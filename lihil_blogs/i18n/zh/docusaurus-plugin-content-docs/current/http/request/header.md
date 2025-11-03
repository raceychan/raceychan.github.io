---
sidebar_position: 3
title: 头部参数
slug: header-parameter
---

# 头部参数

头部是与 HTTP 请求一起发送的键值对。它们携带关于请求的元数据——如内容类型、授权令牌、客户端信息等。头部不是 URL 或请求体的一部分，而是在请求行和请求体之间的单独部分发送。

## 头部参数看起来是什么样的？

以下是带有头部的请求可能的样子：

```http
GET /profile HTTP/1.1
Host: example.com
User-Agent: curl/8.5.0
Accept: application/json, text/plain, text/html
```

每个头部都结构化为键值对，根据 HTTP 规范（RFC 7230），头部键可以多次出现不同的值。当这种情况发生时，值要么：

- 作为具有相同键的单独头部行发送
- 合并为单个逗号分隔的值。

## 头部参数 vs 其他请求参数

1. 请求中的位置
   头部参数是 HTTP 头部的一部分，与 URL 和请求体分开发送。例如：

   ```http
   GET /resource HTTP/1.1
   Host: example.com
   Authorization: Bearer abc123
   X-Custom-Header: value
   ```

2. 编码格式
   头部是纯文本键值对。与查询参数不同，它们不是 URL 编码的，但值必须符合 HTTP 头部标准。

3. 数据类型
   头部通常携带字符串，但可以根据需要解析为原始类型，如 int、bool 或自定义类型。

4. 用例
   头部通常用于元数据，如认证令牌、内容类型、用户代理信息或自定义控制标志。它们不是为了携带像请求体参数那样的大型或复杂数据结构而设计的。

## 在 lihil 中声明头部参数

你可以使用 `Param("header")` 在端点中轻松声明头部参数。

```python
from lihil import Route, Param
from typing import Annotated

route = Route("/greet")

@route.get
async def greet_user(
    user_agent: Annotated[str, Param("header")],  # 自动映射到 "user-agent"
    accept: Annotated[list[str], Param("header")],  # 处理逗号分隔的 Accept
):
    return {"ua": user_agent, "accepts": accept}
```

## 多值头部

一些头部——如 `Accept`、`Accept-Language`、`Cache-Control` 自然支持多个值，用逗号分隔。

lihil 开箱即用地支持这一点。要接受多值头部，只需使用 list[str] 类型提示：

要接受多值头部，只需使用 list[str] 类型提示：

```python
accept: Annotated[list[str], Param("header")]
```

这将正确解析：

```http
Accept: text/html, application/json
```

为：

```python
["text/html", "application/json"]
```

## 头部键映射

HTTP 头部名称通常使用 kebab-case（例如 X-Request-ID），但 Python 变量不能包含破折号。lihil 通过两种方式解决这个问题：

自动映射：默认情况下，lihil 将 `my_token` 转换为 `my-token`。

显式别名：你可以使用 alias 选项指定确切的头部键：

```python
request_id: Annotated[str, Param("header", alias="x-request-id")]
```

## 自定义解码器

对于更复杂的头部，你可以定义自定义解码器函数。这个函数接收原始头部值并返回所需的类型。

```python
from lihil import Route, Param
from typing import Annotated

def custom_decoder(value: str) -> str:
    # 自定义解码逻辑
    return value.lower()

route = Route("/greet")

@route
async def create_user(
    user_agent: Annotated[str, Param("header")],
    custom_header: Annotated[str, Param("header", decoder=custom_decoder)],
):
    return {"ua": user_agent, "custom": custom_header}
```

## 总结

- 头部参数是 HTTP 头部的一部分，携带元数据如认证令牌或自定义标志。
- 它们是纯文本键值对，不是 URL 编码的。
- 在 lihil 中，使用带有 Param(alias=...) 的 Annotated 显式声明头部以获得确切的头部名称。
- lihil 自动处理类型转换、验证和默认值。
- 缺失或无效的头部会导致自动错误响应，以实现强健的输入处理。