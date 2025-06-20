## エラー処理

- `route.get(errors=VioletsAreBlue)`を使用してエンドポイントレスポンスを宣言

```python
class VioletsAreBlue(HTTPException[str]):
    "how about you?"
    __status__ = 418


@lhl.post(errors=VioletsAreBlue)
async def roses_are_red():
    raise VioletsAreBlue("I am a pythonista")
```

- `lihil.problems.problem_solver`をデコレータとして使用してエラーハンドラーを登録し、エラーは問題詳細として解析されます。

```python
from lihil.problems import problem_solver

# 注：excには型ユニオンを使用できます。例：UserNotFound | status.NOT_FOUND
@problem_solver
def handle_404(req: Request, exc: Literal[404]):
    return Response("resource not found", status_code=404)
```

特定の例外タイプ（例：`UserNotFound`）を処理するソルバーは、ステータスコード（例：`404`）を処理するソルバーよりも優先されます。

### 例外-問題マッピング

lihilはHTTPExceptionに基づいてレスポンスとドキュメントを自動生成します。
以下は`roses_are_red`エンドポイント用に生成されたドキュメントです

<!-- ![roses_are_red](./images/roses_are_red_link.png) -->

`External documentation`タブの下のURLをクリック

詳細な問題ページが表示されます

<!-- ![problem page](./images/roses_are_red_problempage.png) -->

デフォルトでは、すべてのエンドポイントは`InvalidRequestErrors`用にコード`422`の少なくとも1つのレスポンスを持ちます。

以下は`InvalidRequestErrors`のレスポンス例です。

```json
{
  "type_": "invalid-request-errors",
  "status": 422,
  "title": "Missing",
  "detail": [
    {
      "type": "MissingRequestParam",
      "location": "query",
      "param": "q",
      "message": "Param is Missing"
    },
    {
      "type": "MissingRequestParam",
      "location": "query",
      "param": "r",
      "message": "Param is Missing"
    }
  ],
  "instance": "/users"
}
```

- レスポンスの作成を変更するには、`lihil.problems.problem_solver`を使用してソルバーを登録してください。
- ドキュメントを変更するには、`DetailBase.__json_example__`と`DetailBase.__problem_detail__`をオーバーライドしてください。
- エラー詳細を拡張するには、`HTTPException[T]`を継承する際に型変数を提供してください。