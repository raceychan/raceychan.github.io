from lihil import Empty, Lihil, Resp, Route, status
from lihil.interface import Base
from lihil.problems import HTTPException


class AddressOutOfScopeProblem(Base):
    current_address: str
    service_radius: float
    distance: float

    message: str = ""

    def __post_init__(self):
        self.message = f"Your current address {self.current_address} is {self.distance} miles away and our service radius is {self.service_radius}"


class InvalidOrderError(HTTPException[AddressOutOfScopeProblem]):
    "Address out of service zone"

    instance: str
    detail: AddressOutOfScopeProblem

    @classmethod
    def __json_example__(cls):
        return {
            "type_": "invalid-order-error",
            "title": "Address out of service zone",
            "instance": "2cd20e0c-9ddc-4fdc-8f61-b32f62ac784d",
            "status": 422,
            "detail": AddressOutOfScopeProblem(
                current_address="home", service_radius=3.5, distance=4
            ).asdict(),
        }


orders = Route("orders")


@orders.post(errors=[InvalidOrderError])
async def create_orders() -> Resp[Empty, status.CREATED]: ...


lhl = Lihil(routes=[orders])


if __name__ == "__main__":
    lhl.run(__file__)
