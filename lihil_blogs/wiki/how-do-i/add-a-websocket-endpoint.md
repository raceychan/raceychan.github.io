---
title: add a WebSocket endpoint
---

How to
- Use `WebSocketRoute(path)` and `@route.ws_handler` with a factory that accepts/closes the connection.

Example
```python
from typing import Annotated
from lihil import WebSocketRoute, WebSocket, Ignore, use

ws_route = WebSocketRoute("/ws/{room}")

async def ws_factory(ws: Ignore[WebSocket]) -> Ignore[WebSocket]:
    await ws.accept()
    try:
        yield ws
    finally:
        await ws.close()

@ws_route.ws_handler
async def handler(ws: Annotated[WebSocket, use(ws_factory, reuse=False)], room: str):
    await ws.send_text(f"joined {room}")
```

References
- http/websocket.md:1
