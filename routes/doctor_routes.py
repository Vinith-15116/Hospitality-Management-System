# doctor_routes.py
from flask import Blueprint, jsonify
from config import DB_CONFIG
import mysql.connector


doctor_bp = Blueprint("doctor", __name__)


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():

    return mysql.connector.connect(
        host=DB_CONFIG["host"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        database=DB_CONFIG["database"]
    )


# =========================================================
# GET ALL DOCTORS
# =========================================================

@doctor_bp.route("/api/doctors", methods=["GET"])
def get_doctors():

    conn = None
    cursor = None

    try:

        conn = get_db_connection()

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
    SELECT
        d.DRID,
        d.Name,
        d.Department,
        d.Qualification,
        d.Experience,
        d.Phone,
        d.Status,

        COUNT(p.PatientID) AS PatientCount,

        COALESCE(
            GROUP_CONCAT(
                DISTINCT p.PatientName
                ORDER BY p.PatientName
                SEPARATOR '||'
            ),
            ''
        ) AS PatientNames

    FROM doctors d

    LEFT JOIN patients p
        ON p.DoctorAssigned = d.Name

    GROUP BY
        d.DRID,
        d.Name,
        d.Department,
        d.Qualification,
        d.Experience,
        d.Phone,
        d.Status

    ORDER BY d.Name ASC
""")

        doctors = cursor.fetchall()

        return jsonify({
            "success": True,
            "doctors": doctors
        })

    except Exception as e:

        print("GET DOCTORS ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()