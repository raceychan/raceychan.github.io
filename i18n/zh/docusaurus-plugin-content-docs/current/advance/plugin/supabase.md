---
title: Supabase
---

## Supabase 集成（认证支持）

lihil 正在引入对 Supabase 的支持，从用户认证开始。只需一行代码：

```python
app.include_routes(signin_route_factory(route_path="/login"))
```

你就可以集成一个由 Supabase Auth 支持的工作登录端点。

完整代码示例

```python

from supabase import AsyncClient

from lihil import Lihil
from lihil.config import AppConfig, lhl_get_config, lhl_read_config
from lihil.plugins.auth.supabase import signin_route_factory


class ProjectConfig(AppConfig, kw_only=True):
    SUPABASE_URL: str
    SUPABASE_API_KEY: str


def supabase_factory() -> AsyncClient:
    config = lhl_get_config(config_type=ProjectConfig)
    return AsyncClient(
        supabase_url=config.SUPABASE_URL, supabase_key=config.SUPABASE_API_KEY
    )


async def lifespan(app: Lihil):
    app.config = lhl_read_config(".env", config_type=ProjectConfig) # 从 .env 文件读取配置并转换为 `ProjectConfig` 对象。
    app.graph.analyze(supabase_factory) # 为 supabase.AsyncClient 注册一个示例工厂函数
    app.include_routes(signin_route_factory(route_path="/login"))
    yield


lhl = Lihil(lifespan=lifespan)

if __name__ == "__main__":
    lhl.run(__file__)
```

- 当前插件支持使用 Supabase 的 AsyncClient 的邮箱/手机-密码认证流程。它自动处理表单解析、依赖注入和错误响应——所有这些都保持完全类型安全和可组合。

这只是开始。虽然当前支持仅限于基本的登录和注册端点，但未来版本将扩展对 Supabase 中其他功能的支持，如：

- 用户管理

- 会话处理

- 授权规则

- 实时和数据库集成

目标是为将 Supabase 与 lihil 集成提供无缝、符合习惯的体验，无需样板代码或变通方法。