---
sidebar_position: 3
title: header
slug: header-parameter
---

# Headers

Headers are key-value pairs sent along with an HTTP request. They carry metadata about the request—like content type, authorization tokens, client information, and more. Headers are not part of the URL or the body, but are sent in a separate section between the request line and the body.

## What Do Header Parameters Look Like?

Here’s what a request with headers might look like:

```http
GET /profile HTTP/1.1
Host: example.com
User-Agent: curl/8.5.0
Accept: application/json, text/plain, text/html
```

Each header is structured as a key-value pair, and according to the HTTP specification (RFC 7230), a header key can appear multiple times with different values. When that happens, the values are either:

- sent as separate header lines with the same key
- combined into a single comma-separated value.

## Header Parameters vs Other Request Parameters

1. Location in Request
   Header parameters are part of the HTTP headers, sent separately from the URL and body. For example:

   ```http
   GET /resource HTTP/1.1
   Host: example.com
   Authorization: Bearer abc123
   X-Custom-Header: value
   ```

2. Encoding Format
   Headers are plain text key-value pairs. Unlike query parameters, they are not URL-encoded, but values must conform to HTTP header standards.

3. Data Types
   Headers typically carry strings but can be parsed into primitive types like int, bool, or custom types as needed.

4. Use Cases
   Headers are commonly used for metadata such as authentication tokens, content type, user agent info, or custom control flags. They’re not designed to carry large or complex data structures like body parameters.

## Declaring Header Parameters in lihil

You can easily declare header parameters directly in your endpoint using `Param("header")`.

```python
from lihil import Route, Param
from typing import Annotated

route = Route("/greet")

@route.get
async def greet_user(
    user_agent: Annotated[str, Param("header")],  # Auto-maps to "user-agent"
    accept: Annotated[list[str], Param("header")],  # Handles comma-separated Accept
):
    return {"ua": user_agent, "accepts": accept}
```

## Multi-Value Headers

Some headers—like `Accept`, `Accept-Language`, `Cache-Control` naturally support multiple values, separated by commas.

lihil supports this out of the box. To accept a multi-value header, just use a list[str] type hint:

To accept a multi-value header, just use a list[str] type hint:

```python
accept: Annotated[list[str], Param("header")]
```

This will correctly parse:

```http
Accept: text/html, application/json
```

into:

```python
["text/html", "application/json"]
```

## Header Key Mapping

HTTP header names often use kebab-case (e.g. X-Request-ID), but Python variables can't contain dashes. lihil solves this in two ways:

Auto-mapping: By default, lihil will convert `my_token` to `my-token`.

Explicit aliasing: You can use the alias option to specify the exact header key:

```python
request_id: Annotated[str, Param("header", alias="x-request-id")]
```

## Custom Decoder

for more complex headers, you can define a custom decoder function. This function takes the raw header value and returns the desired type.

```python
from lihil import Route, Param
from typing import Annotated

def custom_decoder(value: str) -> str:
    # Custom decoding logic
    return value.lower()

route = Route("/greet")

@route
async def create_user(
    user_agent: Annotated[str, Param("header")],
    custom_header: Annotated[str, Param("header", decoder=custom_decoder)],
):
    return {"ua": user_agent, "custom": custom_header}
```

## Recap

- Header parameters are part of HTTP headers, carrying metadata like auth tokens or custom flags.
- They are plain text key-value pairs, not URL-encoded.
- In lihil, declare headers explicitly using Annotated with Param(alias=...) for exact header names.
- lihil handles type conversion, validation, and default values automatically.
- Missing or invalid headers result in automatic error responses for robust input handling.
