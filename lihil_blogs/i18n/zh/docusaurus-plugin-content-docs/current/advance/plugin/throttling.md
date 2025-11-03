---
title: 限流
---

# 限流

lihil 使用 [`premier`](https://github.com/raceychan/premier/tree/master) 进行限流。

premier 是一个直观的限流器，支持各种后端和限流算法，可用于分布式应用程序中限流 Web API 和任何常规函数。

## Premier 插件

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

这将创建一个每秒允许 1 个请求的限流器。

查看 premier 文档以了解如何配置限流器以及不同的限流策略和后端的更多详细信息。