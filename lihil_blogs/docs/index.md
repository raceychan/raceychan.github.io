---
title: QuickStart
sidebar_position: 1
slug: /
---

# Quick Start:

## Hello World

```python title="app/main.py"
from lihil import Lihil, Text, Annotated

lhl = Lihil()

@lhl.get
def hello(world: str = "world") -> Annotated[Text, 200]:
    return f"hello, {world}!"
```

### Serve your app using uvicorn

```bash
uvicorn app.main:lhl
```

## Larger app

### Define a python function

Let's start by defining a function that creates an user in the database.

```python title="app/users/api.py"
from msgspec import Struct
from sqlalchemy.ext.asyncio import AsyncEngine
from .users.db import user_sql

class UserDB(UserData):
    user_id: str

def get_engine() -> AsyncEngine:
    return AsyncEngine()

async def create_user(user: UserData, engine: AsyncEngine) -> UserDB:
    user_id = str(uuid4())
    sql = user_sql(user=user, id_=user_id)
    async with engine.begin() as conn:
        await conn.execute(sql)
    return UserDB.from_user(user, id=user_id)
```

### Expose the function as an endpoint:

```python title="app/users/api.py"
from lihil import Route

users_route = Route("/users")
users_route.factory(get_engine)
users_route.post(create_user)
```

With just three lines, we:

1. Create a Route with the path "/users".
2. Register `AsyncEngine` as a dependency, using `get_engine` as its factory.
3. Register create_user as the POST endpoint.

### Include the route into app

```python title="app/main.py"
from lihil import Lihil
from app.users.api import user_route


lihil = Lihil(user_route)

if __name__ == "__main__":
    lihil.run(__file__)
```

### Serve your app using lihil

```bash
python -m app.main
```
