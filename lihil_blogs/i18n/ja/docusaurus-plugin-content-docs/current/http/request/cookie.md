---
sidebar_position: 3.1
title: Cookie
slug: cookie-parameter
---

# Cookie

HTTP Cookieは、ユーザーのブラウザに保存され、同じオリジンへのすべてのリクエストで自動的に送信される小さなデータ片です。主にセッション管理、ユーザー設定、トラッキングに使用されます。

## Cookieパラメータはどのように見えるか？

```http
GET /dashboard HTTP/1.1
Host: example.com
Cookie: session_id=abc123; theme=dark
```

Cookieは単一のヘッダー（`Cookie`）として渡されますが、内部的にはセミコロンで区切られた複数のkey=valueペアを含んでいます。

## Cookieを使用するタイミング

リクエストごとに設定されるヘッダーやクエリパラメータとは異なり、Cookieは複数のリクエストにわたってユーザー固有の状態を永続化する方法を提供します。
以下はいくつかの一般的な使用ケースです：

- **セッションID**：セッショントークン（session_id）を保存してユーザーのログイン状態を維持

- **CSRFトークン**：クロスサイトリクエストフォージェリ攻撃から保護する支援

- **ユーザー設定**：テーマ、言語、レイアウトなどのUI設定を保存

- **分析とトラッキング**：Google Analyticsなどのツール用のユーザーアクティビティ情報を保存

## lihilでCookieを宣言

Lihilでは、`Param("cookie")`を介してヘッダーやクエリパラメータと同じ方法でCookieを宣言できます。

```python
from lihil import Route, Param
from typing import Annotated

dashboard = Route("/dashboard")

@dashboard.get
async def show_dashboard(
    session_id: Annotated[str, Param("cookie")],
    theme: Annotated[str, Param("cookie")] = "light",
):
    return {"session": session_id, "theme": theme}
```

上記の例では：

- `session_id`は必須のCookie

- `theme`はオプションで、提供されない場合は"light"にフォールバック

## 型変換と検証

ヘッダーやクエリパラメータと同様に、Cookieに型アノテーションと検証制約を適用できます。例：

```python
from lihil import Param
from typing import Annotated

user_id: Annotated[int, Param("cookie", gt=0)]
```

これにより、`user_id` Cookieが正の整数として解析されることが保証されます。解析または検証が失敗した場合、lihilは422 Invalid Requestを返します。

要するに、Cookieはユーザー固有のデータを保存・送信するための軽量なメカニズムを提供します。lihilを使用すると、Cookie値の抽出と検証は、ヘッダー、パス、クエリパラメータと同じようにシームレスです。