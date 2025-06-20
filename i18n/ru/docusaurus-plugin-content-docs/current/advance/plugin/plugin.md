# Система плагинов

lihil предоставляет гибкую систему плагинов, которая позволяет вам декорировать функции эндпоинтов пользовательской логикой — не вмешиваясь в разбор параметров или анализ сигнатуры.

Это особенно полезно для таких функций, как логирование, метрики, аутентификация или трассировка запросов.

## Почему это хорошо?

В похожих ASGI фреймворках сложно создавать компонуемые сторонние плагины из-за нескольких ограничений:

- Принуждение к сигнатуре: Вы не можете просто добавить пользовательскую зависимость в сигнатуру эндпоинта — фреймворк попытается разобрать и проверить её, что может привести к ошибкам.

- Ограничения декораторов: Вы не можете свободно декорировать функцию эндпоинта — декоратор должен строго сохранять сигнатуру функции, иначе она сломается.

- Отсутствие интроспекции: Декораторы не знают, как выглядит функция эндпоинта, что усложняет написание повторно используемых плагинов, учитывающих сигнатуру.

lihil избегает этих ограничений, вводя систему плагинов, которая работает после инициализации приложения, предоставляя полный доступ к графам зависимостей и метаданным эндпоинтов.

## Интерфейс IPlugin

Плагин в lihil — это вызываемый объект (синхронный или асинхронный), который получает:

1. `ididi.Graph` (граф зависимостей), принадлежащий приложению, содержащий все зарегистрированные зависимости и их конфигурации.

2. сырая функция эндпоинта,

3. полностью разобранную EndpointSignature.

Это происходит после события lifespan, что гарантирует, что плагины могут полагаться на ресурсы, созданные во время обработчика lifespan.

```python
from typing import Any, Awaitable, Callable, Protocol
from ididi import Graph
from lihil.interface import IAsyncFunc, P, R
from lihil.signature import EndpointSignature


class IAsyncPlugin(Protocol, Generic[P, R]):
    async def __call__(
        self,
        graph: Graph,
        func: IAsyncFunc[P, R],
        sig: EndpointSignature[Any],
        /,
    ) -> IAsyncFunc[P, R]: ...


class ISyncPlugin(Protocol, Generic[P,R]):
    def __call__(
        self,
        graph: Graph,
        func: IAsyncFunc[P, R],
        sig: EndpointSignature[Any],
        /,
    ) -> IAsyncFunc[P, R]: ...


IPlugin = IAsyncPlugin[..., Any] | ISyncPlugin[..., Any]
```

## Регистрация плагинов

Вы можете применять плагины на двух уровнях:

1. Плагины на уровне маршрута

```python

from lihil import Route
from lihil.routing import EndpointProps


route = Route(props=EndpointProps(plugins=[MyPlugin()]))
```

Все эндпоинты, зарегистрированные под этим маршрутом, автоматически будут использовать `MyPlugin`.

2. Плагины на уровне эндпоинта

```python

   @route.get(plugins=[MyPlugin()])
   async def my_endpoint() -> None:
   ...
```

Это позволяет тонко контролировать применение плагинов только к определённым эндпоинтам.

### фабрика плагинов

Обратите внимание, что плагины вызываются после события lifespan, а не во время создания экземпляра плагина при импорте, как мы делали с `route.get(plugins=[MyPlugin()])`.
Вы можете обернуть плагин в фабрику.

```python
from lihil.config import lhl_get_config

def my_plugin_factory(graph: Graph, func: Callable[P, R], sig: EndpointSignature[R]): # can be either sync or async
    config = lhl_get_config()
    engine = Graph.resolve(Engine, url=config.db.URL)
    return MyPlugin(engine=engine, max_conns=config.db.MAX_CONNS)

@route.get(plugins=[my_plugin_factory])
async def my_endpoint() -> None:
    ...
```

## Написание плагина

Вот пример плагина, который внедряет экземпляр EventBus в эндпоинт:

```python
from functools import wraps
from lihil.signature import EndpointSignature
from ididi import Graph
from typing import Callable, Awaitable

def bus_plugin(busterm: BusTerminal[Any]):
    def inner(self, graph: Graph, func: Callable[..., Awaitable[Any]], sig: EndpointSignature[Any]):
        for name, param in sig.plugins.items():
            param_type = ty_get_origin(param_type) or param_type
            if param_type is EventBus:
                @wraps(func)
                async def wrapped(*args, **kwargs):
                    kwargs[name] = busterm.create_event_bus(graph)
                    return await func(*args, **kwargs)
                return wrapped
        return func
    return inner
```

Этот плагин исследует EndpointSignature, если он находит параметр типа `EventBus`, он оборачивает функцию эндпоинта, чтобы внедрить экземпляр `EventBus`, созданный `BusTerminal`.

Если нет ни одного параметра типа `EventBus`, он просто возвращает исходную функцию.

## Параметры плагинов

Чтобы избежать неправильной интерпретации ваших специфичных для плагина значений (например, внутренние помощники, локаторы сервисов) как данные HTTP-запроса, аннотируйте их с помощью `Param("plugin")`.

```python
from lihil import Route
from lihil.plugins.bus import bus_pluin, BusTerminal

bus_term = BusTerminal()

@Route("/users/{user_id}", plugsins=[bus_plugin(busterm)])
async def create_user(
    user_id: str, bus: EventBus = Annotated[EventBus, Param("plugin")]
) -> None:
```

Это говорит lihil обрабатывать `bus` как управляемую плагином зависимость, а не как параметр, связанный с запросом.

## EndpointSignature

```python
class EndpointSignature(Base, Generic[R]):
    route_path: str

    query_params: ParamMap[QueryParam[Any]]
    path_params: ParamMap[PathParam[Any]]
    header_params: ParamMap[HeaderParam[Any] | CookieParam[Any]]
    body_param: tuple[str, BodyParam[bytes | FormData, Struct]] | None

    dependencies: ParamMap[DependentNode]
    transitive_params: set[str]
    """
    Транзитивные параметры — это параметры, необходимые зависимостям, но не требуемые напрямую функцией эндпоинта.
    """
    plugins: ParamMap[PluginParam]

    scoped: bool
    form_meta: FormMeta | None

    return_params: dict[int, EndpointReturn[R]]

    @property
    def default_return(self):
        return next(iter(self.return_params.values()))

    @property
    def status_code(self):
        return self.default_return.status

    @property
    def encoder(self):
        return self.default_return.encoder

    @property
    def static(self) -> bool:
        return not any(
            (
                self.path_params,
                self.query_params,
                self.header_params,
                self.body_param,
                self.dependencies,
                self.plugins,
            )
        )

    @property
    def media_type(self) -> str:
        default = "application/json"
        first_return = next(iter(self.return_params.values()))
        return first_return.content_type or default
```

## Резюме

- Плагины в lihil — это декораторы, которые изменяют поведение эндпоинтов во время выполнения. Они получают полный контекст: функцию, сигнатуру и граф зависимостей.

- Параметры плагинов явно отмечаются, чтобы избежать конфликтов с разбором HTTP-запросов.
