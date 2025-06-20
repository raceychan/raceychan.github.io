---
title: 事件
---

## 消息系统

Lihil 内置支持进程内消息处理（Beta）和进程外消息处理（实现中），建议使用 `EventBus` 而不是 `BackGroundTask` 来处理事件。

事件有三个原语：

1. publish：异步且阻塞的事件处理，与调用者共享相同的作用域。
2. emit：非阻塞异步事件处理，拥有自己的作用域。
3. sink：围绕外部依赖项进行数据持久化的薄包装器，如消息队列或数据库。

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

`PEventBus` 是 `Annotated[EventBus[Any], Param("plugin")]` 的别名

## 事件处理器

一个事件可以有多个事件处理器，它们将按顺序调用，使用 `publisher` 配置你的 `BusTerminal`，然后将其注入到 `Lihil`。

- 事件处理器可以有任意多的依赖项，但至少应包含两个参数：`Event` 的子类型和 `MessageContext` 的子类型。

- 如果处理器注册到父事件，它将监听所有子事件。
  例如，

- 监听 `UserEvent` 的处理器，在发布/发出 `UserCreated(UserEvent)`、`UserDeleted(UserEvent)` 事件时也会被调用。

- 你也可以在事件处理期间发布事件，为此，将你的依赖项之一声明为 `EventBus`，

```python
async def listen_create(created: TodoCreated, _: Any, bus: PEventBus):
    if is_expired(created.created_at):
        event = TodoExpired.from_event(created)
        await bus.publish(event)
```