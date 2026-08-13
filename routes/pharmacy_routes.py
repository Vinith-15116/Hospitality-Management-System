# pharmacy_routes.py
from flask import Blueprint, jsonify, request
from config import DB_CONFIG
import mysql.connector
from datetime import datetime


pharmacy_bp = Blueprint("pharmacy", __name__)


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
# GET ALL MEDICINES
# =========================================================

@pharmacy_bp.route("/api/pharmacy", methods=["GET"])
def get_medicines():

    conn = None
    cursor = None

    try:

        conn = get_db_connection()

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                `Medicine ID` AS MedicineID,
                `Medicine Name` AS MedicineName,
                `Category` AS Category,
                `Quantity` AS Quantity,
                `Price` AS Price,
                `Expiry Date` AS ExpiryDate,
                `Status` AS Status
            FROM pharmacy
            ORDER BY `Medicine Name` ASC
        """)

        medicines = cursor.fetchall()

        # ---------------------------------------------
        # Calculate status automatically
        # ---------------------------------------------

        today = datetime.now().date()

        for medicine in medicines:

            expiry = medicine["ExpiryDate"]
            quantity = medicine["Quantity"] or 0

            # Convert expiry text to date
            expiry_date = None

            if expiry:

                try:
                    expiry_date = datetime.strptime(
                        str(expiry),
                        "%Y-%m-%d"
                    ).date()

                except ValueError:
                    expiry_date = None


            if expiry_date and expiry_date < today:

                medicine["Status"] = "Expired"

            elif quantity == 0:

                medicine["Status"] = "Out of Stock"

            elif quantity <= 20:

                medicine["Status"] = "Low Stock"

            else:

                medicine["Status"] = "In Stock"


        return jsonify({
            "success": True,
            "medicines": medicines
        })


    except Exception as e:

        print("GET PHARMACY ERROR:", e)

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
# ADD MEDICINE
# =========================================================

@pharmacy_bp.route("/api/pharmacy", methods=["POST"])
def add_medicine():

    conn = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "error": "No medicine data received"
            }), 400


        medicine_id = data.get("MedicineID")
        medicine_name = data.get("MedicineName")
        category = data.get("Category")
        quantity = data.get("Quantity")
        price = data.get("Price")
        expiry_date = data.get("ExpiryDate")


        # ---------------------------------------------
        # VALIDATION
        # ---------------------------------------------

        if not medicine_id:
            return jsonify({
                "success": False,
                "error": "Medicine ID is required"
            }), 400

        if not medicine_name:
            return jsonify({
                "success": False,
                "error": "Medicine Name is required"
            }), 400

        if not category:
            return jsonify({
                "success": False,
                "error": "Category is required"
            }), 400

        if quantity is None:
            return jsonify({
                "success": False,
                "error": "Quantity is required"
            }), 400

        if price is None:
            return jsonify({
                "success": False,
                "error": "Price is required"
            }), 400

        if not expiry_date:
            return jsonify({
                "success": False,
                "error": "Expiry Date is required"
            }), 400


        quantity = int(quantity)
        price = int(float(price))


        # ---------------------------------------------
        # AUTOMATIC STATUS
        # ---------------------------------------------

        try:

            expiry = datetime.strptime(
                str(expiry_date),
                "%Y-%m-%d"
            ).date()

        except ValueError:

            return jsonify({
                "success": False,
                "error": "Invalid expiry date"
            }), 400


        today = datetime.now().date()


        if expiry < today:

            status = "Expired"

        elif quantity == 0:

            status = "Out of Stock"

        elif quantity <= 20:

            status = "Low Stock"

        else:

            status = "In Stock"


        conn = get_db_connection()

        cursor = conn.cursor()


        # ---------------------------------------------
        # CHECK DUPLICATE ID
        # ---------------------------------------------

        cursor.execute("""
            SELECT `Medicine ID`
            FROM pharmacy
            WHERE `Medicine ID` = %s
            LIMIT 1
        """, (medicine_id,))


        existing = cursor.fetchone()


        if existing:

            return jsonify({
                "success": False,
                "error": f"Medicine ID {medicine_id} already exists"
            }), 409


        # ---------------------------------------------
        # INSERT
        # ---------------------------------------------

        cursor.execute("""
            INSERT INTO pharmacy
            (
                `Medicine ID`,
                `Medicine Name`,
                `Category`,
                `Quantity`,
                `Price`,
                `Expiry Date`,
                `Status`
            )
            VALUES
            (%s, %s, %s, %s, %s, %s, %s)
        """, (
            medicine_id,
            medicine_name,
            category,
            quantity,
            price,
            expiry_date,
            status
        ))


        conn.commit()


        return jsonify({
            "success": True,
            "message": "Medicine added successfully"
        }), 201


    except Exception as e:

        if conn:
            conn.rollback()

        print("ADD MEDICINE ERROR:", e)

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
# UPDATE MEDICINE
# =========================================================

@pharmacy_bp.route("/api/pharmacy/<path:medicine_id>", methods=["PUT"])
def update_medicine(medicine_id):

    conn = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "error": "No medicine data received"
            }), 400


        medicine_name = data.get("MedicineName")
        category = data.get("Category")
        quantity = data.get("Quantity")
        price = data.get("Price")
        expiry_date = data.get("ExpiryDate")


        quantity = int(quantity)
        price = int(float(price))


        expiry = datetime.strptime(
            str(expiry_date),
            "%Y-%m-%d"
        ).date()


        today = datetime.now().date()


        if expiry < today:

            status = "Expired"

        elif quantity == 0:

            status = "Out of Stock"

        elif quantity <= 20:

            status = "Low Stock"

        else:

            status = "In Stock"


        conn = get_db_connection()

        cursor = conn.cursor()


        # ---------------------------------------------
        # UPDATE
        # ---------------------------------------------

        cursor.execute("""
            UPDATE pharmacy
            SET
                `Medicine Name` = %s,
                `Category` = %s,
                `Quantity` = %s,
                `Price` = %s,
                `Expiry Date` = %s,
                `Status` = %s
            WHERE `Medicine ID` = %s
        """, (
            medicine_name,
            category,
            quantity,
            price,
            expiry_date,
            status,
            medicine_id
        ))


        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "error": "Medicine not found"
            }), 404


        conn.commit()


        return jsonify({
            "success": True,
            "message": "Medicine updated successfully"
        })


    except Exception as e:

        if conn:
            conn.rollback()

        print("UPDATE MEDICINE ERROR:", e)

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
# DELETE MEDICINE
# =========================================================

@pharmacy_bp.route("/api/pharmacy/<path:medicine_id>", methods=["DELETE"])
def delete_medicine(medicine_id):

    conn = None
    cursor = None

    try:

        conn = get_db_connection()

        cursor = conn.cursor()


        cursor.execute("""
            DELETE FROM pharmacy
            WHERE `Medicine ID` = %s
        """, (medicine_id,))


        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "error": "Medicine not found"
            }), 404


        conn.commit()


        return jsonify({
            "success": True,
            "message": "Medicine deleted successfully"
        })


    except Exception as e:

        if conn:
            conn.rollback()

        print("DELETE MEDICINE ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()