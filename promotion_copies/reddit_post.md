Lihil — a high performance modern web framework for enterprise web development in python

Hey everyone!

I’d like to introduce **Lihil**, a web framework I’ve been building to make Python a strong contender for enterprise web development.

Let me start with why:

For a long time, I’ve heard people criticize Python as unsuitable for large-scale applications, often pointing to its dynamic typing and mysterious constructs like `*args` and `**kwargs`. Many also cite benchmarks, such as n-body simulations, to argue that Python is inherently slow.

While those benchmarks have their place, modern Python (3.10+) has evolved significantly. Its robust typing system greatly improves code readability and maintainability, making large codebases easier to manage. On the performance side, advancements like Just-In-Time (JIT) compilation and the upcoming removal of the Global Interpreter Lock (GIL) give me confidence in Python’s future as a high-performance language.

With Lihil, I aim to create a web framework that combines **high performance** with **developer-friendly design**, making Python an attractive choice for those who might otherwise turn to Go or Java.


GitHub: [https://github.com/raceychan/lihil](https://github.com/raceychan/lihil)

Docs& tutorials: https://liihl.cc/lihil




## What My Project Does

Lihil is a performant, productive, and professional web framework with a focus on strong typing and modern patterns for robust backend development.

Here are some of its core features:

## Performance 

Lihil is very fast, about 50-100% faster than other ASGI frameworks providing similar functionality.
Check out 


https://github.com/raceychan/lhl_bench

For reproducible benchmarks.

See graph here:

[benchmark graph](https://github.com/raceychan/lhl_bench/blob/master/assets/benchmark.png)

## Param Parsing

Lihil provides a sophisticated parameter parsing system that automatically extracts and converts parameters from different request locations:

- Multiple Parameter Sources: Automatically parse parameters from query strings, path parameters, headers, and request bodies
- Type-Based Parsing: Parameters are automatically converted to their annotated types
- Alias Support: Define custom parameter names that differ from function argument names
- Custom Decoders: Apply custom decoders to transform raw input into complex types

```python

@Route("/users/{user_id}")
async def create_user(
    user_id: str,                                  
    name: Query[str],                            
    auth_token: Header[str, Literal["x-auth-token"]
    user_data: UserPayload                 
):
    # All parameters are automatically parsed and type-converted
    ...
```

## Data validation

lihil provide you data validation functionalities out of the box using msgspec, you can also use your own customized encoder/decoder for request params and function return.  

To use them, annotate your param type with `CustomDecoder` and your return type with `CustomEncoder`

```python
from lihil.di import CustomEncoder, CustomDecoder

async def create_user(
    user_id: Annotated[MyUserID, CustomDecoder(decode_user_id)]
) -> Annotated[MyUserId, CustomEncoder(encode_user_id)]:
    return user_id
```
## Dependency Injection

Lihil features a powerful dependency injection system:

- Automatic Resolution: Dependencies are automatically resolved and injected based on type hints.
- Scoped Dependencies: Support for nested, infinite levels of scoped, singleton, and transient dependencies
- Nested Dependencies: Dependencies can have their own dependencies
- Factory Support: Create dependencies using factory functions with custom configuration
- Lazy Initialization: Dependencies are only created when needed

```python
async def get_conn(engine: Engine):
    async with engine.connect() as conn:
        yield conn

async def get_users(conn: AsyncConnection):
    return await conn.execute(text("SELECT * FROM users"))

@Route("users").get
async def list_users(users: Annotated[list[User], use(get_users)], is_active: bool=True):
    return [u for u in users if u.is_active == is_active]
```

for more in-depth tutorials on DI, checkout https://lihil.cc/ididi

## Exception-Problem Mapping & Problem Page

Lihil implements the RFC 7807 Problem Details standard for error reporting

lihil maps your expcetion to a `Problem` and genrate detailed response based on your exception.

```python
class OutOfStockError(HTTPException[str]):
    "The order can't be placed because items are out of stock"
    __status__ = 422

    def __init__(self, order: Order):
        detail: str = f"{order} can't be placed, because {order.items} is short in quantity"
        super().__init__(detail)
```

when such exception is raised from endpoint, client would receive a response like this

```json
{
    "type_": "out-of-stock-error", 
    "status": 422,
    "title": "The order can't be placed because items are out of stock",
    "detail": "order(id=43, items=[massager], quantity=0) can't be placed, because [massager] is short in quantity",
    "instance": "/users/ben/orders/43"
}
```



## Message System


Lihil has built-in support for both in-process message handling (Beta) and out-of-process message handling (implementing)

There are three primitives for event:

1. publish: asynchronous and blocking event handling that shares the same scoep with caller.
2. emit: non-blocking asynchrounous event hanlding, has its own scope.
3. sink: a thin wrapper around external dependency for data persistence, such as message queue or database.

```python
from lihil import Resp, Route, status
from lihil.plugins.bus import Event, EventBus
from lihil.plugins.testclient import LocalClient


class TodoCreated(Event):
    name: str
    content: str


async def listen_create(created: TodoCreated, ctx):
    assert created.name
    assert created.content


async def listen_twice(created: TodoCreated, ctx):
    assert created.name
    assert created.content


bus_route = Route("/bus", listeners=[listen_create, listen_twice])


@bus_route.post
async def create_todo(name: str, content: str, bus: EventBus) -> Resp[None, status.OK]:
    await bus.publish(TodoCreated(name, content))
```

An event can have multiple event handlers, they will be called in sequence, config your `BusTerminal` with `publisher` then inject it to `Lihil`.
- An event handler can have as many dependencies as you want, but it should at least contain two params: a sub type of `Event`, and a sub type of `MessageContext`.
- if a handler is reigstered with a parent event, it will listen to all of its sub event.
for example, 
- a handler that listens to `UserEvent`, will also be called when `UserCreated(UserEvent)`, `UserDeleted(UserEvent)` event is published/emitted.
- you can also publish event during event handling, to do so, declare one of your dependency as `EventBus`,

```python
async def listen_create(created: TodoCreated, _: Any, bus: EventBus):
    if is_expired(created.created_at):
        event = TodoExpired.from_event(created)
        await bus.publish(event)
```

### Compatibility with starlette.

Lihil is ASGI compatible and uses starlette as ASGI toolkit, namely, lihil uses starlette ‘Request’, ‘Response’ and their subclasses, so migration from starlette should be exceptionally easy.


## Target Audience

Lihil is for anywise who is looking for a web framework that has high level development experience and low level runtime performance.


High traffic without giving up Python's readability and developer happiness.
OpenAPI dosc that is correct and detailed, covering both the success case and failure case. 
Extensibility via plugins, middleware, and typed event systems — without performance hits.
Complex dependency management, where you can't afford to misuse singletons or create circular dependencies.
AI features like streaming chat completions, live feeds, etc.

    
If you’ve ever tried scaling up a FastAPI or Flask app and wished there were better abstractions and less magic, Lihil is for you.



## What’s Next

Lihil is currently at v0.1.9, still in its early stages, there will be fast evolution & feature refinements. Please give a star if you are interested.
lihil currently has a test coverage > 99% and is strictly typed,  you are welcome to try it!


Planned for v0.2.0 and beyond, likely in order:
- Out-of-process event system (RabbitMQ, Kafka, etc.).
- A highly performant schema-based query builder based on asyncpg.
- Local command handler (HTTP RPC) and remote command handler (gRPC).
- More middleware and official plugins (e.g., throttling, caching, auth).
- Tutorials & videos on Lihil and web dev in general. stay tune to https://lihil.cc/lihil/minicourse/


GitHub: [https://github.com/raceychan/lihil](https://github.com/raceychan/lihil)

Docs& tutorials: https://liihl.cc/lihil
