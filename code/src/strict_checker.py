# =========== Case of encapsulation ===========


## Break 1:

class UserRepo:
    def __init__(self, engine: Engine | None = None) -> None:
        self._engine = engine

    




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
