# Plugin System

lihil provides a flexible plugin system that allows you to decorate endpoint functions with custom logic — without interfering with parameter parsing or signature analysis.

This is particularly useful for features like logging, metrics, authentication, or request tracing.

# Why makes it good?

In similar ASGI frameworks, it is difficult to build composable, third-party plugins due to several limitations:

- Signature enforcement: You can't simply add a custom dependency to the endpoint signature — The framework will try to parse and validate it, potentially raising errors.

- Decorator restrictions: You can't freely decorate the endpoint function — the decorator must strictly preserve the function's signature or it will break.

- Lack of introspection: Decorators don't know what the endpoint function looks like, which makes it hard to write reusable, signature-aware plugins.

lihil avoids these limitations by introducing a plugin system that operates after the application has initialized, giving full access to dependency graphs and endpoint metadata.

## IPlugin Interface

A plugin in lihil is a callable (sync or async) that receives:

1. the `ididi.Graph` (dependency graph) owned by the application, containing all the registered dependencies and their configurations.

2. the raw endpoint function,

3. the fully parsed EndpointSignature.

This happens after the lifespan event, ensuring that plugins can rely on resources created during lifespan handler.

```python
from typing import Any, Awaitable, Callable, Protocol
from ididi import Graph
from lihil.signature import EndpointSignature

IFunc = Callable[..., Awaitable[Any]]

class IAsyncPlugin(Protocol):
async def __call__(
    self,
    graph: Graph,
    func: IFunc,
    sig: EndpointSignature[Any],
    /,
) -> IFunc: ...

class ISyncPlugin(Protocol):
def __call__(
    self,
    graph: Graph,
    func: IFunc,
    sig: EndpointSignature[Any],
    /,
) -> IFunc: ...

IPlugin = IAsyncPlugin | ISyncPlugin
```

## Registering Plugins

You can apply plugins at two levels:

1. Per-Route Plugins

```python

from lihil import Route
from lihil.routing import EndpointProps


route = Route(props=EndpointProps(plugins=[MyPlugin()]))
```

All endpoints registered under this route will automatically use `MyPlugin`.

2. Per-Endpoint Plugins

```python

   @route.get(plugins=[MyPlugin()])
   async def my_endpoint() -> None:
   ...
```

This allows fine-grained control for applying plugins only to specific endpoints.

## Writing a Plugin

Here's an example plugin that injects an EventBus instance into the endpoint:

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

This plugin inspects the EndpointSignature, if it finds a parameter of type `EventBus`, it wraps the endpoint function to inject an instance of `EventBus` created by the `BusTerminal`.

If there is no any parameter of type `EventBus`, it simply returns the original function.

## Plugin Parameters

To avoid misinterpreting your plugin-specific values (e.g., internal helpers, service locators) as HTTP request data, annotate them using `Param("plugin")`.

```python
from lihil import Route
from lihil.plugins.bus import bus_pluin, BusTerminal

bus_term = BusTerminal()

@Route("/users/{user_id}", plugsins=[bus_plugin(busterm)])
async def create_user(
    user_id: str, bus: EventBus = Annotated[EventBus, Param("plugin")]
) -> None:
```

This tells lihil to treat `bus` as a plugin-managed dependency rather than a request-bound parameter.

## EndpointSignature

```python
class EndpointSignature(Base, Generic[R]):
    route_path: str

    query_params: dict[str, [QueryParam[Any]]]
    path_params: dict[str, [PathParam[Any]]]
    header_params: dict[str, [HeaderParam[Any] | CookieParam[Any]]]
    body_param: tuple[str, BodyParam[bytes | FormData, Struct]] | None

    dependencies: dict[str, [DependentNode]]
    transitive_params: set[str]
    """
    Transitive params are parameters required by dependencies, but not directly required by the endpoint function.
    """
    plugins: dict[str, [PluginParam]]

    scoped: bool
    form_meta: FormMeta | None

    status_code: int
    return_encoder: IEncoder[R]
    return_params: dict[int, EndpointReturn[R]]

    @property
    def static(self) -> bool: ...

    @property
    def media_type(self) -> str: ...

```

## Summary

- Plugins in lihil are decorators that modify endpoint behavior at runtime. They receive full context: function, signature, and dependency graph.

- Plugin parameters are explicitly marked to avoid conflict with HTTP request parsing.
