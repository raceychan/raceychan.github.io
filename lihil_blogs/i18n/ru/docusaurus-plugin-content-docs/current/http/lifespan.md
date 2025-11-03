# lifespan
`lifespan` — это ASGI-протокол, который вызывается при запуске и остановке вашего приложения.

lihil ожидает lifespan со следующим интерфейсом:

```python
type LifeSpan = Callable[
    ["Lihil"], AsyncContextManager[None] | AsyncGenerator[None, None]
]
```

Пример:

```python showLineNumbers

async def example_lifespan(app: Lihil):
    engine = app.graph.resolve(create_async_engine)
    await engine.execute(text("SELECT 1"))
    yield
    await engine.dispose()

lhl = Lihil(lifespan=example_lifespan)
```

## когда использовать lifespan и что делать в обработчике lifespan

Обработчики lifespan ASGI — отличный способ управления логикой запуска и завершения для асинхронных приложений. Эти обработчики выполняются один раз при запуске приложения и при его остановке, что делает их идеальными для управления ресурсами, которые нужно инициализировать и очистить асинхронно.

### Тестирование доступности сервиса

```python
from sqlalchemy.ext.asyncio import create_async_engine

async def lifespan(app: Lihil):
    engine = create_async_engine(app.config.database.url)
    await engine.execute(text("SELECT 1"))  
    yield 
    await engine.dispose()  # закрываем соединения при завершении
```

`await engine.execute(text("SELECT 1"))` отправляет пустой запрос к вашей базе данных и таким образом тестирует доступность сервиса, и если он не удастся, приложение быстро завершится без запуска.

### Создание синглтон-объектов, которые требуют цикл событий

При работе с асинхронными клиентами или сервисами, такими как продюсеры Kafka или клиенты баз данных, вам нужно убедиться, что они запущены в рамках цикла событий:

```python
from aiokafka import AIOKafkaProducer

async def lifespan(app: Lihil):
    kafka = AIOKafkaProducer(bootstrap_servers=app.config.kafka.url)
    await kafka.start()
    yield  
    await kafka.stop()
```

Здесь продюсер Kafka создается как синглтон-объект в рамках обработчика lifespan. Продюсер подключается к брокеру Kafka при запуске и корректно завершается при остановке приложения.

### Очистка ресурсов

Во время завершения важно очистить все соединения, освободить ресурсы или корректно остановить сервисы:

```python
async def lifespan(app: Lihil):
    engine = create_async_engine(...)
    kafka = AIOKafkaProducer(...)
    await kafka.start()
    yield  
    await kafka.stop()  # Остановка продюсера Kafka корректно
    await engine.dispose()  # Освобождение движка или любых соединений с базой данных
```

### Логирование
Обработчики lifespan также хорошее место для логирования ключевых событий, таких как запуск и завершение приложения:

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

### Регистрация метрик (например, Prometheus)

В некоторых случаях вы можете захотеть инициализировать сервисы мониторинга или метрик при запуске:

```python
from prometheus_client import start_http_server, Counter

metrics_counter = Counter('app_start', 'App has started')

async def lifespan(app):
    # Запуск сервера метрик Prometheus на отдельном порту
    start_http_server(app.config.prometheus.url)
    metrics_counter.inc()  # Увеличение счетчика для отслеживания запуска приложения
    yield 
```

### Планирование фоновых задач или инициализация планировщика задач

Если ваше приложение нуждается в планировании периодических задач (например, используя Celery или другой планировщик), вы можете сделать это в обработчике lifespan:

```python
import asyncio

async def schedule_tasks():
    while True:
        print("Running periodic task...")
        await asyncio.sleep(60)  # Выполняется каждые 60 секунд

async def lifespan(app):
    task = asyncio.create_task(schedule_tasks())
    yield
    # Отмена фоновой задачи при завершении
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
```

### Предварительная загрузка кэшей или данных в памяти

Если ваше приложение полагается на предварительную загрузку определенных данных (таких как кэширование или конфигурация), вы можете сделать это в обработчике lifespan для ускорения запуска приложения:

```python
async def preload_cache():
    # Пример: Предварительная загрузка часто используемых данных в кэш
    await cache.set("key", "value")

async def lifespan(app):
    # Предварительная загрузка кэша при запуске приложения
    await preload_cache()
    yield 
```

## Технические детали

Когда ASGI-сервер (например, uvicorn) запускается и останавливается, он отправляет событие lifespan веб-фреймворку, который он хостит (например, lihil).
Когда lihil получает сообщение lifespan, он сначала запускает предоставленный пользователем обработчик lifespan (если он есть), затем выполняет внутренние настройки.