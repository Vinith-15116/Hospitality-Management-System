from flask import Blueprint, request, jsonify, render_template
import mysql.connector
import csv
import io
from datetime import datetime

from config import (
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
)


patient_bp = Blueprint(
    "patient",
    __name__
)


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():

    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )


# =========================================================
# PATIENTS PAGE
# =========================================================

@patient_bp.route("/patients")
def patients():

    return render_template("patients.html")


# =========================================================
# GET ALL PATIENTS
# =========================================================

@patient_bp.route("/patients/data", methods=["GET"])
def get_patients():

    try:

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT *
            FROM patients
            ORDER BY id ASC
        """)

        patients = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "patients": patients
        })

    except Exception as e:

        print("GET PATIENTS ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================
# PATIENT STATISTICS
# =========================================================

@patient_bp.route("/patients/stats", methods=["GET"])
def patient_stats():

    try:

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                COUNT(*) AS total,
                SUM(PatientStatus = 'Admitted') AS admitted,
                SUM(PatientStatus = 'Under Treatment') AS under_treatment,
                SUM(PatientStatus = 'Recovered') AS recovered
            FROM patients
        """)

        result = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "patients": {
                "total": result["total"] or 0,
                "admitted": result["admitted"] or 0,
                "under_treatment": result["under_treatment"] or 0,
                "recovered": result["recovered"] or 0
            }
        })

    except Exception as e:

        print("PATIENT STATS ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# =========================================================
# GET DOCTORS
# =========================================================

@patient_bp.route("/patients/doctors", methods=["GET"])
def get_doctors():

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
    SELECT
        DRID,
        Name,
        Department,
        Qualification,
        Experience,
        Phone,
        Status
    FROM doctors
    ORDER BY Name ASC
""")
        

        doctors = cursor.fetchall()

        cursor.close()
        conn.close()

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


# =========================================================
# GET WARDS
# =========================================================

@patient_bp.route("/patients/wards", methods=["GET"])
def get_wards():

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT DISTINCT Ward
            FROM beds
            WHERE Ward IS NOT NULL
              AND Ward != ''
            ORDER BY Ward ASC
        """)

        wards = [row[0] for row in cursor.fetchall()]

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "wards": wards
        })

    except Exception as e:

        print("GET WARDS ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================
# GET AVAILABLE BEDS BY WARD
# =========================================================

@patient_bp.route("/patients/beds/<ward>", methods=["GET"])
def get_available_beds(ward):

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                `Bed ID`,
                Ward,
                Room,
                `Bed No.`,
                Type,
                Patient,
                Status
            FROM beds
            WHERE Ward = %s
              AND Status = 'Empty'
            ORDER BY Room ASC, `Bed No.` ASC
        """, (ward,))

        beds = cursor.fetchall()

        cursor.close()
        conn.close()

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


# =========================================================
# GET NURSES BY WARD
# =========================================================

@patient_bp.route("/patients/nurses/<ward>", methods=["GET"])
def get_nurses_by_ward(ward):

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                NRID,
                Name,
                Department,
                Ward,
                Qualification,
                Experience,
                Shift,
                Status
            FROM nurses
            WHERE Ward = %s
              AND Status = 'Active'
            ORDER BY Name ASC
        """, (ward,))

        nurses = cursor.fetchall()

        cursor.close()
        conn.close()

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


# =========================================================
# GET PHARMACY MEDICINES
# =========================================================

