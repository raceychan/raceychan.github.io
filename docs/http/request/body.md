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

## Body Parameters vs Other Request Parameters

When handling HTTP requests, it's important to understand the difference between body parameters and other request parameters such as query parameters, path parameters, and header values. These differences affect how data is sent by the client and how it is parsed by the server.

1. Location in the Request
   Body parameters are transmitted in a fundamentally different way compared to other parameters.

   Let’s revisit a typical POST request example:

   ```http
   POST /submit HTTP/1.1
   Host: example.com
   Content-Type: application/json
   Content-Length: 27

   {"key": "value"}
   ```

   This HTTP request is divided into two parts, separated by a blank line:

   - Request line and headers (everything before the blank line): this includes the method (POST), the path (/submit), and headers like Content-Type.

   - Request body (everything after the blank line): this contains the actual payload, in this case, a JSON object.

   Unlike query or path parameters, body parameters do not appear in the URL or in headers. They are placed in the body of the request and are typically used to send structured data such as JSON, XML, or form-encoded values.

2. Encoding Format
   Another key difference is how body parameters are encoded:

   When sending query parameters, the encoding happens in the URL:

   ```http
   GET /search?query=python&sort=asc
   ```

   Query values are URL-encoded and relatively limited in size.

   - Body parameters, on the other hand, are encoded based on the `Content-Type` header. Common formats include:

     - application/json — for sending JSON payloads.

     - application/x-www-form-urlencoded — often used in HTML form submissions.

     - multipart/form-data — used when uploading files.

   The server uses the `Content-Type` header to decide how to parse the request body. For example, if the header is application/json, the server expects the body to contain valid JSON.

### Summary of Differences

| Feature             | Query/Path/Header Params        | Body Params                          |
| ------------------- | ------------------------------- | ------------------------------------ |
| Appears in URL?     | Yes                             | No                                   |
| Location in Request | Request line or headers         | After blank line (request body)      |
| Encoding Type       | URL-encoded (query), plain text | JSON, form data, multipart, etc.     |
| Use Case            | Small/simple values, routing    | Complex objects, forms, file uploads |

Understanding this distinction is essential when designing or consuming APIs, especially in typed frameworks like lihil, where body parameters and other parameters are declared differently and parsed with different logic under the hood.

## Declaring a Body Parameter in lihil

In lihil, there are two ways to declare a request body:

### Implicitly declare request body via Structured Data Type

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

since lihil `0.2.9`, Strucutred Data Types:

- `msgspec.Struct`
- `dataclasses.dataclass`
- `typing.Typeddict`
- `dict`

are supported for body param

### Explicitly with Param("body")

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

## Recap

- Body parameters are a powerful way to send structured data in HTTP requests.

- They are essential for APIs that need to accept complex data types, such as JSON objects or binary files.

- Lihil makes it easy to work with body parameters, allowing you to define them using Structured data types or `Param("body")`.

- You can also apply validation constraints and even use custom decoders for advanced scenarios.
