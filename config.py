import os
from dotenv import load_dotenv

load_dotenv()

# =========================================================
# DATABASE CONFIGURATION
# Local + Railway
# =========================================================

DB_HOST = os.getenv("MYSQLHOST") or os.getenv("DB_HOST") or "localhost"

DB_USER = os.getenv("MYSQLUSER") or os.getenv("DB_USER") or "root"

DB_PASSWORD = os.getenv("MYSQLPASSWORD") or os.getenv("DB_PASSWORD") or ""

DB_NAME = os.getenv("MYSQLDATABASE") or os.getenv("DB_NAME") or "hospital_hms"

DB_PORT = int(
    os.getenv("MYSQLPORT")
    or os.getenv("DB_PORT")
    or "3306"
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