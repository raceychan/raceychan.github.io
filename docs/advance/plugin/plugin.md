# Plugin System

lihil provides a flexible plugin system that allows you to decorate endpoint functions with custom logic — without interfering with parameter parsing or signature analysis.

This is particularly useful for features like logging, metrics, authentication, or request tracing.

## Why makes it good?

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

### plugin factory

Do note that plugins are called after lifespan event, instead of instantiating the plugins at import time like we did with `route.get(plugins=[MyPlugin()])`. 
You can wrap the plugin in a factory.

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

    query_params: ParamMap[QueryParam[Any]]
    path_params: ParamMap[PathParam[Any]]
    header_params: ParamMap[HeaderParam[Any] | CookieParam[Any]]
    body_param: tuple[str, BodyParam[bytes | FormData, Struct]] | None

    dependencies: ParamMap[DependentNode]
    transitive_params: set[str]
    """
    Transitive params are parameters required by dependencies, but not directly required by the endpoint function.
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

## Summary

- Plugins in lihil are decorators that modify endpoint behavior at runtime. They receive full context: function, signature, and dependency graph.

- Plugin parameters are explicitly marked to avoid conflict with HTTP request parsing.
