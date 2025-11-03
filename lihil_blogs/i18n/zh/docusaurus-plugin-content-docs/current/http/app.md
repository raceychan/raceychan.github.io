---
sidebar_position: 3
title: 应用
---


## 使用路由创建应用

```python title="app.py"
from lihil import Lihil, Route

user_route = Route("users")


lhl = Lihil(user_route)
```

## 包含路由

```python
product_route = Route("products")

lhl.include_routes(product_route)
```

## 配置你的应用

有几个设置可以改变来控制 lihil 的行为，


1. 配置文件，例如：`pyproject.toml`

    ```python
    lhl = Lihil(config_file="pyproject.toml")
    ```

    这将在 `pyproject.toml` 文件中查找 `tool.lihil` 表
    额外/未知的键会被禁止以帮助防止错误配置

    注意：目前仅支持 toml 文件

2. `AppConfig` 实例

    ```python
    lhl = Lihil(app_config=AppConfig(version="0.1.1"))
    ```

    如果你想继承 AppConfig 并扩展它，这特别有用。

    ```python
    from lihil.config import AppConfig

    class MyConfig(AppConfig):
        app_name: str

    config = MyConfig.from_file("myconfig.toml")
    ```

3. 命令行参数：

    ```example
    python app.py --oas.title "New Title" --is_prod true
    ```

    - 使用 `.` 表示嵌套字段

    - 添加 `--help` 查看可用选项

你可以通过 `lihil.config.lhl_get_config` 在应用的任何地方访问 `AppConfig`

```python
from lihil.config import lhl_get_config, AppConfig

app_config: AppConfig = lhl_get_config()
```


## 启动（运行）你的应用


### 使用 lihil 启动

```python
from lihil import Lihil

# 你的应用代码

lhl = Lihil()

if __name__ == "__main__":
    lhl.run(__file__)
```

然后在命令行中

```python
uv run python -m myproject.app --server.port=8080
```

这允许你使用命令行参数覆盖配置。

如果你的应用部署在容器化环境中（如 Kubernetes），以这种方式提供机密信息通常比将它们存储在文件中更安全。

使用 `--help` 查看可用配置。