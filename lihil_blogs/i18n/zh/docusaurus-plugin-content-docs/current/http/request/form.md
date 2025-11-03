---
sidebar_position: 4.1
title: 表单参数
slug: from-data
---

# 表单参数

表单数据是发送请求体数据的另一种方式——通常用于 HTML 表单和文件上传。与 JSON 不同，表单数据使用 `application/x-www-form-urlencoded` 或 `multipart/form-data` 内容类型编码。

`lihil` 支持表单解析，你可以提取表单值和上传的文件。

---

## 声明表单参数

你可以使用 `Annotated[T, Form()]` 声明表单参数。`lihil` 将自动解析请求体并为你提取表单字段：

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

form() 助手将参数标记为来自表单请求体。

## 处理文件上传

表单数据还支持文件上传（当内容类型为 multipart/form-data 时）。你可以将上传的文件声明为参数：

```python
from lihil import form, UploadFile
from typing import Annotated

@user.post
async def upload_avatar(file: UploadFile) -> str:
    return file.filename
```

### 高级：文件约束

在解析大型表单或处理用户上传时，你可能想要设置限制来保护你的服务器。form() 助手接受如下选项：

- max_files: 最大文件数量
- max_fields: 最大总字段数量
- max_part_size: 任何部分的最大大小（默认：1MB）

```python
@user.post
async def upload_many(
    files: Annotated[list[UploadFile], Form(max_files=5, max_part_size=2 * 1024 * 1024)]
) -> int:
    return len(files)
```

表单数据只是另一种请求体数据，根据内容类型进行不同的解析。使用 lihil，你可以使用 Annotated[..., Form()] 声明表单参数，并完全控制文件处理、字段限制和流传输——所有这些都使用熟悉的 Python 类型。