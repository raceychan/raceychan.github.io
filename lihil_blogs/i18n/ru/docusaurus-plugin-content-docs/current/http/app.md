---
sidebar_position: 3
title: приложение
---


## Создание приложения с маршрутами

```python title="app.py"
from lihil import Lihil, Route

user_route = Route("users")


lhl = Lihil(user_route)
```

## Включение маршрутов

```python
product_route = Route("products")

lhl.include_routes(product_route)
```

## Конфигурация вашего приложения

Существует несколько настроек, которые вы можете изменить для управления поведением lihil:


1. Файл конфигурации, например: `pyproject.toml`

    ```python
    lhl = Lihil(config_file="pyproject.toml")
    ```

    Это будет искать таблицу `tool.lihil` в файле `pyproject.toml`
    дополнительные/неизвестные ключи будут запрещены для предотвращения неправильной конфигурации

    Примечание: в настоящее время поддерживается только файл toml

2. Экземпляр `AppConfig`

    ```python
    lhl = Lihil(app_config=AppConfig(version="0.1.1"))
    ```

    Это особенно полезно, если вы хотите наследоваться от AppConfig и расширить его.

    ```python
    from lihil.config import AppConfig

    class MyConfig(AppConfig):
        app_name: str

    config = MyConfig.from_file("myconfig.toml")
    ```

3. Аргументы командной строки:

    ```example
    python app.py --oas.title "New Title" --is_prod true
    ```

    - используйте `.` для выражения вложенных полей

    - добавьте `--help` для просмотра доступных опций

Вы можете получить доступ к `AppConfig` в любом месте вашего приложения через `lihil.config.lhl_get_config`

```python
from lihil.config import lhl_get_config, AppConfig

app_config: AppConfig = lhl_get_config()
```


## Запуск вашего приложения


### Запуск с lihil

```python
from lihil import Lihil

# код вашего приложения

lhl = Lihil()

if __name__ == "__main__":
    lhl.run(__file__)
```

затем в командной строке

```python
uv run python -m myproject.app --server.port=8080
```

Это позволяет переопределять конфигурации с помощью аргументов командной строки.

Если ваше приложение развернуто в контейнеризованной среде, такой как Kubernetes, предоставление секретов таким способом обычно безопаснее, чем хранение их в файлах.

используйте `--help` для просмотра доступных конфигураций.