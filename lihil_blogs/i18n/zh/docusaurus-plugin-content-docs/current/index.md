---
title: 快速开始
sidebar_position: 1
slug: /
---

# 快速开始

## Hello World

```python title="app/main.py"
from lihil import Lihil, Text, Annotated

lhl = Lihil()

@lhl.get
def hello(world: str = "world") -> Annotated[Text, 200]:
    return f"hello, {world}!"
```

### 使用 uvicorn 启动应用

```bash
uvicorn app.main:lhl
```

## 更大的应用

### 定义 Python 函数

让我们从定义一个在数据库中创建用户的函数开始。

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

### 将函数暴露为端点

```python title="app/users/api.py"
from lihil import Route

users_route = Route("/users")
users_route.factory(get_engine)
users_route.post(create_user)
```

仅用三行代码，我们就实现了：

1. 创建一个路径为 "/users" 的路由。
2. 使用 `get_engine` 作为工厂函数注册 `AsyncEngine` 依赖。
3. 将 create_user 注册为 POST 端点。

### 将路由包含到应用中

```python title="app/main.py"
from lihil import Lihil
from app.users.api import user_route


lihil = Lihil(user_route)

if __name__ == "__main__":
    lihil.run(__file__)
```

### 使用 lihil 启动应用

```bash
python -m app.main
```