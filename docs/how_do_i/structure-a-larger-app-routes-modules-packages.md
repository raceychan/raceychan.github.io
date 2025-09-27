---
title: structure a larger app (routes, modules, packages)
---

How to
- Define feature routes in their own modules and include them into the application.

Example
```python
# app/users/api.py
from lihil import Route
users = Route("/users")
```

```python
# app/main.py
from lihil import Lihil
from app.users.api import users

lhl = Lihil(users)
# Add more features
# lhl.include_routes(products)
```

References
- http/app.md:1
- http/route.md:1
