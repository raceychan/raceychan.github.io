---
title: Installation
sidebar_position: 1
slug: /
---

Lihil is


- **Productive**: ergonomic API with strong typing support and built-in solutions for common problems — along with beloved features like openapi docs generation — empowers users to build their apps swiftly without sacrificing extensibility.
- **Professional**: Lihil comes with middlewares that are essential for enterprise development—such as authentication, authorization, event publishing, etc. Ensure productivity from day zero. Catered to modern development styles and architectures, including TDD and DDD.
- **Performant**: Blazing fast across tasks and conditions—Lihil ranks among the fastest Python web frameworks, outperforming comparable ASGI frameworks by 50%–100%, see [lihil benchmarks](https://github.com/raceychan/lhl_bench),  [independent benchmarks](https://web-frameworks-benchmark.netlify.app/result?l=python)


## Install

lihil(currently) requires python>=3.12

### pip

```bash
pip install lihil
```

### uv

if you want to install lihil using uv

[uv install guide](https://docs.astral.sh/uv/getting-started/installation/#installation-methods)

1. init your web project with `project_name`

```bash
uv init project_name
```

2. install lihil via uv, this will solve all dependencies for your in a dedicated virtual environment.

```bash
uv add lihil
```

## Serve

### Serve with lihil

#### app.py

```python
from lihil import Lihil

# your application code

lhl = Lihil()

if __name__ == "__main__":
    lhl.run(__file__)
```

then in command line

```python
uv run python -m myproject.app --server.port=8080
```

This allows you to override configurations using command-line arguments.

If your app is deployed in a containerized environment, such as Kubernetes, providing secrets this way is usually safer than storing them in files.

use `--help` to see available configs.

### Serve with uvicorn

lihil is ASGI compatible, you can run it with an ASGI server, such as uvicorn
start a server with `app.py`, default to port 8000
