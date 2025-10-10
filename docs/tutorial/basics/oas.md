---
title: OAS (OpenAPI) Basics
sidebar_label: OAS (OpenAPI)
---

Lihil generates an OpenAPI specification (OAS) for your HTTP routes and endpoints. This page covers how to access the spec/UI and how to control inclusion in the schema.

Note: Some documentation or users may say “openai-schema”, but here we mean the OpenAPI Specification (OAS).

## Accessing the OpenAPI spec and docs

The output locations are configurable via your app config under `oas` (see config interface in `docs/http/config.md`). Common fields include:

- `OAS_PATH`: where the raw OpenAPI JSON is served
- `DOC_PATH`: where the interactive API docs UI is served

Example config snippet (TOML):

```toml title="pyproject.toml (excerpt)"
[tool.lihil]
VERSION = "0.1.0"

[tool.lihil.oas]
TITLE = "My API"
```

You can also override OAS-related values from the CLI:

```bash
python app.py --oas.title "New Title" --is_prod true
```

See: `docs/http/app.md` for more CLI examples and `docs/http/config.md` for the OAS config interface.

## Excluding endpoints from the OpenAPI schema

You can opt out individual endpoints (or whole routes by default) from the generated schema by using `in_schema=False`.

Endpoint-level exclusion:

```python title="endpoint_exclude.py"
from lihil import Lihil, Route

users = Route("/users")

@users.get(in_schema=False)
def private_status() -> dict[str, str]:
    return {"status": "ok"}

lhl = Lihil(users)
```

Route-level default (exclude all endpoints in a route unless overridden):

```python title="route_default_exclude.py"
from lihil import Lihil, Route
from lihil.routing import EndpointProps

private_defaults = EndpointProps(in_schema=False)
private = Route("/private", props=private_defaults)

@private.get()
def hidden_ping() -> dict[str, str]:
    return {"pong": "hidden"}

# This one opts back in explicitly
@private.get(in_schema=True)
def visible_ping() -> dict[str, str]:
    return {"pong": "visible"}

lhl = Lihil(private)
```

Reference: the `in_schema` property is documented in `docs/http/endpoint.md` (see “Properties”).

## Tags and grouping

To organize endpoints in the OpenAPI UI, provide `tags` on endpoints or via route defaults:

```python title="tags.py"
from lihil import Lihil, Route

users = Route("/users")

@users.get(tags=["users"])  # appears under the "users" tag in OAS
def get_me() -> dict[str, str]:
    return {"id": "123"}

lhl = Lihil(users)
```

## See also

- Endpoint properties (including `in_schema`): `docs/http/endpoint.md`
- OAS config (paths, title, version): `docs/http/config.md`
- CLI overrides example: `docs/http/app.md`

