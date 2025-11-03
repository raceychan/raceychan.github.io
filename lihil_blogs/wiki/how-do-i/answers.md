---
title: How do I … Answers
slug: /how-do-i/answers
---

Answers are provided in the same order as the ranked, annotated index. Each answer is constrained to what the current docs cover and links back to the source pages.

1) Define GET/POST/PUT/DELETE endpoints
- How: Create a `Route(path)` and decorate functions with `@route.get/.post/.put/.delete`.
- Example:
  ```python
  from lihil import Route

  users = Route("/users")

  @users.get
  async def list_users():
      return ["alice", "bob"]

  @users.post
  async def create_user(name: str):
      return {"created": name}
  ```
- Refs: ../http/route.md, ../http/endpoint.md

2) Use path, query, header, and cookie parameters
- How: Declare parameters by name/type; use `Param("header"|"cookie"|...)` or implicit rules (path match → path param; structured type → body; otherwise query).
- Example:
  ```python
  from typing import Annotated
  from lihil import Route, Param

  user = Route("/users/{user_id}")

  @user.get
  async def get_user(
      user_id: int,  # path (matches {user_id})
      q: str | None = None,  # query
      auth: Annotated[str, Param("header", alias="Authorization")],
      session_id: Annotated[str, Param("cookie")],
  ) -> dict:
      return {"user_id": user_id, "q": q, "auth": auth, "session_id": session_id}
  ```
- Refs: ../http/request/path.md, ../http/request/query.md, ../http/request/header.md, ../http/request/cookie.md, ../http/endpoint.md

3) Parse JSON and form data bodies
- How: Use structured types (e.g., `msgspec.Struct`/`Payload`) for JSON; use `Annotated[T, Form()]` for form bodies.
- Example (JSON):
  ```python
  from msgspec import Struct
  from lihil import Route

  class User(Struct):
      name: str

  users = Route("/users")

  @users.post
  async def create_user(user: User) -> User:
      return user
  ```
- Example (Form + files):
  ```python
  from typing import Annotated
  from lihil import Route, Form, UploadFile

  upload = Route("/upload")

  @upload.post
  async def upload_avatar(file: UploadFile) -> str:
      return file.filename

  @upload.post
  async def upload_many(
      files: Annotated[list[UploadFile], Form(max_files=5)]
  ) -> int:
      return len(files)
  ```
- Refs: ../http/request/body.md, ../http/request/form.md

4) Return JSON, text, and custom status codes
- How: Default return is JSON; use return marks (`Text`, `HTML`, `Stream`) and status annotation `Annotated[T, status.X]`.
- Example:
  ```python
  from typing import Annotated
  from lihil import Text, status

  async def hello() -> Text:
      return "hello"

  async def created() -> Annotated[dict, status.Created]:
      return {"ok": True}
  ```
- Refs: ../http/response.md

5) Upload and handle files
- How: Accept `UploadFile` or lists of `UploadFile`; constrain via `Form()` options.
- Refs: ../http/request/form.md

6) Access request context and client info
- How: Accept `IRequest` to access url, headers, cookies, client, body, etc.
- Example:
  ```python
  from lihil import Route
  from lihil.interface import IRequest

  meta = Route("/meta")

  @meta.get
  async def info(req: IRequest) -> dict:
      return {
          "client": getattr(req.client, "host", None),
          "headers": dict(req.headers),
          "query": dict(req.query_params),
      }
  ```
- Refs: ../http/request/request.md, ../http/endpoint.md

7) Configure environment variables and settings per environment
- How: Load via `lhl_read_config(...)` and override via env/CLI. Access anywhere with `lhl_get_config()`.
- Example:
  ```python
  from lihil.config import lhl_read_config, lhl_get_config
  config = lhl_read_config("settings.toml")
  cfg = lhl_get_config()
  ```
- CLI override: `python app.py --server.port 8080 --is_prod true`
- Refs: ../http/config.md

8) Run a dev server and enable auto-reload
- How: Use `Lihil.run(__file__)` or serve with uvicorn. Toggle reload via config CLI.
- Example:
  ```python
  from lihil import Lihil
  lhl = Lihil()
  if __name__ == "__main__":
      lhl.run(__file__)
  ```
- CLI: `uv run python -m myproject.app --server.port=8080 --server.reload=true`
- Refs: ../installation.md, ../http/app.md, ../http/config.md

9) Structure a larger app (routes, modules, packages)
- How: Define feature routes and include them in the app.
- Example:
  ```python
  from lihil import Lihil, Route
  users = Route("/users")
  products = Route("/products")
  lhl = Lihil(users)
  lhl.include_routes(products)
  ```
- Refs: ../http/app.md, ../http/route.md

10) Organize a modular route structure for features
- Same pattern as (9); place feature routes in their own modules and `include_routes(...)`.
- Refs: ../http/app.md, ../http/route.md

11) Register dependencies (e.g., DB engine) for injection
- How: Register factories on the route or pass in `deps=[...]`; inject by type in endpoint params.
- Example:
  ```python
  from typing import Annotated
  from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine
  from ididi import NodeConfig
  from lihil import Route, use

  async def get_conn(engine: AsyncEngine) -> AsyncConnection:
      async with engine.begin() as conn:
          yield conn

  users = Route("/users", deps=[(get_conn, NodeConfig(reuse=False))])

  @users.post
  async def create_user(conn: AsyncConnection) -> dict:
      return {"ok": True}
  ```
- Refs: ../index.md, ../http/endpoint.md

