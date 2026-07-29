-- ===========================================
-- Hospital Hospitality Management System
-- Database Creation
-- ===========================================

CREATE DATABASE hospital_hms;

USE hospital_hms;

-- ===========================================
-- Patients Table
-- ===========================================

CREATE TABLE patients (

    patient_id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(50) NOT NULL,

    last_name VARCHAR(50) NOT NULL,

    age INT NOT NULL,

    gender ENUM('Male','Female','Other'),

    blood_group VARCHAR(5),

    phone VARCHAR(15),

    email VARCHAR(100),

    address TEXT,

    disease VARCHAR(100),

    symptoms TEXT,

    doctor_id INT,

    ward VARCHAR(50),

    bed_number VARCHAR(20),

    admission_date DATE,

    discharge_date DATE,

    status ENUM(
        'Admitted',
        'Recovering',
        'Critical',
        'Discharged'
    ),

    insurance_provider VARCHAR(100),

    insurance_number VARCHAR(50),

    emergency_contact_name VARCHAR(100),

    emergency_contact_phone VARCHAR(15),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);
-- ===========================================
-- Doctors Table
-- ===========================================

CREATE TABLE doctors (

    doctor_id INT AUTO_INCREMENT PRIMARY KEY,

    doctor_name VARCHAR(100),

    specialization VARCHAR(100),

    qualification VARCHAR(100),

    phone VARCHAR(20),

    email VARCHAR(100),

    experience INT,

    consultation_fee DECIMAL(10,2),

    department VARCHAR(100),

    status ENUM('Available','Busy','On Leave'),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
-- ===========================================
-- Nurses Table
-- ===========================================

CREATE TABLE nurses (

    nurse_id INT AUTO_INCREMENT PRIMARY KEY,

    nurse_name VARCHAR(100) NOT NULL,

    gender ENUM('Male','Female','Other'),

    phone VARCHAR(15),

    email VARCHAR(100),

    qualification VARCHAR(100),

    experience INT,

    department VARCHAR(100),

    shift ENUM('Morning','Evening','Night'),

    status ENUM('Available','Busy','On Leave'),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- ===========================================
-- Beds Table
-- ===========================================

CREATE TABLE beds (

    bed_id INT AUTO_INCREMENT PRIMARY KEY,

    ward_name VARCHAR(100),

    bed_number VARCHAR(20) UNIQUE,

    bed_type ENUM(

        'General',

        'Private',

        'ICU',

        'Emergency'

    ),

    status ENUM(

        'Available',

        'Occupied',

        'Maintenance'

    ),

    patient_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)

    REFERENCES patients(patient_id)

);
-- ===========================================
-- Pharmacy Table
-- ===========================================

CREATE TABLE pharmacy (

    medicine_id INT AUTO_INCREMENT PRIMARY KEY,

    medicine_name VARCHAR(150),

    category VARCHAR(100),

    manufacturer VARCHAR(100),

    batch_number VARCHAR(50),

    expiry_date DATE,

    stock_quantity INT,

    unit_price DECIMAL(10,2),

    supplier VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- ===========================================
-- Billing Table
-- ===========================================

CREATE TABLE billing (

    bill_id INT AUTO_INCREMENT PRIMARY KEY,

    patient_id INT,

    consultation_fee DECIMAL(10,2),

    medicine_fee DECIMAL(10,2),

    laboratory_fee DECIMAL(10,2),

    surgery_fee DECIMAL(10,2),

    room_charges DECIMAL(10,2),

    other_charges DECIMAL(10,2),

    total_amount DECIMAL(10,2),

    payment_status ENUM(

        'Pending',

        'Paid',

        'Partially Paid'

    ),

    payment_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)

    REFERENCES patients(patient_id)

);
-- ===========================================
-- Reports Table
-- ===========================================

CREATE TABLE reports (

    report_id INT AUTO_INCREMENT PRIMARY KEY,

    patient_id INT NOT NULL,

    doctor_id INT,

    report_type ENUM(

        'Blood Test',

        'Urine Test',

        'X-Ray',

        'MRI',

        'CT Scan',

        'ECG',

        'Prescription',

        'Discharge Summary'

    ),

    report_name VARCHAR(150),

    report_description TEXT,

    report_file VARCHAR(255),

    report_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id),

    FOREIGN KEY (doctor_id)
        REFERENCES doctors(doctor_id)

);

-- ===========================================
-- AI Prediction Table
-- ===========================================

CREATE TABLE ai_predictions (

    prediction_id INT AUTO_INCREMENT PRIMARY KEY,

    patient_id INT NOT NULL,

    disease_prediction VARCHAR(150),

    risk_score DECIMAL(5,2),

    length_of_stay INT,

    medicine_prediction TEXT,

    confidence_score DECIMAL(5,2),

    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id)

);
-- ===========================================
-- Admin Users Table
-- ===========================================

CREATE TABLE users (

    user_id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100),

    username VARCHAR(50) UNIQUE,

    password VARCHAR(255),

    email VARCHAR(100),

    role ENUM(

        'Admin',

        'Doctor',

        'Nurse',

        'Receptionist',

        'Pharmacist'

    ),

    status ENUM(

        'Active',

        'Inactive'

    ) DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- ===========================================
-- Login History
-- ===========================================

CREATE TABLE login_history (

    login_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    logout_time TIMESTAMP NULL,

    ip_address VARCHAR(50),

    FOREIGN KEY(user_id)
        REFERENCES users(user_id)

);
-- ===========================================
-- Sample Doctors
-- ===========================================

INSERT INTO doctors
(
doctor_name,
specialization,
qualification,
phone,
email,
experience,
consultation_fee,
department,
status
)

VALUES

('Dr. Amit Mehta','Cardiology','MD','9876543210','amit@hospital.com',12,700,'Cardiology','Available'),

('Dr. Rahul Singh','Neurology','DM','9876543211','rahul@hospital.com',10,800,'Neurology','Available'),

('Dr. Ayesha Khan','Orthopedics','MS','9876543212','ayesha@hospital.com',8,650,'Orthopedics','Busy');
-- ===========================================
-- Sample Patients
-- ===========================================

INSERT INTO patients
(

first_name,

last_name,

age,

gender,

blood_group,

phone,

email,

address,

disease,

symptoms,

doctor_id,

ward,

bed_number,

admission_date,

status,

insurance_provider,

insurance_number,

emergency_contact_name,

emergency_contact_phone

)

VALUES

(

'Rahul',

'Sharma',

32,

'Male',

'O+',

'9876543200',

'rahul@gmail.com',

'Hyderabad',

'Heart Disease',

'Chest Pain',

1,

'ICU',

'ICU-01',

CURDATE(),

'Admitted',

'Star Health',

'SH123456',

'Anil Sharma',

'9876500000'

),

(

'Anjali',

'Gupta',

28,

'Female',

'A+',

'9876543201',

'anjali@gmail.com',

'Delhi',

'Fever',

'High Fever',

2,

'General',

'G-12',

CURDATE(),

'Recovering',

'HDFC Ergo',

'HDFC12345',

'Raj Gupta',

'9876500001'

);
