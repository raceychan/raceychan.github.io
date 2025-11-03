---
title: Missing Info for How do I …
slug: /how-do-i/missing
---

This page tracks open gaps in our docs for questions marked (TBC) in the ranked index. Filling these will let us complete answers confidently.

Deploy with Uvicorn/Gunicorn in production
- Missing: Official Gunicorn guidance (gunicorn cmd, uvicorn workers, config flags, graceful shutdown, preload, worker counts).
- Missing: Example Procfile/systemd/docker CMD using Gunicorn with Uvicorn workers.

Serve behind Nginx or a load balancer
- Missing: Nginx reverse-proxy example (proxy headers, timeouts, websockets upgrade, gzip), TLS termination notes.
- Missing: Guidance for `ROOT_PATH` or path prefixing behind proxies and handling `X-Forwarded-*` headers.

Handle redirects and 204/304 responses
- Missing: Canonical redirect API (e.g., a RedirectResponse or equivalent) and examples.
- Missing: Examples for returning 204/304 with `Empty` + status annotations.

Set headers and cookies on responses
- Missing: Documented approach to set custom response headers/cookies (low-level `Response` usage with examples; cookie API if provided).

Handle sessions or API keys
- Missing: Recommended patterns for session cookies (security flags) and API key auth in headers/query.
- Missing: Any built-in helpers or plugins for API key/session management.

Broadcast messages to multiple clients
- Missing: Patterns to broadcast to many WebSocket clients or SSE subscribers (in-memory registry, pub/sub, or integration with message bus).

Handle backpressure and disconnects
- Missing: Guidance for handling slow consumers and flow control for WebSockets/SSE.
- Missing: How to detect disconnects in handlers and stop work (beyond IRequest.is_disconnected for HTTP).

Run database migrations
- Missing: Alembic (or alternative) setup, commands, and recommended project wiring.

Paginate results and return metadata
- Missing: Recommended pagination style (offset/limit or cursor), response schema shape (items + meta), examples.

Mock external services (HTTP/DB)
- Missing: Examples for mocking HTTP clients and DB engines/connections in tests; recommended libraries.

Create a new Lihil project layout
- Missing: Suggested directory structure, sample `app/` layout, config file placements, and starter template.

Enable logging and set log levels
- Missing: Central logging setup, config-driven log levels (names/fields), and examples for request/response logs.

Version my API (v1, v2)
- Missing: Recommended approach (route prefixes, shared deps), migration strategy, and deprecation guidance.

Generate or publish API docs
- Missing: Default docs/OAS endpoints, how to configure via `IOASConfig` (OAS_PATH, DOC_PATH, PROBLEM_PATH), and publishing options.

Handle file downloads and static files
- Missing: File response API (content-disposition/streaming), and static files mounting/serving guidance.

