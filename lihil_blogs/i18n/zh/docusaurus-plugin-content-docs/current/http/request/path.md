---
sidebar_position: 1
title: 路径参数
slug: path-parameter
---

# 路径参数

在 HTTP 请求中，URL 路径在路由中起着核心作用。它是服务器知道客户端试图访问_哪个资源_的方式。但路径不仅仅是静态的——它们经常携带称为**路径参数**的动态值。

## 路径参数看起来是什么样的？

路径参数是 URL 路径的可变部分。它通常用于标识特定资源。例如：

```http
GET /users/42 HTTP/1.1
Host: example.com
```

在这个例子中：

- /users/42 正在请求 ID 为 42 的用户。42 是一个路径参数——直接嵌入在 URL 结构中的数据。

虽然我们不能完全确定 URL 中的路径变量是什么，但 RESTful API 通常遵循这样的模式

`/entity_name_in_plural/{entity_id}/sub_entity_name_in_plurals/{sub_entity_id}/...`

这里，`users` 可能指的是 `User` 实体，`42` 是其 ID 的值。

## 路径参数 vs 其他请求参数

路径参数携带一维、固定值，如 ID、slug 或名称——非常适合标识单个资源。

1. 请求中的位置
   路径参数是 URL 路径本身的一部分，直接嵌入在路由结构中：

   ```http
   GET /users/42 HTTP/1.1
   ```

2. 编码格式
   路径参数作为路径段的一部分进行 URL 编码。特殊字符会被百分号编码，但它们不出现在 ? 之后——它们是 URL 层次结构的一部分。

3. 数据类型
   路径参数表示单个、固定值，支持原始类型，如：

   str、int、float、bool

   与查询参数不同，路径参数不能表示数组或重复键。每个参数总是携带恰好一个值。

4. 目的
   路径参数通常通过在 URL 路径中嵌入标识符来标识特定资源或实体。相比之下，查询参数用于过滤、分页或可选数据。

## 在 lihil 中声明路径参数

### 隐式声明路径参数

在 `lihil` 中，路径参数是一等公民。
你可以通过在路由路径中包含它们并匹配函数参数名来隐式声明路径参数：

例如：

```python
from lihil import Route

user = Route("/users/{user_id}")

@user.get
async def get_user(user_id: int) -> User:
    ...
```

这里，`user_id` 被隐式声明，因为它匹配路由路径中的 `{user_id}` 占位符。

lihil 自动从 URL 中提取并转换它。

例如，
如果像 GET /users/42 这样的请求进来，lihil：

- 从 URL 中提取 42，
- 将其转换为 int（基于类型提示），
- 并将其传递给 get_user 函数。

你不需要解析字符串或手动访问原始请求——lihil 处理它。

### 使用 `lihil.Param` 显式声明路径参数

```python
from lihil import Route, Param
from typing import Annotated

PositiveInt = Annotated[int, Param(gt=0)]

user = Route("/users/{user_id}")

@user.get
async def get_user(user_id: PositiveInt) -> User:
    ...
```

## 类型验证

路径参数根据其类型提示进行验证。如果你将路径参数声明为 `int`，lihil 将自动将其转换为整数。如果转换失败，lihil 将返回 422 Invalid Request 错误。

如果提供了类型联合，lihil 将尝试将值转换为联合中的每种类型，直到一个成功。如果都不成功，返回 422 错误。

:::warning
如果联合包含 str 或 bytes，转换将始终成功，因为这些类型可以表示任何值。这意味着如果你有像 `Union[int, str]` 这样的联合，路径参数将始终被视为字符串。
:::

## 数据验证

你可能还想验证路径参数的值。例如，如果你想确保用户 ID 是正数，你可以使用 `lihil.Param` 设置这样的约束。

```python
from lihil import Route, Param

PositiveInt = Param(gt=0)

user = Route("/users/{user_id}")

@user.get
async def get_user(user_id: PositiveInt) -> User: ...
```

`lihil.Param` 允许你在路径参数上设置各种约束，如最小值和最大值、正则表达式模式等。这对于确保你接收的数据在处理之前是有效的特别有用。

`lihil.Param` 底层使用 `msgspec.Meta`，因此你可以使用 `msgspec.Meta` 的所有功能来验证你的路径参数。

## 自定义验证

你也可以为路径参数创建自定义验证器。当你有无法用简单约束表达的复杂验证逻辑时，这很有用。

```python
from lihil import Route, Param, HTTPException


class MyError(HTTPException[T]):
    "I don't like this value"


def decoder(value: str) -> int:
    # 自定义解码逻辑
    if value == "42":
        raise MyError("I don't like this value")
    return int(value)

async def create_user(user_id: int, user_age: Annotated[int, Param(decoder=decoder)]) -> User:
    # 你的逻辑在这里
    pass
```

## 总结

- 路径参数直接嵌入在 URL 路径中，标识特定资源。
- 每个参数携带恰好一个值，支持原始类型如 int、str 和 bool。
- 在 lihil 中，你可以在路由路径中隐式声明路径参数，或使用 Param 进行验证和约束的显式声明。
- 自定义解码器允许你为路径参数实现高级验证和错误处理。