from typing import Final

from ..errors import UnregisteredEventError
from .interface import IEvent

__EventTypeRegistry__: Final[dict[str, type]] = {}


def all_subclasses[T](cls: type[T]) -> set[type[T]]:
    return set(cls.__subclasses__()).union(
        *[all_subclasses(c) for c in cls.__subclasses__()]
    )


def get_event_cls(event_type_id: str, event_cls: type[IEvent]) -> type["IEvent"]:
    try:
        return __EventTypeRegistry__[event_type_id]
    except KeyError:
        __EventTypeRegistry__.update(
            {cls.__type_id__(): cls for cls in all_subclasses(event_cls)}
        )

    try:
        return __EventTypeRegistry__[event_type_id]
    except KeyError:
        raise UnregisteredEventError(event_type_id)
