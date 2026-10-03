"""Tests for database manager, base repository, and lifecycle."""

import os
from unittest.mock import MagicMock
import pytest
from pymongo.database import Database

from app.core.database import DatabaseManager, db_manager
from app.repositories.base import BaseRepository


def test_database_manager_unconfigured() -> None:
    """Verify DatabaseManager behaves safely when URI is not configured."""
    manager = DatabaseManager()
    manager.connect()
    assert manager.get_database() is None

    health = manager.check_health()
    assert health["status"] == "unconfigured"
    assert health["connected"] is False


def test_base_repository_uninitialized_raises() -> None:
    """Verify BaseRepository raises RuntimeError when database is not connected."""
    repo = BaseRepository(db=None)
    # Ensure global db is disconnected in test
    if db_manager.get_database() is None:
        with pytest.raises(RuntimeError, match="Database connection is not initialized"):
            _ = repo.db


def test_base_repository_with_database_instance() -> None:
    """Verify BaseRepository returns provided Database instance."""
    mock_db = MagicMock(spec=Database)
    repo = BaseRepository(db=mock_db)
    assert repo.db is mock_db


@pytest.mark.skipif(
    os.getenv("MONGODB_INTEGRATION_TEST") != "true",
    reason="Atlas integration test requires MONGODB_INTEGRATION_TEST=true and valid .env",
)
def test_live_atlas_connection() -> None:
    """Live integration test against MongoDB Atlas (optional, environment-controlled)."""
    manager = DatabaseManager()
    manager.connect()
    assert manager.get_database() is not None
    health = manager.check_health()
    assert health["connected"] is True
    manager.close()
