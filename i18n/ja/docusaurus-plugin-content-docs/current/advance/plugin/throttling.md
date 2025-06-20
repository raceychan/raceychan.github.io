---
title: スロットリング
---

# スロットリング

lihilはスロットリングに[`premier`](https://github.com/raceychan/premier/tree/master)を使用しています。

premierは直感的なスロットラーで、様々なバックエンドとスロットリングアルゴリズムをサポートし、分散アプリケーションでWeb APIや通常の関数のスロットリングに使用できます。

## Premierプラグイン

```python
from lihil import Lihil, Route
from lihil.plugins.premier import PremierPlugin, throttler, AsyncDefaultHandler, throttler


root = Route()

@route.get(plugins=[PremierPlugin(throttler).fix_window(quota=1, duration=1)])
async def hello():
    return "hello"


async def lifespan():
    throttler.config(aiohandler=AsyncDefaultHandler())


lhl = Lihil(root, lifespan=lifespan)
```

これにより、1秒間に1リクエストを許可するスロットラーが作成されます。

スロットラーの設定方法や異なるスロットリング戦略とバックエンドの詳細については、premierドキュメントを参照してください。