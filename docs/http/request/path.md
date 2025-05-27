---
sidebar_position: 1
title: path
slug: path-parameter
---

# Path Parameters

In an HTTP request, the URL path plays a central role in routing. It's how the server knows _what resource_ the client is trying to access. But paths aren't just static—they often carry dynamic values known as **path parameters**.

## What Do Path Parameters Look Like?

A path parameter is a variable part of the URL path. It’s typically used to identify a specific resource. For example:

```http
GET /users/42 HTTP/1.1
Host: example.com
```

In this example:

- /users/42 is requesting the user whose ID is 42. The 42 is a path parameter—data embedded directly in the URL structure.

Although we can't be entirely sure about what are the path variables in an url, a restful api usually follows the pattern of

`/entity_name_in_plural/{entity_id}/sub_entity_name_in_plurals/{sub_entity_id}/...`

Here, `users` likely refers to the `User` entity, and `42` is the value of its ID.

## Path Parameters vs Other Request Parameters

Path parameters carry one-dimensional, fixed values like IDs, slugs, or names—ideal for identifying a single resource.

1. Location in Request
   Path parameters are part of the URL path itself, embedded directly within the route structure:

   ```http
   GET /users/42 HTTP/1.1
   ```

2. Encoding Format
   Path parameters are URL-encoded as part of the path segment. Special characters are percent-encoded, but they do not appear after a ?—they are part of the URL hierarchy.

3. Data Types
   Path parameters represent single, fixed values and support primitive types such as:

   str, int, float, bool

   Unlike query parameters, path parameters cannot represent arrays or repeated keys. They always carry exactly one value per parameter.

4. Purpose
   Path parameters typically identify a specific resource or entity by embedding identifiers in the URL path. In contrast, query parameters are used for filtering, pagination, or optional data.

## Declare Path Parameters in lihil

### Implicitly Declare a Path Param

In `lihil`, path parameters are first-class citizens.
you can declare path parameters implicitly by including them in the route path and matching function argument names:

For example:

```python
from lihil import Route

user = Route("/users/{user_id}")

@user.get
async def get_user(user_id: int) -> User:
    ...
```

Here, `user_id` is implicitly declared because it matches the `{user_id}` placeholder in the route path.

lihil automatically extracts and converts it from the URL.

For example,
If a request like GET /users/42 comes in, lihil:

- extracts 42 from the URL,
- converts it to int (based on the type hint),
- and passes it to the get_user function.

You don’t need to parse strings or access the raw request manually—lihil handles it.

### Explictly Declare a Path Param with `lihil.Param`

```python
from lihil import Route, Param
from typing import Annotated

PositiveInt = Annotated[int, Param(gt=0)]

user = Route("/users/{user_id}")

@user.get
async def get_user(user_id: PositiveInt) -> User:
    ...
```

## Type validation

Path parameters are validated based on their type hints. If you declare a path parameter as an `int`, lihil will automatically convert it to an integer. If the conversion fails, lihil will return a 422 Invalid Request error.

If a union of types is provided, lihil will try to convert the value to each type in the union until one succeeds. If none succeed, a 422 error is returned.

:::warning
If a union contains str or bytes, the conversion will always succeed, as these types can represent any value. This means that if you have a union like `Union[int, str]`, the path parameter will always be treated as a string.
:::

## Data Validation

You might also want to validate the value of the path parameter. For example, if you want to ensure that the user ID is positive, you can set such constraints using `lihil.Param`.

```python
from lihil import Route, Param

PositiveInt = Param(gt=0)

user = Route("/users/{user_id}")

@user.get
async def get_user(user_id: PositiveInt) -> User: ...
```

`lihil.Param` allows you to set various constraints on the path parameter, such as minimum and maximum values, regex patterns, and more. This is particularly useful for ensuring that the data you receive is valid before processing it.

`lihil.Param` uses `msgspec.Meta` under the hood, so you can use all the features of `msgspec.Meta` to validate your path parameters.

## Custom validation

You can also create custom validators for path parameters. This is useful when you have complex validation logic that can't be expressed with simple constraints.

```python
from lihil import Route, Param, HTTPException


class MyError(HTTPException[T]):
    "I don't like this value"


def decoder(value: str) -> int:
    # Custom decoding logic
    if value == "42":
        raise MyError("I don't like this value")
    return int(value)

async def create_user(user_id: int, user_age: Annotated[int, Param(decoder=decoder)]) -> User:
    # Your logic here
    pass
```

## Recap

- Path parameters are embedded directly in the URL path and identify specific resources.
- They carry exactly one value per parameter and support primitive types like int, str, and bool.
- In lihil, you can declare path parameters implicitly in the route path or explicitly with Param for validation and constraints.
- Custom decoders allow you to implement advanced validation and error handling for path parameters.
