# nurse_routes.py
from flask import Blueprint, jsonify
from config import DB_CONFIG
import mysql.connector


nurse_bp = Blueprint("nurse", __name__)


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
# GET ALL NURSES
# =========================================================

@nurse_bp.route("/api/nurses", methods=["GET"])
def get_nurses():

    conn = None
    cursor = None

    try:

        conn = get_db_connection()

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                n.NRID,
                n.Name,
                n.Department,
                n.Qualification,
                n.Experience,
                n.Shift,
                n.Status,
                n.Ward,

                COUNT(p.PatientID) AS PatientCount,

                COALESCE(
                    GROUP_CONCAT(
                        DISTINCT p.PatientName
                        ORDER BY p.PatientName
                        SEPARATOR '||'
                    ),
                    ''
                ) AS PatientNames

            FROM nurses n

            LEFT JOIN patients p
                ON p.NurseID = n.NRID

            GROUP BY
                n.NRID,
                n.Name,
                n.Department,
                n.Qualification,
                n.Experience,
                n.Shift,
                n.Status,
                n.Ward

            ORDER BY n.Name ASC
        """)

        nurses = cursor.fetchall()

        return jsonify({
            "success": True,
            "nurses": nurses
        })

    except Exception as e:

        print("GET NURSES ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()