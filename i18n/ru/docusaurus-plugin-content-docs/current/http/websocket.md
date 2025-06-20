---
sidebar_position: 3
title: websocket
---

### WebSocket

lihil поддерживает использование websocket, вы можете использовать `WebSocketRoute.ws_handler` для регистрации функции, которая обрабатывает websocket'ы.

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

Тестирование

```python
from lihil.vendors import TestClient # требует установки httpx

client = TestClient(lhl)
with client:
    with client.websocket_connect(
        "/web_socket/session123?max_users=5"
    ) as websocket:
        data = websocket.receive_text()
        assert data == "Hello, world!"
```

#### websocket против http

- Обработчики WebSocket должны быть асинхронными — поскольку связь двунаправленная и управляемая событиями, обработчик должен использовать async def для поддержки неблокирующего взаимодействия.

- WebSocket-соединения не поддерживают тела запросов так же, как HTTP — нет параметра Body во время рукопожатия. Все данные обмениваются после установления соединения, обычно через сообщения, отправляемые по протоколу WebSocket.

- WebSocket'ы имеют состояние — в отличие от HTTP, который не имеет состояния, WebSocket-соединение сохраняется, позволяя непрерывную связь между клиентом и сервером. Это позволяет поддерживать состояние по каждому соединению (например, пользовательские сессии, данные в памяти).

- WebSocket'ы используют другой жизненный цикл — они начинаются с HTTP-рукопожатия (обычно GET-запрос), затем обновляют протокол. После этого связь осуществляется по протоколу WebSocket, а не по HTTP.

- Стандартные шаблоны запрос/ответ не применяются — WebSocket'ы основаны на сообщениях и поддерживают взаимодействие в реальном времени, поэтому традиционные концепции, такие как статус-коды, заголовки на сообщение или парсинг тела, не применяются напрямую после начального рукопожатия.