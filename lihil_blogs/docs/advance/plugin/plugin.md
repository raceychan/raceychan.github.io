# Plugin System

lihil provides a flexible plugin system that allows you to decorate endpoint functions with custom logic — without interfering with parameter parsing or signature analysis.

This is particularly useful for features like logging, metrics, authentication, or request tracing.

## Why it’s good

In similar ASGI frameworks, it is difficult to build composable, third-party plugins due to several limitations:

- Signature enforcement: You can't simply add a custom dependency to the endpoint signature — the framework will try to parse and validate it, potentially raising errors.

- Decorator restrictions: You can't freely decorate the endpoint function — the decorator must strictly preserve the function's signature or it will break.

- Lack of introspection: Decorators don't know what the endpoint function looks like, which makes it hard to write reusable, signature-aware plugins.

lihil avoids these limitations by introducing a plugin system that operates after the application has initialized, giving full access to dependency graphs and endpoint metadata.

## Plugin Protocol

Plugins now operate on a single endpoint descriptor that groups everything they need.

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

## Registering Plugins

You can apply plugins at two levels:

- Per-route

```python
from lihil import Route
from lihil.routing import EndpointProps

route = Route(props=EndpointProps(plugins=[MyPlugin()]))
```

- Per-endpoint

```python
@route.get(plugins=[MyPlugin()])
async def my_endpoint() -> None:
    ...
```

This allows fine-grained control for applying plugins only to specific endpoints.

### Plugin factory (optional)

If you prefer indirection, create a factory that returns a plugin instance. Configuration is captured at creation time; the request-time `Graph` is available from `endpoint_info.graph` inside the plugin.

```python
from lihil.config import lhl_get_config

def my_plugin_factory() -> IPlugin:
    config = lhl_get_config()
    return MyPlugin(max_conns=config.db.MAX_CONNS)

route = Route(props=EndpointProps(plugins=[my_plugin_factory()]))
```

## Writing a Plugin

Here’s an example plugin that injects an `EventBus` instance into the endpoint using the new protocol.

```python
from typing import Any, Awaitable, Callable
from functools import wraps

class BusPlugin:
    def __init__(self, busterm: BusTerminal[Any]):
        self.busterm = busterm

    # Optional indirection for readability
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

    # Conform to IPlugin
    def __call__(self, endpoint_info: IEndpointInfo[P, R]) -> Callable[P, Awaitable[R]]:
        return self.decorate(endpoint_info)
```

Behavior:
- The plugin receives `endpoint_info` which provides the app `graph`, raw endpoint `func`, and parsed `sig`.
- It inspects `sig.plugins` to discover parameters marked for plugins (e.g., `EventBus`).
- If a matching plugin parameter exists, it wraps the endpoint to inject a value constructed with `endpoint_info.graph`.
- If not, it returns the unmodified function.

Usage:

```python
bus_plugin = BusPlugin(BusTerminal(registry))
route = Route("/bus", plugins=[bus_plugin])
```

## Plugin Parameters

To avoid misinterpreting your plugin-specific values (e.g., internal helpers, service locators) as HTTP request data, annotate them using `Param("plugin")`.

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

## Do-anything with IEndpointInfo

`IEndpointInfo` gives plugins everything needed to safely reshape an endpoint at call time:

- Full introspection via `sig`: query/path/header/body parameters, plugin parameters, dependencies, returns, media type, and more.
- The raw callable via `func`: wrap and forward with modified args/kwargs.
- The per-request `graph`: build request-scoped services and resolve dependencies.

In practice, this means a plugin can inject new values, override or normalize existing ones, and even consume inputs before passing control to the endpoint function. You don’t mutate framework internals — you adapt the invocation based on a fully parsed signature.

### Examples

1) Override or normalize a query parameter

```python
from functools import wraps

class ClampPageSize:
    def __init__(self, default: int = 50, maximum: int = 100):
        self.default = default
        self.maximum = maximum

    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        # Only activate if the endpoint actually has this query param
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

2) Lift a path parameter into a richer domain object

```python
from functools import wraps

class LoadUser:
    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        # Only apply if endpoint accepts both a path id and a plugin user
        has_id = "user_id" in sig.path_params
        has_user = any(t.type_ is User for _, t in sig.plugins.items())
        if not (has_id and has_user):
            return func

        @wraps(func)
        async def wrapped(*args: P.args, **kwargs: P.kwargs) -> R:
            user_id = kwargs["user_id"]
            # Use the request graph to obtain repositories/services
            repo = ep.graph.get(UserRepository)
            kwargs["user"] = await repo.get_by_id(user_id)
            return await func(*args, **kwargs)

        return wrapped
```

3) Consume or rename inputs before forwarding

```python
from functools import wraps

class AliasOrgId:
    """Support legacy clients that send `orgId` by mapping it to `org_id`."""

    def __call__(self, ep: IEndpointInfo[P, R]):
        func = ep.func
        sig = ep.sig

        if "org_id" not in sig.path_params:
            return func

        @wraps(func)
        async def wrapped(*args: P.args, **kwargs: P.kwargs):
            if "orgId" in kwargs and "org_id" not in kwargs:
                kwargs["org_id"] = kwargs.pop("orgId")  # remove alias, forward canonical
            return await func(*args, **kwargs)

        return wrapped
```

Guidelines:
- Prefer annotating implementation-only arguments with `Param("plugin")` so they are excluded from HTTP parsing and available under `sig.plugins`.
- Don’t delete required parameters that the endpoint function expects; instead, transform or pre-fill them before calling `func`.
- Use `sig.dependencies` and `sig.transitive_params` to understand what will be resolved implicitly and avoid double work.
- Use `sig.return_params`, `sig.encoder`, and `sig.media_type` if you need to post-process or wrap return values consistently.

## Summary

- Plugins in lihil are decorators that modify endpoint behavior at runtime. They receive full context: function, signature, and dependency graph.

- Plugin parameters are explicitly marked to avoid conflict with HTTP request parsing.
