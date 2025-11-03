---
title: containerize the app with Docker
---

How to
- Use the provided Dockerfile template; build and run with Docker or docker-compose.

Example Dockerfile
```dockerfile
FROM python:3.12-slim-bookworm
WORKDIR /app
COPY pyproject.toml ./
RUN pip install . && pip uninstall -y src
COPY src/ ./src/
EXPOSE 8000
CMD ["python", "-m", "src.main"]
```

Build/Run
```bash
docker build -t lihil-app .
docker run -p 8000:8000 lihil-app
```

References
- deployment.md:1
