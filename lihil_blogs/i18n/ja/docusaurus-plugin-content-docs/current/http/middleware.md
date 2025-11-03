### ミドルウェア

`Lihil`と`Route`の両方に、1つまたは一連の`MiddlewareFactory`を受け入れる`add_middleware` APIがあります。

`MiddlewareFactory`は`ASGIApp`型の1つの位置引数を受け取り、`ASGIApp`を返す呼び出し可能オブジェクトです。例：

```python
# このコードは実演目的のみです。

def tracingmw_factory(next_app: ASGIApp) -> ASGIApp:
    async def tracemw(scope, receive, send):
        scope["trace_id"] = str(uuid.uuid4())
        await next_app(scope, receive, send)
    return trace_mw

lhl = Lihil(middlewares=[lambda app: tracingmw_factory(app)])
```

lihilは内部でstarletteを使用しているため、starletteから直接ミドルウェアをインポートできます。例：

```python
from starlette.middleware.cors import CORSMiddleware

lhl = Lihil(middlewares=[lambda app: CORSMiddleware(app, add_methods="*")])
```

多くの外部依存関係を必要とする複雑なミドルウェアの場合、ライフスパン内で構築することで、`lhl.graph`を使用して依存関係を解決できるようになります。