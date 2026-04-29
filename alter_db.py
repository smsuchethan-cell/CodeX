import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Va%4017022005@localhost:5432/nagaraiq"
)

engine = create_engine(DATABASE_URL)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE complaints ADD COLUMN officer_id VARCHAR(255);"))
        conn.commit()
        print("Successfully added officer_id column to complaints table.")
except Exception as e:
    print("Error or already exists:", e)
