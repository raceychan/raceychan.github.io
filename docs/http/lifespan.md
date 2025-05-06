# Lifespan
`lifespan` is a ASGI-protocol that would be invoked when your app starts and stops.

lihil expects a lifespan with following interface:

```python
type LifeSpan[T: Mapping[str, Any] | None] = Callable[
    ["Lihil[T]"], AsyncContextManager[T] | AsyncGenerator[T, None]
]
```

Example:

```python
from typing import TypedDict

class ExampleState(TypedDict):
    engine: AsyncEngine


async def example_lifespan(app: Lihil[None]):
    engine = create_async_engine(app.app_congig)
    yield ExampleState(engine=Engine)
    await engine.dispose()

lhl = Lihil(lifespan=example_lifespan)
```

## when to use lifespan & what to do in lifespan handler

1. test service availability
2. create singleton objects that should not be recycled untill app dies
3. clean up
4. logging

## app state

object yield from the lifespan is called `AppState`

You might declare dependency injection in your endpoint using the `AppState` mark.

Example
```python
async def get_app_name(app_name: AppState[str]):
    return app_name
```

## Technic details

When an asgi server(for example, uvicorn),  starts and stops, it sends an lifespan event to the web framework it is hosting(for example, lihil).
The lihil receives the lifespan message, it would first run user provided lifespan handler(if there is one), then run internal setups.