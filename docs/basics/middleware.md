### Middlewares

Both `Lihil` and `Route` has `add_middleware` API that accept one, or a sequence of `MiddlewareFactory`.

a `MiddlewareFactory` is a callable that receives one positional argument of type `ASGIApp` and returns a `ASGIApp`. for example:

```python
# This piece of code is for demonstration only.

def tracingmw_factory(next_app: ASGIApp) -> ASGIApp:
    async def tracemw(scope, receive, send):
        scope["trace_id"] = str(uuid.uuid4())
        await next_app(scope, receive, send)
    return trace_mw
```

lihil uses starlette internally, you can directly import middlewares from starlette, for example:

```python
from starlette.middleware.cors import CORSSMiddleware

lhl = Lihil(middlewares=[lambda app: CORSMiddleware(app, add_methods="*")])
```

for complex middleware that require many external dependencies, you might to construct them inside lifespan.