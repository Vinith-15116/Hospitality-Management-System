import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("MYSQLHOST", os.getenv("DB_HOST", "localhost"))
DB_USER = os.getenv("MYSQLUSER", os.getenv("DB_USER", "root"))
DB_PASSWORD = os.getenv("MYSQLPASSWORD", os.getenv("DB_PASSWORD", ""))
DB_NAME = os.getenv("MYSQLDATABASE", os.getenv("DB_NAME", "hospital_hms"))

DB_PORT = int(
    os.getenv(
        "MYSQLPORT",
        os.getenv("DB_PORT", "3306")
    )
)

DB_CONFIG = {
    "host": DB_HOST,
    "user": DB_USER,
    "password": DB_PASSWORD,
    "database": DB_NAME,
    "port": DB_PORT
}