@patient_bp.route("/patients/medicines", methods=["GET"])
def get_medicines():

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                `Medicine ID`,
                `Medicine Name`,
                Category,
                Quantity,
                Price,
                `Expiry Date`,
                Status
            FROM pharmacy
            WHERE Quantity > 0
            ORDER BY `Medicine Name` ASC
        """)

        medicines = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "medicines": medicines
        })

    except Exception as e:

        print("GET MEDICINES ERROR:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# =========================================================
# ADD PATIENT
# =========================================================

# =========================================================
# ADD PATIENT
# =========================================================

@patient_bp.route("/patients", methods=["POST"])
def add_patient():

    conn = None
    cursor = None

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No patient data received"
            }), 400


        # =================================================
        # ALL 37 PATIENT COLUMNS
        # =================================================

        columns = [
            "PatientID",
            "PatientName",
            "Age",
            "Gender",
            "Disease",
            "Allergies",
            "PreviousDiseases",
            "LabTestResults",
            "AdmissionDate",
            "RoomNumber",
            "BedID",
            "BedType",
            "NurseID",
            "DoctorAssigned",
            "MedicineRequired",
            "MedicineTime",
            "PatientStatus",
            "EmergencyContact",
            "DischargeDate",
            "Temperature",
            "BloodPressure",
            "SugarLevel",
            "HeartRate",
            "OxygenLevel",
            "WBCCount",
            "PlateletCount",
            "Hemoglobin",
            "FeverSymptom",
            "Cough",
            "Vomiting",
            "ChestPain",
            "Headache",
            "ShortnessOfBreath",
            "SeverityLevel",
            "MedicineQuantityUsed",
            "CurrentMedicineStock",
            "Season"
        ]


        # =================================================
        # GET VALUES
        # =================================================

        values = []

        for column in columns:

            value = data.get(column)

            if value == "":
                value = None

            values.append(value)


        # =================================================
        # REQUIRED FIELDS
        # =================================================

        if not data.get("PatientName"):
            return jsonify({
                "success": False,
                "error": "Patient name is required"
            }), 400


        if not data.get("Age"):
            return jsonify({
                "success": False,
                "error": "Patient age is required"
            }), 400


        if not data.get("Gender"):
            return jsonify({
                "success": False,
                "error": "Patient gender is required"
            }), 400


        if not data.get("Disease"):
            return jsonify({
                "success": False,
                "error": "Disease is required"
            }), 400


        # =================================================
        # DATABASE CONNECTION
        # =================================================

        conn = get_db_connection()

        cursor = conn.cursor(dictionary=True)


        # =================================================
        # GENERATE PATIENT ID
        # =================================================

        patient_id = data.get("PatientID")

        if not patient_id:

            patient_id = "P" + str(
                int(datetime.now().timestamp())
            )[-8:]

            values[0] = patient_id


        # =================================================
        # CHECK DUPLICATE PATIENT ID
        # =================================================

        cursor.execute(
            """
            SELECT PatientID
            FROM patients
            WHERE PatientID = %s
            LIMIT 1
            """,
            (patient_id,)
        )

        existing = cursor.fetchone()

        if existing:

            conn.rollback()

            return jsonify({
                "success": False,
                "error":
                    f"PatientID {patient_id} already exists"
            }), 409


        # =================================================
        # BED VALIDATION
        # =================================================

        bed_id = data.get("BedID")

        if bed_id:

            cursor.execute(
                """
                SELECT
                    `Bed ID`,
                    Ward,
                    Room,
                    `Bed No.`,
                    Type,
                    Patient,
                    Status
                FROM beds
                WHERE `Bed ID` = %s
                FOR UPDATE
                """,
                (bed_id,)
            )

            bed = cursor.fetchone()

            if not bed:

                conn.rollback()

                return jsonify({
                    "success": False,
                    "error":
                        f"Bed {bed_id} does not exist"
                }), 400


            # Only empty beds can be assigned

            if str(bed["Status"]).lower() != "empty":

                conn.rollback()

                return jsonify({
                    "success": False,
                    "error":
                        f"Bed {bed_id} is already occupied"
                }), 409


            # Automatically get room number

            values[9] = bed["Room"]


            # Automatically get bed type

            values[11] = bed["Type"]


            # =================================================
            # UPDATE BED
            # =================================================

            cursor.execute(
                """
                UPDATE beds
                SET
                    Patient = %s,
                    Status = 'Occupied'
                WHERE `Bed ID` = %s
                """,
                (
                    data.get("PatientName"),
                    bed_id
                )
            )


        # =================================================
        # NURSE VALIDATION
        # =================================================

        nurse_id = data.get("NurseID")

        if nurse_id:

            cursor.execute(
                """
                SELECT
                    NRID,
                    Name,
                    Ward,
                    Status
                FROM nurses
                WHERE NRID = %s
                LIMIT 1
                """,
                (nurse_id,)
            )

            nurse = cursor.fetchone()

            if not nurse:

                conn.rollback()

                return jsonify({
                    "success": False,
                    "error":
                        f"Nurse {nurse_id} does not exist"
                }), 400


            if str(nurse["Status"]).lower() != "active":

                conn.rollback()

                return jsonify({
                    "success": False,
                    "error":
                        f"Nurse {nurse_id} is not active"
                }), 400


            # If a bed was selected, make sure nurse belongs
            # to the same ward.

            if bed_id:

                if str(nurse["Ward"]).lower() != str(
                    bed["Ward"]
                ).lower():

                    conn.rollback()

                    return jsonify({
                        "success": False,
                        "error":
                            "Selected nurse does not belong "
                            "to the selected ward"
                    }), 400


        # =================================================
        # DOCTOR VALIDATION
        # =================================================

        doctor_name = data.get("DoctorAssigned")

        if doctor_name:

            cursor.execute(
                """
                SELECT
                    DRID,
                    Name,
                    Department,
                    Status
                FROM doctors
                WHERE Name = %s
                LIMIT 1
                """,
                (doctor_name,)
            )

            doctor = cursor.fetchone()

            if not doctor:

                conn.rollback()

                return jsonify({
                    "success": False,
                    "error":
                        f"Doctor {doctor_name} does not exist"
                }), 400


        # =================================================
        # MEDICINE STOCK UPDATE
        # =================================================

        medicine_name = data.get("MedicineRequired")

        medicine_quantity = data.get(
            "MedicineQuantityUsed"
        )

        if medicine_name:

            try:
                medicine_quantity = int(
                    medicine_quantity or 0
                )
            except:
                medicine_quantity = 0


            cursor.execute(
                """
                SELECT
                    `Medicine ID`,
                    `Medicine Name`,
                    Quantity,
                    Status
                FROM pharmacy
                WHERE `Medicine Name` = %s
                LIMIT 1
                FOR UPDATE
                """,
                (medicine_name,)
            )

            medicine = cursor.fetchone()

            if not medicine:

                conn.rollback()

                return jsonify({
                    "success": False,
                    "error":
                        f"Medicine {medicine_name} "
                        "does not exist"
                }), 400


            if medicine_quantity > 0:

                current_quantity = int(
                    medicine["Quantity"] or 0
                )


                if medicine_quantity > current_quantity:

                    conn.rollback()

                    return jsonify({
                        "success": False,
                        "error":
                            f"Insufficient stock for "
                            f"{medicine_name}. "
                            f"Available: {current_quantity}"
                    }), 400


                new_quantity = (
                    current_quantity -
                    medicine_quantity
                )


                # Determine new pharmacy status

                if new_quantity <= 0:

                    new_status = "Out of Stock"

                elif new_quantity <= 10:

                    new_status = "Low Stock"

                else:

                    new_status = "In Stock"


                cursor.execute(
                    """
                    UPDATE pharmacy
                    SET
                        Quantity = %s,
                        Status = %s
                    WHERE `Medicine Name` = %s
                    """,
                    (
                        new_quantity,
                        new_status,
                        medicine_name
                    )
                )


                # Update current medicine stock
                # in patient record

                values[35] = new_quantity


        # =================================================
        # INSERT PATIENT
        # =================================================

        column_names = ", ".join(columns)

        placeholders = ", ".join(
            ["%s"] * len(columns)
        )

        query = f"""
            INSERT INTO patients
            ({column_names})
            VALUES
            ({placeholders})
        """

        cursor.execute(
            query,
            values
        )


        # =================================================
        # COMMIT EVERYTHING
        # =================================================

        conn.commit()


        # =================================================
        # CLOSE
        # =================================================

        cursor.close()
        conn.close()


        # =================================================
        # RESPONSE
        # =================================================

        return jsonify({

            "success": True,

            "message":
                "Patient added successfully",

            "PatientID":
                patient_id,

            "BedID":
                bed_id,

            "NurseID":
                nurse_id,

            "Doctor":
                doctor_name,

            "Medicine":
                medicine_name

        }), 201


    except Exception as e:

        print(
            "ADD PATIENT ERROR:",
            e
        )


        if conn:

            try:
                conn.rollback()
            except:
                pass


        if cursor:

            try:
                cursor.close()
            except:
                pass


        if conn:

            try:
                conn.close()
            except:
                pass


        return jsonify({

            "success": False,

            "error":
                str(e)

        }), 500
    
# =========================================================
# UPDATE PATIENT
# =========================================================

@patient_bp.route("/patients/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):

    conn = None
    cursor = None

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No patient data received"
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # =================================================
        # GET CURRENT PATIENT
        # =================================================

        cursor.execute(
            """
            SELECT
                id,
                PatientID,
                PatientName,
                BedID,
                NurseID,
                DoctorAssigned,
                PatientStatus
            FROM patients
            WHERE id = %s
            FOR UPDATE
            """,
            (patient_id,)
        )

        old_patient = cursor.fetchone()

        if not old_patient:

            return jsonify({
                "success": False,
                "error": "Patient not found"
            }), 404

        old_bed = old_patient["BedID"]
        new_bed = data.get("BedID")

        old_nurse = old_patient["NurseID"]
        new_nurse = data.get("NurseID")

        old_doctor = old_patient["DoctorAssigned"]
        new_doctor = data.get("DoctorAssigned")

        patient_name = data.get(
            "PatientName"
        )

        # =================================================
        # BED CHANGE
        # =================================================

        if new_bed != old_bed:

            # ---------------------------------------------
            # RELEASE OLD BED
            # ---------------------------------------------

            if old_bed:

                cursor.execute(
                    """
                    UPDATE beds
                    SET
                        Patient = NULL,
                        Status = 'Empty'
                    WHERE `Bed ID` = %s
                    """,
                    (old_bed,)
                )

            # ---------------------------------------------
            # ASSIGN NEW BED
            # ---------------------------------------------

            if new_bed:

                cursor.execute(
                    """
                    SELECT
                        `Bed ID`,
                        Ward,
                        Room,
                        `Bed No.`,
                        Type,
                        Status
                    FROM beds
                    WHERE `Bed ID` = %s
                    FOR UPDATE
                    """,
                    (new_bed,)
                )

                bed = cursor.fetchone()

                if not bed:

                    conn.rollback()

                    return jsonify({
                        "success": False,
                        "error":
                            f"Bed {new_bed} does not exist"
                    }), 400

                if str(
                    bed["Status"]
                ).lower() != "empty":

                    conn.rollback()

                    return jsonify({
                        "success": False,
                        "error":
                            f"Bed {new_bed} is already occupied"
                    }), 409

                # Automatically update room and bed type

                data["RoomNumber"] = bed["Room"]
                data["BedType"] = bed["Type"]

                cursor.execute(
                    """
                    UPDATE beds
                    SET
                        Patient = %s,
                        Status = 'Occupied'
                    WHERE `Bed ID` = %s
                    """,
                    (
                        patient_name,
                        new_bed
                    )
                )

        else:

            # Patient name may have changed.
            # Keep the same bed linked to the new name.

            if new_bed and patient_name:

                cursor.execute(
                    """
                    UPDATE beds
                    SET Patient = %s
                    WHERE `Bed ID` = %s
                    """,
                    (
                        patient_name,
                        new_bed
                    )
                )

        # =================================================
        # NURSE VALIDATION
        # =================================================

        if new_nurse:

            cursor.execute(
                """
                SELECT
                    NRID,
                    Name,
                    Ward,
                    Status
                FROM nurses
                WHERE NRID = %s
                LIMIT 1
                """,
                (new_nurse,)
            )

            nurse = cursor.fetchone()

            if not nurse:

                conn.rollback()

                return jsonify({
                    "success": False,
                    "error":
                        f"Nurse {new_nurse} does not exist"
                }), 400

            if str(
                nurse["Status"]
            ).lower() != "active":

                conn.rollback()

                return jsonify({
                    "success": False,
                    "error":
                        f"Nurse {new_nurse} is not active"
                }), 400

        # =================================================
        # DOCTOR VALIDATION
        # =================================================

        if new_doctor:

            cursor.execute(
                """
                SELECT
                    DRID,
                    Name,
                    Department,
                    Status
                FROM doctors
                WHERE Name = %s
                LIMIT 1
                """,
                (new_doctor,)
            )

            doctor = cursor.fetchone()

            if not doctor:

                conn.rollback()

                return jsonify({
                    "success": False,
                    "error":
                        f"Doctor {new_doctor} does not exist"
                }), 400

        # =================================================
        # UPDATE PATIENT
        # =================================================

        query = """
            UPDATE patients
            SET
                PatientName = %s,
                Age = %s,
                Gender = %s,
                Disease = %s,
                Allergies = %s,
                PreviousDiseases = %s,
                LabTestResults = %s,
                AdmissionDate = %s,
                RoomNumber = %s,
                BedID = %s,
                BedType = %s,
                NurseID = %s,
                DoctorAssigned = %s,
                MedicineRequired = %s,
                MedicineTime = %s,
                PatientStatus = %s,
                EmergencyContact = %s,
                DischargeDate = %s,
                Temperature = %s,
                BloodPressure = %s,
                SugarLevel = %s,
                HeartRate = %s,
                OxygenLevel = %s,
                WBCCount = %s,
                PlateletCount = %s,
                Hemoglobin = %s,
                FeverSymptom = %s,
                Cough = %s,
                Vomiting = %s,
                ChestPain = %s,
                Headache = %s,
                ShortnessOfBreath = %s,
                SeverityLevel = %s,
                MedicineQuantityUsed = %s,
                CurrentMedicineStock = %s,
                Season = %s
            WHERE id = %s
        """

        values = (
            data.get("PatientName"),
            data.get("Age"),
            data.get("Gender"),
            data.get("Disease"),
            data.get("Allergies"),
            data.get("PreviousDiseases"),
            data.get("LabTestResults"),
            data.get("AdmissionDate"),
            data.get("RoomNumber"),
            new_bed,
            data.get("BedType"),
            new_nurse,
            new_doctor,
            data.get("MedicineRequired"),
            data.get("MedicineTime"),
            data.get("PatientStatus"),
            data.get("EmergencyContact"),
            data.get("DischargeDate"),
            data.get("Temperature"),
            data.get("BloodPressure"),
            data.get("SugarLevel"),
            data.get("HeartRate"),
            data.get("OxygenLevel"),
            data.get("WBCCount"),
            data.get("PlateletCount"),
            data.get("Hemoglobin"),
            data.get("FeverSymptom"),
            data.get("Cough"),
            data.get("Vomiting"),
            data.get("ChestPain"),
            data.get("Headache"),
            data.get("ShortnessOfBreath"),
            data.get("SeverityLevel"),
            data.get("MedicineQuantityUsed"),
            data.get("CurrentMedicineStock"),
            data.get("Season"),
            patient_id
        )

        cursor.execute(
            query,
            values
        )

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Patient updated successfully",
            "BedID": new_bed,
            "NurseID": new_nurse,
            "Doctor": new_doctor
        })

    except Exception as e:

        print(
            "UPDATE PATIENT ERROR:",
            e
        )

        if conn:

            try:
                conn.rollback()
            except:
                pass

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:

        if cursor:

            try:
                cursor.close()
            except:
                pass

        if conn:

            try:
                conn.close()
            except:
                pass


# =========================================================
# DELETE PATIENT
# =========================================================

@patient_bp.route(
    "/patients/<int:patient_id>",
    methods=["DELETE"]
)
def delete_patient(patient_id):

    conn = None
    cursor = None

    try:

        conn = get_db_connection()

        cursor = conn.cursor(
            dictionary=True
        )

        # =================================================
        # GET PATIENT DETAILS
        # =================================================

        cursor.execute(
            """
            SELECT
                id,
                PatientID,
                PatientName,
                BedID,
                NurseID,
                DoctorAssigned
            FROM patients
            WHERE id = %s
            FOR UPDATE
            """,
            (patient_id,)
        )

        patient = cursor.fetchone()

        if not patient:

            return jsonify({
                "success": False,
                "error": "Patient not found"
            }), 404

        bed_id = patient["BedID"]

        # =================================================
        # FREE BED
        # =================================================

        if bed_id:

            cursor.execute(
                """
                UPDATE beds
                SET
                    Patient = NULL,
                    Status = 'Empty'
                WHERE `Bed ID` = %s
                """,
                (bed_id,)
            )

        # =================================================
        # DELETE PATIENT
        # =================================================

        cursor.execute(
            """
            DELETE FROM patients
            WHERE id = %s
            """,
            (patient_id,)
        )

        conn.commit()

        return jsonify({
            "success": True,
            "message":
                "Patient deleted successfully",
            "BedID":
                bed_id,
            "NurseID":
                patient["NurseID"],
            "Doctor":
                patient["DoctorAssigned"]
        })

    except Exception as e:

        print(
            "DELETE PATIENT ERROR:",
            e
        )

        if conn:

            try:
                conn.rollback()
            except:
                pass

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:

        if cursor:

            try:
                cursor.close()
            except:
                pass

        if conn:

            try:
                conn.close()
            except:
                pass

# =========================================================
# CSV UPLOAD - SAFE INSERT / UPDATE
# =========================================================

@patient_bp.route("/patients/upload-csv", methods=["POST"])
def upload_csv():

    try:

        # -------------------------------------------------
        # CHECK FILE
        # -------------------------------------------------

        if "file" not in request.files:

            return jsonify({
                "success": False,
                "error": "No CSV file uploaded"
            }), 400


        file = request.files["file"]


        if file.filename == "":

            return jsonify({
                "success": False,
                "error": "No file selected"
            }), 400


        if not file.filename.lower().endswith(".csv"):

            return jsonify({
                "success": False,
                "error": "Only CSV files are allowed"
            }), 400


        # -------------------------------------------------
        # READ CSV
        # -------------------------------------------------

        content = file.read().decode(
            "utf-8-sig",
            errors="replace"
        )


        reader = csv.DictReader(
            io.StringIO(content)
        )


        if not reader.fieldnames:

            return jsonify({
                "success": False,
                "error": "CSV has no headers"
            }), 400


        # -------------------------------------------------
        # DATABASE
        # -------------------------------------------------

        conn = get_db_connection()

        cursor = conn.cursor()


        # -------------------------------------------------
        # COLUMNS FROM YOUR CSV / MYSQL TABLE
        # -------------------------------------------------

        columns = [

            "PatientID",
            "PatientName",
            "Age",
            "Gender",
            "Disease",
            "Allergies",
            "PreviousDiseases",
            "LabTestResults",
            "AdmissionDate",
            "RoomNumber",
            "BedID",
            "BedType",
            "NurseID",
            "DoctorAssigned",
            "MedicineRequired",
            "MedicineTime",
            "PatientStatus",
            "EmergencyContact",
            "DischargeDate",
            "Temperature",
            "BloodPressure",
            "SugarLevel",
            "HeartRate",
            "OxygenLevel",
            "WBCCount",
            "PlateletCount",
            "Hemoglobin",
            "FeverSymptom",
            "Cough",
            "Vomiting",
            "ChestPain",
            "Headache",
            "ShortnessOfBreath",
            "SeverityLevel",
            "MedicineQuantityUsed",
            "CurrentMedicineStock",
            "Season"

        ]


        # -------------------------------------------------
        # CHECK CSV HEADERS
        # -------------------------------------------------

        csv_headers = [
            header.strip()
            for header in reader.fieldnames
        ]


        missing_columns = [

            column

            for column in columns

            if column not in csv_headers

        ]


        if missing_columns:

            cursor.close()
            conn.close()


            return jsonify({

                "success": False,

                "error":
                    "CSV is missing columns: "
                    +
                    ", ".join(missing_columns)

            }), 400


        # -------------------------------------------------
        # COUNTERS
        # -------------------------------------------------

        inserted = 0

        updated = 0

        skipped = 0


        # -------------------------------------------------
        # PROCESS EACH CSV ROW
        # -------------------------------------------------

        for row in reader:


            patient_id = (
                row.get("PatientID") or ""
            ).strip()


            # PatientID is required

            if not patient_id:

                skipped += 1

                continue


            # -------------------------------------------------
            # CHECK WHETHER PATIENT ALREADY EXISTS
            # -------------------------------------------------

            cursor.execute(
                """
                SELECT id
                FROM patients
                WHERE PatientID = %s
                LIMIT 1
                """,
                (patient_id,)
            )


            existing = cursor.fetchone()


            # -------------------------------------------------
            # PREPARE VALUES
            # -------------------------------------------------

            values = []


            for column in columns:

                value =  row.get(column)


                if value is not None:

                    value =  value.strip()


                if value == "":

                    value = None


                values.append(value)


            # -------------------------------------------------
            # UPDATE EXISTING PATIENT
            # -------------------------------------------------

            if existing:

                set_clause = ", ".join(

                    [
                        f"{column} = %s"

                        for column in columns

                        if column != "PatientID"
                    ]

                )


                update_values = [

                    row.get(column)

                    for column in columns

                    if column != "PatientID"

                ]


                update_values = [

                    value.strip()
                    if isinstance(value, str)
                    and value.strip() != ""
                    else None

                    for value in update_values

                ]


                update_values.append(
                    patient_id
                )


                cursor.execute(

                    f"""
                    UPDATE patients
                    SET {set_clause}
                    WHERE PatientID = %s
                    """,

                    update_values

                )


                updated += 1


            # -------------------------------------------------
            # INSERT NEW PATIENT
            # -------------------------------------------------

            else:

                column_names =  ", ".join(columns)


                placeholders = ", ".join(
                        ["%s"] * len(columns)
                    )


                cursor.execute(

                    f"""
                    INSERT INTO patients
                    ({column_names})
                    VALUES
                    ({placeholders})
                    """,

                    values

                )


                inserted += 1


        # -------------------------------------------------
        # COMMIT
        # -------------------------------------------------

        conn.commit()


        cursor.close()

        conn.close()


        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return jsonify({

            "success": True,

            "message":
                "CSV imported successfully",

            "inserted":
                inserted,

            "updated":
                updated,

            "skipped":
                skipped,

            "count":
                inserted + updated

        })


    except Exception as e:

        print(
            "CSV UPLOAD ERROR:",
            e
        )


        try:

            conn.rollback()

        except:

            pass


        return jsonify({

            "success": False,

            "error": str(e)

        }), 500