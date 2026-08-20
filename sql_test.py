import duckdb

con = duckdb.connect("automation-workspace/data.db")

con.execute("""
CREATE TABLE IF NOT EXISTS test (
    id INTEGER,
    name VARCHAR,
    value DOUBLE
)
""")

con.execute("""
INSERT INTO test VALUES
(1, 'Test', 100.5),
(2, 'Demo', 250.75)
""")

rows = con.execute("SELECT * FROM test").fetchall()

print(rows)

con.close()

print("SQL ENGINE READY")
