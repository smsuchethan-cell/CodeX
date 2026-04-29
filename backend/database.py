import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Reads DATABASE_URL from environment; falls back to local dev default.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Va%4017022005@localhost:5432/nagaraiq"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()