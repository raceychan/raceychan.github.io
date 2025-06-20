---
title: 安装
sidebar_position: 1
slug: /installation
---

## 安装

lihil 需要 python>=3.10

### pip

```bash
pip install lihil
```

### uv

如果你想使用 uv 安装 lihil

[uv 安装指南](https://docs.astral.sh/uv/getting-started/installation/#installation-methods)

1. 使用 `project_name` 初始化你的 web 项目

```bash
uv init project_name
```

2. 通过 uv 安装 lihil，这将为你在专用虚拟环境中解决所有依赖关系。

```bash
uv add lihil
```

## 启动服务

### 使用 lihil 启动

```python title="app.py"
from lihil import Lihil

# 你的应用代码

lhl = Lihil()

if __name__ == "__main__":
    lhl.run(__file__)
```

然后在命令行中

```bash
python -m myproject.app --server.port=8080
```

如果你使用 uv
```bash
uv run python -m myproject.app --server.port=8080
```

这里 `myproject` 是你项目根目录的名称，而 `app.py` 是你主应用文件的名称。

这允许你使用命令行参数覆盖配置。

如果你的应用部署在容器化环境中（如 Kubernetes），以这种方式提供机密信息通常比将它们存储在文件中更安全。

使用 `--help` 查看可用配置。

### 使用 uvicorn 启动

lihil 兼容 ASGI，你可以使用 ASGI 服务器（如 uvicorn）运行它
使用 `app.py` 启动服务器，默认端口 8000

