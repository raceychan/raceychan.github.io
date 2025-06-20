---
title: デプロイメント
sidebar_position: 4
---

## 前提条件

- Docker Engine 20.10+
- Docker Compose v2.0+

## プロジェクトのDockerize

### Dockerfile設定

プロジェクトルートに以下の設定で`dockerfile`を作成：

```dockerfile
FROM python:3.12-slim-bookworm

WORKDIR /app

# 依存関係ファイルをコピー
COPY pyproject.toml ./

# 依存関係のみをインストール
RUN pip install . && pip uninstall -y src
# 設定をコピー
COPY settings.toml ./
COPY .env ./

# ソースコードをコピー
COPY src/ ./src/

EXPOSE 8000

CMD ["python", "-m", "src.main"]
```

### Pythonイメージの選択

**推奨**：`python:3.12-slim-bookworm`
- 最小フットプリントのDebian-ベース
- セキュリティと互換性のバランスが良い
- 本番デプロイメントに最適

**代替案**：
- `python:3.12-alpine` - サイズは小さいが互換性の問題の可能性
- `python:3.12` - フルDebianイメージ、大きいがより互換性がある
- `python:3.11-slim-bookworm` - Python 3.11互換性用

### ビルドコマンド

```bash
# Dockerイメージをビルド
docker build -t lihil-app .

# 特定のタグでビルド
docker build -t lihil-app:v1.0.0 .

# キャッシュなしでビルド
docker build --no-cache -t lihil-app .
```

### コンテナの実行

```bash
# コンテナを実行
docker run -p 8000:8000 lihil-app

# 環境変数で実行
docker run -p 8000:8000 -e ENV=production lihil-app

# データベース用ボリュームマウントで実行
docker run -p 8000:8000 -v ./test.db:/app/test.db lihil-app
```

## Docker composeを使用してローカルでイメージをテスト

### Docker Compose設定

`docker-compose.yml`ファイルを作成：

```yaml
services:
  lihil-backend:
    build:
      context: .
      dockerfile: dockerfile
    ports:
      - "8000:8000"
    environment:
      - ENV=production
    volumes:
      - ./test.db:/app/test.db
    restart: unless-stopped
    command: ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Composeコマンド

```bash
# アプリケーションを開始
docker-compose up

# デタッチモードで開始
docker-compose up -d

# ビルドして開始
docker-compose up --build

# サービスを停止
docker-compose down

# ログを表示
docker-compose logs -f lihil-backend

# コンテナでシェルを実行
docker-compose exec lihil-backend bash
```

### 環境設定

`docker-compose.yml`で環境変数を設定：

```yaml
environment:
  - ENV=production
  - DATABASE_URL=sqlite:///app/test.db
  - LOG_LEVEL=info
  - UVICORN_HOST=0.0.0.0
  - UVICORN_PORT=8000
```

### ボリュームマウント

データベース永続化のため：
```yaml
volumes:
  - ./test.db:/app/test.db
```

ライブリロード開発用：
```yaml
volumes:
  - ./src:/app/src
  - ./settings.toml:/app/settings.toml
```

### ヘルスチェック

サービスにヘルスチェックを追加：
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## k8sでのデプロイ

### デプロイメントマニフェスト

`k8s-deployment.yaml`を作成：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lihil-app
  labels:
    app: lihil-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lihil-app
  template:
    metadata:
      labels:
        app: lihil-app
    spec:
      containers:
      - name: lihil-app
        image: lihil-app:latest
        ports:
        - containerPort: 8000
        env:
        - name: ENV
          value: "production"
        - name: UVICORN_HOST
          value: "0.0.0.0"
        - name: UVICORN_PORT
          value: "8000"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### サービスマニフェスト

`k8s-service.yaml`を作成：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: lihil-service
spec:
  selector:
    app: lihil-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: LoadBalancer
```

### 設定用ConfigMap

`k8s-configmap.yaml`を作成：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: lihil-config
data:
  settings.toml: |
    [server]
    host = "0.0.0.0"
    port = 8000
    
    [database]
    url = "sqlite:///app/data/app.db"
```

### データベース用永続ボリューム

`k8s-pv.yaml`を作成：

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: lihil-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

### デプロイメントコマンド

```bash
# すべてのマニフェストを適用
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-service.yaml
kubectl apply -f k8s-configmap.yaml
kubectl apply -f k8s-pv.yaml

# デプロイメントステータスを確認
kubectl get deployments
kubectl get pods
kubectl get services

# ログを表示
kubectl logs -f deployment/lihil-app

# デプロイメントをスケール
kubectl scale deployment lihil-app --replicas=5

# イメージを更新
kubectl set image deployment/lihil-app lihil-app=lihil-app:v2.0.0

# ローカルテスト用ポートフォワード
kubectl port-forward service/lihil-service 8000:80
```

### 本番環境の考慮事項

1. **シークレット管理**：機密データにはKubernetesシークレットを使用
2. **Ingress**：外部アクセス用のingressコントローラーを設定
3. **リソース制限**：適切なCPUとメモリ制限を設定
4. **監視**：Prometheusメトリクスとアラートを実装
5. **ログ記録**：Fluentd/ELKスタックで集中ログ記録を設定