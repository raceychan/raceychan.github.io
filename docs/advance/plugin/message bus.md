---
title: event
---

## Message System

Lihil has built-in support for both in-process message handling (Beta) and out-of-process message handling (implementing), it is recommended to use `EventBus` over `BackGroundTask` for event handling.

There are three primitives for event:

1. publish: asynchronous and blocking event handling that shares the same scope with caller.
2. emit: non-blocking asynchrounous event hanlding, has its own scope.
3. sink: a thin wrapper around external dependency for data persistence, such as message queue or database.

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
bus_route = Route("/bus", plugins=BusPlugin(BusTerminal(registry)).decorate)


@bus_route.post
async def create_todo(name: str, content: str, bus: PEventBus) -> Annotated[Empty, status.OK]:
    await bus.publish(TodoCreated(name, content))
```

`PEventBus` is an alias for `Annotated[EventBus[Any], Param("plugin")]`

## Event handlers

An event can have multiple event handlers, they will be called in sequence, config your `BusTerminal` with `publisher` then inject it to `Lihil`.

- An event handler can have as many dependencies as you want, but it should at least contain two params: a sub type of `Event`, and a sub type of `MessageContext`.

- if a handler is reigstered with a parent event, it will listen to all of its sub event.
  for example,

- a handler that listens to `UserEvent`, will also be called when `UserCreated(UserEvent)`, `UserDeleted(UserEvent)` event is published/emitted.

- you can also publish event during event handling, to do so, declare one of your dependency as `EventBus`,

```python
async def listen_create(created: TodoCreated, _: Any, bus: PEventBus):
    if is_expired(created.created_at):
        event = TodoExpired.from_event(created)
        await bus.publish(event)
```
