
# request


## http request

a `request` object is a low-level(relatively) abstraction of a http request.

### GET REQuest

```bash
GET /path?query=value HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: text/html,application/xhtml+xml
```

### POST Request

```bash
POST /submit HTTP/1.1
Host: example.com
Content-Type: application/json
Content-Length: 27

{"key":"value"}
```


## `Lihil.Request`

lihil provides higher level abstractions like `Header`, `Query`, `Body`, etc. to let you directly declare the params you need in your endpoint. lihil is also optimized to only minimize the performance overhead in parsing params from request.

