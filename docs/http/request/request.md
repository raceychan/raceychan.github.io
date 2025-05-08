
# Request

Before diving into the structure and details of an HTTP request, it's important to understand what a request actually is.

In the context of web development, an HTTP request is the message a client sends to a server, asking for some action to be performed—such as retrieving a webpage or submitting data. This is the starting point of almost every interaction between a client and your server.

While lihil abstracts away most of the low-level details—letting you directly declare headers, query parameters, cookies, and body content as structured inputs to your endpoint—it's still useful to understand what a request looks like under the hood.


## A Request in Plain Text

At the lowest level, an HTTP request is just plain text sent over the network, following the HTTP protocol. 
Here’s an example of a simple GET request:

```http
GET /path?query=value HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: text/html,application/xhtml+xml
```

This shows the basic structure:

- The method (GET) tells the server what action is being requested.

- The path "/path" points to the resource "path"
- "?query=value" includes a query parameter "query" with value being "value".
- The HTTP version is specified at the end of the first line.

Additional lines are headers, such as Host, User-Agent, and Accept, which provide metadata about the request.

Requests can also carry a body. For instance, a POST request might look like this:

```http
POST /submit HTTP/1.1
Host: example.com
Content-Type: application/json
Content-Length: 27

{"key":"value"}
```

Here, the request includes a body, which contains JSON data. Headers like Content-Type and Content-Length describe how the server should interpret the body.

## Declare a request object in your endpoint

lihil provides higher level abstractions like `Header`, `Query`, `Body`, etc. to let you directly declare the params you need in your endpoint. 
In most cases, you don’t interact with IRequest directly,  but understanding where this information comes from will help you reason about how the framework works under the hood.

```python
from lihil import Route
from lihil.interface import IRequest

@Route("create_uesrs")
async def ep(req: IRequest):
    data = await req.body()
```

Note that param parsing in lihil is optimized. it is unlikely that you would see a siginificant performance boost by using `IRequest` object directly. 


## `IRequest` interface
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
