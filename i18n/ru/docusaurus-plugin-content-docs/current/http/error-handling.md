
## Обработка ошибок
- используйте `route.get(errors=VioletsAreBlue)` для объявления ответа endpoint'а

```python
class VioletsAreBlue(HTTPException[str]):
    "how about you?"
    __status__ = 418


@lhl.post(errors=VioletsAreBlue)
async def roses_are_red():
    raise VioletsAreBlue("I am a pythonista")
```

- используйте `lihil.problems.problem_solver` как декоратор для регистрации обработчика ошибок, ошибка будет обработана как Problem Detail.

```python
from lihil.problems import problem_solver

# ПРИМЕЧАНИЕ: вы можете использовать объединение типов для exc, например, UserNotFound | status.NOT_FOUND
@problem_solver
def handle_404(req: Request, exc: Literal[404]):
    return Response("resource not found", status_code=404)
```

Обработчик, который обрабатывает конкретный тип исключения (например, `UserNotFound`), имеет приоритет над обработчиком, который обрабатывает статус-код (например, `404`).

### Сопоставление исключение-проблема

lihil автоматически генерирует ответ и документацию на основе вашего HTTPException.
Вот сгенерированная документация для endpoint'а `roses_are_red`

<!-- ![roses_are_red](./images/roses_are_red_link.png) -->

нажмите url под вкладкой `External documentation`

мы увидим подробную страницу проблемы

<!-- ![problem page](./images/roses_are_red_problempage.png) -->

По умолчанию каждый endpoint будет иметь как минимум один ответ с кодом `422` для `InvalidRequestErrors`.

Вот один пример ответа для `InvalidRequestErrors`.

```json
{
  "type_": "invalid-request-errors",
  "status": 422,
  "title": "Missing",
  "detail": [
    {
      "type": "MissingRequestParam",
      "location": "query",
      "param": "q",
      "message": "Param is Missing"
    },
    {
      "type": "MissingRequestParam",
      "location": "query",
      "param": "r",
      "message": "Param is Missing"
    }
  ],
  "instance": "/users"
}
```

- Чтобы изменить создание ответа, используйте `lihil.problems.problem_solver` для регистрации вашего обработчика.
- Чтобы изменить документацию, переопределите `DetailBase.__json_example__` и `DetailBase.__problem_detail__`.
- Чтобы расширить детали ошибки, предоставьте typevar при наследовании `HTTPException[T]`.