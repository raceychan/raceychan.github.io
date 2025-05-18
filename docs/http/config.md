# Config

Application configuration is a common yet tricky problem, especially in real-world projects.

You often need to create dependencies that rely on dynamic settings — such as setting a database engine's isolation level, or adjusting timeouts based on environment.

Lihil provides a unified configuration system that supports multiple sources — files, environment variables, and CLI arguments — allowing secure and flexible config management out of the box.

---

## Config Loading & Parsing

```python
from lihil.config import lhl_read_config, AppConfig
```

Lihil automatically loads configuration values from the following sources, in order of increasing priority:

1. User-provided config files
2. Environment variables
3. Command-line arguments

This layered approach reflects real-world needs:

- Static and public config, such as server ports or logging levels, can go into a versioned file (e.g. settings.toml).

- Sensitive data, like API keys or database passwords, should come from environment variables to avoid accidental exposure.

- For temporary overrides, like debugging with a different port or toggling a flag, CLI arguments offer maximum flexibility.

```python
config = lhl_read_config("settings.toml", config_type=MyAppConfig)
```

This automatically reads from all three sources and merges them into one config instance.

Notice that you can provide multiple files and they will be read in order.

```python
config = lhl_read_config("dev.env", "prod.env")
```

## Set Config Manually

```python
from lihil import AppConfig, Lihil

lhl = Lihil(app_config = AppConfig())
```

Or use lhl_set_config() directly:

```python
from lihil.config import lhl_set_config

lhl_set_config(MyConfig())
```

### Calling without arguments resets to the default:

```python
lhl_set_config()
```

## Get Current Config

Use `lhl_get_config()` to retrieve the active config from anywhere in your app:

```python
from lihil.config import lhl_get_config

config = lhl_get_config()
```

## Extending AppConfig

You can extend AppConfig to define your own settings:

```python
from lihil.app_config import AppConfig

class MyAppConfig(AppConfig):
    my_custom_setting: str = "default"
```

Then load it:

```python

from lihil.config import lhl_read_config

config = lhl_read_config("settings.toml", config_type=MyAppConfig)
```

## Auto generated command line arguments

If you extend your config via inheriting from `AppConfig`,
the extra properties will also be generated as command line arguments and you can pass them to override.

## Using Other Config Schemas (e.g., Pydantic)

If you use a different validation system like Pydantic, you can parse it yourself and inject it manually:

```python

from lihil.config import lhl_set_config, lhl_get_config

app_config = PydanticSettings()
lhl_set_config(app_config)
```

## Example Config File (config.toml)

```toml
[lihil]
is_prod = true
version = "1.0.0"

[lihil.server]
host = "127.0.0.1"
port = 9000

[lihil.oas]
title = "My API"
```

## Command-line Overrides

Any field can be overridden via CLI:

```bash
python app.py --is_prod --server.port 8080
```

## AppConfig Interface

```python
    class IOASConfig(Protocol):
    @property
    def oas_path(self) -> str: ...
    @property
    def doc_path(self) -> str: ...
    @property
    def title(self) -> str: ...
    @property
    def problem_path(self) -> str: ...
    @property
    def problem_title(self) -> str: ...
    @property
    def version(self) -> str: ...

    class IServerConfig(Protocol):
    @property
    def host(self) -> str: ...
    @property
    def port(self) -> int: ...
    @property
    def workers(self) -> int: ...
    @property
    def reload(self) -> bool: ...
    def asdict(self) -> dict[str, Any]: ...

    class IAppConfig(Protocol):
    @property
    def version(self) -> str: ...
    @property
    def server(self) -> IServerConfig: ...
    @property
    def oas(self) -> IOASConfig: ...
```

## Summary

- Use `AppConfig` + `lhl_read_config` for most use cases.

- Use `lhl_set_config` if you build the config manually (e.g. via Pydantic).

- Call `lhl_get_config` to access the config anywhere.

- Sensitive values should go into environment variables.

- Use CLI arguments for fast, local overrides.
