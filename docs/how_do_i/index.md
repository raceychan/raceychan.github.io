---
title: How do I …?
slug: /how-do-i
---

This page collects common, practical questions when you’re new to Python web dev or just starting with Lihil and want to ship quickly.

## Ranked FAQ (Annotated)

Below is a prioritized list based on estimated importance and frequency. Each item links to where the current docs cover it. If an item is marked (TBC), our docs don’t yet have enough information to answer it completely.

1) How do I define GET/POST/PUT/DELETE endpoints? — Docs: ../http/route.md, ../http/endpoint.md
2) How do I use path, query, header, and cookie parameters? — Docs: ../http/request/path.md, ../http/request/query.md, ../http/request/header.md, ../http/request/cookie.md
3) How do I parse JSON and form data bodies? — Docs: ../http/request/body.md, ../http/request/form.md
4) How do I return JSON, text, and custom status codes? — Docs: ../http/response.md
5) How do I upload and handle files? — Docs: ../http/request/form.md
6) How do I access request context and client info? — Docs: ../http/request/request.md, ../http/endpoint.md
7) How do I configure environment variables and settings per environment? — Docs: ../http/config.md
8) How do I run a dev server and enable auto-reload? — Docs: ../installation.md, ../http/app.md, ../http/config.md
9) How do I structure a larger app (routes, modules, packages)? — Docs: ../http/app.md, ../http/route.md
10) How do I organize a modular route structure for features? — Docs: ../http/app.md, ../http/route.md
11) How do I register dependencies (e.g., DB engine) for injection? — Docs: ../index.md, ../http/endpoint.md, ../http/lifespan.md
12) How do I add middleware for CORS, compression, or auth? — Docs: ../http/middleware.md, ../advance/plugin/jwt.md
13) How do I enable CORS correctly for browsers? — Docs: ../http/middleware.md
14) How do I validate inputs and provide helpful error messages? — Docs: ../http/endpoint.md, ../http/request/*, ../http/error-handling.md
15) How do I define and return custom error types? — Docs: ../http/error-handling.md
16) How do I set global error handlers and fallbacks? — Docs: ../http/error-handling.md
17) How do I implement request/response logging and timing? — Docs: ../http/middleware.md
18) How do I stream large responses or server-sent events? — Docs: ../http/response.md
19) How do I add a WebSocket endpoint? — Docs: ../http/websocket.md
20) How do I connect to a database (SQLAlchemy, async engines)? — Docs: ../http/lifespan.md, ../http/endpoint.md, ../index.md
21) How do I run background tasks or scheduled jobs? — Docs: ../http/lifespan.md
22) How do I write unit and integration tests for endpoints? — Docs: ../testing.md
23) How do I test async code and dependency-injected services? — Docs: ../testing.md
24) How do I add JWT authentication? — Docs: ../advance/plugin/jwt.md
25) How do I protect routes with role/permission checks? — Docs: ../advance/plugin/jwt.md
26) How do I add rate limiting / throttling? — Docs: ../advance/plugin/throttling.md
27) How do I deploy with Uvicorn/Gunicorn in production? — (TBC)
28) How do I containerize the app with Docker? — Docs: ../deployment.md
29) How do I serve behind Nginx or a load balancer? — (TBC)
30) How do I configure health checks and readiness probes? — Docs: ../deployment.md
31) How do I monitor, trace, and collect metrics? — Docs: ../http/lifespan.md
32) How do I handle redirects and 204/304 responses? — (TBC)
33) How do I set headers and cookies on responses? — (TBC)
34) How do I handle sessions or API keys? — (TBC)
35) How do I broadcast messages to multiple clients? — (TBC)
36) How do I handle backpressure and disconnects? — (TBC)
37) How do I run database migrations? — (TBC)
38) How do I paginate results and return metadata? — (TBC)
39) How do I mock external services (HTTP/DB)? — (TBC)
40) How do I create a new Lihil project layout? — (TBC)
41) How do I enable logging and set log levels? — (TBC)
42) How do I version my API (v1, v2)? — (TBC)
43) How do I generate or publish API docs? — (TBC)
44) How do I handle file downloads and static files? — (TBC)

If you want any of these expanded with step-by-step examples, tell me which one to build first.
