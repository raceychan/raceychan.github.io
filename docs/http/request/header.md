---
sidebar_position: 3
title: header
slug: header-parameter
---


# Headers

Headers are key-value pairs sent along with an HTTP request. They carry metadata about the request—like content type, authorization tokens, client information, and more. Headers are not part of the URL or the body, but are sent in a separate section between the request line and the body.

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


## Accessing Headers in lihil
While lihil abstracts away raw headers, you can easily declare header parameters directly in your endpoint using `Param("header")`.


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
