---
sidebar_position: 2
title: クエリパラメータ
slug: query-parameter
---

# クエリパラメータ

クエリパラメータは、URLを通じてサーバーにデータを渡すための柔軟な方法です。特にフィルター、ページネーション、オプション入力などに適しています。URLの`?`の後に現れ、キー・バリューペアで構成されます。

## クエリパラメータはどのように見えるか？

以下はクエリパラメータを含む簡単なリクエストです：

```http
GET /articles?keyword=book&page=2 HTTP/1.1
Host: example.com
```

この例では：

- `keyword`は値`book`を持つクエリパラメータです。
- `page`は値`2`を持つ別のクエリパラメータです。

これらの値はリクエストURLでプレーンテキスト文字列として送信されます。Lihilは関数シグネチャに基づいて自動的に解析と型変換を処理します。

## クエリパラメータ vs その他のリクエストパラメータ

1. リクエスト内での位置
   クエリパラメータはURL内でエンコードされ、パスパラメータの後で`?`で始まり、リクエストラインの一部として：

   ```http
   GET /search?query=python&sort=asc HTTP/1.1
   ```

2. エンコード形式
   クエリパラメータはURLエンコードされます。例：

   ```http
   ?q=hello%20world
   ```

   これは特殊文字（スペースなど）がパーセントエンコードされることを意味します。

3. データ型
   クエリパラメータがサポートするもの：

   - プリミティブ型：str、int、float、bool
   - 配列/リスト：list[str]、list[int]

   ボディパラメータとは異なり、辞書のような入れ子構造を表現できません。
   パスパラメータとは異なり、クエリパラメータは重複キーを持つことができます（例：tag=python&tag=web）。

## lihilでクエリパラメータを宣言

クエリパラメータは暗黙的と明示的の両方で宣言できます

### クエリパラメータの暗黙的宣言

```python

from lihil import Route

articles = Route("/articles")

@articles.get
async def search(keyword: str, page: int = 1):
    ...
```

リクエストが`/articles?keyword=book&page=2`の形で来ると、lihilは：

- クエリ文字列からkeywordとpageを抽出し、
- page を整数に変換し（型ヒントに基づいて）、
- 両方の値を関数に渡します。
- pageが提供されない場合、デフォルト値1が使用されます。
- デフォルト値のないクエリパラメータが欠けているか、強制できない無効な型を持つ場合、lihilは自動的に`InvalidRequest`エラーで応答します。

### `Param`でクエリパラメータを明示的に宣言

または、`typing.Annotated`と`lihil.Param`を組み合わせることで、より明示的にパラメータを宣言できます。

```python
@articles.get
async def search(keyword: Annotated[str, Param("query")], page: Annotated[int, Param("query")] = 1):
    ...
```

## 配列ライクなクエリパラメータ

パスパラメータとは異なり、クエリパラメータは二次元データのように動作できます。つまり、同じキーに対して複数の値を持つことができ、配列や繰り返しオプションに最適です：

```http
GET /filter?tag=python&tag=web&tag=backend HTTP/1.1
```

lihilでは、リスト型で宣言できます：

```python
from lihil import Route

@Route("/filter")
async def filter_by_tags(tag: list[str]):
    ...
```

lihilはすべてのtag値を収集し、リストとして提供します。

`/filter?tag=web&tag=python`の場合、tagの値として`["web", "python", "backend"]`を受け取ります。

## データ検証

配列スタイルのクエリパラメータに対して、lihil.Paramは最大長やアイテム検証などの制約を強制できます。

```python

from lihil import Param

Tags = Param(max_length=5)

@route("/articles")
async def search_articles(tags: Annotated[list[str], Tags]) -> JSONResponse:
    ...
```

この場合、リクエストに5つ以上のタグが含まれている場合、lihilは422エラーで拒否します。

スカラーのクエリパラメータも同じ方法で検証できます。例えば、範囲制限や正規表現ルールを強制するために。

```python

Page = Param(ge=1)

@route("/articles")
async def list_articles(page: Annotated[int, Page]) -> JSONResponse:
    ...
```

## カスタム検証

より多くの制御が必要ですか？高度な検証ロジックのためにカスタムデコーダーを定義できます。これは単一およびリストベースのクエリパラメータの両方で動作します。

```python
from lihil import Param, HTTPException

class BlockedTagError(HTTPException[str]):
    "This tag is not allowed"

def tag_decoder(value: str) -> str:
    if value in {"banned", "spam"}:
        raise BlockedTagError(f"Tag '{value}' is blocked")
    return value

@route("/filter")
async def filter_tags(tags: Annotated[list[str]: Param(decoder=tag_decoder)]) -> JSONResponse:
    ...
```

この例では、ユーザーが`"banned"`や`"spam"`のようなブロックされたタグでフィルタリングしようとすると、lihilは`BlockedTag`エラーを発生させます。リクエストは422エラーで拒否され、メッセージはどのタグがブロックされたかを示します。

クエリパラメータは単なるキー・バリュー文字列ではありません。リクエスト処理の柔軟で強力な部分です。lihilを使用すると、最小限の労力で型変換、検証、構造を得ることができます。

## まとめ

- クエリパラメータはURLに現れ、フィルター、検索語、ページネーションに理想的です。

- プリミティブ型と繰り返しキー（リスト）の両方をサポートします。

- lihilでは、型ヒントを通じて暗黙的に、または検証のためにParamを使用して明示的に宣言できます。

- 堅牢な入力検証のために制約やカスタムデコーダーを追加できます。