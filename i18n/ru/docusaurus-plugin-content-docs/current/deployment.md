---
title: Развертывание
sidebar_position: 4
---

## Предварительные требования

- Docker Engine 20.10+
- Docker Compose v2.0+

## Контейнеризация вашего проекта

### Конфигурация Dockerfile

Создайте `dockerfile` в корне вашего проекта со следующей конфигурацией:

```dockerfile
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy dependency files
COPY pyproject.toml ./

# Install dependencies only
RUN pip install . && pip uninstall -y src
# Copy configuration
COPY settings.toml ./
COPY .env ./

# Copy source code
COPY src/ ./src/

EXPOSE 8000

CMD ["python", "-m", "src.main"]
```

### Выбор Python образа

**Рекомендуется**: `python:3.12-slim-bookworm`
- На основе Debian с минимальным размером
- Хороший баланс безопасности и совместимости
- Оптимальный для продакшен развертываний

**Альтернативы**:
- `python:3.12-alpine` - Меньший размер, но возможные проблемы совместимости
- `python:3.12` - Полный Debian образ, больше но более совместимый
- `python:3.11-slim-bookworm` - Для совместимости с Python 3.11

### Команды сборки

```bash
# Build the Docker image
docker build -t lihil-app .

# Build with specific tag
docker build -t lihil-app:v1.0.0 .

# Build without cache
docker build --no-cache -t lihil-app .
```

### Запуск контейнера

```bash
# Run container
docker run -p 8000:8000 lihil-app

# Run with environment variables
docker run -p 8000:8000 -e ENV=production lihil-app

# Run with volume mount for database
docker run -p 8000:8000 -v ./test.db:/app/test.db lihil-app
```

## Тестирование образов локально с использованием Docker compose

### Конфигурация Docker Compose

Создайте файл `docker-compose.yml`:

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

### Команды Docker Compose

```bash
# Start the application
docker-compose up

# Start in detached mode
docker-compose up -d

# Build and start
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f lihil-backend

# Execute shell in container
docker-compose exec lihil-backend bash
```

### Конфигурация окружения

Настройте переменные окружения в `docker-compose.yml`:

```yaml
environment:
  - ENV=production
  - DATABASE_URL=sqlite:///app/test.db
  - LOG_LEVEL=info
  - UVICORN_HOST=0.0.0.0
  - UVICORN_PORT=8000
```

### Монтирование томов

Для сохранения базы данных:
```yaml
volumes:
  - ./test.db:/app/test.db
```

Для разработки с автоматическим перезагрузкой:
```yaml
volumes:
  - ./src:/app/src
  - ./settings.toml:/app/settings.toml
```

### Проверка работоспособности

Добавьте проверку работоспособности к вашему сервису:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Развертывание в k8s

### Манифест развертывания

Создайте `k8s-deployment.yaml`:

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

### Манифест сервиса

Создайте `k8s-service.yaml`:

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

### ConfigMap для конфигурации

Создайте `k8s-configmap.yaml`:

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

### Постоянный том для базы данных

Создайте `k8s-pv.yaml`:

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

### Команды развертывания

```bash
# Apply all manifests
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-service.yaml
kubectl apply -f k8s-configmap.yaml
kubectl apply -f k8s-pv.yaml

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/lihil-app

# Scale deployment
kubectl scale deployment lihil-app --replicas=5

# Update image
kubectl set image deployment/lihil-app lihil-app=lihil-app:v2.0.0

# Port forward for local testing
kubectl port-forward service/lihil-service 8000:80
```

### Соображения для продакшена

1. **Управление секретами**: Используйте Kubernetes secrets для конфиденциальных данных
2. **Ingress**: Настройте ingress controller для внешнего доступа
3. **Ограничения ресурсов**: Установите подходящие лимиты CPU и памяти
4. **Мониторинг**: Реализуйте метрики и оповещения Prometheus
5. **Логирование**: Настройте централизованное логирование с помощью Fluentd/ELK stack