"""
pre-defined event model and event table
"""

try:
    from .eventstore import EventStore as EventStore
    from .table import EventTable as EventTable
except ModuleNotFoundError: # slqlalchemy not installed
    pass

from .interface import IEvent as IEvent
from .model import NormalizedEvent as NormalizedEvent
