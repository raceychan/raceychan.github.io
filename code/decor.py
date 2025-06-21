from functools import partial
from typing import Callable, ParamSpec, TypeVar

P = ParamSpec("P")
T = TypeVar("T")


# from sqlalchemy import Integer

def is_even(x: int) -> bool:
    return (x % 2) == 0


def larger_than(x: int, threshold: int) -> bool:
    return x > threshold


def meets_conditions(*conditions: Callable[[T], bool], target: T) -> bool:
    return all(condition(target) for condition in conditions)


def check_result(*conditions: Callable[[T], bool]):
    def decorator(func: Callable[P, T]):
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            result = func(*args, **kwargs)
            if not meets_conditions(*conditions, target=result):
                raise ValueError("Return value did not meet required conditions")
            return result

        return wrapper

    return decorator


@check_result(is_even, partial(larger_than, threshold=5))
def add(a: int, b: int) -> int:
    return a + b


assert add(3, 5) == 8

# add(1, 1)  # this would fail
# add(4, 3)  # this would fail too
