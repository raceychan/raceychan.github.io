---
title: クイックスタート
sidebar_position: 1
slug: /
---

# クイックスタート

## Hello World

```python title="app/main.py"
from lihil import Lihil, Text, Annotated

lhl = Lihil()

@lhl.get
def hello(world: str = "world") -> Annotated[Text, 200]:
    return f"hello, {world}!"
```

### uvicornを使用してアプリを実行

```bash
uvicorn app.main:lhl
```

## より大きなアプリ

### Python関数を定義

データベースでユーザーを作成する関数を定義することから始めましょう。

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

### 関数をエンドポイントとして公開

```python title="app/users/api.py"
from lihil import Route

users_route = Route("/users")
users_route.factory(get_engine)
users_route.post(create_user)
```

わずか3行で、以下を実現しました：

1. パス"/users"でRouteを作成。
2. `get_engine`をファクトリ関数として使用して`AsyncEngine`を依存関係として登録。
3. create_userをPOSTエンドポイントとして登録。

### ルートをアプリに含める

```python title="app/main.py"
from lihil import Lihil
from app.users.api import user_route


lihil = Lihil(user_route)

if __name__ == "__main__":
    lihil.run(__file__)
```

### lihilを使用してアプリを実行

```bash
python -m app.main
```