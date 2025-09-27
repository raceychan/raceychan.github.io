---
title: upload and handle files
---

How to
- Accept `UploadFile` for a single file or `list[UploadFile]` for multiple files.
- Control limits using `Form(max_files=..., max_part_size=...)`.

Example
```python
from typing import Annotated
from lihil import Route, Form, UploadFile

files = Route("/files")

@files.post
async def upload_one(file: UploadFile) -> str:
    return file.filename

@files.post
async def upload_many(
    files: Annotated[list[UploadFile], Form(max_files=5)]
) -> int:
    return len(files)
```

References
- http/request/form.md:1
