---
sidebar_position: 2
title: ルート
---

ルートを定義すると、クライアントがリクエストできる特定の**パス**を通じてリソースを公開します。そして、ルートに`Endpoint`を追加して、クライアントがそのリソースで何ができるかを決定します。

URL `https://dontclickme.com/users`を例に取ると、パス`/users`はリソース`users`を指し示します。

## ルートの定義

```python
from lihil import Route

users_route = Route("/users")
```

使用したい既存の`lihil.Graph`と`lihil.MessageRegistry`がある場合は、ルートコンストラクタに入れてください。

これは依存関係とイベントリスナーを別々のファイルに保持している場合に便利です。例：

```python
from project.users.deps import user_graph
from project.users.listeners import user_eventregistry

user_route = Route(graph=user_graph, registry=user_eventregistry)
```

また、特定のルートにのみ適用したいミドルウェアをルートに追加することもできます。

```python
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

Route(middlewares=[CORSMiddleware])
route.add_middleware(HTTPSRedirectMiddleware)
```

### ルートにエンドポイントを登録

前の議論では、`users_route`の`POST`リクエストのエンドポイントとして`create_user`を公開しました。
同様の構文で他のHTTPメソッドも宣言でき、これには以下が含まれます：

| メソッド    | 冪等性     | 目的                                               | 例               |
| --------- | ---------- | -------------------------------------------------- | ---------------- |
| `GET`     | はい       | サーバー状態を変更せずにデータを取得               | `@route.get`     |
| `POST`    | いいえ     | リソースを作成またはアクションをトリガーするデータを送信 | `@route.post`    |
| `HEAD`    | はい       | GETと同じですが、ヘッダーのみを返す                | `@route.head`    |
| `OPTIONS` | はい       | 許可されたメソッドとCORS情報を発見                 | `@route.options` |
| `TRACE`   | はい       | 受信したリクエストをエコー（デバッグ用）           | `@route.trace`   |
| `PUT`     | はい       | 提供されたデータでリソースを置換                   | `@route.put`     |
| `DELETE`  | はい       | リソースを削除                                     | `@route.delete`  |
| `PATCH`   | いいえ     | リソースに部分的な変更を適用                       | `@route.patch`   |
| `CONNECT` | いいえ     | サーバーへのトンネルを確立（例：HTTPS）            | `@route.connect` |

これは、ルートが0-9個のエンドポイントを持つことができることを意味します。

複数のHTTPメソッドに関数を公開するには

- 関数に複数のデコレータを適用

- または、同等に`Route.add_endpoint`を使用

```python
users_route.add_endpoint("GET", "POST", ...,  create_user)
```

## サブルートの定義

前の議論では、ユーザーリソースのコレクションである`users`のルートを作成しました。
特定のユーザーリソースを公開するには：

```python
user_route = users_route.sub("{user_id}")

@user_route.get
async def get_user(user_id: str, limit: int = 1): ...
```

ここで、
`users_route`のサブルートを定義し、ルートを`Lihil`に含めると、そのすべてのサブルートも再帰的に含まれます。

Route.subは冪等で、同じパスで複数回呼び出すことができます。

```python
@users_route.sub("{user_id}").get
async def get_user(user_id: str, limit: int = 1): ...

@users_route.sub("{user_id}").put
async def update_user(data: UserUpdate): ...
```

ここで、`get_user`と`update_user`は両方とも同じルートの下にあります。

## サブルートを含める

大きなアプリでは、通常、人々は最初にサブルートを作成してから親ルートに含めます。そのためには、`Route.include_subroutes`を使用します

```python
parent = Route("/parent")
sub = Route("/sub")

parent.include_subroutes(sub)
assert parent.subroutes[0].path == "/parent/sub"
```

`Route.sub`と`Route.include_subroutes`の違いは：

- `Route.sub`は文字列型のパスに基づいて新しい空のルートを作成
- `Route.include_subroutes`は既存のルートをサブルートとして再帰的に含め、それらのプロパティ（エンドポイント、ミドルウェアなど）に基づいて再作成

各ルートに対してファイルを作成することが推奨されます：

```python title="api/cart/items.py"
items = Route("/items")

@items.get
def list_items(): ...

@items.sub("/{item_id}").get
def get_item(item_id: str) :...
```

次に、フォルダの`__init__.py`で親ルートを作成し、サブルートを含めます

```python title="api/cart/__init__.py"
from .items import items

carts = Route("/carts")
carts.include_subroutes(items)
```

## ルートルート

パス`/`のルートがルートルートです。提供されない場合、ルートルートはデフォルトで`Lihil`によって作成され、`Lihil.{http method}`を通じて登録されたものはすべてルートルートの下にあります。

以下の例は機能的に同じです

1. `Lihil`インスタンスをルートルートとして使用

```python
lhl = Lihil()
@lhl.get
async def hello():
    return "hello, world"
```

2. ルートルートを作成してから`Lihil`インスタンスに含める

```python
root = Route()

@root.get
async def hello():
    return "hello, world"
lhl = Lihil(root)
```
