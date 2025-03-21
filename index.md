# lihil

## lihil

Unbelievably fast async webframework offering high-level development, low-level performance, proudly written in python. Multiplying 0.1x engineers by a factor of 100.

```python
from lihil import Lihil

lhl = Lihil()

@lhl.get
async def hello():
    return {"hello": "world!"}
```

### Source: 
https://github.com/raceychan/lihil

### Docs
Docs: https://lihil.cc/lihil

## Ididi
(ididi is used for di internally by lihil)

A type-based, full-fledged dependency injection library baesd on DAG, that is as fast as hard-coded factories(optimized by cython). 

Bides advanced features like infinite nested scope and protocol-implementation-separatetion, ididi smartly deduce dependency relationship based on type annotation, and will reduce your boilerplate factory codes significantly, with minimal changes(or no at all) to existing codebase.

```python
from typing import AsyncGenerator
from ididi import use, entry

async def conn_factory(engine: AsyncEngine) -> AsyncGenerator[AsyncConnection, None]:
    async with engine.begin() as conn:
        yield conn

class UnitOfWork:
    def __init__(self, conn: AsyncConnection=use(conn_factory)):
        self._conn = conn

@entry
async def main(command: CreateUser, uow: UnitOfWork):
    await uow.execute(build_query(command))

# note uow is automatically injected here
await main(CreateUser(name='user'))
```

## anywise
(anywise is used as message system internally by lihil)

A modern type-based messaging framework in python, designed for the ease of architecture evolvement.

```python
from anywise import EventBus
from lihil import Route, Lihil

lhl = Lihil()

@lhl.sub("/users").post
async def signup(command: CreateUser, bus: EventBus) -> User:
    return await bus.publish(command)
```

