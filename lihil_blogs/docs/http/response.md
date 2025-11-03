---
title: response
sidebar_position: 1.1
---

Lihil responses are described by the function return type. You can adjust status codes, content types, and serialization using return marks and typing annotations.

### Return Marks

Use return marks to control content type and shape of the response. For example, to change the status code:

```python
from lihil import Annotated, status

async def create_user(user: UserData, engine: Engine) -> Annotated[UserDB, status.Created]:
    ...
```

Now create_user returns status code 201 instead of the default 200.

Common return marks:

| Return Mark | Purpose                                                  | Type Argument(s)        | Notes                                | Example           |
| ----------- | -------------------------------------------------------- | ----------------------- | ------------------------------------ | ----------------- |
| `Json[T]`   | Response with `application/json` content type            | `T`: response body type | Default return type if not specified | `Json[list[int]]` |
| `Stream[T]` | Generic chunked streaming response                       | `T`: item type          | For non-SSE streaming; use `EventStream` for SSE (see [SSE](#sse-server-sent-events)) | `Stream[str]`     |
| `Text`      | Plain text response with `text/plain` content type       | None                    | Use for simple text responses        | `Text`            |
| `HTML`      | HTML response with `text/html` content type              | None                    | Use for HTML content                 | `HTML`            |
| `Empty`     | Empty response (no body)                                 | None                    | Indicates no content to return       | `Empty`           |

Example:

```python
from lihil import Json

async def demo() -> Json[list[int]]: ...
```

Return marks have no runtime/typing effect outside of lihil; your type checker treats `Json[T]` as `T`.

Note: For Server-Sent Events, prefer `EventStream` and yield `SSE` events. See [SSE (Server-Sent Events)](#sse-server-sent-events).

### Status Codes

- `Annotated[T, status.OK]` produces a response with status code 200. `T` can be any JSON-serializable type or another return mark.
- By default, the return value is JSON-serialized. For example, `Annotated[UserDB, status.Created]` is equivalent to `Annotated[Json[UserDB], status.Created]`.
- To return HTML content, use `HTML`:

```python
async def hello() -> HTML:
    return "<p>hello, world!</p>"
```

### Union Returns

You can return a union of multiple types; they appear as anyOf schemas in the OpenAPI specification.

```python
async def create_user() -> User | TemporaryUser: ...
```

### Custom Encoder/Decoder

You can provide custom encoders/decoders for request parameters and function returns.

```python
def encoder_user_id(user_id: UUID) -> bytes:
    return str(user_id)

def decoder_user_id(user_id: str) -> UUID:
    return UUID(user_id)

user_route = Route("/users/{user_id}")

@user_route(encoder=encode_user_id)
async def get_user(
    user_id: Annotated[UUID, Param(decoder=decode_user_id)]
) -> str:
    return user_id
```

```python
def decoder[T](param: str | bytes) -> T: ...
```

- `decoder` expects a single parameter with type either `str` (for non-body params) or `bytes` (for body params) and returns the required type.

```python
def encoder[T](param: T) -> bytes: ...
```

- `encoder` expects a single parameter of the type the endpoint returns and must return `bytes`.

### Low-level Response Types

In advanced cases you can use low-level response classes directly.

- Import from `lihil.vendors`: `Response`, `StreamingResponse`, `PlainTextResponse`.
- This is often unnecessary because return marks (`Json`, `Text`, `HTML`, `Stream`, `Empty`) and typed returns cover most needs.

Example:

```python
from lihil.vendors import PlainTextResponse

async def raw_text() -> PlainTextResponse:
    return PlainTextResponse("ok")
```

Implementation detail: lihil currently uses `starlette.Response` under the hood. Treat this as an internal detail. lihil may replace `starlette.Response` with its own implementation in the future; such a change is not considered breaking as long as the public interface and behavior remain consistent.

Behavior note: if your endpoint returns an instance of `Response` (or any subclass), lihil sends it as-is without further modification. Return marks (e.g., `HTML`, `Json`, `Text`) and status annotations on the function signature do not apply in this case; the explicit `Response` instance fully determines status code, headers, and body.

### SSE (Server-Sent Events)

SSE is a unidirectional streaming protocol over HTTP where the server pushes text/event-stream messages to the browser. Each message is a sequence of lines ending with a blank line. Common fields per message:
- event: Event name string used for dispatch; listeners register via addEventListener(name, ...). If omitted, onmessage receives the event.
- data: The message payload. Multiple consecutive data: lines are concatenated with newlines; trailing newlines are removed.
- id: Sets the EventSource last-event-id value for reconnection and sequencing.
- retry: Reconnection delay in milliseconds. Non-integer values are ignored by the browser.

Return SSE by making your endpoint an async generator that yields `SSE` events and annotating the return type as `EventStream`.

Basic usage:

```python
from lihil import Route, SSE, EventStream

sse_route = Route("/sse")

@sse_route.get
async def events() -> EventStream:
    yield SSE(data={"message": "Hello"}, event="start", id="1")
    for i in range(3):
        yield SSE(data={"count": i}, event="update", id=str(i))
    yield SSE(data={"message": "Goodbye"}, event="close", id="final")
```

Behavior:
- Lihil automatically wraps the generator into a streaming response with media type `text/event-stream`.
- Each yielded `SSE` value is encoded per the SSE spec and flushed as a separate message.
- `SSE` has fields `event`, `data`, `id`, `retry`; only provided fields are emitted.
- `data` defaults to an empty string. If left empty, no `data:` lines are emitted for that message.
    - If `data` is a `str`, it is sent as-is (no JSON encoding).
    - If `data` is not a `str`, it is JSON-encoded to a compact string.
- Multiline strings are split into multiple `data:` lines; every message ends with a blank line.
- The alias `EventStream` is `Annotated[Stream[SSE], CustomEncoder(encode_sse)]`, so yielding `SSE` values from an `EventStream` endpoint applies `encode_sse` automatically.



Browser client example:

```html
<script>
  const es = new EventSource("/sse");
  es.addEventListener("update", (e) => {
    const payload = JSON.parse(e.data);
    console.log("count:", payload.count);
  });
  es.addEventListener("close", () => es.close());
  es.onmessage = (e) => console.log("message:", e.data);
  es.onerror = (e) => console.error("SSE error", e);
</script>
```

Low-level encoding (optional):

```python
from lihil import SSE
from lihil.interface.struct import encode_sse

raw: bytes = encode_sse(SSE(data={"message": "Hello"}, event="start", id="1", retry=5000))
```

Examples:

```text
SSE(data="hello")            -> data: hello\n\n
SSE(data={"x": 1})           -> data: {"x":1}\n\n
SSE(event="tick", id="42")   -> event: tick\n\n id: 42\n\n
SSE()                        -> \n\n  # no data/event/id/retry lines, just message delimiter
```

Testing tips:
- Under Starlette `TestClient`, iterate the streamed body using `iter_lines()` or `iter_content()`.
- As of v0.2.27, cross-event-loop issues with streaming were fixed; SSE works reliably in mixed async environments.
