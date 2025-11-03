---
sidebar_position: 3.1
title: Cookie
slug: cookie-parameter
---

# Cookie

HTTP cookie 是存储在用户浏览器中的小数据片段，会自动与对同一来源的每个请求一起发送。它们主要用于会话管理、用户偏好和跟踪。

## Cookie 参数看起来是什么样的？

```http
GET /dashboard HTTP/1.1
Host: example.com
Cookie: session_id=abc123; theme=dark
```

Cookie 作为单个头部（`Cookie`）传递，但内部包含多个用分号分隔的 key=value 对。

## 何时使用 Cookie

与每个请求设置的头部或查询参数不同，cookie 提供了一种在多个请求之间持久化用户特定状态的方法。
以下是一些常见用例：

- **会话 ID**：通过存储会话令牌（session_id）保持用户登录状态

- **CSRF 令牌**：帮助防止跨站请求伪造攻击

- **用户偏好**：存储 UI 设置，如主题、语言或布局

- **分析和跟踪**：为 Google Analytics 等工具存储用户活动信息

## 在 lihil 中声明 Cookie

在 Lihil 中，你可以像声明头部或查询参数一样通过 `Param("cookie")` 声明 cookie。

```python
from lihil import Route, Param
from typing import Annotated

dashboard = Route("/dashboard")

@dashboard.get
async def show_dashboard(
    session_id: Annotated[str, Param("cookie")],
    theme: Annotated[str, Param("cookie")] = "light",
):
    return {"session": session_id, "theme": theme}
```

在上面的例子中：

- `session_id` 是一个必需的 cookie

- `theme` 是可选的，如果没有提供则回退到 "light"

## 类型转换和验证

就像头部或查询参数一样，你可以对 cookie 应用类型注释和验证约束。例如：

```python
from lihil import Param
from typing import Annotated

user_id: Annotated[int, Param("cookie", gt=0)]
```

这将确保 `user_id` cookie 被解析为正整数。如果解析或验证失败，lihil 将返回 422 Invalid Request。

简而言之，cookie 提供了存储和传输用户特定数据的轻量级机制。使用 lihil，提取和验证 cookie 值就像使用头部、路径或查询参数一样无缝。