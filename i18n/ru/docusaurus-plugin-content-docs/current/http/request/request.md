# Запрос

Прежде чем углубляться в структуру и детали HTTP-запроса, важно понять, что такое запрос на самом деле.

В контексте веб-разработки HTTP-запрос — это сообщение, которое клиент отправляет серверу, запрашивая выполнение какого-либо действия — такого как получение веб-страницы или отправка данных. Это начальная точка почти каждого взаимодействия между клиентом и вашим сервером.

Хотя lihil абстрагирует большинство низкоуровневых деталей — позволяя вам напрямую объявлять заголовки, параметры запроса, cookies и содержимое тела как структурированные входные данные для вашей конечной точки — все еще полезно понимать, как выглядит запрос под капотом.


## Запрос в виде обычного текста

На самом низком уровне HTTP-запрос — это просто обычный текст, отправляемый по сети, следующий протоколу HTTP. 
Вот пример простого GET-запроса:

```http
GET /path?query=value HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: text/html,application/xhtml+xml
```

Это показывает базовую структуру:

- Метод (GET) сообщает серверу, какое действие запрашивается.

- Путь "/path" указывает на ресурс "path"
- "?query=value" включает параметр запроса "query" со значением "value".
- Версия HTTP указана в конце первой строки.

Дополнительные строки — это заголовки, такие как Host, User-Agent и Accept, которые предоставляют метаданные о запросе.

Запросы также могут нести тело. Например, POST-запрос может выглядеть так:

```http
POST /submit HTTP/1.1
Host: example.com
Content-Type: application/json
Content-Length: 27

{"key":"value"}
```

Здесь запрос включает тело, которое содержит JSON-данные. Заголовки, такие как Content-Type и Content-Length, описывают, как сервер должен интерпретировать тело.

## Объявление объекта запроса в вашей конечной точке

lihil предоставляет абстракции более высокого уровня, такие как `Header`, `Query`, `Body` и т.д., чтобы позволить вам напрямую объявлять параметры, которые вам нужны в вашей конечной точке. 
В большинстве случаев вы не взаимодействуете с IRequest напрямую, но понимание того, откуда поступает эта информация, поможет вам понять, как фреймворк работает под капотом.

```python
from lihil import Route
from lihil.interface import IRequest

@Route("create_uesrs")
async def ep(req: IRequest):
    data = await req.body()
```

Разбор параметров в lihil оптимизирован. Обычно это не принесет значительного прироста производительности при использовании объекта `IRequest` напрямую. 

## Интерфейс `IRequest`

```python
class IRequest(Protocol):
    def __init__(self, scope: IScope, receive: IReceive | None = None) -> None: ...
    def __getitem__(self, key: str) -> Any: ...
    def __iter__(self) -> Iterator[str]: ...
    def __len__(self) -> int: ...
    def __eq__(self, value: object) -> bool: ...
    def __hash__(self) -> int: ...
    @property
    def url(self) -> URL: ...
    @property
    def headers(self) -> Mapping[str, str]: ...
    @property
    def query_params(self) -> Mapping[str, str]: ...
    @property
    def path_params(self) -> Mapping[str, Any]: ...
    @property
    def cookies(self) -> Mapping[str, str]: ...
    @property
    def client(self) -> IAddress | None: ...
    @property
    def state(self) -> dict[str, Any]: ...
    @property
    def method(self): ...
    @property
    def receive(self) -> IReceive: ...
    async def stream(self) -> AsyncGenerator[bytes, None]: ...
    async def body(self) -> bytes: ...
    async def json(self) -> Any: ...
    def form(
        self,
        *,
        max_files: int | float = 1000,
        max_fields: int | float = 1000,
        max_part_size: int = 1024 * 1024,
    ) -> AsyncContextManager[FormData]: ...
    async def close(self) -> None: ...
    async def is_disconnected(self) -> bool: ...
    async def send_push_promise(self, path: str) -> None: ...
```