12) Add middleware for CORS, compression, or auth
- How: Pass `middlewares=[lambda app: ...]` to `Lihil(...)`. Import middlewares from Starlette; use JWT plugin for auth.
- Example (CORS):
  ```python
  from starlette.middleware.cors import CORSMiddleware
  from lihil import Lihil

  lhl = Lihil(middlewares=[lambda app: CORSSMiddleware(app, allow_origins=["*"], allow_methods=["*"])])
  ```
- Refs: ../http/middleware.md, ../advance/plugin/jwt.md

13) Validate inputs and provide helpful error messages
- How: Use `Annotated[..., Param(...)]` constraints or structured types; invalid input yields 422 with details.
- Example:
  ```python
  from typing import Annotated
  from lihil import Route, Param

  search = Route("/search")

  @search.get
  async def fn(limit: Annotated[int, Param(ge=1, le=100)]):
      return {"limit": limit}
  ```
- Refs: ../http/endpoint.md, ../http/request/*, ../http/error-handling.md

14) Define and return custom error types
- How: Inherit `HTTPException[T]`, set `__status__`, and list in `errors=` on the endpoint as needed.
- Example:
  ```python
  from lihil import Route
  from lihil.errors import HTTPException

  class MyError(HTTPException[str]):
      __status__ = 418

  r = Route("/demo")

  @r.get(errors=MyError)
  async def raise_it():
      raise MyError("teapot")
  ```
- Refs: ../http/error-handling.md

15) Set global error handlers and fallbacks
- How: Use `@problem_solver` to register handlers; can match specific exceptions or status codes.
- Example:
  ```python
  from lihil import Route
  from lihil.problems import problem_solver
  from lihil.vendors import Response

  @problem_solver
  def handle_404(req, exc: 404):
      return Response("resource not found", status_code=404)
  ```
- Refs: ../http/error-handling.md

16) Implement request/response logging and timing
- How: Add a middleware that times the request and logs metadata.
- Example (pattern):
  ```python
  import time, logging
  from lihil import Lihil
  from typing import Callable

  log = logging.getLogger(__name__)

  def timing_mw(next_app) -> Callable:
      async def app(scope, receive, send):
          start = time.perf_counter()
          try:
              await next_app(scope, receive, send)
          finally:
              dur_ms = (time.perf_counter() - start) * 1000
              log.info("%s %s took %.2fms", scope.get("method"), scope.get("path"), dur_ms)
      return app

  lhl = Lihil(middlewares=[timing_mw])
  ```
- Refs: ../http/middleware.md

17) Stream large responses or server-sent events
- How: For SSE, yield `SSE` values and annotate return as `EventStream`.
- Example:
  ```python
  from lihil import Route, SSE, EventStream

  sse = Route("/sse")

  @sse.get
  async def events() -> EventStream:
      yield SSE(data={"message": "Hello"}, event="start")
  ```
- Refs: ../http/response.md

18) Add a WebSocket endpoint
- How: Use `WebSocketRoute` and `.ws_handler` with a factory that accepts/closes the connection.
- Example:
  ```python
  from lihil import WebSocketRoute, WebSocket, Ignore, use
  from typing import Annotated

  ws = WebSocketRoute("/ws/{room}")

  async def ws_factory(ws: Ignore[WebSocket]) -> Ignore[WebSocket]:
      await ws.accept();
      try:
          yield ws
      finally:
          await ws.close()

  @ws.ws_handler
  async def handler(ws: Annotated[WebSocket, use(ws_factory, reuse=False)], room: str):
      await ws.send_text(f"joined {room}")
  ```
- Refs: ../http/websocket.md

19) Connect to a database (SQLAlchemy, async engines)
- How: Create an `AsyncEngine` (e.g., in lifespan), yield `AsyncConnection` per request via a dependency.
- Example:
  ```python
  from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, AsyncConnection
  from lihil import Route

  async def lifespan(app):
      app.engine = create_async_engine("sqlite+aiosqlite:///test.db")
      yield
      await app.engine.dispose()

  async def get_conn(engine: AsyncEngine) -> AsyncConnection:
      async with engine.begin() as conn:
          yield conn

  r = Route("/users", deps=[get_conn])
  ```
- Refs: ../http/lifespan.md, ../http/endpoint.md, ../index.md

20) Run background tasks or scheduled jobs
- How: Create a background task in lifespan using `asyncio.create_task(...)` and cancel on shutdown.
- Refs: ../http/lifespan.md

21) Write unit and integration tests for endpoints
- How: Use `TestClient` for integration; iterate SSE with `iter_lines()`.
- Refs: ../testing.md

22) Test async code and dependency-injected services
- How: Use `LocalClient` to call endpoints/functions with DI locally.
- Refs: ../testing.md

23) Add JWT authentication
- How: Use `JWTAuthPlugin` with OAuth2 Password flow and `JWTAuthParam`.
- Refs: ../advance/plugin/jwt.md

24) Protect routes with role/permission checks
- How: Add a function dependency (e.g., `is_admin`) and require it on the endpoint.
- Refs: ../advance/plugin/jwt.md

25) Add rate limiting / throttling
- How: Use `PremierPlugin` and choose a strategy (e.g., fixed window).
- Refs: ../advance/plugin/throttling.md

26) Containerize the app with Docker
- How: Use the provided Dockerfile template and docker-compose/k8s examples.
- Refs: ../deployment.md

27) Configure health checks and readiness probes
- How: Use the sample Kubernetes liveness/readiness probes targeting a health endpoint you expose.
- Refs: ../deployment.md

28) Monitor, trace, and collect metrics
- How: Start a Prometheus metrics server from lifespan and increment counters.
- Refs: ../http/lifespan.md

Notes on items marked (TBC) in the index: see missing-info.md for what’s needed to document those fully.

