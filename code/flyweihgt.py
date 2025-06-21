from dataclasses import dataclass
from functools import lru_cache

import re


re.compile()


@dataclass
class User:
    name: str
    age: int


class UserFacotry:
    _users: dict[tuple[str, int], User] = {}

    def create_user(self, name: str, age: int) -> User:
        if not (u := self._users.get((name, age))):
            u = User(name, age)
            self._users[(name, age)] = u
        return u


# =========== instead ===========


@lru_cache(maxsize=None)
def create_user(name: str, age: int) -> User:
    return User(name, age)
