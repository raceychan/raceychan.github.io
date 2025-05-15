---
sidebar_position: 1
title: path
slug: path-parameter
---


# Path Parameters

In an HTTP request, the URL path plays a central role in routing. It's how the server knows *what resource* the client is trying to access. But paths aren't just static—they often carry dynamic values known as **path parameters**.

## What Are Path Parameters?

A path parameter is a variable part of the URL path. It’s typically used to identify a specific resource. For example:

```http
GET /users/42 HTTP/1.1
Host: example.com
```

In this example, /users/42 is requesting the user whose ID is 42. The 42 is a path parameter—data embedded directly in the URL structure.

embedded directly in the URL structure.

## Path Parameters in lihil

In lihil, path parameters are first-class citizens. You declare them directly in your route definition, and lihil automatically extracts them from the URL and passes them into your endpoint as regular Python arguments.

For example:

```python
from lihil import Route

user = Route("/users/{user_id}")

@user.get
async def get_user(user_id: int) -> User:
    ...
```

Here, `user_id` is a path parameter. When a request like `GET /users/42` comes in, lihil parses the URL, converts 42 to an integer (based on the type hint), and passes it to your function.

You don’t need to write any parsing logic. You don’t even need to look at the IRequest object directly. lihil handles everything from extracting the value to performing type conversion.

## Path vs Other Parameters

Path parameters are one-dimensional: they carry a single, fixed value—like an ID, slug, or name. They are perfect for identifying a specific resource.

Compare this with:

`query` parameters, which can represent filters, pagination, or lists of values.

`headers`, which usually carry metadata or control instructions.

`request body`, which holds structured data like JSON or form submissions.

Each of these has its place, and lihil supports them all—but path parameters are the most direct and visible part of the URL.

In the next post, we'll explore query parameters and headers—how they appear in requests, what they're used for, and how lihil helps you declare and validate them cleanly.

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
