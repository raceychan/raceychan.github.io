# =========== Case of encapsulation ===========


## Break 1:


class DBConnection: ...


class OrderRepo:
    def __init__(self, conn: DBConnection | None = None) -> None:
        self._conn = conn


## Break 2


class UserRepo:
    def __init__(self) -> None:
        pass


class UserService:
    def __init__(self, user_repository: UserRepo):
        self._user_repository = user_repository


service = UserService(UserRepo())


service._user_repository


# =========== Case of


class A:
    def get(self, name: str) -> str:
        return "a"


class B(A):
    def get(self, b: int) -> int:
        return 5
