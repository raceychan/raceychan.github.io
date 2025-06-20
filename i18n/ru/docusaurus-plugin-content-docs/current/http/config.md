---
title: конфигурация
---

# Конфигурация

Конфигурация приложения — это распространенная, но сложная проблема, особенно в реальных проектах.

Часто нужно создавать зависимости, которые полагаются на динамические настройки — такие как установка уровня изоляции движка базы данных или настройка тайм-аутов в зависимости от среды.

Lihil предоставляет унифицированную систему конфигурации, которая поддерживает несколько источников — файлы, переменные окружения и аргументы CLI — обеспечивая безопасное и гибкое управление конфигурацией из коробки.

---

## Загрузка и парсинг конфигурации

```python
from lihil.config import lhl_read_config, AppConfig
```

Lihil автоматически загружает значения конфигурации из следующих источников в порядке возрастания приоритета:

1. Файлы конфигурации, предоставленные пользователем
2. Переменные окружения
3. Аргументы командной строки

Этот многоуровневый подход отражает реальные потребности:

- Статичная и публичная конфигурация, такая как порты сервера или уровни логирования, может находиться в версионированном файле (например, settings.toml).

- Чувствительные данные, такие как API-ключи или пароли базы данных, должны поступать из переменных окружения, чтобы избежать случайного раскрытия.

- Для временных переопределений, таких как отладка с другим портом или переключение флага, аргументы CLI предлагают максимальную гибкость.

## Чтение конфигурации из разных источников

```python
config = lhl_read_config("settings.toml", config_type=MyAppConfig)
```

Это автоматически читает из всех трех источников и объединяет их в один экземпляр конфигурации.

Вы можете предоставить несколько файлов, и они будут прочитаны по порядку.

```python
config = lhl_read_config("settings.toml", "dev.env", "prod.env")
```

## Ручная установка конфигурации

```python
from lihil import AppConfig, Lihil

lhl = Lihil(app_config = AppConfig())
```

Или используйте lhl_set_config() напрямую:

```python
from lihil.config import lhl_set_config

lhl_set_config(MyConfig())
```

### Вызов без аргументов сбрасывает к значению по умолчанию:

```python
lhl_set_config()
```

## Получение текущей конфигурации

Используйте `lhl_get_config()` для получения активной конфигурации из любого места в вашем приложении:

```python
from lihil.config import lhl_get_config

config = lhl_get_config()
```

## Расширение AppConfig

Вы можете расширить AppConfig для определения собственных настроек:

```python
from lihil.app_config import AppConfig

class MyAppConfig(AppConfig):
    my_custom_setting: str = "default"
```

Затем загрузите его:

```python

from lihil.config import lhl_read_config

config = lhl_read_config("settings.toml", config_type=MyAppConfig)
```

## Автоматически генерируемые аргументы командной строки

Если вы расширяете свою конфигурацию через наследование от `AppConfig`,
дополнительные свойства также будут сгенерированы как аргументы командной строки, и вы можете передать их для переопределения.

## Пример файла конфигурации (config.toml)

```toml
[lihil]
IS_PROD = true
VERSION = "1.0.0"

[lihil.server]
HOST = "127.0.0.1"
PORT = 9000

[lihil.oas]
TITLE = "My API"
```

## Переопределения командной строки

Любое поле может быть переопределено через CLI:

```bash
python app.py --is_prod --server.port 8080
```

## Использование других схем конфигурации (например, Pydantic)

Если вы используете другую систему валидации, такую как Pydantic, вы можете самостоятельно парсить и вручную внедрять:

```python

from lihil.config import lhl_set_config, lhl_get_config

app_config = PydanticSettings()
lhl_set_config(app_config)
```

Ваша конфигурация должна реализовать интерфейс `IAppConfig`.

## Интерфейс AppConfig

```python
    class IOASConfig(Protocol):
        @property
        def OAS_PATH(self) -> str: ...
        @property
        def DOC_PATH(self) -> str: ...
        @property
        def TITLE(self) -> str: ...
        @property
        def PROBLEM_PATH(self) -> str: ...
        @property
        def PROBLEM_TITLE(self) -> str: ...
        @property
        def VERSION(self) -> str: ...

    class IServerConfig(Protocol):
        @property
        def HOST(self) -> str: ...
        @property
        def PORT(self) -> int: ...
        @property
        def WORKERS(self) -> int: ...
        @property
        def RELOAD(self) -> bool: ...
        @property
        def ROOT_PATH(self) -> bool: ...
        def asdict(self) -> dict[str, Any]: ...

    class IAppConfig(Protocol):
        @property
        def VERSION(self) -> str: ...
        @property
        def server(self) -> IServerConfig: ...
        @property
        def oas(self) -> IOASConfig: ...
```

## Резюме

- Наследуйте `AppConfig` для расширения, используйте `lhl_read_config` для загрузки конфигурации, затем устанавливайте конфигурацию через `lhl_set_config` для большинства случаев
- Если вы создаете конфигурацию вручную (например, через Pydantic), реализуйте интерфейс `IAppConfig`.
- Вызывайте `lhl_get_config` для доступа к конфигурации из любого места.
- Чувствительные значения должны поступать из переменных окружения.
- Используйте аргументы CLI для быстрых локальных переопределений, например, для отладки.