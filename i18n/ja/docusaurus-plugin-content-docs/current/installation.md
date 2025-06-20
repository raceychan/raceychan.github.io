---
title: インストール
sidebar_position: 1
slug: /installation
---

## インストール

lihilはpython>=3.10が必要です

### pip

```bash
pip install lihil
```

### uv

uvを使用してlihilをインストールしたい場合

[uv インストールガイド](https://docs.astral.sh/uv/getting-started/installation/#installation-methods)

1. `project_name`でWebプロジェクトを初期化

```bash
uv init project_name
```

2. uvを使用してlihilをインストールします。これにより、専用の仮想環境ですべての依存関係が解決されます。

```bash
uv add lihil
```

## サーバーの起動

### lihilで起動

```python title="app.py"
from lihil import Lihil

# アプリケーションコード

lhl = Lihil()

if __name__ == "__main__":
    lhl.run(__file__)
```

コマンドラインで

```bash
python -m myproject.app --server.port=8080
```

uvを使用する場合
```bash
uv run python -m myproject.app --server.port=8080
```

ここで`myproject`はプロジェクトのルートフォルダの名前、`app.py`はメインアプリケーションファイルの名前です。

これにより、コマンドライン引数を使用して設定を上書きできます。

アプリがKubernetesなどのコンテナ化された環境にデプロイされている場合、この方法で機密情報を提供することは、通常ファイルに保存するよりも安全です。

`--help`を使用して利用可能な設定を確認してください。

### uvicornで起動

lihilはASGI互換なので、uvicornなどのASGIサーバーで実行できます
`app.py`でサーバーを起動、デフォルトポート8000
