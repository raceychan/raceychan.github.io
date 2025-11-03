## 错误处理

- 使用 `route.get(errors=VioletsAreBlue)` 来声明端点响应

```python
class VioletsAreBlue(HTTPException[str]):
    "how about you?"
    __status__ = 418


@lhl.post(errors=VioletsAreBlue)
async def roses_are_red():
    raise VioletsAreBlue("I am a pythonista")
```

- 使用 `lihil.problems.problem_solver` 作为装饰器来注册错误处理器，错误将被解析为问题详细信息。

```python
from lihil.problems import problem_solver

# 注意：你可以为 exc 使用类型联合，例如 UserNotFound | status.NOT_FOUND
@problem_solver
def handle_404(req: Request, exc: Literal[404]):
    return Response("resource not found", status_code=404)
```

处理特定异常类型（例如 `UserNotFound`）的求解器优先于处理状态码（例如 `404`）的求解器。

### 异常-问题映射

lihil 根据你的 HTTPException 自动生成响应和文档，
这是为端点 `roses_are_red` 生成的文档

<!-- ![roses_are_red](./images/roses_are_red_link.png) -->

点击 `External documentation` 标签下的 URL

我们将看到详细的问题页面

<!-- ![problem page](./images/roses_are_red_problempage.png) -->

默认情况下，每个端点都会有至少一个代码为 `422` 的 `InvalidRequestErrors` 响应。

这是 `InvalidRequestErrors` 的一个示例响应。

```json
{
  "type_": "invalid-request-errors",
  "status": 422,
  "title": "Missing",
  "detail": [
    {
      "type": "MissingRequestParam",
      "location": "query",
      "param": "q",
      "message": "Param is Missing"
    },
    {
      "type": "MissingRequestParam",
      "location": "query",
      "param": "r",
      "message": "Param is Missing"
    }
  ],
  "instance": "/users"
}
```

- 要更改响应的创建，使用 `lihil.problems.problem_solver` 注册你的求解器。
- 要更改文档，覆盖 `DetailBase.__json_example__` 和 `DetailBase.__problem_detail__`。
- 要扩展错误详细信息，在继承 `HTTPException[T]` 时提供类型变量。