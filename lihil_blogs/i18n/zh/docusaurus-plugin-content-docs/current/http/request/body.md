---
sidebar_position: 4
title: 请求体参数
slug: body-parameter
---

# 请求体参数

虽然路径、查询和头部参数通常是编码在 URL 或头部中的小数据片段，但请求体参数携带请求的主要负载。它们通常用于 POST、PUT 和 PATCH 等方法，其中客户端需要向服务器发送结构化数据。

例如：

这是一个带有 JSON 请求体的典型 HTTP 请求：

```http
POST /users HTTP/1.1
Content-Type: application/json

{
  "username": "alice",
  "age": 30
}
```

## 请求体参数 vs 其他请求参数

在处理 HTTP 请求时，重要的是要理解请求体参数和其他请求参数（如查询参数、路径参数和头部值）之间的区别。这些差异影响客户端如何发送数据以及服务器如何解析数据。

1. 请求中的位置
   请求体参数的传输方式与其他参数根本不同。

   让我们重新看一个典型的 POST 请求示例：

   ```http
   POST /submit HTTP/1.1
   Host: example.com
   Content-Type: application/json
   Content-Length: 27

   {"key": "value"}
   ```

   这个 HTTP 请求分为两部分，由空行分隔：

   - 请求行和头部（空行之前的所有内容）：这包括方法（POST）、路径（/submit）和头部，如 Content-Type。

   - 请求体（空行之后的所有内容）：这包含实际的负载，在这种情况下是一个 JSON 对象。

   与查询或路径参数不同，请求体参数不出现在 URL 或头部中。它们放在请求的请求体中，通常用于发送结构化数据，如 JSON、XML 或表单编码值。

2. 编码格式
   另一个关键区别是请求体参数的编码方式：

   发送查询参数时，编码发生在 URL 中：

   ```http
   GET /search?query=python&sort=asc
   ```

   查询值是 URL 编码的，大小相对有限。

   - 另一方面，请求体参数根据 `Content-Type` 头部进行编码。常见格式包括：

     - application/json — 用于发送 JSON 负载。

     - application/x-www-form-urlencoded — 通常用于 HTML 表单提交。

     - multipart/form-data — 用于上传文件时。

   服务器使用 `Content-Type` 头部来决定如何解析请求体。例如，如果头部是 application/json，服务器期望请求体包含有效的 JSON。

### 差异总结

| 特性            | 查询/路径/头部参数              | 请求体参数                           |
| --------------- | ------------------------------- | ------------------------------------ |
| 出现在 URL 中？ | 是                              | 否                                   |
| 请求中的位置    | 请求行或头部                    | 空行之后（请求体）                   |
| 编码类型        | URL 编码（查询）、纯文本        | JSON、表单数据、multipart 等         |
| 用例            | 小/简单值、路由                 | 复杂对象、表单、文件上传             |

理解这种区别对于设计或使用 API 是必要的，特别是在像 lihil 这样的类型化框架中，其中请求体参数和其他参数的声明不同，并在底层使用不同的逻辑进行解析。

## 在 lihil 中声明请求体参数

在 lihil 中，有两种方式声明请求体：

### 通过结构化数据类型隐式声明请求体

你可以简单地使用 msgspec.Struct 定义请求体模型，lihil 将自动将其视为请求体：

```python

import msgspec
from lihil import Route

class CreateUser(msgspec.Struct):
    username: str
    age: int

user = Route("/users")

@user.post
async def create_user(data: CreateUser) -> str:
    return f"Hello {data.username}!"
```

当你的请求体是结构化对象（例如 JSON 文档）时，这是首选方式。

自 lihil `0.2.9` 起，支持以下结构化数据类型作为请求体参数：

- `msgspec.Struct`
- `dataclasses.dataclass`
- `typing.Typeddict`
- `dict`

### 使用 Param("body") 显式声明

如果你想要明确，或者如果你将请求体数据与其他类型的参数结合，你可以使用 Param("body")：

```python
from lihil import Param
from typing import Annotated

@user.post
async def create_user(
    data: Annotated[CreateUser, Param("body")]
) -> str:
    return f"Hello {data.username}!"
```

当你的请求体是原始值（如字符串或列表）时，这种方法特别有用。

## 约束和验证

由于请求体参数使用 msgspec，你可以直接在你的 Struct 中应用验证约束，或通过 Param，就像你对路径或查询参数所做的那样：

```python
from lihil import Param
from typing import Annotated

class CreateUser(msgspec.Struct):
    username: Annotated[str, Param(min_length=3, max_length=30)]
    age: Annotated[int, Param(ge=0, le=120)]
```

## 自定义解码器

对于高级用例，你可以通过 Param 提供自定义解码器：

```python
from lihil import Param
from typing import Annotated

def parse_data(value: bytes) -> CreateUser:
    # 你的自定义逻辑
    return CreateUser(...)

@user.post
async def create_user(
    data: Annotated[CreateUser, Param("body", decoder=parse_data)]
): ...
```

这让你完全控制如何解释原始请求体字节。

## 总结

- 请求体参数是在 HTTP 请求中发送结构化数据的强大方式。

- 它们对于需要接受复杂数据类型（如 JSON 对象或二进制文件）的 API 是必需的。

- Lihil 使使用请求体参数变得容易，允许你使用结构化数据类型或 `Param("body")` 定义它们。

- 你还可以应用验证约束，甚至为高级场景使用自定义解码器。