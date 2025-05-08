# lifespan
`lifespan` is a ASGI-protocol that would be invoked when your app starts and stops.

lihil expects a lifespan with following interface:

```python
type LifeSpan[T: Mapping[str, Any] | None] = Callable[
    ["Lihil[T]"], AsyncContextManager[T] | AsyncGenerator[T, None]
]
```

Example:

```python showLineNumbers
from typing import TypedDict

class ExampleState(TypedDict):
    engine: AsyncEngine


async def example_lifespan(app: Lihil[None]):
    engine = create_async_engine(app.app_congig)
    await engine.execute(text("SELECT 1"))
    yield ExampleState(engine=Engine)
    await engine.dispose()

lhl = Lihil(lifespan=example_lifespan)
```

## when to use lifespan & what to do in lifespan handler

ASGI lifespan handlers are an excellent way to manage startup and shutdown logic for async applications. These handlers run once when the application starts and when it stops, making them ideal for managing resources that need to be initialized and cleaned up asynchronously.

### Test service availability

```python
from sqlalchemy.ext.asyncio import create_async_engine

async def lifespan(app: Lihil[None]):
    engine = create_async_engine(app.config.database.url)
    await engine.execute(text("SELECT 1"))  
    yield 
    await engine.dispose()  # close connections on shutdown
```

`await engine.execute(text("SELECT 1"))` sends a dummy query to your database and therefore tests the availability of a service, and if it fails, the application will fail fast without starting.

### Create Singleton Objects That Require the Event Loop

When working with async clients or services, such as Kafka producers or database clients, you need to ensure they are started within the event loop:

```python
from aiokafka import AIOKafkaProducer

async def lifespan(app: Lihil[None]):
    kafka = AIOKafkaProducer(bootstrap_servers=app.config.kafka.url)
    await kafka.start()
    yield  
    await kafka.stop()
```

Here, the Kafka producer is created as a singleton object within the lifespan handler. The producer connects to the Kafka broker on startup and is properly shut down when the app stops.

### Clean Up Resources

During shutdown, it’s important to clean up any connections, release resources, or stop services gracefully:

```python
async def lifespan(app: Lihil[None]):
    engine = create_async_engine(...)
    kafka = AIOKafkaProducer(...)
    await kafka.start()
    yield  
    await kafka.stop()  # Stop Kafka producer cleanly
    await engine.dispose()  # Dispose of engine or any database connections
```

### Logging
Lifespan handlers are also a good place to log key events, such as app startup and shutdown:

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

### Register Metrics (e.g., Prometheus)

In some cases, you might want to initialize monitoring or metrics services on startup:

```python
from prometheus_client import start_http_server, Counter

metrics_counter = Counter('app_start', 'App has started')

async def lifespan(app):
    # Start Prometheus metrics server on a separate port
    start_http_server(app.config.prometheus.url)
    metrics_counter.inc()  # Increment a counter to track app startup
    yield 
```

### Schedule Background Tasks or Initialize Task Scheduler

If your app needs to schedule periodic tasks (e.g., using Celery or another scheduler), you can do this in the lifespan handler:

```python
import asyncio

async def schedule_tasks():
    while True:
        print("Running periodic task...")
        await asyncio.sleep(60)  # Run every 60 seconds

async def lifespan(app):
    task = asyncio.create_task(schedule_tasks())
    yield
    # Cancel the background task during shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
```

### Preload Caches or In-memory Data

If your application relies on preloading certain data (such as caching or configuration), you can do so in the lifespan handler to speed up app startup:

```python
async def preload_cache():
    # Example: Preload frequently accessed data into the cache
    await cache.set("key", "value")

async def lifespan(app):
    # Preload cache on app startup
    await preload_cache()
    yield 
```

## Technic details

When an asgi server(for example, uvicorn),  starts and stops, it sends an lifespan event to the web framework it is hosting(for example, lihil).
The lihil receives the lifespan message, it would first run user provided lifespan handler(if there is one), then run internal setups.