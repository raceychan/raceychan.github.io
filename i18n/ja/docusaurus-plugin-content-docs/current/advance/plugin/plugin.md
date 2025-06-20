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

lihilのプラグインは、以下を受け取る呼び出し可能オブジェクト（同期または非同期）です：

1. アプリケーションが所有する`ididi.Graph`（依存関係グラフ）、登録されたすべての依存関係とその構成を含む。

2. 生のエンドポイント関数、

3. 完全に解析されたEndpointSignature。

これはライフスパンイベントの後に発生し、プラグインがライフスパンハンドラー中に作成されたリソースに依存できることを保証します。

```python
from typing import Any, Awaitable, Callable, Protocol
from ididi import Graph
from lihil.interface import IAsyncFunc, P, R
from lihil.signature import EndpointSignature


class IAsyncPlugin(Protocol, Generic[P, R]):
    async def __call__(
        self,
        graph: Graph,
        func: IAsyncFunc[P, R],
        sig: EndpointSignature[Any],
        /,
    ) -> IAsyncFunc[P, R]: ...


class ISyncPlugin(Protocol, Generic[P,R]):
    def __call__(
        self,
        graph: Graph,
        func: IAsyncFunc[P, R],
        sig: EndpointSignature[Any],
        /,
    ) -> IAsyncFunc[P, R]: ...


IPlugin = IAsyncPlugin[..., Any] | ISyncPlugin[..., Any]
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

### プラグインファクトリ

プラグインはライフスパンイベントの後に呼び出されることに注意してください。`route.get(plugins=[MyPlugin()])`のようにインポート時にプラグインをインスタンス化するのではありません。
プラグインをファクトリでラップできます。

```python
from lihil.config import lhl_get_config

def my_plugin_factory(graph: Graph, func: Callable[P, R], sig: EndpointSignature[R]): # 同期または非同期可能
    config = lhl_get_config()
    engine = Graph.resolve(Engine, url=config.db.URL)
    return MyPlugin(engine=engine, max_conns=config.db.MAX_CONNS)

@route.get(plugins=[my_plugin_factory])
async def my_endpoint() -> None:
    ...
```

## プラグインの作成

以下は、エンドポイントにEventBusインスタンスを注入するプラグインの例です：

```python
from functools import wraps
from lihil.signature import EndpointSignature
from ididi import Graph
from typing import Callable, Awaitable

def bus_plugin(busterm: BusTerminal[Any]):
    def inner(self, graph: Graph, func: Callable[..., Awaitable[Any]], sig: EndpointSignature[Any]):
        for name, param in sig.plugins.items():
            param_type = ty_get_origin(param_type) or param_type
            if param_type is EventBus:
                @wraps(func)
                async def wrapped(*args, **kwargs):
                    kwargs[name] = busterm.create_event_bus(graph)
                    return await func(*args, **kwargs)
                return wrapped
        return func
    return inner
```

このプラグインはEndpointSignatureを検査し、`EventBus`型のパラメータを見つけると、`BusTerminal`によって作成された`EventBus`のインスタンスを注入するようにエンドポイント関数をラップします。

`EventBus`型のパラメータがない場合、単に元の関数を返します。

## プラグインパラメータ

プラグイン固有の値（内部ヘルパー、サービスロケーターなど）をHTTPリクエストデータとして誤解釈されることを避けるため、`Param("plugin")`を使用してアノテートします。

```python
from lihil import Route
from lihil.plugins.bus import bus_pluin, BusTerminal

bus_term = BusTerminal()

@Route("/users/{user_id}", plugsins=[bus_plugin(busterm)])
async def create_user(
    user_id: str, bus: EventBus = Annotated[EventBus, Param("plugin")]
) -> None:
```

これにより、lihilは`bus`をリクエスト境界パラメータではなく、プラグイン管理の依存関係として扱うことを伝えます。

## 概要

- lihilのプラグインは、実行時にエンドポイントの動作を変更するデコレータです。完全なコンテキスト（関数、署名、依存関係グラフ）を受け取ります。

- プラグインパラメータは、HTTPリクエスト解析との競合を避けるために明示的にマークされます。