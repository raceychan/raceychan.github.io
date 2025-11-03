---
title: throttling
---

# Регулирование частоты запросов (Throttling)

lihil использует [`premier`](https://github.com/raceychan/premier/tree/master) для регулирования частоты запросов.

premier — это интуитивный регулятор частоты запросов, который поддерживает различные бэкенды и алгоритмы регулирования. Он может использоваться в распределённых приложениях для регулирования web-api и любых обычных функций.

## Плагин Premier

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

Это создаст регулятор частоты запросов, который разрешает 1 запрос в секунду.

ознакомьтесь с документацией premier для получения более подробной информации о настройке регулятора частоты запросов, а также о различных стратегиях регулирования и бэкендах.
