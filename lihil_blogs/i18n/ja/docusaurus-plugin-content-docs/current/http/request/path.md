---
sidebar_position: 1
title: パスパラメータ
slug: path-parameter
---

# パスパラメータ

HTTPリクエストでは、URLパスがルーティングにおいて中心的な役割を果たします。これは、サーバーがクライアントがアクセスしようとしている_リソース_を知る方法です。しかし、パスは静的なだけではありません。**パスパラメータ**と呼ばれる動的な値を運ぶことがよくあります。

## パスパラメータはどのように見えるか？

パスパラメータはURLパスの可変部分です。通常、特定のリソースを識別するために使用されます。例：

```http
GET /users/42 HTTP/1.1
Host: example.com
```

この例では：

- /users/42 はIDが42のユーザーをリクエストしています。42はパスパラメータで、URL構造に直接埋め込まれたデータです。

URLのパス変数が何であるかを完全に確信することはできませんが、RESTful APIは通常次のパターンに従います

`/entity_name_in_plural/{entity_id}/sub_entity_name_in_plurals/{sub_entity_id}/...`

ここで、`users`は`User`エンティティを指し、`42`はそのIDの値である可能性があります。

## パスパラメータ vs その他のリクエストパラメータ

パスパラメータは、ID、スラッグ、名前などの一次元固定値を運び、単一のリソースの識別に理想的です。

1. リクエスト内での位置
   パスパラメータはURL パス自体の一部で、ルート構造内に直接埋め込まれます：

   ```http
   GET /users/42 HTTP/1.1
   ```

2. エンコード形式
   パスパラメータはパスセグメントの一部としてURLエンコードされます。特殊文字はパーセントエンコードされますが、?の後には現れません。これらはURL階層の一部です。

3. データ型
   パスパラメータは単一の固定値を表し、以下のようなプリミティブ型をサポートします：

   str、int、float、bool

   クエリパラメータとは異なり、パスパラメータは配列や繰り返しキーを表現できません。常にパラメータごとに正確に1つの値を運びます。

4. 目的
   パスパラメータは通常、URLパスに識別子を埋め込むことで特定のリソースまたはエンティティを識別します。対照的に、クエリパラメータはフィルタリング、ページネーション、またはオプショナルデータに使用されます。

## lihilでパスパラメータを宣言

### パスパラメータの暗黙的宣言

`lihil`では、パスパラメータは第一級市民です。
ルートパスに含め、関数引数名をマッチさせることで暗黙的にパスパラメータを宣言できます：

例：

```python
from lihil import Route

user = Route("/users/{user_id}")

@user.get
async def get_user(user_id: int) -> User:
    ...
```

ここで、`user_id`は、ルートパスの`{user_id}`プレースホルダーとマッチするため暗黙的に宣言されます。

lihilは自動的にURLから抽出して変換します。

例えば、
GET /users/42のようなリクエストが来ると、lihil：

- URLから42を抽出し、
- intに変換し（型ヒントに基づいて）、
- get_user関数に渡します。

文字列を解析したり、生のリクエストに手動でアクセスしたりする必要はありません。lihilが処理します。

### `lihil.Param`でパスパラメータを明示的に宣言

```python
from lihil import Route, Param
from typing import Annotated

PositiveInt = Annotated[int, Param(gt=0)]

user = Route("/users/{user_id}")

@user.get
async def get_user(user_id: PositiveInt) -> User:
    ...
```

## 型検証

パスパラメータは型ヒントに基づいて検証されます。パスパラメータを`int`として宣言すると、lihilは自動的に整数に変換します。変換が失敗すると、lihilは422 Invalid Requestエラーを返します。

型のユニオンが提供されると、lihilは1つが成功するまでユニオン内の各型に値を変換しようとします。いずれも成功しない場合、422エラーが返されます。

:::warning
ユニオンにstrまたはbytesが含まれている場合、これらの型は任意の値を表現できるため、変換は常に成功します。これは、`Union[int, str]`のようなユニオンを持つ場合、パスパラメータは常に文字列として扱われることを意味します。
:::

## データ検証

パスパラメータの値を検証することもできます。例えば、ユーザーIDが正数であることを確認したい場合、`lihil.Param`を使用してそのような制約を設定できます。

```python
from lihil import Route, Param

PositiveInt = Param(gt=0)

user = Route("/users/{user_id}")

@user.get
async def get_user(user_id: PositiveInt) -> User: ...
```

`lihil.Param`により、最小値と最大値、正規表現パターンなど、パスパラメータにさまざまな制約を設定できます。これは、処理前に受信したデータが有効であることを確認するのに特に有用です。

`lihil.Param`は内部で`msgspec.Meta`を使用するため、パスパラメータの検証に`msgspec.Meta`のすべての機能を使用できます。

## カスタム検証

パスパラメータのカスタムバリデーターを作成することもできます。これは、単純な制約では表現できない複雑な検証ロジックがある場合に有用です。

```python
from lihil import Route, Param, HTTPException


class MyError(HTTPException[T]):
    "I don't like this value"


def decoder(value: str) -> int:
    # カスタムデコードロジック
    if value == "42":
        raise MyError("I don't like this value")
    return int(value)

async def create_user(user_id: int, user_age: Annotated[int, Param(decoder=decoder)]) -> User:
    # ここにロジック
    pass
```

## まとめ

- パスパラメータはURLパスに直接埋め込まれ、特定のリソースを識別します。
- パラメータごとに正確に1つの値を運び、int、str、boolなどのプリミティブ型をサポートします。
- lihilでは、ルートパスでパスパラメータを暗黙的に宣言するか、検証と制約のためにParamで明示的に宣言できます。
- カスタムデコーダーにより、パスパラメータの高度な検証とエラー処理を実装できます。