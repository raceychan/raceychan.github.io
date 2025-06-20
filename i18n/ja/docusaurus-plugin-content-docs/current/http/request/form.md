---
sidebar_position: 4.1
title: フォーム
slug: from-data
---

# フォームパラメータ

フォームデータは、リクエストボディデータを送信するもう1つの方法で、HTMLフォームやファイルアップロードで一般的に使用されます。JSONとは異なり、フォームデータは`application/x-www-form-urlencoded`または`multipart/form-data`コンテンツタイプでエンコードされます。

`lihil`はフォーム解析をサポートし、フォーム値とアップロードされたファイルを抽出できます。

---

## フォームパラメータの宣言

`Annotated[T, Form()]`を使用してフォームパラメータを宣言できます。`lihil`は自動的にリクエストボディを解析し、フォームフィールドを抽出します：

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

form()ヘルパーは、パラメータがフォームボディから来ることをマークします。

## ファイルアップロードの処理

フォームデータはファイルアップロードもサポートします（コンテンツタイプがmultipart/form-dataの場合）。アップロードされたファイルをパラメータとして宣言できます：

```python
from lihil import form, UploadFile
from typing import Annotated

@user.post
async def upload_avatar(file: UploadFile) -> str:
    return file.filename
```

### 高度：ファイルの制約

大きなフォームを解析したり、ユーザーアップロードを処理したりする際、サーバーを保護するために制限を設定したい場合があります。form()ヘルパーは以下のようなオプションを受け入れます：

- max_files：最大ファイル数
- max_fields：合計フィールドの最大数
- max_part_size：任意のパートの最大サイズ（デフォルト：1MB）

```python
@user.post
async def upload_many(
    files: Annotated[list[UploadFile], Form(max_files=5, max_part_size=2 * 1024 * 1024)]
) -> int:
    return len(files)
```

フォームデータは、コンテンツタイプに応じて異なる方法で解析される、もう1つの種類のボディデータです。lihilを使用すると、Annotated[..., Form()]を使用してフォームパラメータを宣言でき、ファイル処理、フィールド制限、ストリーミングを完全に制御できます—すべて慣れ親しんだPython型で。