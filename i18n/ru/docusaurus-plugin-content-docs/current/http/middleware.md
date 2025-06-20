### Middleware

И `Lihil`, и `Route` имеют API `add_middleware`, который принимает один или последовательность `MiddlewareFactory`.

`MiddlewareFactory` — это вызываемый объект, который получает один позиционный аргумент типа `ASGIApp` и возвращает `ASGIApp`. Например:

```python
# Этот фрагмент кода только для демонстрации.

def tracingmw_factory(next_app: ASGIApp) -> ASGIApp:
    async def tracemw(scope, receive, send):
        scope["trace_id"] = str(uuid.uuid4())
        await next_app(scope, receive, send)
    return trace_mw

lhl = Lihil(middlewares=[lambda app: tracingmw_factory(app)])
```

lihil использует starlette внутри, вы можете напрямую импортировать middleware из starlette, например:

```python
from starlette.middleware.cors import CORSSMiddleware

lhl = Lihil(middlewares=[lambda app: CORSMiddleware(app, add_methods="*")])
```

для сложных middleware, которые требуют много внешних зависимостей, вы можете конструировать их внутри lifespan, чтобы вы могли использовать `lhl.graph` для разрешения зависимостей.