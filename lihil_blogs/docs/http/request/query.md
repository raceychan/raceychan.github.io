---
sidebar_position: 2
title: query
slug: query-parameter
---

# Query Parameters

Query parameters are a flexible way to pass data to your server through the URL—especially for things like filters, pagination, or optional inputs. They appear after a `?` in the URL and are made up of key-value pairs.

## What Do Query Parameters Look Like?

Here’s a simple request with query parameters:

```http
GET /articles?keyword=book&page=2 HTTP/1.1
Host: example.com
```

In this example:

- `keyword` is a query parameter with the value `book`.
- `page` is another query parameter with the value `2`.

These values are transmitted in the request URL as plain text strings. Lihil will automatically handle parsing and type conversion based on your function signature.

## Query Parameters vs Other Request Parameters

1. Location in Request
   Query parameters are encoded in the URL, after the path pameters and starts with a `?`, as part of the request line:

   ```http
   GET /search?query=python&sort=asc HTTP/1.1
   ```

2. Encoding Format
   Query parameters are URL-encoded. For example:

   ```http
   ?q=hello%20world
   ```

   This means special characters (like spaces) are percent-encoded.

3. Data Types
   Query parameters support:

   - Primitive types: str, int, float, bool
   - Arrays/lists: list[str], list[int]

   Unlike body parameters, they cannot represent nested structures like dictionaries.
   Unlike path parameters, query parameters can have repeated keys (e.g., tag=python&tag=web).

## Declaring Query Parameters in lihil

You can declare a query parameter both implictly and explictly

### Implictly declare a query param

```python

from lihil import Route

articles = Route("/articles")

@articles.get
async def search(keyword: str, page: int = 1):
    ...
```

If a request comes in as `/articles?keyword=book&page=2`, lihil will:

- extract keyword and page from the query string,
- convert page to an integer (based on the type hint),
- pass both values to your function.
- If page is not provided, the default value 1 will be used.
- If a query parameter without default value is missing or has an invalid type that can't be coerced, lihil will respond with an `InvalidRequest` error automatically.

### Explictly declare a query param with `Param`

Alternatively, you might declare the param more explictly by combining `typing.Annotated` and `lihil.Param`.

```python
@articles.get
async def search(keyword: Annotated[str, Param("query")], page: Annotated[int, Param("query")] = 1):
    ...
```

## Array-like Query Parameters

Unlike path parameters, query parameters can behave like two-dimensional data. That means you can have multiple values for the same key—perfect for arrays or repeated options:

```http
GET /filter?tag=python&tag=web&tag=backend HTTP/1.1
```

In lihil, you can declare this with a list type:

```python
from lihil import Route

@Route("/filter")
async def filter_by_tags(tag: list[str]):
    ...
```

lihil will collect all tag values and give them to you as a list.

For `/filter?tag=web&tag=python`, you'll receive `["web", "python", "backend"]` as the value of tag.

## Data Validation

For array-style query parameters, lihil.Param allows you to enforce constraints like max length or item validation.

```python

from lihil import Param

Tags = Param(max_length=5)

@route("/articles")
async def search_articles(tags: Annotated[list[str], Tags]) -> JSONResponse:
    ...
```

In this case, if a request includes more than 5 tags, lihil will reject it with a 422 error.

You can also validate scalar query parameters the same way—for example, to enforce range limits or regex rules.

```python

Page = Param(ge=1)

@route("/articles")
async def list_articles(page: Annotated[int, Page]) -> JSONResponse:
    ...
```

## Custom Validation

Need more control? You can define a custom decoder for advanced validation logic. This works for both single and list-based query parameters.

```python
from lihil import Param, HTTPException

class BlockedTagError(HTTPException[str]):
    "This tag is not allowed"

def tag_decoder(value: str) -> str:
    if value in {"banned", "spam"}:
        raise BlockedTagError(f"Tag '{value}' is blocked")
    return value

@route("/filter")
async def filter_tags(tags: Annotated[list[str]: Param(decoder=tag_decoder)]) -> JSONResponse:
    ...
```

In this example, if a user tries to filter with a blocked tag like `"banned"` or `"spam"`, lihil will raise a `BlockedTag` error. The request will be rejected with a 422 error, and the message will indicate which tag was blocked.

Query parameters are not just key-value strings—they're a flexible and powerful part of request handling. With lihil, you get type conversion, validation, and structure with minimal effort.

## Recap

- Query parameters appear in the URL and are ideal for filters, search terms, and pagination.

- They support both primitive types and repeated keys (lists).

- In lihil, you can declare them implicitly via type hints or explicitly using Param for validation.

- You can add constraints or custom decoders for robust input validation.
