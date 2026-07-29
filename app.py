from flask import Flask, render_template

from routes.patient_routes import patient_bp
from routes.prediction_routes import prediction_bp

app = Flask(__name__)

app.register_blueprint(patient_bp)
app.register_blueprint(prediction_bp)

@app.route("/")
def dashboard():
    return render_template("dashboard.html")

@app.route("/patients-page")
def patients():
    return render_template("patients.html")

@app.route("/doctors-page")
def doctors():
    return render_template("doctors.html")

@app.route("/nurses-page")
def nurses():
    return render_template("nurses.html")

@app.route("/beds-page")
def beds():
    return render_template("beds.html")

@app.route("/pharmacy-page")
def pharmacy():
    return render_template("pharmacy.html")

if __name__ == "__main__":
    app.run(debug=True)