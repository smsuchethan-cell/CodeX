import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="Va@17022005",
        dbname="postgres"
    )
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("SELECT 1 FROM pg_database WHERE datname='nagaraiq'")
    exists = cur.fetchone()

    if not exists:
        cur.execute("CREATE DATABASE nagaraiq")
        print("SUCCESS: Database 'nagaraiq' created.")
    else:
        print("OK: Database 'nagaraiq' already exists.")

    cur.close()
    conn.close()

except Exception as e:
    print(f"ERROR: {e}")
