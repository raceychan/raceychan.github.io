---
sidebar_position: 2
title: 路由
---

---

当你定义一个路由时，你通过特定的 **路径** 向客户端暴露一个资源。接着，你可以为该路由添加一个 `Endpoint`，用于决定客户端可以对这个资源执行什么操作。

以 `https://dontclickme.com/users` 为例，路径 `/users` 表示的是资源 `users`。

## 定义一个路由

```python
from lihil import Route

users_route = Route("/users")
```

如果你已经有现成的 `lihil.Graph` 和 `lihil.MessageRegistry` 想要复用，可以在构造路由时传入它们。

当你将依赖关系和事件监听器分离在不同文件中时，这会非常有用，例如：

```python
from project.users.deps import user_graph
from project.users.listeners import user_eventregistry

user_route = Route(graph=user_graph, registry=user_eventregistry)
```

你还可以为某个特定的路由添加中间件，使中间件只作用于该路由。

```python
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

Route(middlewares=[CORSMiddleware])
route.add_middleware(HTTPSRedirectMiddleware)
```

### 为路由注册 Endpoint

在前面的讨论中，我们通过 `@users_route.post` 将 `create_user` 暴露为一个 POST 请求的 Endpoint。
我们还可以用类似的语法声明其他 HTTP 方法，包括：

| 方法       | 幂等性     | 目的                                                 | 示例              |
|------------|------------|------------------------------------------------------|-------------------|
| `GET`      | 是         | 获取数据，不修改服务器状态                          | `@route.get`      |
| `POST`     | 否         | 提交数据以创建资源或触发动作                        | `@route.post`     |
| `HEAD`     | 是         | 类似于 GET，但只返回响应头                          | `@route.head`     |
| `OPTIONS`  | 是         | 探测允许的方法及 CORS 信息                          | `@route.options`  |
| `TRACE`    | 是         | 回显请求，用于调试                                  | `@route.trace`    |
| `PUT`      | 是         | 用提供的数据替换整个资源                            | `@route.put`      |
| `DELETE`   | 是         | 删除资源                                             | `@route.delete`   |
| `PATCH`    | 否         | 对资源进行部分修改                                  | `@route.patch`    |
| `CONNECT`  | 否         | 建立到服务器的隧道（如 HTTPS）                      | `@route.connect`  |

这意味着一个路由可以最多有 0~9 个不同方法的 Endpoint。

如果要让一个函数支持多个 HTTP 方法：

- 可以为它添加多个装饰器
- 或者使用 `Route.add_endpoint` 方法：

```python
users_route.add_endpoint("GET", "POST", ...,  create_user)
```

## 定义子路由

前面我们为 `users` 创建了一个路由，它表示的是用户资源的集合。
现在我们来暴露一个具体的用户资源：

```python
user_route = users_route.sub("{user_id}")

@user_route.get
async def get_user(user_id: str, limit: int = 1): ...
```

在这里，我们定义了 `users_route` 的一个子路由。
当我们把某个路由加入到 `Lihil` 实例中时，它的所有子路由也会被递归地包含进来。

`Route.sub` 是幂等的，也就是说你可以多次使用相同的路径调用它。

```python
@users_route.sub("{user_id}").get
async def get_user(user_id: str, limit: int = 1): ...

@users_route.sub("{user_id}").put
async def update_user(data: UserUpdate): ...
```

上述两个函数都注册在同一个子路由下。

## 容纳子路由

在大型应用中，通常会先创建子路由，然后再将它们包含到父路由中。可以使用 `Route.include_subroutes` 来实现：

```python
parent = Route("/parent")
sub = Route("/sub")

parent.include_subroutes(sub)
assert parent.subroutes[0].path == "/parent/sub"
```

`Route.sub` 和 `Route.include_subroutes` 的区别在于：

- `Route.sub` 根据字符串路径创建一个新的空子路由
- `Route.include_subroutes` 是将已有的 Route 递归包含进来，会保留原有的 Endpoint、中间件等属性

推荐为每一个路由创建一个独立的文件，例如：

```python title="api/cart/items.py"
items = Route("/items")

@items.get
def list_items(): ...

@items.sub("/{item_id}").get
def get_item(item_id: str): ...
```

然后在该文件夹下的 `__init__.py` 中创建父路由并包含子路由：

```python title="api/cart/__init__.py"
from .items import items

carts = Route("/carts")
carts.include_subroutes(items)
```

## 根路由

路径为 `/` 的路由就是根路由（root route）。
如果没有手动指定，`Lihil` 默认会创建一个根路由。
所有通过 `Lihil.{http method}` 注册的处理函数，都会被放到根路由下。

以下两个例子在功能上是等价的：

1. 使用 `Lihil` 实例作为根路由

```python
lhl = Lihil()

@lhl.get
async def hello():
    return "hello, world"
```

2. 手动创建根路由并传入 `Lihil`

```python
root = Route()

@root.get
async def hello():
    return "hello, world"

lhl = Lihil(root)
```




