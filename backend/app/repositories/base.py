"""Base repository foundation."""

from typing import Optional
from pymongo.database import Database
from app.core.database import get_database


class BaseRepository:
    """Base repository establishing database access pattern for future domain repositories."""

    def __init__(self, db: Optional[Database] = None) -> None:
        self._db = db

    @property
    def db(self) -> Database:
        """Return the active MongoDB database instance, or raise RuntimeError if disconnected."""
        database = self._db or get_database()
        if database is None:
            raise RuntimeError("Database connection is not initialized. Ensure MongoDB is connected.")
        return database
