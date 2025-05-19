from datetime import UTC, datetime
from functools import singledispatchmethod
from typing import ClassVar, Self, Sequence, cast
from uuid import uuid4

from .interface import IEvent, NormalizedEvent

# TODO: rename to folder message
# add a Command Model, with type registry


def uuid_factory() -> str:
    return str(uuid4())


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


def deafult_typeid(cls: type["IEvent"]) -> str:
    """
    generate a type_id based on event class

    e.g.
    "demo.domain.event:UserCreated"
    """
    return f"{cls.__module__}:{cls.__name__}"


try:
    from msgspec import Struct
except ImportError:
    pass
else:

    from msgspec import field as msgspec_field
    from msgspec.json import encode as _msgspecencode

    class MsgSpecEvent(Struct, frozen=True, kw_only=True):
        __source__: ClassVar[str] = "unspecified"  # project name, like demo
        __version__: ClassVar[str] = "1"  # specversion

        entity_id: str
        event_id: str = msgspec_field(default_factory=uuid_factory)
        timestamp: str = msgspec_field(default_factory=utc_now)

        @classmethod
        def __type_id__(cls) -> str:
            "generate a unique id for event type, e.g. 'demo.domain.event:UserCreated', if class is renamed make sure to update this method"
            return deafult_typeid(cls)

        def jsonize(self) -> bytes:
            return _msgspecencode(self)

        def __normalized__(self) -> NormalizedEvent:
            base_fields = MsgSpecEvent.__struct_fields__
            current_only_fields = self.__struct_fields__[: -len(base_fields)]

            mapping = {f: getattr(self, f) for f in base_fields}
            event_body = {f: getattr(self, f) for f in current_only_fields}

            mapping["event_type"] = deafult_typeid(self.__class__)
            mapping["version"] = self.__version__
            mapping["source"] = self.__source__
            mapping["event_body"] = event_body
            return cast(NormalizedEvent, mapping)

    class MsgSpecEntity(Struct, kw_only=True):
        entity_id: str

        @singledispatchmethod
        @classmethod
        def apply(cls, event: IEvent) -> "Self":
            raise NotImplementedError

        @apply.register
        def _(self, _: object) -> "Self":
            raise NotImplementedError

        @classmethod
        def rebuild(cls, events: Sequence[IEvent]) -> "Self":
            create, rest = events[0], events[1:]
            self = cls.apply(create)

            for e in rest:
                self.apply(e)

            return self


try:
    from pydantic import BaseModel, ConfigDict, Field
except ImportError:
    pass
else:

    class PydanticEvent(BaseModel):
        __source__: ClassVar[str] = "unspecified"  # project name, like demo
        __version__: ClassVar[str] = "1"  # specversion

        entity_id: str
        event_id: str = Field(default_factory=uuid_factory)
        timestamp: str = Field(default_factory=utc_now)

        model_config = ConfigDict(frozen=True)

        @classmethod
        def __type_id__(cls) -> str:
            "generate a unique id for event type, e.g. 'demo.domain.event:UserCreated', if class is renamed make sure to update this method"
            return deafult_typeid(cls)

        def jsonize(self) -> bytes:
            return self.__pydantic_serializer__.to_json(self)

        def __normalized__(self) -> NormalizedEvent:
            base_fields = PydanticEvent.__pydantic_fields__.keys()
            current_only_fields = list(self.__pydantic_fields__.keys())[
                : -len(base_fields)
            ]

            mapping = {f: getattr(self, f) for f in base_fields}
            event_body = {f: getattr(self, f) for f in current_only_fields}

            mapping["event_type"] = deafult_typeid(self.__class__)
            mapping["version"] = self.__version__
            mapping["source"] = self.__source__
            mapping["event_body"] = event_body
            return cast(NormalizedEvent, mapping)

    class PydanticEntity(BaseModel):
        entity_id: str

        @singledispatchmethod
        @classmethod
        def apply(cls, event: PydanticEvent) -> "Self":
            raise NotImplementedError

        @apply.register
        def _(self, _: object) -> "Self":
            raise NotImplementedError

        @classmethod
        def rebuild(cls, events: Sequence[PydanticEvent]) -> "Self":
            create, rest = events[0], events[1:]
            self = cls.apply(create)

            for e in rest:
                self.apply(e)

            return self


import json
from dataclasses import asdict, dataclass, field


@dataclass(kw_only=True, frozen=True)
class DataclassEvent:
    __source__: ClassVar[str] = "unspecified"  # project name, like demo
    __version__: ClassVar[str] = "1"  # specversion

    entity_id: str
    event_id: str = field(default_factory=uuid_factory)
    timestamp: str = field(default_factory=utc_now)

    @classmethod
    def __type_id__(cls) -> str:
        "generate a unique id for event type, e.g. 'demo.domain.event:UserCreated', if class is renamed make sure to update this method"
        return deafult_typeid(cls)

    def jsonize(self) -> bytes:
        return json.dumps(asdict(self)).encode()

    def __normalized__(self) -> NormalizedEvent:
        base_fields = DataclassEvent.__dataclass_fields__.keys()
        current_only_fields = list(self.__dataclass_fields__.keys())[
            : -len(base_fields)
        ]

        mapping = {f: getattr(self, f) for f in base_fields}
        event_body = {f: getattr(self, f) for f in current_only_fields}

        mapping["event_type"] = deafult_typeid(self.__class__)
        mapping["version"] = self.__version__
        mapping["source"] = self.__source__
        mapping["event_body"] = event_body
        return cast(NormalizedEvent, mapping)


@dataclass
class DataclassEntity:
    entity_id: str

    @singledispatchmethod
    @classmethod
    def apply(cls, event: DataclassEvent) -> "Self":
        raise NotImplementedError

    @apply.register
    def _(self, _: object) -> "Self":
        raise NotImplementedError

    @classmethod
    def rebuild(cls, events: Sequence[DataclassEvent]) -> "Self":
        create, rest = events[0], events[1:]
        self = cls.apply(create)

        for e in rest:
            self.apply(e)

        return self


try:
    Event = MsgSpecEvent  # type: ignore
except NameError:
    try:
        Event = PydanticEvent  # type: ignore
    except NameError:
        Event = DataclassEvent
