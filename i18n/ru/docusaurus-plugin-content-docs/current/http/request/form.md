---
sidebar_position: 4.1
title: форма
slug: from-data
---

# Параметры формы

Данные формы — это еще один способ отправки данных тела запроса, часто используемый в HTML-формах и загрузке файлов. В отличие от JSON, данные формы кодируются с типами контента `application/x-www-form-urlencoded` или `multipart/form-data`.

`lihil` поддерживает разбор форм, вы можете извлекать значения формы и загруженные файлы.

---

## Объявление параметров формы

Вы можете объявлять параметры формы, используя `Annotated[T, Form()]`. `lihil` автоматически разберет тело запроса и извлечет поля формы для вас:

```python
from lihil import Route, Form, Struct
from typing import Annotated

login = Route("/login")

class LoginForm(Struct):
    username: str
    password: str

@login.post
async def handle_login(
    loginform: Annotated[LoginForm, Form()]
) -> str:
    return f"Welcome {username}"
```

Помощник form() отмечает параметр как поступающий из тела формы.

## Обработка загрузки файлов

Данные формы также поддерживают загрузку файлов (когда тип контента multipart/form-data). Вы можете объявлять загруженные файлы как параметры:

```python
from lihil import form, UploadFile
from typing import Annotated

@user.post
async def upload_avatar(file: UploadFile) -> str:
    return file.filename
```

### Продвинуто: ограничения на файлы

При разборе больших форм или обработке пользовательских загрузок, вы можете захотеть установить ограничения для защиты вашего сервера. Помощник form() принимает опции, такие как:

- max_files: максимальное количество файлов
- max_fields: максимальное количество общих полей
- max_part_size: максимальный размер для любой части (по умолчанию: 1MB)

```python
@user.post
async def upload_many(
    files: Annotated[list[UploadFile], Form(max_files=5, max_part_size=2 * 1024 * 1024)]
) -> int:
    return len(files)
```

Данные формы — это просто еще один вид данных тела, разбираемый по-разному в зависимости от типа контента. С lihil вы можете объявлять параметры формы, используя Annotated[..., Form()], и получить полный контроль над обработкой файлов, ограничениями полей и потоковой передачей — все с знакомыми типами Python.