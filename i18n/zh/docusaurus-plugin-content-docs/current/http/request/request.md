# 请求

在深入了解 HTTP 请求的结构和细节之前，重要的是要理解请求到底是什么。

在 Web 开发的语境中，HTTP 请求是客户端发送给服务器的消息，要求执行某些操作——比如检索网页或提交数据。这是客户端和服务器之间几乎每次交互的起点。

虽然 lihil 抽象了大部分底层细节——让你可以直接将头部、查询参数、cookie 和请求体内容声明为端点的结构化输入——但了解请求在底层的样子仍然是有用的。


## 纯文本中的请求

在最底层，HTTP 请求只是通过网络发送的纯文本，遵循 HTTP 协议。
以下是一个简单 GET 请求的示例：

```http
GET /path?query=value HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: text/html,application/xhtml+xml
```

这显示了基本结构：

- 方法（GET）告诉服务器请求的是什么操作。

- 路径 "/path" 指向资源 "path"
- "?query=value" 包含一个查询参数 "query"，值为 "value"。
- HTTP 版本在第一行的末尾指定。

其他行是头部，如 Host、User-Agent 和 Accept，它们提供关于请求的元数据。

请求也可以携带请求体。例如，POST 请求可能看起来像这样：

```http
POST /submit HTTP/1.1
Host: example.com
Content-Type: application/json
Content-Length: 27

{"key":"value"}
```

这里，请求包含一个请求体，其中包含 JSON 数据。像 Content-Type 和 Content-Length 这样的头部描述了服务器应该如何解释请求体。

## 在端点中声明请求对象

lihil 提供了更高级的抽象，如 `Header`、`Query`、`Body` 等，让你可以直接在端点中声明所需的参数。
在大多数情况下，你不会直接与 IRequest 交互，但了解这些信息的来源将帮助你理解框架在底层是如何工作的。

```python
from lihil import Route
from lihil.interface import IRequest

@Route("create_uesrs")
async def ep(req: IRequest):
    data = await req.body()
```

lihil 中的参数解析是优化的。直接使用 `IRequest` 对象通常不会带来显著的性能提升。

## `IRequest` 接口

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