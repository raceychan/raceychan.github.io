---
sidebar_position: 3
title: アプリケーション
---


## ルートでアプリを作成

```python title="app.py"
from lihil import Lihil, Route

user_route = Route("users")


lhl = Lihil(user_route)
```

## ルートを含める

```python
product_route = Route("products")

lhl.include_routes(product_route)
```

## アプリの設定

lihilの動作を制御するために変更できるいくつかの設定があります。


1. 設定ファイル、例：`pyproject.toml`

    ```python
    lhl = Lihil(config_file="pyproject.toml")
    ```

    これは`pyproject.toml`ファイル内の`tool.lihil`テーブルを探します
    誤設定を防ぐために、追加/未知のキーは禁止されます

    注意：現在tomlファイルのみサポートされています

2. `AppConfig`インスタンス

    ```python
    lhl = Lihil(app_config=AppConfig(version="0.1.1"))
    ```

    AppConfigを継承して拡張したい場合に特に有用です。

    ```python
    from lihil.config import AppConfig

    class MyConfig(AppConfig):
        app_name: str

    config = MyConfig.from_file("myconfig.toml")
    ```

3. コマンドライン引数：

    ```example
    python app.py --oas.title "New Title" --is_prod true
    ```

    - ネストしたフィールドを表現するには`.`を使用

    - 利用可能なオプションを確認するには`--help`を追加

`lihil.config.lhl_get_config`を使用してアプリのどこからでも`AppConfig`にアクセスできます

```python
from lihil.config import lhl_get_config, AppConfig

app_config: AppConfig = lhl_get_config()
```


## アプリを提供（実行）


### lihilで提供

```python
from lihil import Lihil

# アプリケーションコード

lhl = Lihil()

if __name__ == "__main__":
    lhl.run(__file__)
```

コマンドラインで

```python
uv run python -m myproject.app --server.port=8080
```

これにより、コマンドライン引数を使用して設定を上書きできます。

アプリがKubernetesなどのコンテナ化された環境にデプロイされている場合、この方法で機密情報を提供することは、通常ファイルに保存するよりも安全です。

利用可能な設定を確認するには`--help`を使用してください。