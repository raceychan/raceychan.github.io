---
sidebar_position: 6
---

### Enpoint

An `endpoint` is the most atomic ASGI component in `lihil`, registered under `Route` with `Route.{http method}`, such as `Route.get`. It defines how clients interact with the resource exposed by the `Route`.

<!-- In the [ASGI callchain](./minicourse.md) the `endpoint` is typically at the end. -->

Let's start with a function that creates a `User` in database.

#### Quick Start:

Expose a random function as an endpoint

**`app/users/api.py`**

```python
from msgspec import Struct
from sqlalchemy.ext.asyncio import AsyncEngine
from .users.db import user_sql

class UserDB(UserData):
    user_id: str

def get_engine() -> AsyncEngine:
    return AsyncEngine()

async def create_user(user: UserData, engine: AsyncEngine) -> UserDB:
    user_id = str(uuid4())
    sql = user_sql(user=user, id_=user_id)
    async with engine.begin() as conn:
        await conn.execute(sql)
    return UserDB.from_user(user, id=user_id)
```

To expose this function as an endpoint:


```python
from lihil import Route

users_route = Route("/users")
users_route.factory(get_engine)
users_route.post(create_user)
```

With just three lines, we:

1. Create a Route with the path "/users".
2. Register `AsyncEngine` as a dependency, using `get_engine` as its factory.
3. Register create_user as the POST endpoint.


You might also use python decorator syntax to register an endpoint

```python
users_route = Route("/users")

@users_route.post
async def create_user(): ...
```

#### Param Parsing

```python
from lihil import use, Ignore
from typing import Annotated, NewType
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine

async def get_conn(engine: AsyncEngine) -> AsyncConnection:
    async with engine.begin() as conn:
        yield conn

UserID = NewType("UserID", str)

def user_id_factory() -> UserID:
    return UserID(str(uuid4()))

async def create_user(
    user: UserData, user_id: UserID, conn: AsyncConnection
) -> Resp[UserDB, stauts.Created]:

    sql = user_sql(user=user, id_=user_id)
    await conn.execute(sql)
    return UserDB.from_user(user, id=user_id)

users_route.factory(get_conn)
users_route.factory(user_id_factory, reuse=False)
```

Here,

1. `user_id` will be created by `user_id_factory` and return a uuid in str.
2. `conn` will be created by `get_conn` and return an instance of `AsyncConnection`, where the the connection will be returned to engine after request.
3. `UserDB` will be json-serialized, and return a response with content-type being `application/json`, status code being `201`.

##### Param Marks

Explicitly declaring a parameter with a param mark tells Lihil to treat it as-is, without further analysis.

- `Header[T, H]` for header param with type `T` and header key `H`
- `Cookie[T, C]` for cookie param with type `T` and cookie name `C`
- `Path[T]` for path param with type `T`
- `Query[T]` for query param with type `T`
- `Body[T]` for body param with type `T`
- `Form[T]` for body param with content type `multipart/from-data` and type [T]
- `Use[T]` for dependency with type `T`

`Header` and `Cookie` allows your to provide metadata for param parsing,

Use `typing.Literal` to provide header/cookie name,

```python
async def login(cred: Header[str, Literal["User-Credentials"]], x_access_token: Header[str]) : ...
```

- Here param `cred` expects a header with key `User-Credentials`.

- If key not provided, The kebab case of param name is used, for example, here `x_access_token` expects a header with key `x-access-token`


##### Param Analysis Rules

If a param is not declared with any param mark, the following rule would apply to parse it:

- If the param name appears in route path, it is interpreted as a path param.
- If the param type is a subclass of `msgspec.Struct`, it is interpreted as a body param.
- If the param type is registered in the route graph, or is a lihil-primitive type, it will be interpered as a dependency and will be resolved by lihil

- Otherise, it is interpreted as a query param.

Example:

```python
from lihil import Route, Payload, Use, EventBus

user_route = Route("/users/{user_id}")

class UserUpdate(Payload): ...
class Engine: ...
class Cache: ...

user_route.factory(Cache)

@user_route.put
async def update_user(user_id: str, engine: Use[Engine], cache: Cache, bus: EventBus):
    return "ok"
```

In this example:

- `user_id` appears in the route path, so it is a path param
- `engine` is annotated with the `Use` mark, so it is a dependency
- `cache` is registered in the user_route, so it is also a dependency
- `bus` is a lihil-builtin type, it is therefore a dependency as well.

Only `user_id` needs to be provided by the client request, rest will be resolved by lihil.

Since return param is not declared, `"ok"` will be serialized as json `'"ok"'`, status code will be `200`.

#### Data validation

lihil provide you data validation functionalities out of the box using msgspec.

#### Constraints

- You might combine `typing.Annotated` and `msgspec.Meta` to put constraints on params,

```python
all_users = Route("/users")

@all_users.get
async def get_users(numers: Annotated[int, msgspec.Meta(gt=0)]):
    ...
```

