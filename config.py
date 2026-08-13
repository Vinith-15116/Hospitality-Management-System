import os


# =========================================================
# DATABASE CONFIGURATION
# =========================================================

DB_HOST = os.getenv("DB_HOST", "localhost")

DB_USER = os.getenv("DB_USER", "root")

DB_PASSWORD = os.getenv("DB_PASSWORD", "")

DB_NAME = os.getenv("DB_NAME", "hospital_hms")

DB_PORT = int(
    os.getenv("DB_PORT", "3306")
)


# =========================================================
# DATABASE CONFIGURATION OBJECT
# =========================================================

DB_CONFIG = {
    "host": DB_HOST,
    "user": DB_USER,
    "password": DB_PASSWORD,
    "database": DB_NAME,
    "port": DB_PORT
}