---
title: set global error handlers and fallbacks
---

How to
- Register a problem solver with `@problem_solver`. You can match on specific exception types or status literals like `404`.

Example
```python
from lihil.problems import problem_solver
from lihil.vendors import Response

@problem_solver
def handle_404(req, exc: 404):
    return Response("resource not found", status_code=404)
```

Notes
- A solver for a specific exception takes precedence over a status-code solver.

References
- http/error-handling.md:1
