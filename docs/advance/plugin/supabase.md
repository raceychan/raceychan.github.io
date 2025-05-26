---
title: supabase
---

## Supabase Integration (Auth Support)

lihil is introducing support for Supabase, starting with user authentication. With just a single line of code:

```python
app.include_routes(signin_route_factory(route_path="/login"))
```

you can integrate a working login endpoint backed by Supabase Auth.

Full code example

```python

from supabase import AsyncClient

from lihil import Lihil
from lihil.config import AppConfig, lhl_get_config, lhl_read_config
from lihil.plugins.auth.supabase import signin_route_factory


class ProjectConfig(AppConfig, kw_only=True):
    SUPABASE_URL: str
    SUPABASE_API_KEY: str


def supabase_factory() -> AsyncClient:
    config = lhl_get_config(config_type=ProjectConfig)
    return AsyncClient(
        supabase_url=config.SUPABASE_URL, supabase_key=config.SUPABASE_API_KEY
    )


async def lifespan(app: Lihil):
    app.config = lhl_read_config(".env", config_type=ProjectConfig) # read config from .env file as convert it to `ProjectConfig` object.
    app.graph.analyze(supabase_factory) # register an example factory function for supabase.AsyncClient
    app.include_routes(signin_route_factory(route_path="/login"))
    yield


lhl = Lihil(lifespan=lifespan)

if __name__ == "__main__":
    lhl.run(__file__)
```

- The current plugin supports both email/phone-password authentication flows using Supabase's AsyncClient. It handles form parsing, dependency injection, and error responses automatically — all while staying fully type-safe and composable.

This is just the beginning. While the current support is limited to basic login and signup endpoints, future releases will expand support to other features in Supabase such as:

- User management

- Session handling

- Authorization rules

- Realtime and database integration

The goal is to offer a seamless, idiomatic experience for integrating Supabase with lihil, without boilerplate or workarounds.