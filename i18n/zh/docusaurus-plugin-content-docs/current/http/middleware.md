### 中间件

`Lihil` 和 `Route` 都有 `add_middleware` API，接受一个或一系列 `MiddlewareFactory`。

`MiddlewareFactory` 是一个可调用对象，接收一个类型为 `ASGIApp` 的位置参数并返回一个 `ASGIApp`。例如：

```python
# 这段代码仅用于演示。

def tracingmw_factory(next_app: ASGIApp) -> ASGIApp:
    async def tracemw(scope, receive, send):
        scope["trace_id"] = str(uuid.uuid4())
        await next_app(scope, receive, send)
    return trace_mw

lhl = Lihil(middlewares=[lambda app: tracingmw_factory(app)])
```

lihil 内部使用 starlette，你可以直接从 starlette 导入中间件，例如：

```python
from starlette.middleware.cors import CORSMiddleware

lhl = Lihil(middlewares=[lambda app: CORSMiddleware(app, add_methods="*")])
```

对于需要许多外部依赖项的复杂中间件，你可能需要在生命周期内构造它们，这样你就可以使用 `lhl.graph` 来解析依赖项。