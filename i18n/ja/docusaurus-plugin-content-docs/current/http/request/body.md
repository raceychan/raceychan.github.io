---
sidebar_position: 4
title: ボディパラメータ
slug: body-parameter
---

# ボディパラメータ

パス、クエリ、ヘッダーパラメータは通常URLやヘッダーにエンコードされた小さなデータ片ですが、ボディパラメータはリクエストの主要なペイロードを運びます。これらは通常、クライアントがサーバーに構造化データを送信する必要がある POST、PUT、PATCH などのメソッドで使用されます。

例：

これはJSONボディを持つ典型的なHTTPリクエストです：

```http
POST /users HTTP/1.1
Content-Type: application/json

{
  "username": "alice",
  "age": 30
}
```

## ボディパラメータ vs その他のリクエストパラメータ

HTTPリクエストを処理する際、ボディパラメータとクエリパラメータ、パスパラメータ、ヘッダー値などの他のリクエストパラメータとの違いを理解することが重要です。

## lihilでボディパラメータを宣言

lihilでは、リクエストボディを宣言する2つの方法があります：

### 構造化データ型によるリクエストボディの暗黙的宣言

msgspec.Structを使用してボディモデルを単純に定義でき、lihilは自動的にそれをリクエストボディとして扱います：

```python

import msgspec
from lihil import Route

class CreateUser(msgspec.Struct):
    username: str
    age: int

user = Route("/users")

@user.post
async def create_user(data: CreateUser) -> str:
    return f"Hello {data.username}!"
```

これは、リクエストボディが構造化オブジェクト（例：JSONドキュメント）の場合の推奨方法です。

### Param("body")での明示的宣言

明示的にしたい場合、またはボディデータを他のタイプのパラメータと組み合わせる場合、Param("body")を使用できます：

```python
from lihil import Param
from typing import Annotated

@user.post
async def create_user(
    data: Annotated[CreateUser, Param("body")]
) -> str:
    return f"Hello {data.username}!"
```

## 制約と検証

ボディパラメータはmsgspecを使用するため、Structで直接検証制約を適用するか、パスやクエリパラメータと同様にParamを通じて適用できます：

```python
from lihil import Param
from typing import Annotated

class CreateUser(msgspec.Struct):
    username: Annotated[str, Param(min_length=3, max_length=30)]
    age: Annotated[int, Param(ge=0, le=120)]
```

## まとめ

- ボディパラメータはHTTPリクエストで構造化データを送信する強力な方法です。

- 複雑なデータ型（JSONオブジェクトやバイナリファイルなど）を受け入れる必要があるAPIに不可欠です。

- Lihilは構造化データ型や`Param("body")`を使用してボディパラメータを簡単に処理できます。

- 高度なシナリオには検証制約やカスタムデコーダーも適用できます。