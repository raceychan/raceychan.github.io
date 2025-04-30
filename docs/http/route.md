---
sidebar_position: 2
title: route
---

When you define a route, you expose a resource through a specific **path** that clients can request. you then add an `Endpoint` on the route to determin what clients can do with the resource.

Take url `https://dontclickme.com/users` as an example, path `/users` would locate resource `users`.

## Defining an route

```python
from lihil import Route

users_route = Route("/users")
```

If you have existing `lihil.Graph` and `lihil.MessageRegistry` that you would like to use, put then in the route constructor.

This is useful if you keep dependencies and event listeners in separate files, example:

```python
from project.users.deps import user_graph
from project.users.listeners import user_eventregistry

user_route = Route(graph=uesr_graph, registry=user_eventregistry)
```

You can also add middlewares to a route if you want them to apply only to that specific route.

```python
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

Route(middlewares=[CORSMiddleware])
route.add_middleware(HTTPSRedirectMiddleware)
```

### register endpoint to an route.

In previous dicussion, we expose `create_user` as an endpoint for `POST` request of `users_route`.
we can also declare other http methods with similar syntax, this includes:

- `GET`
- `POST`
- `HEAD`
- `OPTIONS`
- `TRACE`
- `PUT`
- `DELETE`
- `PATCH`
- `CONNECT`

This means that an route can have 0-9 endpoints.

to expose a function for multiple http methods

- apply multiple decorators to the function

- or, equivalently, use `Route.add_endpoint`

```python

users_route.add_endpoint("GET", "POST", ...,  create_user)
```

## Defining an sub-route

In previous discussion, we created a route for `users`, a collection of the user resource,
to expose an specific user resource,

```python
user_route = users_route.sub("{user_id}")

@user_route.get
async def get_user(user_id: str, limit: int = 1): ...
```

Here,
we define a sub route of `users_route`, when we include an route into our `Lihil`, all of its sub-routes will also be included recursively.

Route are unique to path, thus, you might call it constructor with same path multiple times.

```python
@users_route.sub("{user_id}").get
async def get_user(user_id: str, limit: int = 1): ...

@users_route.sub("{user_id}").put
async def update_user(data: UserUpdate): ...
```

here both `get_user` and `update_user` are under the same route.

## The root route

an route with path `/` is the root route, if not provided, root route is created with `Lihil` by default, anything registered via `Lihil.{http method}` is the under the root route.