# 生命周期

`lifespan` 是一个 ASGI 协议，在你的应用启动和停止时会被调用。

lihil 期望一个具有以下接口的生命周期：

```python
type LifeSpan = Callable[
    ["Lihil"], AsyncContextManager[None] | AsyncGenerator[None, None]
]
```

示例：

```python showLineNumbers

async def example_lifespan(app: Lihil):
    engine = app.graph.resolve(create_async_engine)
    await engine.execute(text("SELECT 1"))
    yield
    await engine.dispose()

lhl = Lihil(lifespan=example_lifespan)
```

## 何时使用生命周期以及在生命周期处理器中做什么

ASGI 生命周期处理器是管理异步应用程序启动和关闭逻辑的绝佳方式。这些处理器在应用程序启动和停止时各运行一次，使它们非常适合管理需要异步初始化和清理的资源。

### 测试服务可用性

```python
from sqlalchemy.ext.asyncio import create_async_engine

async def lifespan(app: Lihil):
    engine = create_async_engine(app.config.database.url)
    await engine.execute(text("SELECT 1"))  
    yield 
    await engine.dispose()  # 关闭时关闭连接
```

`await engine.execute(text("SELECT 1"))` 向你的数据库发送一个虚拟查询，因此测试服务的可用性，如果失败，应用程序将快速失败而不启动。

### 创建需要事件循环的单例对象

在使用异步客户端或服务（如 Kafka 生产者或数据库客户端）时，你需要确保它们在事件循环内启动：

```python
from aiokafka import AIOKafkaProducer

async def lifespan(app: Lihil):
    kafka = AIOKafkaProducer(bootstrap_servers=app.config.kafka.url)
    await kafka.start()
    yield  
    await kafka.stop()
```

这里，Kafka 生产者在生命周期处理器内作为单例对象创建。生产者在启动时连接到 Kafka 代理，并在应用停止时正确关闭。

### 清理资源

在关闭期间，清理任何连接、释放资源或优雅地停止服务很重要：

```python
async def lifespan(app: Lihil):
    engine = create_async_engine(...)
    kafka = AIOKafkaProducer(...)
    await kafka.start()
    yield  
    await kafka.stop()  # 干净地停止 Kafka 生产者
    await engine.dispose()  # 处理引擎或任何数据库连接
```

### 日志记录
生命周期处理器也是记录关键事件（如应用启动和关闭）的好地方：

```python
import logging

logger = logging.getLogger(__name__)

async def lifespan(app):
    logger.info("App is starting...")
    await engine.execute(text("SELECT 1"))
    yield 
    logger.info("App is shutting down...")
    await engine.dispose()
```

### 注册指标（例如 Prometheus）

在某些情况下，你可能想在启动时初始化监控或指标服务：

```python
from prometheus_client import start_http_server, Counter

metrics_counter = Counter('app_start', 'App has started')

async def lifespan(app):
    # 在单独的端口上启动 Prometheus 指标服务器
    start_http_server(app.config.prometheus.url)
    metrics_counter.inc()  # 增加计数器以跟踪应用启动
    yield 
```

### 调度后台任务或初始化任务调度器

如果你的应用需要调度定期任务（例如使用 Celery 或其他调度器），你可以在生命周期处理器中执行此操作：

```python
import asyncio

async def schedule_tasks():
    while True:
        print("Running periodic task...")
        await asyncio.sleep(60)  # 每 60 秒运行一次

async def lifespan(app):
    task = asyncio.create_task(schedule_tasks())
    yield
    # 在关闭期间取消后台任务
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
```

### 预加载缓存或内存数据

如果你的应用依赖于预加载某些数据（如缓存或配置），你可以在生命周期处理器中执行此操作以加快应用启动速度：

```python
async def preload_cache():
    # 示例：将经常访问的数据预加载到缓存中
    await cache.set("key", "value")

async def lifespan(app):
    # 在应用启动时预加载缓存
    await preload_cache()
    yield 
```

## 技术细节

当 ASGI 服务器（例如 uvicorn）启动和停止时，它向它托管的 Web 框架（例如 lihil）发送生命周期事件。
lihil 接收生命周期消息后，它会首先运行用户提供的生命周期处理器（如果有的话），然后运行内部设置。