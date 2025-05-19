from typing import Any, Protocol, TypedDict


class NormalizedEvent(TypedDict):
    # classfields
    event_type: str
    source: str
    version: str

    # base fields
    event_id: str
    entity_id: str
    timestamp: str

    # current fields
    event_body: dict[str, Any]


class IEvent(Protocol):

    @property
    def event_id(self) -> str: ...

    @property
    def entity_id(self) -> str: ...

    @property
    def timestamp(self) -> str: ...

    @classmethod
    def __type_id__(cls) -> str: ...

    def __normalized__(self) -> NormalizedEvent: ...

    def jsonize(self) -> bytes: ...
