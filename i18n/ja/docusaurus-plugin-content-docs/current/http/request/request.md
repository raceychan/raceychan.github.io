# リクエスト

HTTPリクエストの構造と詳細に深入りする前に、リクエストが実際に何であるかを理解することが重要です。

Web開発の文脈では、HTTPリクエストはクライアントがサーバーに送信するメッセージで、何らかのアクション（Webページの取得やデータの送信など）の実行を要求します。これは、クライアントとサーバー間のほぼすべての相互作用の出発点です。

lihilは低レベルの詳細の大部分を抽象化し、ヘッダー、クエリパラメータ、Cookie、リクエストボディコンテンツをエンドポイントの構造化入力として直接宣言できるようにしますが、リクエストが内部でどのようになっているかを理解することは依然として有用です。


## プレーンテキストでのリクエスト

最低レベルでは、HTTPリクエストはHTTPプロトコルに従ってネットワーク経由で送信されるプレーンテキストです。
以下は簡単なGETリクエストの例です：

```http
GET /path?query=value HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: text/html,application/xhtml+xml
```

これは基本構造を示しています：

- メソッド（GET）はサーバーにどのようなアクションが要求されているかを伝えます。

- パス "/path" はリソース "path" を指し示します
- "?query=value" はクエリパラメータ "query" を含み、値は "value" です。
- HTTPバージョンは最初の行の末尾で指定されます。

その他の行はHost、User-Agent、Acceptなどのヘッダーで、リクエストに関するメタデータを提供します。

リクエストはボディも運ぶことができます。例えば、POSTリクエストは次のようになる可能性があります：

```http
POST /submit HTTP/1.1
Host: example.com
Content-Type: application/json
Content-Length: 27

{"key":"value"}
```

ここで、リクエストはJSONデータを含むボディを含んでいます。Content-TypeやContent-Lengthなどのヘッダーは、サーバーがボディをどのように解釈すべきかを記述します。

## エンドポイントでリクエストオブジェクトを宣言

lihilは`Header`、`Query`、`Body`などのより高レベルの抽象化を提供し、エンドポイントで必要なパラメータを直接宣言できるようにします。
ほとんどの場合、IRequestと直接やり取りすることはありませんが、この情報がどこから来るかを理解することで、フレームワークが内部でどのように動作するかを理解するのに役立ちます。

```python
from lihil import Route
from lihil.interface import IRequest

@Route("create_uesrs")
async def ep(req: IRequest):
    data = await req.body()
```

lihilでのパラメータ解析は最適化されています。`IRequest`オブジェクトを直接使用しても、通常は大幅なパフォーマンスの向上をもたらしません。

## `IRequest` インターフェース

```python
class IRequest(Protocol):
    def __init__(self, scope: IScope, receive: IReceive | None = None) -> None: ...
    def __getitem__(self, key: str) -> Any: ...
    def __iter__(self) -> Iterator[str]: ...
    def __len__(self) -> int: ...
    def __eq__(self, value: object) -> bool: ...
    def __hash__(self) -> int: ...
    @property
    def url(self) -> URL: ...
    @property
    def headers(self) -> Mapping[str, str]: ...
    @property
    def query_params(self) -> Mapping[str, str]: ...
    @property
    def path_params(self) -> Mapping[str, Any]: ...
    @property
    def cookies(self) -> Mapping[str, str]: ...
    @property
    def client(self) -> IAddress | None: ...
    @property
    def state(self) -> dict[str, Any]: ...
    @property
    def method(self): ...
    @property
    def receive(self) -> IReceive: ...
    async def stream(self) -> AsyncGenerator[bytes, None]: ...
    async def body(self) -> bytes: ...
    async def json(self) -> Any: ...
    def form(
        self,
        *,
        max_files: int | float = 1000,
        max_fields: int | float = 1000,
        max_part_size: int = 1024 * 1024,
    ) -> AsyncContextManager[FormData]: ...
    async def close(self) -> None: ...
    async def is_disconnected(self) -> bool: ...
    async def send_push_promise(self, path: str) -> None: ...
```