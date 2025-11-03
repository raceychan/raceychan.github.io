# プラグインシステム

lihilは、パラメータ解析や署名分析を妨げることなく、カスタムロジックでエンドポイント関数をデコレートできる柔軟なプラグインシステムを提供します。

これは、ログ記録、メトリクス、認証、リクエストトレーシングなどの機能に特に有用です。

## なぜ良いのか？

類似のASGIフレームワークでは、いくつかの制限により、構成可能でサードパーティのプラグインを構築することが困難です：

- 署名強制：エンドポイント署名にカスタム依存関係を単純に追加することはできません。フレームワークが解析と検証を試み、エラーを発生させる可能性があります。

- デコレータ制限：エンドポイント関数を自由にデコレートすることはできません。デコレータは関数の署名を厳密に保持するか、破損してしまいます。

- 内省の欠如：デコレータはエンドポイント関数がどのようなものかを知らないため、再利用可能で署名認識のプラグインを書くことが困難になります。

lihilは、アプリケーションの初期化後に動作するプラグインシステムを導入することでこれらの制限を回避し、依存関係グラフとエンドポイントメタデータへの完全なアクセスを提供します。

## IPluginインターフェース

プラグインは、必要な情報（アプリの `Graph`、生の関数、解析済みシグネチャ）をひとまとめにしたエンドポイント情報オブジェクトで動作します。

```python
from typing import Protocol, Generic
from ididi import Graph
from lihil.interface import IAsyncFunc, P, R
from lihil.signature import EndpointSignature


class IEndpointInfo(Protocol, Generic[P, R]):
    @property
    def graph(self) -> Graph: ...

    @property
    def func(self) -> IAsyncFunc[P, R]: ...

    @property
    def sig(self) -> EndpointSignature[R]: ...


class IPlugin(Protocol):
    def __call__(self, endpoint_info: IEndpointInfo[P, R], /) -> IAsyncFunc[P, R]: ...
```

## プラグインの登録

2つのレベルでプラグインを適用できます：

1. ルートごとのプラグイン

```python

from lihil import Route
from lihil.routing import EndpointProps


route = Route(props=EndpointProps(plugins=[MyPlugin()]))
```

このルートの下に登録されたすべてのエンドポイントは自動的に`MyPlugin`を使用します。

2. エンドポイントごとのプラグイン

```python

   @route.get(plugins=[MyPlugin()])
   async def my_endpoint() -> None:
   ...
```

これにより、特定のエンドポイントにのみプラグインを適用する細かい制御が可能になります。

### プラグインファクトリ（任意）

間接化したい場合は、プラグインインスタンスを返すファクトリを用意します。実行時の `Graph` はプラグイン内で `endpoint_info.graph` から取得できます。

```python
from lihil.config import lhl_get_config

def my_plugin_factory() -> IPlugin:
    cfg = lhl_get_config()
    return MyPlugin(max_conns=cfg.db.MAX_CONNS)

route = Route(props=EndpointProps(plugins=[my_plugin_factory()]))
```

## プラグインの作成

新しいプロトコルを使い、`EventBus` を注入する例：

```python
from typing import Any, Awaitable, Callable
from functools import wraps

class BusPlugin:
    def __init__(self, busterm: BusTerminal[Any]):
        self.busterm = busterm

    def decorate(self, ep_info: IEndpointInfo[P, R]) -> Callable[P, Awaitable[R]]:
        sig = ep_info.sig
        func = ep_info.func

        for name, param in sig.plugins.items():
            param_type, _ = get_origin_pro(param.type_)
            param_type = ty_get_origin(param_type) or param_type
            if param_type is EventBus:
                break
        else:
            return func

        @wraps(func)
        async def f(*args: P.args, **kwargs: P.kwargs) -> R:
            kwargs[name] = self.busterm.create_event_bus(ep_info.graph)
            return await func(*args, **kwargs)

        return f

    def __call__(self, endpoint_info: IEndpointInfo[P, R]) -> Callable[P, Awaitable[R]]:
        return self.decorate(endpoint_info)
```

このプラグインはEndpointSignatureを検査し、`EventBus`型のパラメータを見つけると、`BusTerminal`によって作成された`EventBus`のインスタンスを注入するようにエンドポイント関数をラップします。

