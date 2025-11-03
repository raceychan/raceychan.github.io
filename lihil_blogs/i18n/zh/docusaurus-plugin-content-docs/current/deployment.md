---
title: 部署
sidebar_position: 4
---

## 先决条件

- Docker Engine 20.10+
- Docker Compose v2.0+

## 容器化你的项目

### Dockerfile 配置

在项目根目录创建一个 `dockerfile`，包含以下配置：

```dockerfile
FROM python:3.12-slim-bookworm

WORKDIR /app

# 复制依赖文件
COPY pyproject.toml ./

# 仅安装依赖
RUN pip install . && pip uninstall -y src
# 复制配置
COPY settings.toml ./
COPY .env ./

# 复制源代码
COPY src/ ./src/

EXPOSE 8000

CMD ["python", "-m", "src.main"]
```

### Python 镜像选择

**推荐**：`python:3.12-slim-bookworm`
- 基于 Debian，占用空间最小
- 安全性和兼容性平衡良好
- 适合生产环境部署

**替代方案**：
- `python:3.12-alpine` - 体积更小但可能存在兼容性问题
- `python:3.12` - 完整的 Debian 镜像，体积更大但兼容性更好
- `python:3.11-slim-bookworm` - 适用于 Python 3.11 兼容性

### 构建命令

```bash
# 构建 Docker 镜像
docker build -t lihil-app .

# 使用特定标签构建
docker build -t lihil-app:v1.0.0 .

# 无缓存构建
docker build --no-cache -t lihil-app .
```

### 运行容器

```bash
# 运行容器
docker run -p 8000:8000 lihil-app

# 使用环境变量运行
docker run -p 8000:8000 -e ENV=production lihil-app

# 使用卷挂载数据库运行
docker run -p 8000:8000 -v ./test.db:/app/test.db lihil-app
```

## 使用 Docker compose 在本地测试镜像

### Docker Compose 配置

创建 `docker-compose.yml` 文件：

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

### Docker Compose 命令

```bash
# 启动应用
docker-compose up

# 后台模式启动
docker-compose up -d

# 构建并启动
docker-compose up --build

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f lihil-backend

# 在容器中执行 shell
docker-compose exec lihil-backend bash
```

### 环境配置

在 `docker-compose.yml` 中配置环境变量：

```yaml
environment:
  - ENV=production
  - DATABASE_URL=sqlite:///app/test.db
  - LOG_LEVEL=info
  - UVICORN_HOST=0.0.0.0
  - UVICORN_PORT=8000
```

### 卷挂载

数据库持久化：
```yaml
volumes:
  - ./test.db:/app/test.db
```

开发环境实时重载：
```yaml
volumes:
  - ./src:/app/src
  - ./settings.toml:/app/settings.toml
```

### 健康检查

为你的服务添加健康检查：
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 在 k8s 中部署

### 部署清单

创建 `k8s-deployment.yaml`：

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

### 服务清单

创建 `k8s-service.yaml`：

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

### 配置的 ConfigMap

创建 `k8s-configmap.yaml`：

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

### 数据库的持久卷

创建 `k8s-pv.yaml`：

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

### 部署命令

```bash
# 应用所有清单
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-service.yaml
kubectl apply -f k8s-configmap.yaml
kubectl apply -f k8s-pv.yaml

# 检查部署状态
kubectl get deployments
kubectl get pods
kubectl get services

# 查看日志
kubectl logs -f deployment/lihil-app

# 扩展部署
kubectl scale deployment lihil-app --replicas=5

# 更新镜像
kubectl set image deployment/lihil-app lihil-app=lihil-app:v2.0.0

# 本地测试端口转发
kubectl port-forward service/lihil-service 8000:80
```

### 生产环境考虑

1. **机密管理**：使用 Kubernetes secrets 管理敏感数据
2. **Ingress**：配置 ingress 控制器以供外部访问
3. **资源限制**：设置适当的 CPU 和内存限制
4. **监控**：实施 Prometheus 指标和警报
5. **日志记录**：使用 Fluentd/ELK 堆栈配置集中日志记录