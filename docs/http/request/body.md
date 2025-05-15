---
sidebar_position: 4
title: body
slug: body-parameter
---


# Body Parameters
While path, query, and header parameters are usually small bits of data encoded in the URL or headers, body parameters carry the main payload of a request. They're typically used in methods like POST, PUT, and PATCH, where a client needs to send structured data to the server.

For example:

This is a typical HTTP request with a JSON body:

```http
POST /users HTTP/1.1
Content-Type: application/json

{
  "username": "alice",
  "age": 30
}
```

Declaring Body Parameters in lihil
In lihil, there are two ways to declare request bodies:

1. Implicitly with msgspec.Struct
You can simply define a body model using msgspec.Struct, and lihil will automatically treat it as the request body:

```python

import msgspec
from lihil import Route

class CreateUser(msgspec.Struct):
    username: str
    age: int

user = Route("/users")

@user.post
async def create_user(data: CreateUser) -> str:
    return f"Hello {data.username}!"
```

This is the preferred way when your request body is a structured object (e.g., a JSON document).

2. Explicitly with Param("body")

If you want to be explicit, or if you are combining body data with other types of parameters, you can use Param("body"):

```python
from lihil import Param
from typing import Annotated

@user.post
async def create_user(
    data: Annotated[CreateUser, Param("body")]
) -> str:
    return f"Hello {data.username}!"
```

This approach is espceially useful when your body is a primitive value like a string or a list.

## Constraints and Validation
Since body parameters use msgspec, you can apply validation constraints directly in your Struct, or via Param, just like you would with path or query parameters:

```python
from lihil import Param
from typing import Annotated

class CreateUser(msgspec.Struct):
    username: Annotated[str, Param(min_length=3, max_length=30)]
    age: Annotated[int, Param(ge=0, le=120)]
```


## Custom Decoders
For advanced use cases, you can supply a custom decoder via Param:

```python
from lihil import Param
from typing import Annotated

def parse_data(value: bytes) -> CreateUser:
    # your custom logic
    return CreateUser(...)

@user.post
async def create_user(
    data: Annotated[CreateUser, Param("body", decoder=parse_data)]
): ...
```

This gives you full control over how raw body bytes are interpreted.


In summary, body parameters are a powerful way to send structured data in HTTP requests. They are essential for APIs that need to accept complex data types, such as JSON objects or binary files. Lihil makes it easy to work with body parameters, allowing you to define them using `msgspec.Struct` or `Param("body")`. You can also apply validation constraints and even use custom decoders for advanced scenarios.
