---
title: Supabase
---

## Supabase統合（認証サポート）

lihilはSupabaseのサポートを導入しており、ユーザー認証から始まります。わずか一行のコードで：

```python
app.include_routes(signin_route_factory(route_path="/login"))
```

Supabase Authによってサポートされた動作するログインエンドポイントを統合できます。

完全なコード例

```python

from supabase import AsyncClient

from lihil import Lihil
from lihil.config import AppConfig, lhl_get_config, lhl_read_config
from lihil.plugins.auth.supabase import signin_route_factory


class ProjectConfig(AppConfig, kw_only=True):
    SUPABASE_URL: str
    SUPABASE_API_KEY: str


def supabase_factory() -> AsyncClient:
    config = lhl_get_config(config_type=ProjectConfig)
    return AsyncClient(
        supabase_url=config.SUPABASE_URL, supabase_key=config.SUPABASE_API_KEY
    )


async def lifespan(app: Lihil):
    app.config = lhl_read_config(".env", config_type=ProjectConfig) # .envファイルから設定を読み取り、`ProjectConfig`オブジェクトに変換
    app.graph.analyze(supabase_factory) # supabase.AsyncClient用のサンプルファクトリ関数を登録
    app.include_routes(signin_route_factory(route_path="/login"))
    yield


lhl = Lihil(lifespan=lifespan)

if __name__ == "__main__":
    lhl.run(__file__)
```

- 現在のプラグインは、SupabaseのAsyncClientを使用したメール/電話-パスワード認証フローの両方をサポートしています。フォーム解析、依存性注入、エラー応答を自動的に処理し、完全に型安全で構成可能でありながら動作します。

これは始まりに過ぎません。現在のサポートは基本的なログインとサインアップエンドポイントに限定されていますが、将来のリリースでは以下のようなSupabaseの他の機能のサポートを拡張します：

- ユーザー管理

- セッション処理

- 認可ルール

- リアルタイムとデータベース統合

目標は、ボイラープレートや回避策なしに、Supabaseとlihilを統合するためのシームレスで慣用的な体験を提供することです。