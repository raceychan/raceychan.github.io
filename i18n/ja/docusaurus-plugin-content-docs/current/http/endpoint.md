---
sidebar_position: 1.1
title: エンドポイント
---

# エンドポイント

`エンドポイント`は`lihil`で最も原子的なASGIコンポーネントで、クライアントが`Route`によって公開されたリソースとやり取りする方法を定義します。

### パラメータ解析

```python
from lihil import Route
from ididi import NodeConfig
from typing import Annotated, NewType
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine


async def get_conn(engine: AsyncEngine) -> AsyncConnection:
    async with engine.begin() as conn:
        yield conn

UserID = NewType("UserID", str)

def user_id_factory() -> UserID:
    return UserID(str(uuid4()))

user_route = Route("/users", deps=[get_conn, (user_id_factory, NodeConfig(reuse=False))])

@user_route.post
async def create_user(
    user: UserData, user_id: UserID, conn: AsyncConnection
) -> Annotated[UserDB, stauts.Created]:

    sql = user_sql(user=user, id_=user_id)
    await conn.execute(sql)
    return UserDB.from_user(user, id=user_id)
```

ここで、

1. `user_id`は`user_id_factory`によって作成され、文字列形式のuuidを返します。
2. `conn`は`get_conn`によって作成され、`AsyncConnection`のインスタンスを返し、接続はリクエスト後にエンジンに返されます。
3. `UserDB`はJSON シリアライズされ、コンテンツタイプが`application/json`、ステータスコードが`201`のレスポンスを返します。

### パラメータを明示的に宣言

`Param`でパラメータを明示的に宣言すると、Lihilにそれ以上の分析なしにそのまま扱うように指示します。

**例**：

```python
async def login(cred: Annotated[str, Param("header", alias="User-Credentials")], x_access_token: Annotated[str, Param("header")]) : ...
```

- ここでパラメータ`cred`は`User-Credentials`キーのヘッダーを期待します。

- キーが提供されない場合、パラメータ名のkebab-caseが使用されます。例えば、ここで`x_access_token`は`x-access-token`キーのヘッダーを期待します。

### データ検証

lihilはmsgspecを使用してすぐに使えるデータ検証機能を提供します。

### 制約

`typing.Annotated`と`Param`を組み合わせてパラメータに制約を設けることができます：

```python
from lihil import Param
all_users = Route("/users")

@all_users.get
async def get_users(numers: Annotated[int, Param(gt=0)]):
    ...
```

ここで`get_user`は`0`より大きい値の整数である`numers`クエリパラメータを期待します。

### 戻り値マーク

エンドポイントのステータスコードやコンテンツタイプを変更したい場合、1つまたは複数の`戻り値マーク`の組み合わせを使用できます。例えば、ステータスコードを変更するには：

```python
from lihil import Annotated, status

async def create_user(user: UserData, engine: Engine) -> Annotated[UserDB, status.Created]:
    ...
```

現在`create_user`はデフォルトの`200`ではなく、ステータスコード`201`を返します。

使用したい戻り値マークがいくつかあります：

| 戻り値マーク | 目的                                                   | 型引数              | 注記                               | 例                |
| ----------- | ------------------------------------------------------ | ------------------- | ---------------------------------- | ----------------- |
| `Json[T]`   | `application/json`コンテンツタイプのレスポンス         | `T`: レスポンス本体型 | 指定されない場合のデフォルト戻り値型 | `Json[list[int]]` |
| `Stream[T]` | `text/event-stream`コンテンツタイプのサーバー送信イベント | `T`: イベントデータ型 | イベントストリーミング用             | `Stream[str]`     |
| `Text`      | `text/plain`コンテンツタイプのプレーンテキストレスポンス | なし                | シンプルテキストレスポンス用         | `Text`            |
| `HTML`      | `text/html`コンテンツタイプのHTMLレスポンス            | なし                | HTMLコンテンツ用                   | `HTML`            |
| `Empty`     | 空のレスポンス（本体なし）                             | なし                | 戻すコンテンツがないことを示す       | `Empty`           |