"""
Declarative base that every ORM model (app/database/models.py) inherits
from. Kept in its own file so Alembic (or any migration tool) can import
just the metadata without pulling in the full app.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
