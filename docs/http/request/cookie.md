---
sidebar_position: 3.1
title: cookie
slug: cookie-parameter
---

## Cookie Parameters

HTTP cookies are small pieces of data stored in the user's browser and automatically sent with every request to the same origin. They are primarily used for session management, user preferences, and tracking.

```http
GET /dashboard HTTP/1.1
Host: example.com
Cookie: session_id=abc123; theme=dark
```

Cookies are passed as a single header (`Cookie`) but internally contain multiple key=value pairs separated by semicolons.

## When to use Cookies

Unlike headers or query parameters, which are set per request, cookies provide a way to persist user-specific state across multiple requests.
Here are a few common use cases:

- **Session ID**: Keeps users logged in by storing a session token (session_id)

- **CSRF Token**: Helps protect against cross-site request forgery attacks

- **User Preferences**: Stores UI settings like theme, language, or layout

- **Analytics and Tracking**: Stores user activity information for tools like Google Analytics

## Declaring Cookies in lihil

In Lihil, you can declare cookies in the same way as headers or query parameters via `Param("cookie")`.

```python
from lihil import Route, Param
from typing import Annotated

dashboard = Route("/dashboard")

@dashboard.get
async def show_dashboard(
    session_id: Annotated[str, Param("cookie")],
    theme: Annotated[str, Param("cookie")] = "light",
):
    return {"session": session_id, "theme": theme}
```

In the example above:

- `session_id` is a required cookie

- `theme` is optional and falls back to "light" if not provided

## Type Conversion and Validation

Just like with headers or query params, you can apply type annotations and validation constraints to cookies. For example:

```python
from lihil import Param
from typing import Annotated

user_id: Annotated[int, Param("cookie", gt=0)]
```

This will ensure that the `user_id` cookie is parsed as a positive integer. If parsing or validation fails, lihil will return a 422 Invalid Request.

In short, cookies provide a lightweight mechanism for storing and transmitting user-specific data. With lihil, extracting and validating cookie values is just as seamless as working with headers, path, or query parameters.