`EventBus`型のパラメータがない場合、単に元の関数を返します。

## プラグインパラメータ

プラグイン固有の値（内部ヘルパー、サービスロケーターなど）をHTTPリクエストデータとして誤解釈されることを避けるため、`Param("plugin")`を使用してアノテートします。

```python
from typing import Annotated
from lihil import Route, Param

bus_term = BusTerminal()
route = Route("/users/{user_id}", props=EndpointProps(plugins=[BusPlugin(bus_term)]))

@route.post
async def create_user(
    user_id: str,
    bus: Annotated[EventBus, Param("plugin")],
) -> None:
    ...
```

これにより、lihilは`bus`をリクエスト境界パラメータではなく、プラグイン管理の依存関係として扱うことを伝えます。

## IEndpointInfo の強み

`IEndpointInfo` は、呼び出し時にエンドポイントを安全に再構成するために必要なすべてをプラグインに渡します。

- `sig` による完全な内省：クエリ/パス/ヘッダー/ボディの各パラメータ、プラグインパラメータ、依存関係、戻り値、メディアタイプなど。
- `func`（生の呼び出し可能）へのアクセス：ラップして変更した `args/kwargs` でフォワード。
- リクエスト単位の `graph`：リクエストスコープのサービスを構築し、依存関係を解決。

つまり、プラグインは新しい値を注入し、既存の値を上書き/正規化し、場合によってはエンドポイントへ渡す前に入力を消費できます。フレームワーク内部を変更する必要はなく、完全に解析済みのシグネチャに基づいて呼び出しを適応させます。

### 例

1) クエリパラメータの上書き/正規化

```python
from functools import wraps

class ClampPageSize:
    def __init__(self, default: int = 50, maximum: int = 100):
        self.default = default
        self.maximum = maximum

    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        # エンドポイントがこのクエリを持つ場合のみ有効
        if "page_size" not in sig.query_params:
            return func

        @wraps(func)
        async def wrapped(*args: P.args, **kwargs: P.kwargs) -> R:
            value = kwargs.get("page_size")
            if value is None:
                kwargs["page_size"] = self.default
            else:
                kwargs["page_size"] = min(int(value), self.maximum)
            return await func(*args, **kwargs)

        return wrapped
```

2) パスパラメータをより豊かなドメインオブジェクトへ昇格

```python
from functools import wraps

class LoadUser:
    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        # パスIDとプラグインの user の両方を受け取る場合のみ適用
        has_id = "user_id" in sig.path_params
        has_user = any(t.type_ is User for _, t in sig.plugins.items())
        if not (has_id and has_user):
            return func

        @wraps(func)
        async def wrapped(*args: P.args, **kwargs: P.kwargs) -> R:
            user_id = kwargs["user_id"]
            repo = ep.graph.get(UserRepository)
            kwargs["user"] = await repo.get_by_id(user_id)
            return await func(*args, **kwargs)

        return wrapped
```

3) フォワード前に入力を変換/エイリアスを除去

```python
from functools import wraps

class AliasOrgId:
    """`orgId` を送るレガシークライアントをサポートし、`org_id` にマップする。"""

    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        if "org_id" not in sig.path_params:
            return func

        @wraps(func)
        async def wrapped(*args: P.args, **kwargs: P.kwargs):
            if "orgId" in kwargs and "org_id" not in kwargs:
                kwargs["org_id"] = kwargs.pop("orgId")  # 別名を削除し正規名へ
            return await func(*args, **kwargs)

        return wrapped
```

ガイドライン：
- 実装専用の引数には `Param("plugin")` を付け、HTTP 解析から除外し、`sig.plugins` で参照できるようにします。
- エンドポイント関数が必要とする必須パラメータは削除せず、`func` を呼ぶ前に変換またはプレフィルします。
- `sig.dependencies` と `sig.transitive_params` を使い、暗黙的に解決される内容を把握して二重作業を避けます。
- 戻り値を一律に後処理・ラップする必要があれば、`sig.return_params`、`sig.encoder`、`sig.media_type` を参照します。

## 概要

- lihilのプラグインは、実行時にエンドポイントの動作を変更するデコレータです。完全なコンテキスト（関数、署名、依存関係グラフ）を受け取ります。

- プラグインパラメータは、HTTPリクエスト解析との競合を避けるために明示的にマークされます。
