# database.py
import sqlite3

db = sqlite3.connect("hospital.db", check_same_thread=False)
db.row_factory = sqlite3.Row

cursor = db.cursor()