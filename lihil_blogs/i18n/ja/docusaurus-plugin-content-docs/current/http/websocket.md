---
sidebar_position: 3
title: WebSocket
---

### WebSocket

lihilはWebSocketの使用をサポートしており、`WebSocketRoute.ws_handler`を使用してWebSocketを処理する関数を登録できます。

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

テスト

```python
from lihil.vendors import TestClient # httpxのインストールが必要

client = TestClient(lhl)
with client:
    with client.websocket_connect(
        "/web_socket/session123?max_users=5"
    ) as websocket:
        data = websocket.receive_text()
        assert data == "Hello, world!"
```

#### WebSocket vs HTTP

- WebSocketハンドラーは非同期である必要があります — 通信が双方向でイベント駆動であるため、ハンドラーはノンブロッキング相互作用をサポートするためにasync defを使用する必要があります。

- WebSocket接続はHTTPと同じ方法でリクエストボディをサポートしません — ハンドシェイク中にBodyパラメータはありません。すべてのデータは接続が確立された後に交換され、通常WebSocketプロトコルを介して送信されるメッセージを通じて行われます。

- WebSocketはステートフルです — ステートレスなHTTPとは異なり、WebSocket接続は持続し、クライアントとサーバー間の継続的な通信を可能にします。これにより、接続ごとの状態（例：ユーザーセッション、インメモリデータ）を維持できます。

- WebSocketは異なるライフサイクルを使用します — HTTPハンドシェイク（通常GETリクエスト）で始まり、その後プロトコルをアップグレードします。その後、通信はHTTPではなくWebSocketプロトコルで行われます。

- 標準的なリクエスト/レスポンスパターンは適用されません — WebSocketはメッセージベースでリアルタイム相互作用をサポートするため、ステータスコード、メッセージごとのヘッダー、またはボディ解析などの従来の概念は、初期ハンドシェイク後には直接適用されません。