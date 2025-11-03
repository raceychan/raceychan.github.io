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

Плагины работают с объектом описания эндпоинта, который содержит всё необходимое: `Graph` приложения, сырая функция и разобранная сигнатура.

```python
from typing import Protocol, Generic
from ididi import Graph
from lihil.interface import IAsyncFunc, P, R
from lihil.signature import EndpointSignature


class IEndpointInfo(Protocol, Generic[P, R]):
    @property
    def graph(self) -> Graph: ...

    @property
    def func(self) -> IAsyncFunc[P, R]: ...

    @property
    def sig(self) -> EndpointSignature[R]: ...


class IPlugin(Protocol):
    def __call__(self, endpoint_info: IEndpointInfo[P, R], /) -> IAsyncFunc[P, R]: ...
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

### Фабрика плагинов (опционально)

Если нужна прослойка, создайте фабрику, которая возвращает экземпляр плагина. Время выполнения `Graph` доступен внутри плагина через `endpoint_info.graph`.

```python
from lihil.config import lhl_get_config

def my_plugin_factory() -> IPlugin:
    cfg = lhl_get_config()
    return MyPlugin(max_conns=cfg.db.MAX_CONNS)

route = Route(props=EndpointProps(plugins=[my_plugin_factory()]))
```

## Написание плагина

Пример по новому протоколу: внедрение `EventBus` в эндпоинт.

```python
from typing import Any, Awaitable, Callable
from functools import wraps

class BusPlugin:
    def __init__(self, busterm: BusTerminal[Any]):
        self.busterm = busterm

    def decorate(self, ep_info: IEndpointInfo[P, R]) -> Callable[P, Awaitable[R]]:
        sig = ep_info.sig
        func = ep_info.func

        for name, param in sig.plugins.items():
            param_type, _ = get_origin_pro(param.type_)
            param_type = ty_get_origin(param_type) or param_type
            if param_type is EventBus:
                break
        else:
            return func

        @wraps(func)
        async def f(*args: P.args, **kwargs: P.kwargs) -> R:
            kwargs[name] = self.busterm.create_event_bus(ep_info.graph)
            return await func(*args, **kwargs)

        return f

    def __call__(self, endpoint_info: IEndpointInfo[P, R]) -> Callable[P, Awaitable[R]]:
        return self.decorate(endpoint_info)
```

Этот плагин исследует EndpointSignature, если он находит параметр типа `EventBus`, он оборачивает функцию эндпоинта, чтобы внедрить экземпляр `EventBus`, созданный `BusTerminal`.

Если нет ни одного параметра типа `EventBus`, он просто возвращает исходную функцию.

## Параметры плагинов

Чтобы избежать неправильной интерпретации ваших специфичных для плагина значений (например, внутренние помощники, локаторы сервисов) как данные HTTP-запроса, аннотируйте их с помощью `Param("plugin")`.

```python
from typing import Annotated
from lihil import Route, Param

bus_term = BusTerminal()
route = Route("/users/{user_id}", props=EndpointProps(plugins=[BusPlugin(bus_term)]))

@route.post
async def create_user(
    user_id: str,
    bus: Annotated[EventBus, Param("plugin")],
) -> None:
    ...
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

## Сила IEndpointInfo

`IEndpointInfo` даёт плагинам всё необходимое, чтобы безопасно переоформлять вызов эндпоинта во время выполнения:

- Полная интроспекция через `sig`: параметры query/path/header/body, параметры плагинов, зависимости, возвращаемые типы, media type и т. д.
- Доступ к исходной функции через `func`: оборачивайте и передавайте изменённые `args/kwargs`.
- Доступ к `graph` запроса: создавайте сервисы с областью запроса и разрешайте зависимости.

На практике это позволяет плагину внедрять новые значения, переопределять или нормализовать существующие и даже «поглощать» входы до передачи управления функции эндпоинта. Вам не нужно менять внутренности фреймворка — вы адаптируете сам вызов, опираясь на полностью разобранную сигнатуру.

### Примеры

1) Переопределение/нормализация query-параметра

```python
from functools import wraps

class ClampPageSize:
    def __init__(self, default: int = 50, maximum: int = 100):
        self.default = default
        self.maximum = maximum

    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        # Активируйтесь только если у эндпоинта есть такой параметр
        if "page_size" not in sig.query_params:
            return func

        @wraps(func)
        async def wrapped(*args: P.args, **kwargs: P.kwargs) -> R:
            value = kwargs.get("page_size")
            if value is None:
                kwargs["page_size"] = self.default
            else:
                kwargs["page_size"] = min(int(value), self.maximum)
            return await func(*args, **kwargs)

        return wrapped
```

2) Поднять path-параметр до богатого доменного объекта

```python
from functools import wraps

class LoadUser:
    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        # Применять только если есть и id в пути, и плагинный user
        has_id = "user_id" in sig.path_params
        has_user = any(t.type_ is User for _, t in sig.plugins.items())
        if not (has_id and has_user):
            return func

        @wraps(func)
        async def wrapped(*args: P.args, **kwargs: P.kwargs) -> R:
            user_id = kwargs["user_id"]
            repo = ep.graph.get(UserRepository)
            kwargs["user"] = await repo.get_by_id(user_id)
            return await func(*args, **kwargs)

        return wrapped
```

3) Преобразование или удаление алиасов до форвардинга

```python
from functools import wraps

class AliasOrgId:
    """Поддержать легаси-клиентов с `orgId`, сопоставив его с `org_id`."""

    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        if "org_id" not in sig.path_params:
            return func

        @wraps(func)
        async def wrapped(*args: P.args, **kwargs: P.kwargs):
            if "orgId" in kwargs and "org_id" not in kwargs:
                kwargs["org_id"] = kwargs.pop("orgId")  # убрать алиас, передать каноничное имя
            return await func(*args, **kwargs)

        return wrapped
```

Рекомендации:
- Отмечайте служебные аргументы `Param("plugin")`, чтобы исключить их из HTTP-разбора и читать через `sig.plugins`.
- Не удаляйте обязательные параметры, которых ждёт функция эндпоинта; вместо этого трансформируйте или предзаполните их перед вызовом `func`.
- Используйте `sig.dependencies` и `sig.transitive_params`, чтобы понимать, что будет разрешено неявно, и избегать дублирования.
- Если нужно пост-обработать/обернуть возвращаемые значения, используйте `sig.return_params`, `sig.encoder` и `sig.media_type`.

## Резюме

- Плагины в lihil — это декораторы, которые изменяют поведение эндпоинтов во время выполнения. Они получают полный контекст: функцию, сигнатуру и граф зависимостей.

- Параметры плагинов явно отмечаются, чтобы избежать конфликтов с разбором HTTP-запросов.