Here `get_user` expects a query param `numers`, an integer with value greater than `0`.

- Constraints with structual data

```python
from typing import Annotated

from lihil import Payload
from msgspec import Meta

UnixName = Annotated[
    str, Meta(min_length=1, max_length=32, pattern="^[a-z_][a-z0-9_-]*$")
]

class User(Payload):
    name: UnixName
    groups: Annotated[set[UnixName], Meta(max_length=16)] = set()
    cpu_limit: Annotated[float, Meta(ge=0.1, le=8)] = 1
    mem_limit: Annotated[int, Meta(ge=256, le=8192)] = 1024

@all_users.post
async def create_user(user: User): ...
```

Here `create_user` expects a body param `user`, a structual data where each field has constraints.

- Constraints with supported types

Checkout [msgspec constraints](https://jcristharif.com/msgspec/constraints.html) for more details on specific constraints that you can set on different types.


#### Return Marks

Often you would like to change the status code, or content type of your endpoint,  to do so, you can use one or a combination of several `return marks`. for example, to change stauts code:

```python
from lihil import Resp, status

async def create_user(user: UserData, engine: Engine) -> Resp[UserDB, status.Created]:
    ...
```

Now `create_user` would return a status code `201`, instead of the default `200`.

There are several other return marks you might want to use:

- `Json[T]` for response with content-type `application/json`

Endpoints are assumed to return `Json[T]` by default, `async def f() -> str` is the same as  `async def f() -> Json[str]`

- `Stream[T]` for server sent event with content-type `text/event-stream`
- `Text` for response with content-type `text/plain`
- `HTML` for response with content-type `text/html`
- `Empty` for empty response

You can use these return marks just like plain python return type hint

```python
from lihil import Json

async def demo() -> Json[list[int]]: ...
```

return marks have no runtime/typing effect outside of lihil, your type checker would treat `Json[T]` as `T`.


##### Response with status code

- `Resp[T, 200]` for response with status code `200`. where `T` can be anything json serializable, or another return mark.

For instance, in the `create_user` example, we use `Resp[UserDB, status.Created]` to declare our return type, here `T` is `UserDB`.

- By default, the return convert is json-serialized, so that it is equiavlent to `Resp[Json[UserDB], status.Created]`.
- If you would like to return a response with content type `text/html`, you might use `HTML`

```python
async def hello() -> HTML:
    return "<p>hello, world!</p>"
```

##### Return Union

it is valid to return union of multiple types, they will be shown as `anyOf` schemas in the open api specification.

```python
async def create_user() -> User | TemporaryUser: ...
```

##### Custom Encoder/Decoder

You can also use your own customized encoder/decoder for request params and function return.
To use them, annotate your param type with `CustomDecoder` and your return type with `CustomEncoder`

```python
from lihil.di import CustomEncoder, CustomDecoder

user_route = @Route(/users/{user_id})

async def get_user(
    user_id: Annotated[str, CustomDecoder(decode_user_id)]
) -> Annotated[str, CustomEncoder(encode_user_id)]:
    return user_id
```

```python
def decoder[T](param: str | bytes) -> T: ...
```

- `decoder` should expect a single param with type either `str`, for non-body param, or `bytes`, for body param, and returns required param type, in the `decode_user_id` case, it is `str`.

```python
def encoder[T](param: T) -> bytes: ...
```

- `encoder` should expect a single param with any type that the endpoint function returns, in the `encode_user_id` case, it is `str`, and returns bytes.


#### EndPoint properties

- Provide extra meta data of endpoint through route decorator.

```python
@router.get(errors=[UserNotFoundError, UserInactiveError])
async get_user(user_id: str): ...
```

- Endpoint can have these properties:

```python
errors: Sequence[type[DetailBase[Any]]] | type[DetailBase[Any]]
"Errors that might be raised from the current `endpoint`. These will be treated as responses and displayed in OpenAPI documentation."
in_schema: bool
"Whether to include this endpoint inside openapi docs"
to_thread: bool
"Whether this endpoint should be run wihtin a separate thread, only apply to sync function"
scoped: Literal[True] | None
"Whether current endpoint should be scoped"
auth_scheme: AuthBase | None
"Auth Scheme for access control"
tags: Sequence[str] | None
"OAS tag, endpoints with the same tag will be grouped together"
```

    - `scoped`: if an endpoint requires any dependency that is an async context manager, or its factory returns an async generator, the endpoint would be scoped, and setting scoped to None won't change that, however, for an endpoint that is not scoped, setting `scoped=True` would make it scoped.

- Provide a properties for every endpoint in the route:


You might provide default properties when intialize a route,

```python
from lihil.routing import Route, EndpointProps

default_props = EndpointProps(errors=[UserNotFoundError, UserInactiveError])
prop_route = Route(props=default_props)
```

- Here `default_props` would be applied to every endpoint added to `prop_route`.
- endpoint properties provided via route decorator like `route.get` would override roperties provided by route.