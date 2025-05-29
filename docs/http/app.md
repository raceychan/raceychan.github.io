---
sidebar_position: 3
title: application
---


## Create app with routes

```python title="app.py"
from lihil import Lihil, Route

user_route = Route("users")


lhl = Lihil(user_route)
```

## Include routes

```python
product_route = Route("products")

lhl.include_routes(product_route)
```

## Config Your App

There are several settings you can change to control the behavior of lihil,


1. config file, e.g: `pyproject.toml`

    ```python
    lhl = Lihil(config_file="pyproject.toml")
    ```

    This will look for `tool.lihil` table in the `pyproject.toml` file
    extra/unkown keys will be forbidden to help prevent misconfiging

    Note: currently only toml file is supported

2. `AppConfig` instance

    ```python
    lhl = Lihil(app_config=AppConfig(version="0.1.1"))
    ```

    this is particularly useful if you want to inherit from AppConfig and extend it.

    ```python
    from lihil.config import AppConfig

    class MyConfig(AppConfig):
        app_name: str

    config = MyConfig.from_file("myconfig.toml")
    ```

3. Command line arguments:

    ```example
    python app.py --oas.title "New Title" --is_prod true
    ```

    - use `.` to express nested fields

    - add `--help` to see available options

You can access `AppConfig` anywhere in your app via `lihil.config.lhl_get_config`

```python
from lihil.config import lhl_get_config, AppConfig

app_config: AppConfig = lhl_get_config()
```


## Serve(run) your app


### Serve with lihil

```python
from lihil import Lihil

# your application code

lhl = Lihil()

if __name__ == "__main__":
    lhl.run(__file__)
```

then in command line

```python
uv run python -m myproject.app --server.port=8080
```

This allows you to override configurations using command-line arguments.

If your app is deployed in a containerized environment, such as Kubernetes, providing secrets this way is usually safer than storing them in files.

use `--help` to see available configs.