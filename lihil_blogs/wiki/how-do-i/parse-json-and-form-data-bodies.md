---
title: parse JSON and form data bodies
---

How to
- JSON: declare a structured type (e.g., `msgspec.Struct` or `Payload`) as a parameter; Lihil parses and validates.
- Form: use `Annotated[T, Form()]` and `UploadFile` for file parts.

Examples
```python
from msgspec import Struct
from lihil import Route

class User(Struct):
    name: str

users = Route("/users")

@users.post
async def create_user(user: User) -> User:
    return user
```

```python
from typing import Annotated
from lihil import Route, Form, UploadFile

upload = Route("/upload")

@upload.post
async def upload_avatar(file: UploadFile) -> str:
    return file.filename

@upload.post
async def upload_many(
    files: Annotated[list[UploadFile], Form(max_files=5)]
) -> int:
    return len(files)
```

References
- http/request/body.md:1
- http/request/form.md:1
