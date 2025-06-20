---
sidebar_position: 2
title: 查询参数
slug: query-parameter
---

# 查询参数

查询参数是通过 URL 向服务器传递数据的灵活方式——特别适用于过滤器、分页或可选输入之类的内容。它们出现在 URL 中的 `?` 之后，由键值对组成。

## 查询参数看起来是什么样的？

以下是带有查询参数的简单请求：

```http
GET /articles?keyword=book&page=2 HTTP/1.1
Host: example.com
```

在这个例子中：

- `keyword` 是一个查询参数，值为 `book`。
- `page` 是另一个查询参数，值为 `2`。

这些值在请求 URL 中作为纯文本字符串传输。Lihil 将根据你的函数签名自动处理解析和类型转换。

## 查询参数 vs 其他请求参数

1. 请求中的位置
   查询参数编码在 URL 中，在路径参数之后并以 `?` 开始，作为请求行的一部分：

   ```http
   GET /search?query=python&sort=asc HTTP/1.1
   ```

2. 编码格式
   查询参数是 URL 编码的。例如：

   ```http
   ?q=hello%20world
   ```

   这意味着特殊字符（如空格）会被百分号编码。

3. 数据类型
   查询参数支持：

   - 原始类型：str、int、float、bool
   - 数组/列表：list[str]、list[int]

   与请求体参数不同，它们不能表示嵌套结构（如字典）。
   与路径参数不同，查询参数可以有重复的键（例如，tag=python&tag=web）。

## 在 lihil 中声明查询参数

你可以隐式和显式地声明查询参数

### 隐式声明查询参数

```python

from lihil import Route

articles = Route("/articles")

@articles.get
async def search(keyword: str, page: int = 1):
    ...
```

如果请求以 `/articles?keyword=book&page=2` 的形式进来，lihil 将：

- 从查询字符串中提取 keyword 和 page，
- 将 page 转换为整数（基于类型提示），
- 将两个值传递给你的函数。
- 如果没有提供 page，将使用默认值 1。
- 如果缺少没有默认值的查询参数或具有无法强制转换的无效类型，lihil 将自动响应 `InvalidRequest` 错误。

### 使用 `Param` 显式声明查询参数

或者，你可以通过结合 `typing.Annotated` 和 `lihil.Param` 更明确地声明参数。

```python
@articles.get
async def search(keyword: Annotated[str, Param("query")], page: Annotated[int, Param("query")] = 1):
    ...
```

## 类数组查询参数

与路径参数不同，查询参数可以表现为二维数据。这意味着你可以为同一个键有多个值——非常适合数组或重复选项：

```http
GET /filter?tag=python&tag=web&tag=backend HTTP/1.1
```

在 lihil 中，你可以用列表类型声明：

```python
from lihil import Route

@Route("/filter")
async def filter_by_tags(tag: list[str]):
    ...
```

lihil 将收集所有 tag 值并将它们作为列表给你。

对于 `/filter?tag=web&tag=python`，你将收到 `["web", "python", "backend"]` 作为 tag 的值。

## 数据验证

对于数组样式的查询参数，lihil.Param 允许你强制执行约束，如最大长度或项目验证。

```python

from lihil import Param

Tags = Param(max_length=5)

@route("/articles")
async def search_articles(tags: Annotated[list[str], Tags]) -> JSONResponse:
    ...
```

在这种情况下，如果请求包含超过 5 个标签，lihil 将用 422 错误拒绝它。

你也可以以同样的方式验证标量查询参数——例如，强制执行范围限制或正则表达式规则。

```python

Page = Param(ge=1)

@route("/articles")
async def list_articles(page: Annotated[int, Page]) -> JSONResponse:
    ...
```

## 自定义验证

需要更多控制？你可以为高级验证逻辑定义自定义解码器。这适用于单个和基于列表的查询参数。

```python
from lihil import Param, HTTPException

class BlockedTagError(HTTPException[str]):
    "This tag is not allowed"

def tag_decoder(value: str) -> str:
    if value in {"banned", "spam"}:
        raise BlockedTagError(f"Tag '{value}' is blocked")
    return value

@route("/filter")
async def filter_tags(tags: Annotated[list[str]: Param(decoder=tag_decoder)]) -> JSONResponse:
    ...
```

在这个例子中，如果用户尝试使用被阻止的标签（如 `"banned"` 或 `"spam"`）进行过滤，lihil 将抛出 `BlockedTag` 错误。请求将被 422 错误拒绝，消息将指示哪个标签被阻止。

查询参数不仅仅是键值字符串——它们是请求处理中灵活而强大的部分。使用 lihil，你可以以最少的努力获得类型转换、验证和结构。

## 总结

- 查询参数出现在 URL 中，非常适合过滤器、搜索词和分页。

- 它们支持原始类型和重复键（列表）。

- 在 lihil 中，你可以通过类型提示隐式声明它们，或使用 Param 进行验证显式声明。

- 你可以添加约束或自定义解码器以进行强健的输入验证。