---
title: event
---

## Система сообщений

Lihil имеет встроенную поддержку как внутрипроцессной обработки сообщений (Beta), так и межпроцессной обработки сообщений (реализуется). Рекомендуется использовать `EventBus` вместо `BackGroundTask` для обработки событий.

Существует три примитива для событий:

1. publish: асинхронная и блокирующая обработка событий, которая разделяет ту же область видимости с вызывающей стороной.
2. emit: неблокирующая асинхронная обработка событий, имеет свою собственную область видимости.
3. sink: тонкая обёртка вокруг внешней зависимости для хранения данных, такой как очередь сообщений или база данных.

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

`PEventBus` является алиасом для `Annotated[EventBus[Any], Param("plugin")]`

## Обработчики событий

Событие может иметь несколько обработчиков событий, они будут вызываться последовательно. Настройте ваш `BusTerminal` с `publisher`, затем внедрите его в `Lihil`.

- Обработчик события может иметь столько зависимостей, сколько вы хотите, но он должен содержать как минимум два параметра: подтип `Event` и подтип `MessageContext`.

- если обработчик зарегистрирован с родительским событием, он будет слушать все его подсобытия.
  например,

- обработчик, который слушает `UserEvent`, также будет вызван, когда публикуется/испускается событие `UserCreated(UserEvent)`, `UserDeleted(UserEvent)`.

- вы также можете публиковать событие во время обработки события, для этого объявите одну из ваших зависимостей как `EventBus`,

```python
async def listen_create(created: TodoCreated, _: Any, bus: PEventBus):
    if is_expired(created.created_at):
        event = TodoExpired.from_event(created)
        await bus.publish(event)
```
