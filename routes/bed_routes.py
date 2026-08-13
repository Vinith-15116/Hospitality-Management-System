from flask import Blueprint, jsonify, request
from config import DB_CONFIG
import mysql.connector


bed_bp = Blueprint("bed", __name__)


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
# GET ALL BEDS
# =========================================================

@bed_bp.route("/api/beds", methods=["GET"])
def get_beds():

    conn = None
    cursor = None

    try:

        conn = get_db_connection()

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                b.`Bed ID` AS BedID,
                b.`Ward` AS Ward,
                b.`Room` AS Room,
                b.`Bed No.` AS BedNo,
                b.`Type` AS Type,

                COALESCE(
                    GROUP_CONCAT(
                        DISTINCT p.PatientName
                        ORDER BY p.PatientName
                        SEPARATOR '||'
                    ),
                    NULLIF(b.`Patient`, '')
                ) AS Patient,

                CASE
    WHEN COUNT(p.PatientID) > 0
        THEN 'Occupied'

    WHEN b.`Patient` IS NULL
        OR b.`Patient` = ''
        OR b.`Patient` = '-'
        THEN 'Available'

    WHEN b.`Status` = 'Empty'
        THEN 'Available'

    ELSE b.`Status`
END AS Status
            FROM beds b

            LEFT JOIN patients p
                ON p.BedID = b.`Bed ID`

            GROUP BY
                b.`Bed ID`,
                b.`Ward`,
                b.`Room`,
                b.`Bed No.`,
                b.`Type`,
                b.`Patient`,
                b.`Status`

            ORDER BY
                b.`Ward`,
                b.`Room`,
                b.`Bed No.`
        """)

        beds = cursor.fetchall()

        return jsonify({
            "success": True,
            "beds": beds
        })

    except Exception as e:

        print("GET BEDS ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =========================================================
# ADD BED
# =========================================================

@bed_bp.route("/api/beds", methods=["POST"])
def add_bed():

    conn = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "error": "No bed data received"
            }), 400


        bed_id = data.get("BedID")
        ward = data.get("Ward")
        room = data.get("Room")
        bed_no = data.get("BedNo")
        bed_type = data.get("Type")
        patient = data.get("Patient")
        status = data.get("Status") or "Available"


        # ---------------------------------------------
        # REQUIRED FIELDS
        # ---------------------------------------------

        if not bed_id:
            return jsonify({
                "success": False,
                "error": "Bed ID is required"
            }), 400

        if not ward:
            return jsonify({
                "success": False,
                "error": "Ward is required"
            }), 400

        if not room:
            return jsonify({
                "success": False,
                "error": "Room number is required"
            }), 400

        if not bed_no:
            return jsonify({
                "success": False,
                "error": "Bed number is required"
            }), 400

        if not bed_type:
            return jsonify({
                "success": False,
                "error": "Bed type is required"
            }), 400


        conn = get_db_connection()

        cursor = conn.cursor(dictionary=True)


        # ---------------------------------------------
        # CHECK DUPLICATE BED
        # ---------------------------------------------

        cursor.execute("""
            SELECT `Bed ID`
            FROM beds
            WHERE `Bed ID` = %s
            LIMIT 1
        """, (bed_id,))

        existing = cursor.fetchone()

        if existing:

            return jsonify({
                "success": False,
                "error": f"Bed ID {bed_id} already exists"
            }), 409


        # ---------------------------------------------
        # INSERT
        # ---------------------------------------------

        cursor.execute("""
            INSERT INTO beds
            (
                `Bed ID`,
                `Ward`,
                `Room`,
                `Bed No.`,
                `Type`,
                `Patient`,
                `Status`
            )
            VALUES
            (%s, %s, %s, %s, %s, %s, %s)
        """, (
            bed_id,
            ward,
            room,
            bed_no,
            bed_type,
            patient or "",
            status
        ))


        conn.commit()


        return jsonify({
            "success": True,
            "message": "Bed added successfully",
            "BedID": bed_id
        }), 201


    except Exception as e:

        if conn:
            conn.rollback()

        print("ADD BED ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =========================================================
# UPDATE BED
# =========================================================

@bed_bp.route("/api/beds/<path:bed_id>", methods=["PUT"])
def update_bed(bed_id):

    conn = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "error": "No bed data received"
            }), 400


        ward = data.get("Ward")
        room = data.get("Room")
        bed_no = data.get("BedNo")
        bed_type = data.get("Type")
        patient = data.get("Patient")
        status = data.get("Status") or "Available"


        conn = get_db_connection()

        cursor = conn.cursor()


        # ---------------------------------------------
        # CHECK BED
        # ---------------------------------------------

        cursor.execute("""
            SELECT `Bed ID`
            FROM beds
            WHERE `Bed ID` = %s
            LIMIT 1
        """, (bed_id,))

        existing = cursor.fetchone()

        if not existing:

            return jsonify({
                "success": False,
                "error": f"Bed ID {bed_id} not found"
            }), 404


        # ---------------------------------------------
        # UPDATE
        # ---------------------------------------------

        cursor.execute("""
            UPDATE beds
            SET
                `Ward` = %s,
                `Room` = %s,
                `Bed No.` = %s,
                `Type` = %s,
                `Patient` = %s,
                `Status` = %s
            WHERE `Bed ID` = %s
        """, (
            ward,
            room,
            bed_no,
            bed_type,
            patient or "",
            status,
            bed_id
        ))


        conn.commit()


        return jsonify({
            "success": True,
            "message": "Bed updated successfully"
        })


    except Exception as e:

        if conn:
            conn.rollback()

        print("UPDATE BED ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =========================================================
# DELETE BED
# =========================================================

@bed_bp.route("/api/beds/<path:bed_id>", methods=["DELETE"])
def delete_bed(bed_id):

    conn = None
    cursor = None

    try:

        conn = get_db_connection()

        cursor = conn.cursor()


        # ---------------------------------------------
        # CHECK IF BED EXISTS
        # ---------------------------------------------

        cursor.execute("""
            SELECT `Bed ID`
            FROM beds
            WHERE `Bed ID` = %s
            LIMIT 1
        """, (bed_id,))

        existing = cursor.fetchone()

        if not existing:

            return jsonify({
                "success": False,
                "error": f"Bed ID {bed_id} not found"
            }), 404


        # ---------------------------------------------
        # DELETE
        # ---------------------------------------------

        cursor.execute("""
            DELETE FROM beds
            WHERE `Bed ID` = %s
        """, (bed_id,))


        conn.commit()


        return jsonify({
            "success": True,
            "message": "Bed deleted successfully"
        })


    except Exception as e:

        if conn:
            conn.rollback()

        print("DELETE BED ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()