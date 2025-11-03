# ライフスパン

`ライフスパン`はアプリの開始と停止時に呼び出されるASGIプロトコルです。

lihilは以下のインターフェースを持つライフスパンを期待します：

```python
type LifeSpan = Callable[
    ["Lihil"], AsyncContextManager[None] | AsyncGenerator[None, None]
]
```

例：

```python showLineNumbers

async def example_lifespan(app: Lihil):
    engine = app.graph.resolve(create_async_engine)
    await engine.execute(text("SELECT 1"))
    yield
    await engine.dispose()

lhl = Lihil(lifespan=example_lifespan)
```

## ライフスパンを使用するタイミング & ライフスパンハンドラーで何をするか

ASGIライフスパンハンドラーは、非同期アプリケーションの起動と終了ロジックを管理する優れた方法です。これらのハンドラーは、アプリケーションの開始時と停止時にそれぞれ一度実行され、非同期的に初期化とクリーンアップが必要なリソースの管理に理想的です。

### サービスの可用性をテスト

```python
from sqlalchemy.ext.asyncio import create_async_engine

async def lifespan(app: Lihil):
    engine = create_async_engine(app.config.database.url)
    await engine.execute(text("SELECT 1"))  
    yield 
    await engine.dispose()  # シャットダウン時に接続を閉じる
```

`await engine.execute(text("SELECT 1"))`はデータベースにダミークエリを送信してサービスの可用性をテストし、失敗した場合、アプリケーションは開始せずに高速で失敗します。

### イベントループが必要なシングルトンオブジェクトの作成

Kafkaプロデューサーやデータベースクライアントなどの非同期クライアントやサービスを使用する場合、イベントループ内で開始することを確認する必要があります：

```python
from aiokafka import AIOKafkaProducer

async def lifespan(app: Lihil):
    kafka = AIOKafkaProducer(bootstrap_servers=app.config.kafka.url)
    await kafka.start()
    yield  
    await kafka.stop()
```

ここで、Kafkaプロデューサーはライフスパンハンドラー内でシングルトンオブジェクトとして作成されます。プロデューサーは起動時にKafkaブローカーに接続し、アプリが停止する際に適切にシャットダウンされます。

### リソースのクリーンアップ

シャットダウン中は、接続をクリーンアップし、リソースを解放し、サービスを適切に停止することが重要です：

```python
async def lifespan(app: Lihil):
    engine = create_async_engine(...)
    kafka = AIOKafkaProducer(...)
    await kafka.start()
    yield  
    await kafka.stop()  # Kafkaプロデューサーをクリーンに停止
    await engine.dispose()  # エンジンやデータベース接続を破棄
```

### ログ記録
ライフスパンハンドラーは、アプリの起動やシャットダウンなどの重要なイベントをログに記録する良い場所でもあります：

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

### メトリクス登録（例：Prometheus）

場合によっては、起動時に監視やメトリクスサービスを初期化したい場合があります：

```python
from prometheus_client import start_http_server, Counter

metrics_counter = Counter('app_start', 'App has started')

async def lifespan(app):
    # 別のポートでPrometheusメトリクスサーバーを開始
    start_http_server(app.config.prometheus.url)
    metrics_counter.inc()  # アプリ起動を追跡するためにカウンターを増加
    yield 
```

### バックグラウンドタスクのスケジュールまたはタスクスケジューラーの初期化

アプリが定期的なタスクをスケジュールする必要がある場合（例：Celeryや他のスケジューラーを使用）、ライフスパンハンドラーでこれを行うことができます：

```python
import asyncio

async def schedule_tasks():
    while True:
        print("Running periodic task...")
        await asyncio.sleep(60)  # 60秒ごとに実行

async def lifespan(app):
    task = asyncio.create_task(schedule_tasks())
    yield
    # シャットダウン中にバックグラウンドタスクをキャンセル
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
```

### キャッシュやインメモリデータの事前読み込み

アプリケーションが特定のデータ（キャッシュや設定など）の事前読み込みに依存している場合、ライフスパンハンドラーでこれを行ってアプリの起動を高速化できます：

```python
async def preload_cache():
    # 例：頻繁にアクセスされるデータをキャッシュに事前読み込み
    await cache.set("key", "value")

async def lifespan(app):
    # アプリ起動時にキャッシュを事前読み込み
    await preload_cache()
    yield 
```

## 技術的詳細

ASGIサーバー（例：uvicorn）が開始・停止する際、ホストしているWebフレームワーク（例：lihil）にライフスパンイベントを送信します。
lihilがライフスパンメッセージを受信すると、まずユーザー提供のライフスパンハンドラー（ある場合）を実行し、その後内部セットアップを実行します。