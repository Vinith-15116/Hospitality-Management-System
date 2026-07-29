from flask import Blueprint, jsonify, request
from utils.database import cursor, db

patient_bp = Blueprint("patient_bp", __name__)

# =====================================================
# GET ALL PATIENTS
# =====================================================

@patient_bp.route("/patients", methods=["GET"])
def get_patients():

    try:

        query = """
        SELECT
            id,
            PatientID,
            PatientName,
            Age,
            Gender,
            Disease,
            DoctorAssigned,
            PatientStatus,
            AdmissionDate,
            RoomNumber,
            BedID,
            EmergencyContact
        FROM patients
        ORDER BY id DESC
        """

        cursor.execute(query)

        patients = cursor.fetchall()

        return jsonify(patients), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# =====================================================
# GET SINGLE PATIENT
# =====================================================

@patient_bp.route("/patients/<int:id>", methods=["GET"])
def get_patient(id):

    try:

        query = """
        SELECT *
        FROM patients
        WHERE id=%s
        """

        cursor.execute(query, (id,))

        patient = cursor.fetchone()

        if patient is None:

            return jsonify({
                "success": False,
                "message": "Patient not found"
            }), 404

        return jsonify(patient), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
    # =====================================================
# ADD NEW PATIENT
# =====================================================

@patient_bp.route("/patients", methods=["POST"])
def add_patient():

    try:

        data = request.get_json()

        sql = """
        INSERT INTO patients
        (
            PatientID,
            PatientName,
            Age,
            Gender,
            Disease,
            DoctorAssigned,
            PatientStatus,
            AdmissionDate,
            RoomNumber,
            BedID,
            EmergencyContact
        )

        VALUES
        (
            %s,%s,%s,%s,%s,
            %s,%s,%s,%s,%s,%s
        )
        """

        values = (

            data.get("PatientID"),
            data.get("PatientName"),
            data.get("Age"),
            data.get("Gender"),
            data.get("Disease"),
            data.get("DoctorAssigned"),
            data.get("PatientStatus"),
            data.get("AdmissionDate"),
            data.get("RoomNumber"),
            data.get("BedID"),
            data.get("EmergencyContact")

        )

        cursor.execute(sql, values)

        db.commit()

        return jsonify({
            "success": True,
            "message": "Patient added successfully"
        }), 201

    except Exception as e:

        db.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# =====================================================
# UPDATE PATIENT
# =====================================================

@patient_bp.route("/patients/<int:id>", methods=["PUT"])
def update_patient(id):

    try:

        data = request.get_json()

        sql = """
        UPDATE patients
        SET

            PatientName=%s,
            Age=%s,
            Gender=%s,
            Disease=%s,
            DoctorAssigned=%s,
            PatientStatus=%s,
            AdmissionDate=%s,
            RoomNumber=%s,
            BedID=%s,
            EmergencyContact=%s

        WHERE id=%s
        """

        values = (

            data.get("PatientName"),
            data.get("Age"),
            data.get("Gender"),
            data.get("Disease"),
            data.get("DoctorAssigned"),
            data.get("PatientStatus"),
            data.get("AdmissionDate"),
            data.get("RoomNumber"),
            data.get("BedID"),
            data.get("EmergencyContact"),
            id

        )

        cursor.execute(sql, values)

        db.commit()

        return jsonify({
            "success": True,
            "message": "Patient updated successfully"
        }), 200

    except Exception as e:

        db.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
    # =====================================================
# DELETE PATIENT
# =====================================================

@patient_bp.route("/patients/<int:id>", methods=["DELETE"])
def delete_patient(id):

    try:

        cursor.execute(
            "DELETE FROM patients WHERE id=%s",
            (id,)
        )

        db.commit()

        return jsonify({
            "success": True,
            "message": "Patient deleted successfully"
        }), 200

    except Exception as e:

        db.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# =====================================================
# PATIENT DASHBOARD STATS
# =====================================================

@patient_bp.route("/patients/stats", methods=["GET"])
def patient_stats():

    try:

        cursor.execute("SELECT COUNT(*) AS total FROM patients")
        total = cursor.fetchone()["total"]

        cursor.execute("""
            SELECT COUNT(*) AS admitted
            FROM patients
            WHERE PatientStatus='Admitted'
        """)
        admitted = cursor.fetchone()["admitted"]

        cursor.execute("""
            SELECT COUNT(*) AS recovering
            FROM patients
            WHERE PatientStatus='Recovering'
        """)
        recovering = cursor.fetchone()["recovering"]

        cursor.execute("""
            SELECT COUNT(*) AS critical
            FROM patients
            WHERE PatientStatus='Critical'
        """)
        critical = cursor.fetchone()["critical"]

        cursor.execute("""
            SELECT COUNT(*) AS discharged
            FROM patients
            WHERE PatientStatus='Discharged'
        """)
        discharged = cursor.fetchone()["discharged"]

        return jsonify({
            "total": total,
            "admitted": admitted,
            "recovering": recovering,
            "critical": critical,
            "discharged": discharged
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500