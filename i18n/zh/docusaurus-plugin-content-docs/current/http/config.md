---
title: 配置
---

# 配置

应用配置是一个常见但棘手的问题，特别是在实际项目中。

你经常需要创建依赖于动态设置的依赖项——比如设置数据库引擎的隔离级别，或根据环境调整超时时间。

Lihil 提供了一个统一的配置系统，支持多个来源——文件、环境变量和命令行参数——允许开箱即用的安全和灵活的配置管理。

---

## 配置加载和解析

```python
from lihil.config import lhl_read_config, AppConfig
```

Lihil 自动从以下来源加载配置值，按递增优先级顺序：

1. 用户提供的配置文件
2. 环境变量
3. 命令行参数

这种分层方法反映了现实世界的需求：

- 静态和公共配置（如服务器端口或日志级别）可以放在版本控制的文件中（例如 settings.toml）。

- 敏感数据（如 API 密钥或数据库密码）应该来自环境变量以避免意外暴露。

- 对于临时覆盖（如使用不同端口进行调试或切换标志），命令行参数提供最大的灵活性。

## 从不同来源读取配置

```python
config = lhl_read_config("settings.toml", config_type=MyAppConfig)
```

这会自动从所有三个来源读取并将它们合并到一个配置实例中。

你可以提供多个文件，它们将按顺序读取。

```python
config = lhl_read_config("settings.toml", "dev.env", "prod.env")
```

## 手动设置配置

```python
from lihil import AppConfig, Lihil

lhl = Lihil(app_config = AppConfig())
```

或直接使用 lhl_set_config()：

```python
from lihil.config import lhl_set_config

lhl_set_config(MyConfig())
```

### 不带参数调用会重置为默认值：

```python
lhl_set_config()
```

## 获取当前配置

使用 `lhl_get_config()` 从应用的任何地方检索活动配置：

```python
from lihil.config import lhl_get_config

config = lhl_get_config()
```

## 扩展 AppConfig

你可以扩展 AppConfig 来定义自己的设置：

```python
from lihil.app_config import AppConfig

class MyAppConfig(AppConfig):
    my_custom_setting: str = "default"
```

然后加载它：

```python

from lihil.config import lhl_read_config

config = lhl_read_config("settings.toml", config_type=MyAppConfig)
```

## 自动生成的命令行参数

如果你通过继承 `AppConfig` 扩展配置，
额外的属性也会作为命令行参数生成，你可以传递它们来覆盖。

## 示例配置文件 (config.toml)

```toml
[lihil]
IS_PROD = true
VERSION = "1.0.0"

[lihil.server]
HOST = "127.0.0.1"
PORT = 9000

[lihil.oas]
TITLE = "My API"
```

## 命令行覆盖

任何字段都可以通过命令行覆盖：

```bash
python app.py --is_prod --server.port 8080
```

## 使用其他配置模式（例如 Pydantic）

如果你使用不同的验证系统（如 Pydantic），你可以自己解析并手动注入：

```python

from lihil.config import lhl_set_config, lhl_get_config

app_config = PydanticSettings()
lhl_set_config(app_config)
```

你的配置需要实现 `IAppConfig` 接口。

## AppConfig 接口

```python
    class IOASConfig(Protocol):
        @property
        def OAS_PATH(self) -> str: ...
        @property
        def DOC_PATH(self) -> str: ...
        @property
        def TITLE(self) -> str: ...
        @property
        def PROBLEM_PATH(self) -> str: ...
        @property
        def PROBLEM_TITLE(self) -> str: ...
        @property
        def VERSION(self) -> str: ...

    class IServerConfig(Protocol):
        @property
        def HOST(self) -> str: ...
        @property
        def PORT(self) -> int: ...
        @property
        def WORKERS(self) -> int: ...
        @property
        def RELOAD(self) -> bool: ...
        @property
        def ROOT_PATH(self) -> bool: ...
        def asdict(self) -> dict[str, Any]: ...

    class IAppConfig(Protocol):
        @property
        def VERSION(self) -> str: ...
        @property
        def server(self) -> IServerConfig: ...
        @property
        def oas(self) -> IOASConfig: ...
```

## 总结

- 继承 `AppConfig` 进行扩展，使用 `lhl_read_config` 加载配置，然后通过 `lhl_set_config` 设置配置，适用于大多数情况
- 如果你手动构建配置（例如通过 Pydantic），实现 `IAppConfig` 接口。
- 调用 `lhl_get_config` 在任何地方访问配置。
- 敏感值应该放在环境变量中。
- 使用命令行参数进行快速、本地覆盖，例如调试。