from flask import Flask, render_template, session, redirect, request

from routes.database_routes import database_bp
from routes.patient_routes import patient_bp
from routes.prediction_routes import prediction_bp
from routes.dashboard_routes import dashboard_bp
from routes.doctor_routes import doctor_bp
from routes.nurse_routes import nurse_bp
from routes.bed_routes import bed_bp
from routes.pharmacy_routes import pharmacy_bp
from routes.login_routes import login_bp
from routes.report_routes import reports_bp


app = Flask(__name__)

# =========================================================
# SECRET KEY
# =========================================================

app.secret_key = "14a25c68c0d89c32830eba3811734a3976bd9cce30539ea483bec91108d584cd"


# =========================================================
# LOGIN PROTECTION
# =========================================================

@app.before_request
def require_login():

    # Allow Flask static files
    if request.endpoint == "static":
        return None

    # Allow login page
    if request.path == "/login-page":
        return None

    # Allow login submission
    if request.path == "/login":
        return None

    # Allow logout
    if request.path == "/logout":
        return None

    # Everything else requires login
    if not session.get("logged_in"):
        return redirect("/login-page")

    return None


# =========================================================
# BLUEPRINTS
# =========================================================

app.register_blueprint(patient_bp)

app.register_blueprint(prediction_bp)

app.register_blueprint(database_bp)

app.register_blueprint(dashboard_bp)

app.register_blueprint(doctor_bp)

app.register_blueprint(nurse_bp)

app.register_blueprint(bed_bp)

app.register_blueprint(pharmacy_bp)

app.register_blueprint(login_bp)

app.register_blueprint(reports_bp)
# =========================================================
# PAGE ROUTES
# =========================================================

@app.route("/")
def dashboard():

    return render_template(
        "dashboard.html"
    )


@app.route("/patients-page")
def patients():

    return render_template(
        "patients.html"
    )


@app.route("/doctors-page")
def doctors():

    return render_template(
        "doctors.html"
    )


@app.route("/nurses-page")
def nurses():

    return render_template(
        "nurses.html"
    )


@app.route("/beds-page")
def beds():

    return render_template(
        "beds.html"
    )


@app.route("/pharmacy-page")
def pharmacy():

    return render_template(
        "pharmacy.html"
    )


@app.route("/prediction-page")
def prediction():

    return render_template(
        "prediction.html"
    )


@app.route("/analytics-page")
def analytics():

    return render_template(
        "analytics.html"
    )


@app.route("/reports-page")
def reports():

    return render_template(
        "reports.html"
    )


# =========================================================
# RUN APPLICATION
# =========================================================

print(app.url_map)

if __name__ == "__main__":

    app.run(
        debug=True
    )