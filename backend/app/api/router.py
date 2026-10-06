"""API router aggregation."""

from fastapi import APIRouter
from app.api.routes import analysis, health, references

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(analysis.router)
api_router.include_router(references.router)
