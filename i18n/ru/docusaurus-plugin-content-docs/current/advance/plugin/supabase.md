---
title: supabase
---

## Интеграция с Supabase (поддержка аутентификации)

lihil вводит поддержку Supabase, начиная с аутентификации пользователей. Всего одной строчкой кода:

```python
app.include_routes(signin_route_factory(route_path="/login"))
```

вы можете интегрировать рабочий эндпоинт входа, поддерживаемый Supabase Auth.

Полный пример кода

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
    app.config = lhl_read_config(".env", config_type=ProjectConfig) # читаем конфигурацию из файла .env и преобразуем её в объект `ProjectConfig`.
    app.graph.analyze(supabase_factory) # регистрируем пример фабричной функции для supabase.AsyncClient
    app.include_routes(signin_route_factory(route_path="/login"))
    yield


lhl = Lihil(lifespan=lifespan)

if __name__ == "__main__":
    lhl.run(__file__)
```

- Текущий плагин поддерживает потоки аутентификации как по email/телефону-пароль, так и по паролю, используя AsyncClient от Supabase. Он автоматически обрабатывает разбор форм, внедрение зависимостей и обработку ошибок — всё это оставаясь полностью типобезопасным и компонуемым.

Это только начало. Хотя текущая поддержка ограничивается базовыми эндпоинтами входа и регистрации, будущие версии расширят поддержку других функций Supabase, таких как:

- Управление пользователями

- Обработка сессий

- Правила авторизации

- Интеграция с Realtime и базой данных

Цель состоит в том, чтобы предложить бесшовный, идиоматичный опыт интеграции Supabase с lihil, без шаблонного кода и обходных путей.