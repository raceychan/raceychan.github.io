from typing import ClassVar

class User:
    _users: ClassVar[dict[tuple[str, int], "User"]] = {}

    def __new__(cls, name: str, age: int) -> "User":
        if not (u := cls._users.get((name, age))):
            cls._users[(name, age)] = u = super().__new__(cls)
        return u

    def __init__(self, name: str, age: int):
       self.name = name
       self.age = age