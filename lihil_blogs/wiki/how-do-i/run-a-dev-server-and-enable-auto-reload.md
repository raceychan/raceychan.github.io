---
title: run a dev server and enable auto-reload
---

How to
- Minimal runner inside your app file:
  ```python
  from lihil import Lihil
  lhl = Lihil()
  if __name__ == "__main__":
      lhl.run(__file__)
  ```
- Run with CLI overrides:
  ```bash
  python -m myproject.app --server.port=8080
  ```
- With uv:
  ```bash
  uv run python -m myproject.app --server.port=8080
  ```
- Auto-reload: pass the reload flag via CLI/config (see server.RELOAD in config interface).

References
- installation.md:1
- http/app.md:1
- http/config.md:1
