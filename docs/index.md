---
title: Installation
sidebar_position: 1
slug: /
---

## Install

lihil requires python>=3.10

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

```python title="app.py"
from lihil import Lihil

# your application code

lhl = Lihil()

if __name__ == "__main__":
    lhl.run(__file__)
```

then in command line

```bash
python -m myproject.app --server.port=8080
```

if you use uv
```bash
uv run python -m myproject.app --server.port=8080
```

Here `myproject` is the name of the root folder of your project, whereas `app.py` is the name of your main application file. 

This allows you to override configurations using command-line arguments.

If your app is deployed in a containerized environment, such as Kubernetes, providing secrets this way is usually safer than storing them in files.

use `--help` to see available configs.

### Serve with uvicorn

lihil is ASGI compatible, you can run it with an ASGI server, such as uvicorn
start a server with `app.py`, default to port 8000


