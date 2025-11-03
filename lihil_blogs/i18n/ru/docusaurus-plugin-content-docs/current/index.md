---
title: Быстрый старт
sidebar_position: 1
slug: /
---

# Быстрый старт:

## Hello World

```python title="app/main.py"
from lihil import Lihil, Text, Annotated

lhl = Lihil()

@lhl.get
def hello(world: str = "world") -> Annotated[Text, 200]:
    return f"hello, {world}!"
```

### Запуск приложения с помощью uvicorn

```bash
uvicorn app.main:lhl
```

## Большое приложение

### Определение python функции

Начнем с определения функции, которая создает пользователя в базе данных.

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

### Регистрация функции как эндпоинт:

```python title="app/users/api.py"
from lihil import Route

users_route = Route("/users")
users_route.factory(get_engine)
users_route.post(create_user)
```

Всего тремя строками мы:

1. Создаем Route с путем "/users".
2. Регистрируем `AsyncEngine` как зависимость, используя `get_engine` как фабрику.
3. Регистрируем create_user как POST эндпоинт.

### Включение маршрута в приложение

```python title="app/main.py"
from lihil import Lihil
from app.users.api import user_route


lihil = Lihil(user_route)

if __name__ == "__main__":
    lihil.run(__file__)
```

### Запуск приложения с помощью lihil

```bash
python -m app.main
```