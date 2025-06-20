---
title: イベント
---

## メッセージシステム

Lihilには、プロセス内メッセージ処理（ベータ）とプロセス外メッセージ処理（実装中）の両方の組み込みサポートがあり、イベント処理には`BackGroundTask`よりも`EventBus`を使用することが推奨されます。

イベントには3つのプリミティブがあります：

1. publish：呼び出し元と同じスコープを共有する非同期でブロッキングなイベント処理。
2. emit：ノンブロッキング非同期イベント処理、独自のスコープを持つ。
3. sink：メッセージキューやデータベースなどのデータ永続化のための外部依存関係の薄いラッパー。

```python
from lihil import Route, status, Empty
from lihil.plugins.bus import Event, PEventBus
from lihil.plugins.testclient import LocalClient


class TodoCreated(Event):
    name: str
    content: str


async def listen_create(created: TodoCreated, ctx):
    assert created.name
    assert created.content


async def listen_twice(created: TodoCreated, ctx):
    assert created.name
    assert created.content

registry = MessageRegistry(event_base=Event)
registry.register(listen_create, listen_twice)
bus_plugin = BusPlugin(BusTerminal(registry))
bus_route = Route("/bus", plugins=[bus_plugin])


@bus_route.post
async def create_todo(
    name: str, content: str, bus: PEventBus
) -> Annotated[Empty, status.OK]:
    await bus.publish(TodoCreated(name, content))
```

`PEventBus`は`Annotated[EventBus[Any], Param("plugin")]`のエイリアスです

## イベントハンドラー

イベントは複数のイベントハンドラーを持つことができ、それらは順番に呼び出されます。`publisher`で`BusTerminal`を設定し、`Lihil`に注入してください。

- イベントハンドラーは任意の数の依存関係を持つことができますが、少なくとも2つのパラメータを含む必要があります：`Event`のサブタイプと`MessageContext`のサブタイプ。

- ハンドラーが親イベントで登録されている場合、そのすべてのサブイベントをリッスンします。
  例えば、

- `UserEvent`をリッスンするハンドラーは、`UserCreated(UserEvent)`、`UserDeleted(UserEvent)`イベントが発行/発出された際にも呼び出されます。

- イベント処理中にイベントを発行することもできます。そのためには、依存関係の1つを`EventBus`として宣言してください。

```python
async def listen_create(created: TodoCreated, _: Any, bus: PEventBus):
    if is_expired(created.created_at):
        event = TodoExpired.from_event(created)
        await bus.publish(event)
```