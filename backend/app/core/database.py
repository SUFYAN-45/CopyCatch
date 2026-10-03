"""MongoDB database client and connection lifecycle manager."""

import logging
from typing import Any, Dict, Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, PyMongoError

from app.core.config import settings

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manages the MongoDB client instance and connection state."""

    def __init__(self) -> None:
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self._last_error: Optional[str] = None

    def connect(self) -> None:
        """Initialize the MongoDB client and verify connectivity via ping."""
        if not settings.is_mongodb_configured:
            logger.info("MongoDB URI is not configured. Database is currently inactive.")
            self.client = None
            self.db = None
            self._last_error = "MongoDB URI not configured in environment."
            return

        try:
            logger.info("Connecting to MongoDB Atlas...")
            self.client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                appname="CopyCatch",
            )
            # Verify connectivity via admin ping command
            self.client.admin.command("ping")
            self.db = self.client[settings.MONGODB_DATABASE]
            self._last_error = None
            logger.info("Successfully connected to MongoDB Atlas database: '%s'", settings.MONGODB_DATABASE)
        except (ConnectionFailure, PyMongoError) as err:
            self._last_error = str(err)
            self.db = None
            logger.error("Failed to connect to MongoDB: %s", err)
            raise

    def close(self) -> None:
        """Close the MongoDB client cleanly upon application shutdown."""
        if self.client is not None:
            logger.info("Closing MongoDB client connection...")
            self.client.close()
            self.client = None
            self.db = None
            logger.info("MongoDB connection closed.")

    def get_database(self) -> Optional[Database]:
        """Return the active MongoDB Database instance, or None if disconnected."""
        return self.db

    def check_health(self) -> Dict[str, Any]:
        """Verify MongoDB connectivity and return a structured health report."""
        if not settings.is_mongodb_configured:
            return {
                "status": "unconfigured",
                "connected": False,
                "database": settings.MONGODB_DATABASE,
                "message": "MongoDB URI is not configured in local environment (.env).",
            }

        if self.client is None:
            return {
                "status": "disconnected",
                "connected": False,
                "database": settings.MONGODB_DATABASE,
                "message": self._last_error or "MongoDB client is not initialized.",
            }

        try:
            self.client.admin.command("ping")
            return {
                "status": "healthy",
                "connected": True,
                "database": settings.MONGODB_DATABASE,
                "message": f"Successfully connected to MongoDB Atlas database '{settings.MONGODB_DATABASE}'.",
            }
        except (ConnectionFailure, PyMongoError) as err:
            self._last_error = str(err)
            return {
                "status": "unhealthy",
                "connected": False,
                "database": settings.MONGODB_DATABASE,
                "message": f"MongoDB connectivity check failed: {err}",
            }


db_manager = DatabaseManager()


def get_database() -> Optional[Database]:
    """Dependency / helper function to access the active database."""
    return db_manager.get_database()
