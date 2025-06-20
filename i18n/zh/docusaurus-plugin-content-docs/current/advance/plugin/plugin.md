# 插件系统

lihil 提供了一个灵活的插件系统，允许你使用自定义逻辑装饰端点函数——而不会干扰参数解析或签名分析。

这对于日志记录、指标、认证或请求跟踪等功能特别有用。

## 为什么它是好的？

在类似的 ASGI 框架中，由于几个限制，很难构建可组合的第三方插件：

- 签名强制：你不能简单地向端点签名添加自定义依赖项——框架会尝试解析和验证它，可能会引发错误。

- 装饰器限制：你不能自由装饰端点函数——装饰器必须严格保留函数的签名，否则会破坏。

- 缺乏内省：装饰器不知道端点函数的样子，这使得编写可重用、签名感知的插件变得困难。

lihil 通过引入在应用程序初始化后运行的插件系统来避免这些限制，提供对依赖图和端点元数据的完全访问。

## IPlugin 接口

lihil 中的插件是一个可调用对象（同步或异步），它接收：

1. 应用程序拥有的 `ididi.Graph`（依赖图），包含所有注册的依赖项及其配置。

2. 原始端点函数，

3. 完全解析的 EndpointSignature。

这发生在生命周期事件之后，确保插件可以依赖在生命周期处理器期间创建的资源。

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

## 注册插件

你可以在两个级别应用插件：

1. 每路由插件

```python

from lihil import Route
from lihil.routing import EndpointProps


route = Route(props=EndpointProps(plugins=[MyPlugin()]))
```

在此路由下注册的所有端点将自动使用 `MyPlugin`。

2. 每端点插件

```python

   @route.get(plugins=[MyPlugin()])
   async def my_endpoint() -> None:
   ...
```

这允许精细控制，仅将插件应用于特定端点。

### 插件工厂

请注意，插件在生命周期事件之后调用，而不是像我们使用 `route.get(plugins=[MyPlugin()])` 那样在导入时实例化插件。
你可以将插件包装在工厂中。

```python
from lihil.config import lhl_get_config

def my_plugin_factory(graph: Graph, func: Callable[P, R], sig: EndpointSignature[R]): # 可以是同步或异步
    config = lhl_get_config()
    engine = Graph.resolve(Engine, url=config.db.URL)
    return MyPlugin(engine=engine, max_conns=config.db.MAX_CONNS)

@route.get(plugins=[my_plugin_factory])
async def my_endpoint() -> None:
    ...
```

## 编写插件

以下是一个向端点注入 EventBus 实例的示例插件：

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

这个插件检查 EndpointSignature，如果它找到一个类型为 `EventBus` 的参数，它会包装端点函数以注入由 `BusTerminal` 创建的 `EventBus` 实例。

如果没有任何类型为 `EventBus` 的参数，它只是返回原始函数。

## 插件参数

为了避免误解你的插件特定值（例如内部助手、服务定位器）为 HTTP 请求数据，使用 `Param("plugin")` 注释它们。

```python
from lihil import Route
from lihil.plugins.bus import bus_pluin, BusTerminal

bus_term = BusTerminal()

@Route("/users/{user_id}", plugsins=[bus_plugin(busterm)])
async def create_user(
    user_id: str, bus: EventBus = Annotated[EventBus, Param("plugin")]
) -> None:
```

这告诉 lihil 将 `bus` 视为插件管理的依赖项，而不是请求绑定的参数。

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
    传递参数是依赖项所需的参数，但不是端点函数直接需要的。
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

## 总结

- lihil 中的插件是在运行时修改端点行为的装饰器。它们接收完整的上下文：函数、签名和依赖图。

- 插件参数被明确标记以避免与 HTTP 请求解析冲突。