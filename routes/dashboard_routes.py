from flask import Blueprint, jsonify
import mysql.connector
from config import DB_CONFIG


dashboard_bp = Blueprint("dashboard", __name__)


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


# =========================================================
# DASHBOARD DATA
# =========================================================

@dashboard_bp.route("/api/dashboard-data", methods=["GET"])
def dashboard_data():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)


        # =================================================
        # PATIENTS
        # =================================================

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM patients
        """)

        total_patients = cursor.fetchone()["total"]


        # =================================================
        # ADMISSIONS
        # =================================================

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM patients
            WHERE PatientStatus = 'Admitted'
        """)

        admissions = cursor.fetchone()["total"]


        # =================================================
        # DISCHARGES
        # =================================================

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM patients
            WHERE PatientStatus IN ('Recovered', 'Discharged')
        """)

        discharges = cursor.fetchone()["total"]


        # =================================================
        # DOCTORS
        # =================================================

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM doctors
        """)

        total_doctors = cursor.fetchone()["total"]


        # =================================================
        # NURSES
        # =================================================

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM nurses
        """)

        total_nurses = cursor.fetchone()["total"]


        # =================================================
        # BEDS
        # =================================================

        # Total beds

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM beds
        """)

        total_beds = cursor.fetchone()["total"]


        # Available beds
        # Empty = Available

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM beds
            WHERE Status = 'Empty'
        """)

        available_beds = cursor.fetchone()["total"]


        # Occupied beds

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM beds
            WHERE Status = 'Occupied'
        """)

        occupied_beds = cursor.fetchone()["total"]


        # Maintenance beds

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM beds
            WHERE Status = 'Maintenance'
        """)

        maintenance_beds = cursor.fetchone()["total"]


        # =================================================
        # PHARMACY
        # =================================================

        # Total medicine quantity

        cursor.execute("""
            SELECT COALESCE(SUM(Quantity), 0) AS total
            FROM pharmacy
        """)

        medicine_stock = cursor.fetchone()["total"]


        # Total different medicines

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM pharmacy
        """)

        total_medicines = cursor.fetchone()["total"]


        # Low stock medicines

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM pharmacy
            WHERE Status = 'Low Stock'
        """)

        low_stock = cursor.fetchone()["total"]


        # Expired medicines

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM pharmacy
            WHERE Status = 'Expired'
        """)

        expired_medicines = cursor.fetchone()["total"]


        # =================================================
        # RECENT ADMISSIONS
        # =================================================

        cursor.execute("""
            SELECT
                p.PatientID,
                p.PatientName,
                p.DoctorAssigned,
                b.Ward,
                p.PatientStatus
            FROM patients p
            LEFT JOIN beds b
                ON p.BedID = b.`Bed ID`
            ORDER BY p.id DESC
            LIMIT 6
        """)

        recent_admissions = cursor.fetchall()


        # =================================================
        # DISEASE DISTRIBUTION
        # =================================================

        cursor.execute("""
            SELECT
                Disease,
                COUNT(*) AS total
            FROM patients
            WHERE Disease IS NOT NULL
              AND Disease != ''
            GROUP BY Disease
            ORDER BY total DESC
            LIMIT 10
        """)

        disease_distribution = cursor.fetchall()


        # =================================================
        # MONTHLY PATIENTS
        # =================================================

        cursor.execute("""
            SELECT
                DATE_FORMAT(
                    STR_TO_DATE(AdmissionDate, '%Y-%m-%d'),
                    '%Y-%m'
                ) AS month,
                COUNT(*) AS total
            FROM patients
            WHERE AdmissionDate IS NOT NULL
              AND AdmissionDate != ''
              AND STR_TO_DATE(
                    AdmissionDate,
                    '%Y-%m-%d'
                  ) IS NOT NULL
            GROUP BY month
            ORDER BY month
        """)

        monthly_patients = cursor.fetchall()


        # =================================================
        # RESPONSE
        # =================================================

        return jsonify({

            "success": True,


            # Dashboard statistics

            "patients": total_patients,

            "doctors": total_doctors,

            "nurses": total_nurses,

            "beds": total_beds,

            "available_beds": available_beds,

            "occupied_beds": occupied_beds,

            "maintenance_beds": maintenance_beds,

            "admissions": admissions,

            "discharges": discharges,

            "medicine_stock": medicine_stock,

            "total_medicines": total_medicines,

            "low_stock": low_stock,

            "expired_medicines": expired_medicines,


            # Recent admissions

            "recent_admissions": recent_admissions,


            # Disease distribution

            "disease_distribution": disease_distribution,


            # Monthly patients

            "monthly_patients": monthly_patients

        })


    # =====================================================
    # ERROR HANDLING
    # =====================================================

    except Exception as e:

        print("DASHBOARD ERROR:", e)

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


    # =====================================================
    # CLOSE DATABASE
    # =====================================================

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()