# Lihil — a High-Performance Web Framework for Enterprise Web Development in Python

Lihil is a modern web framework built to make Python a serious choice for enterprise backend systems — from monoliths to microservices.

## Why Lihil?

Python has long been criticized as “too slow” or “too dynamic” for large-scale applications. But the language and ecosystem have evolved — Python 3.10+ offers a robust type system, and with ongoing advancements like the removal of the Global Interpreter Lock (GIL), Python is ready for high-performance workloads.

Lihil aims to bring together:

- High performance rivaling Go and Java frameworks

- Scalable architecture that grows from simple apps to distributed systems

- Modern developer ergonomics with static typing, auto-injection, and clean API design

GitHub: https://github.com/raceychan/lihil

Docs & tutorials: https://lihil.cc

## What Lihil Offers

### Performance

Lihil is 50–100% faster than comparable ASGI frameworks with similar functionality.
Benchmark source (reproducible):
https://github.com/raceychan/lhl_bench

### Parameter Parsing

Lihil provides a powerful, type-driven parameter parser that handles inputs from all request sources.

Parses from query, path, header, and body

Type-aware conversion

Alias support for headers

Custom decoders via Param(decoder=...)

```python
from typing import Annotated
from lihil.params import Param

@Route("/users/{user_id}")
async def create_user(
    user_id: str,
    name: Annotated[str, Param("query")],
    auth_token: Annotated[str, Param("header", alias="x-auth-token")],
    user_data: UserPayload
):
    ...
```

### Data Validation & Decoding

Using msgspec under the hood, Lihil supports custom decoding and encoding with minimal boilerplate.

```python
from lihil.di import CustomEncoder
from lihil.params import Param

async def create_user(
    user_id: Annotated[MyUserID, Param(decoder=decode_user_id)]
) -> Annotated[MyUserID, CustomEncoder(encode_user_id)]:
    return user_id
```

### Dependency Injection

Lihil’s DI system resolves dependencies via type hints and supports:

Scoped, singleton, and transient lifecycles

Deeply nested dependencies

Lazy initialization

Factory-based injection

```python
async def get_conn(engine: Engine):
    async with engine.connect() as conn:
        yield conn

async def get_users(conn: AsyncConnection):
    return await conn.execute(text("SELECT * FROM users"))

@Route("/users").get
async def list_users(
    users: Annotated[list[User], use(get_users)],
    is_active: bool = True
):
    return [u for u in users if u.is_active == is_active]
```

More tutorials: https://lihil.cc/ididi

### Plugin System

Lihil provides a flexible plugin system that allows you to decorate endpoint functions with custom logic — without interfering with parameter parsing or signature analysis.

This is particularly useful for features like logging, metrics, authentication, or request tracing.

You can easily integrate a third party library into lihil within a few lines

```python
from functools import wraps
from lihil.plugins import EndpointSignature, Graph
from typing import Callable, Awaitable
from redis import RedisClient

def redis_plugin(redis: RedisClient, cache_key: str):
    def inner(self, graph: Graph, func: Callable[..., Awaitable[Any]], sig: EndpointSignature[Any]):
        @wraps(func)
        async def wrapped(*args, **kwargs):
            if result := redis.get(kwargs[cache_key]):
                return result
            return await func(*args, **kwargs)
        return wrapped
    return inner
```

Then apply it to your routes/endpoints

```python
route = Route("/users/{user_id}")

@route.get(plugins=[redis_plugin(RedisClient(), cache_key="user_id")])
async def create_user(user_id: str): ...
```

### Structured Problem Responses

Lihil adopts RFC 7807 to return detailed problem responses for exceptions.

```python

class OutOfStockError(HTTPException[str]):
    __status__ = 422
    def __init__(self, order: Order):
        detail = f"{order} can't be placed, because {order.items} is short in quantity"
        super().__init__(detail)
```

Client receives:

```json
{
  "type_": "out-of-stock-error",
  "status": 422,
  "title": "The order can't be placed because items are out of stock",
  "detail": "order(id=43, items=[massager]) can't be placed, because [massager] is short in quantity",
  "instance": "/users/ben/orders/43"
}
```

### Event System

Lihil provides a unified event system that supports:

publish (in-process, blocking)

emit (in-process, non-blocking)

sink (integration point for MQ/databases)

```python
from lihil import Route, status
from lihil.plugins.bus import Event, EventBus, bus_plugin
from typing import Annotated
from lihil.params import Param

class TodoCreated(Event):
    name: str
    content: str

async def on_create(created: TodoCreated, ctx):
    ...

bus_route = Route("/bus", listeners=[on_create])

@bus_route.post(plugins=[bus_plugin])
async def create_todo(
    name: str,
    content: str,
    bus: Annotated[EventBus, Param("plugin")]
) -> Annotated[None, status.OK]:
    await bus.publish(TodoCreated(name, content))
```

Handlers can have dependencies and can even publish new events during execution.

### Standards-Driven, Scalable Design

Lihil supports distributed middleware like throttling and event sourcing, and offers guidance for best practices and clean architecture. You can:

- Start with a monolith and scale to microservices.
- Use strong typing for maintainability.
- Follow extensible plugin patterns for observability, persistence, auth, etc.

## Who It's For

Lihil is for developers who want:

- Enterprise-ready structure and flexibility

- Great DX (developer experience) with Python’s readability

- True scalability and performance

- Strict typing with fast feedback and strong IDE support

- Detailed OpenAPI docs for both success and failure cases

- First-class support for async patterns, events, streaming, and RPC

## Versioning

Lihil is at v0.2.8, already >99% test-covered and strictly typed.

## What's Next

Upcoming in v0.2.0+:

v0.2.9 supabase integration

v0.2.10 MCP server

v0.3.0 +

- Schema-based async query builder
- Out-of-process event bus (e.g., RabbitMQ, Kafka)
- Command handlers (HTTP RPC + gRPC)

👉 GitHub: https://github.com/raceychan/lihil
📘 Docs: https://lihil.cc