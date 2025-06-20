---
title: 設定
---

# 設定

アプリケーション設定は一般的でありながら、特に実際のプロジェクトでは厄介な問題です。

動的な設定に依存する依存関係を作成する必要があることが多く、例えばデータベースエンジンの分離レベルの設定や、環境に基づくタイムアウトの調整などがあります。

Lihilは複数のソース（ファイル、環境変数、CLI引数）をサポートする統一設定システムを提供し、開箱即用で安全で柔軟な設定管理を可能にします。

---

## 設定の読み込みと解析

```python
from lihil.config import lhl_read_config, AppConfig
```

Lihilは優先度の高い順に以下のソースから設定値を自動的に読み込みます：

1. ユーザー提供の設定ファイル
2. 環境変数
3. コマンドライン引数

この階層的なアプローチは実際のニーズを反映しています：

- サーバーポートやログレベルなどの静的でパブリックな設定は、バージョン管理されたファイル（例：settings.toml）に入れることができます。

- APIキーやデータベースパスワードなどの機密データは、偶発的な露出を避けるため環境変数から取得する必要があります。

- 異なるポートでのデバッグやフラグの切り替えなど、一時的な上書きには、CLI引数が最大の柔軟性を提供します。

## 異なるソースから設定を読み取る

```python
config = lhl_read_config("settings.toml", config_type=MyAppConfig)
```

これは自動的にすべての3つのソースから読み取り、1つの設定インスタンスにマージします。

複数のファイルを提供でき、順番に読み取られます。

```python
config = lhl_read_config("settings.toml", "dev.env", "prod.env")
```

## 設定を手動で設定

```python
from lihil import AppConfig, Lihil

lhl = Lihil(app_config = AppConfig())
```

または直接lhl_set_config()を使用：

```python
from lihil.config import lhl_set_config

lhl_set_config(MyConfig())
```

### 引数なしで呼び出すとデフォルトにリセット：

```python
lhl_set_config()
```

## 現在の設定を取得

`lhl_get_config()`を使用してアプリのどこからでもアクティブな設定を取得：

```python
from lihil.config import lhl_get_config

config = lhl_get_config()
```

## AppConfigの拡張

AppConfigを拡張して独自の設定を定義できます：

```python
from lihil.app_config import AppConfig

class MyAppConfig(AppConfig):
    my_custom_setting: str = "default"
```

次に読み込み：

```python

from lihil.config import lhl_read_config

config = lhl_read_config("settings.toml", config_type=MyAppConfig)
```

## 自動生成されるコマンドライン引数

`AppConfig`を継承して設定を拡張すると、
追加のプロパティもコマンドライン引数として生成され、上書きするために渡すことができます。

## 設定ファイルの例（config.toml）

```toml
[lihil]
IS_PROD = true
VERSION = "1.0.0"

[lihil.server]
HOST = "127.0.0.1"
PORT = 9000

[lihil.oas]
TITLE = "My API"
```

## コマンドラインでの上書き

任意のフィールドはCLIで上書きできます：

```bash
python app.py --is_prod --server.port 8080
```

## 他の設定スキーマの使用（例：Pydantic）

Pydanticなど異なる検証システムを使用する場合、自分で解析して手動で注入できます：

```python

from lihil.config import lhl_set_config, lhl_get_config

app_config = PydanticSettings()
lhl_set_config(app_config)
```

設定は`IAppConfig`インターフェースを実装することが期待されます。

## AppConfigインターフェース

```python
    class IOASConfig(Protocol):
        @property
        def OAS_PATH(self) -> str: ...
        @property
        def DOC_PATH(self) -> str: ...
        @property
        def TITLE(self) -> str: ...
        @property
        def PROBLEM_PATH(self) -> str: ...
        @property
        def PROBLEM_TITLE(self) -> str: ...
        @property
        def VERSION(self) -> str: ...

    class IServerConfig(Protocol):
        @property
        def HOST(self) -> str: ...
        @property
        def PORT(self) -> int: ...
        @property
        def WORKERS(self) -> int: ...
        @property
        def RELOAD(self) -> bool: ...
        @property
        def ROOT_PATH(self) -> bool: ...
        def asdict(self) -> dict[str, Any]: ...

    class IAppConfig(Protocol):
        @property
        def VERSION(self) -> str: ...
        @property
        def server(self) -> IServerConfig: ...
        @property
        def oas(self) -> IOASConfig: ...
```

## 概要

- 拡張するには`AppConfig`を継承し、`lhl_read_config`で設定を読み込み、ほとんどの場合`lhl_set_config`で設定を設定します
- 手動で設定を構築する場合（例：Pydanticで）、`IAppConfig`インターフェースを実装してください。
- どこからでも設定にアクセスするには`lhl_get_config`を呼び出します。
- 機密値は環境変数に入れる必要があります。
- 高速でローカルな上書き、例えばデバッグには、CLI引数を使用してください。