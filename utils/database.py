# database.py
import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Vinith15116",
    database="hospital_hms"
)

cursor = db.cursor(dictionary=True)