---
sidebar_position: 4.1
title: form
slug: from-data
---

# Form Parameters

Form data is another way to send request body data—commonly used in HTML forms and file uploads. Unlike JSON, form data is encoded with `application/x-www-form-urlencoded` or `multipart/form-data` content types.

`lihil` supports form parsing, you can extract form values and uploaded files.

---

## Declaring Form Parameters

You can declare form parameters using `Annotated[T, Form()]`. `lihil` will automatically parse the request body and extract form fields for you:

```python
from lihil import Route, Form, Struct
from typing import Annotated

login = Route("/login")

class LoginForm(Struct):
    username: str
    password: str

@login.post
async def handle_login(
    loginform: Annotated[LoginForm, Form()]
) -> str:
    return f"Welcome {username}"
```

The form() helper marks the parameter as coming from a form body.

## Handling File Uploads

Form data also supports file uploads (when the content type is multipart/form-data). You can declare uploaded files as parameters:

```python
from lihil import form, UploadFile
from typing import Annotated

@user.post
async def upload_avatar(file: UploadFile) -> str:
    return file.filename
```

### Advanced: constraints on files

When parsing large forms or handling user uploads, you may want to set limits to protect your server. The form() helper accepts options like:

- max_files: maximum number of files
- max_fields: maximum number of total fields
- max_part_size: maximum size for any part (default: 1MB)

```python
@user.post
async def upload_many(
    files: Annotated[list[UploadFile], Form(max_files=5, max_part_size=2 * 1024 * 1024)]
) -> int:
    return len(files)
```

Form data is just another kind of body data, parsed differently depending on the content type. With lihil, you can declare form parameters using Annotated[..., Form()], and get full control over file handling, field limits, and streaming—all with familiar Python types.
