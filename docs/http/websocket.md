---
sidebar_position: 3
title: websocket
---

> Technically, websocket is not included in http, but parellel to it. we place it here for convenience of reading. 

### WebSocket

lihil supports the usage of websocket, you might use `WebSocketRoute.ws_handler` to register a function that handles websockets.

```python
from lihil import WebSocketRoute, WebSocket, Ignore, use

ws_route = WebSocketRoute("web_socket/{session_id}")

async def ws_factory(ws: Ignore[WebSocket]) -> Ignore[AsyncResource[WebSocket]]:
    await ws.accept()
    yield ws
    await ws.close()

@ws_route.ws_handler
async def ws_handler(
    ws: Annotated[WebSocket, use(ws_factory, reuse=False)],
    session_id: str,
    max_users: int,
):
    assert session_id == "session123" and max_users == 5
    await ws.send_text("Hello, world!")

lhl = Lihil[None]()
lhl.include_routes(ws_route)
```

Testing
```python
from lihil.vendors import TestClient # require httpx installed

client = TestClient(lhl)
with client:
    with client.websocket_connect(
        "/web_socket/session123?max_users=5"
    ) as websocket:
        data = websocket.receive_text()
        assert data == "Hello, world!"
```

#### websocket vs http

- WebSocket handlers must be asynchronous — since communication is bidirectional and event-driven, the handler must use async def to support non-blocking interaction.

- WebSocket connections do not support request bodies in the same way as HTTP — there is no Body parameter during the handshake. All data is exchanged after the connection is established, typically through messages sent via the WebSocket protocol.

- WebSockets are stateful — unlike HTTP, which is stateless, a WebSocket connection persists, allowing continuous communication between the client and server. This enables maintaining per-connection state (e.g. user sessions, in-memory data).

- WebSockets use a different lifecycle — they begin with an HTTP handshake (usually a GET request), then upgrade the protocol. After that, communication is done over the WebSocket protocol, not HTTP.

- Standard request/response patterns do not apply — WebSockets are message-based and support real-time interaction, so traditional concepts like status codes, headers per message, or body parsing don’t directly apply after the initial handshake.