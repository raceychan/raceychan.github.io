---
sidebar_position: 3
title: websocket
---

### WebSocket

lihil 支持 websocket 的使用，你可以使用 `WebSocketRoute.ws_handler` 来注册一个处理 websocket 的函数。

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

lhl = Lihil()
lhl.include_routes(ws_route)
```

测试

```python
from lihil.vendors import TestClient # 需要安装 httpx

client = TestClient(lhl)
with client:
    with client.websocket_connect(
        "/web_socket/session123?max_users=5"
    ) as websocket:
        data = websocket.receive_text()
        assert data == "Hello, world!"
```

#### websocket vs http

- WebSocket 处理器必须是异步的——由于通信是双向和事件驱动的，处理器必须使用 async def 来支持非阻塞交互。

- WebSocket 连接不像 HTTP 那样支持请求体——在握手期间没有 Body 参数。所有数据都在连接建立后交换，通常通过通过 WebSocket 协议发送的消息。

- WebSocket 是有状态的——与无状态的 HTTP 不同，WebSocket 连接持续存在，允许客户端和服务器之间的持续通信。这使得能够维护每个连接的状态（例如用户会话、内存数据）。

- WebSocket 使用不同的生命周期——它们以 HTTP 握手（通常是 GET 请求）开始，然后升级协议。之后，通信通过 WebSocket 协议完成，而不是 HTTP。

- 标准的请求/响应模式不适用——WebSocket 是基于消息的，支持实时交互，所以传统的概念（如状态码、每个消息的头部或请求体解析）在初始握手后不直接适用。