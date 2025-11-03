---
title: organize a modular route structure for features
---

How to
- Create one `Route` per feature and keep their endpoints with the feature’s code. Include all routes in the app.

Example
```python
from lihil import Lihil, Route

users = Route("/users")
products = Route("/products")

lhl = Lihil(users)
lhl.include_routes(products)
```

References
- http/app.md:1
- http/route.md:1
