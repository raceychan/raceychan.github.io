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

插件基于一个端点信息描述对象工作，它提供了所需的一切：应用 `Graph`、原始函数和已解析的签名。

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

### 插件工厂（可选）

如果你更喜欢间接创建插件，可以使用返回插件实例的工厂。运行时的 `Graph` 可在插件内部通过 `endpoint_info.graph` 获取。

```python
from lihil.config import lhl_get_config

def my_plugin_factory() -> IPlugin:
    cfg = lhl_get_config()
    return MyPlugin(max_conns=cfg.db.MAX_CONNS)

route = Route(props=EndpointProps(plugins=[my_plugin_factory()]))
```

## 编写插件

以下示例使用新协议，通过插件向端点注入 `EventBus`：

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

这个插件检查 EndpointSignature，如果它找到一个类型为 `EventBus` 的参数，它会包装端点函数以注入由 `BusTerminal` 创建的 `EventBus` 实例。

如果没有任何类型为 `EventBus` 的参数，它只是返回原始函数。

## 插件参数

为了避免误解你的插件特定值（例如内部助手、服务定位器）为 HTTP 请求数据，使用 `Param("plugin")` 注释它们。

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

## IEndpointInfo 的威力

`IEndpointInfo` 为插件提供了在调用时安全改造端点所需的一切：

- 通过 `sig` 完整内省：查询/路径/头/请求体参数、插件参数、依赖、返回信息、媒体类型等。
- 通过 `func` 获取原始可调用对象：包装后以修改过的 `args/kwargs` 转发。
- 通过每次请求的 `graph`：构建请求作用域服务并解析依赖。

这意味着插件可以注入新值、覆盖或规范化已有值，甚至在将控制权交给端点函数之前消费输入。你无需修改框架内部——只需基于已完全解析的签名自适应调用。

### 示例

1) 覆盖/规范化查询参数

```python
from functools import wraps

class ClampPageSize:
    def __init__(self, default: int = 50, maximum: int = 100):
        self.default = default
        self.maximum = maximum

    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        # 仅当端点确实声明了该查询参数时才生效
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

2) 将路径参数提升为更丰富的领域对象

```python
from functools import wraps

class LoadUser:
    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        # 仅当端点同时接受路径 id 和插件 user 时才生效
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

3) 转换或移除转发前的输入

```python
from functools import wraps

class AliasOrgId:
    """兼容发送 `orgId` 的旧客户端，将其映射为 `org_id`。"""

    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        if "org_id" not in sig.path_params:
            return func

        @wraps(func)
        async def wrapped(*args: P.args, **kwargs: P.kwargs):
            if "orgId" in kwargs and "org_id" not in kwargs:
                kwargs["org_id"] = kwargs.pop("orgId")  # 删除别名，转发规范名
            return await func(*args, **kwargs)

        return wrapped
```

指南：
- 对仅用于实现的参数使用 `Param("plugin")` 注解，使其从 HTTP 解析中排除，并可在 `sig.plugins` 中读取。
- 不要删除端点函数真正需要的必填参数；应在调用 `func` 前对其进行转换或预填。
- 使用 `sig.dependencies` 与 `sig.transitive_params` 了解哪些值会被隐式解析，避免重复工作。
- 如需对返回值做统一后处理或包装，可参考 `sig.return_params`、`sig.encoder` 与 `sig.media_type`。

## 总结

- lihil 中的插件是在运行时修改端点行为的装饰器。它们接收完整的上下文：函数、签名和依赖图。

- 插件参数被明确标记以避免与 HTTP 请求解析冲突。
