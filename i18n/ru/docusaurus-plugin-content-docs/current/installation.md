---
title: Установка
sidebar_position: 1
slug: /installation
---

## Установка

lihil требует python>=3.10

### pip

```bash
pip install lihil
```

### uv

если вы хотите установить lihil используя uv

[руководство по установке uv](https://docs.astral.sh/uv/getting-started/installation/#installation-methods)

1. инициализируйте ваш веб-проект с `project_name`

```bash
uv init project_name
```

2. установите lihil через uv, это решит все зависимости для вас в выделенном виртуальном окружении.

```bash
uv add lihil
```

## Запуск

### Запуск с lihil

```python title="app.py"
from lihil import Lihil

# код вашего приложения

lhl = Lihil()

if __name__ == "__main__":
    lhl.run(__file__)
```

затем в командной строке

```bash
python -m myproject.app --server.port=8080
```

если вы используете uv
```bash
uv run python -m myproject.app --server.port=8080
```

Здесь `myproject` - это имя корневой папки вашего проекта, а `app.py` - это имя главного файла вашего приложения.

Это позволяет вам переопределять конфигурации, используя аргументы командной строки.

Если ваше приложение развернуто в контейнеризованной среде, такой как Kubernetes, предоставление секретов таким образом обычно безопаснее, чем хранение их в файлах.

используйте `--help` для просмотра доступных конфигураций.

### Запуск с uvicorn

lihil совместим с ASGI, вы можете запустить его с сервером ASGI, таким как uvicorn
запустите сервер с `app.py`, по умолчанию на порту 8000

