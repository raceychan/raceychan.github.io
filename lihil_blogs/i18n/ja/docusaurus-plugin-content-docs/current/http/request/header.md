---
sidebar_position: 3
title: ヘッダー
slug: header-parameter
---

# ヘッダー

ヘッダーはHTTPリクエストと一緒に送信されるキー・バリューペアです。コンテンツタイプ、認証トークン、クライアント情報などのリクエストに関するメタデータを運びます。ヘッダーはURLやボディの一部ではなく、リクエストラインとボディの間の別のセクションで送信されます。

## ヘッダーパラメータはどのように見えるか？

以下はヘッダーを含むリクエストの例です：

```http
GET /profile HTTP/1.1
Host: example.com
User-Agent: curl/8.5.0
Accept: application/json, text/plain, text/html
```

各ヘッダーはキー・バリューペアとして構造化され、HTTP仕様（RFC 7230）によると、ヘッダーキーは異なる値で複数回現れることができます。その場合、値は以下のいずれかになります：

- 同じキーで別々のヘッダー行として送信
- 単一のコンマ区切り値に結合

## ヘッダーパラメータ vs その他のリクエストパラメータ

1. リクエスト内での位置
   ヘッダーパラメータはHTTPヘッダーの一部で、URLやボディとは別に送信されます。例：

   ```http
   GET /resource HTTP/1.1
   Host: example.com
   Authorization: Bearer abc123
   X-Custom-Header: value
   ```

2. エンコード形式
   ヘッダーはプレーンテキストのキー・バリューペアです。クエリパラメータとは異なり、URLエンコードされませんが、値はHTTPヘッダー標準に準拠する必要があります。

3. データ型
   ヘッダーは通常文字列を運びますが、必要に応じてint、bool、またはカスタム型などのプリミティブ型に解析できます。

4. 使用ケース
   ヘッダーは通常、認証トークン、コンテンツタイプ、ユーザーエージェント情報、またはカスタム制御フラグなどのメタデータに使用されます。ボディパラメータのような大きなまたは複雑なデータ構造を運ぶように設計されていません。

## lihilでヘッダーパラメータを宣言

`Param("header")`を使用してエンドポイントでヘッダーパラメータを簡単に宣言できます。

```python
from lihil import Route, Param
from typing import Annotated

route = Route("/greet")

@route.get
async def greet_user(
    user_agent: Annotated[str, Param("header")],  # "user-agent"に自動マッピング
    accept: Annotated[list[str], Param("header")],  # コンマ区切りのAcceptを処理
):
    return {"ua": user_agent, "accepts": accept}
```

## 複数値ヘッダー

`Accept`、`Accept-Language`、`Cache-Control`などの一部のヘッダーは、コンマで区切られた複数の値を自然にサポートします。

lihilはこれを開箱即用でサポートします。複数値ヘッダーを受け入れるには、list[str]型ヒントを使用するだけです：

複数値ヘッダーを受け入れるには、list[str]型ヒントを使用するだけです：

```python
accept: Annotated[list[str], Param("header")]
```

これは以下を正しく解析します：

```http
Accept: text/html, application/json
```

以下のように：

```python
["text/html", "application/json"]
```

## ヘッダーキーマッピング

HTTPヘッダー名はしばしばkebab-case（例：X-Request-ID）を使用しますが、Python変数にはダッシュを含めることができません。lihilは2つの方法でこれを解決します：

自動マッピング：デフォルトで、lihilは`my_token`を`my-token`に変換します。

明示的エイリアス：aliasオプションを使用して正確なヘッダーキーを指定できます：

```python
request_id: Annotated[str, Param("header", alias="x-request-id")]
```

## カスタムデコーダー

より複雑なヘッダーには、カスタムデコーダー関数を定義できます。この関数は生のヘッダー値を取り、望ましい型を返します。

```python
from lihil import Route, Param
from typing import Annotated

def custom_decoder(value: str) -> str:
    # カスタムデコードロジック
    return value.lower()

route = Route("/greet")

@route
async def create_user(
    user_agent: Annotated[str, Param("header")],
    custom_header: Annotated[str, Param("header", decoder=custom_decoder)],
):
    return {"ua": user_agent, "custom": custom_header}
```

## まとめ

- ヘッダーパラメータはHTTPヘッダーの一部で、認証トークンやカスタムフラグなどのメタデータを運びます。
- プレーンテキストのキー・バリューペアで、URLエンコードされません。
- lihilでは、正確なヘッダー名のためにParam(alias=...)と一緒にAnnotatedを使用してヘッダーを明示的に宣言します。
- lihilは型変換、検証、デフォルト値を自動的に処理します。
- 欠損または無効なヘッダーは、堅牢な入力処理のために自動エラー応答を引き起こします。