---
title: configure environment variables and settings per environment
---

How to
- Load configuration from files, environment variables, and CLI (in increasing priority) using `lhl_read_config(...)`.
- Access config anywhere via `lhl_get_config()`; set explicitly with `lhl_set_config()`.

Examples
```python
from lihil.config import lhl_read_config, lhl_get_config

config = lhl_read_config("settings.toml")
cfg = lhl_get_config()
```

CLI overrides
```bash
python app.py --server.port 8080 --is_prod true
```

References
- http/config.md:1
