from flask import Blueprint, request, jsonify
import pandas as pd
import joblib

prediction_bp = Blueprint("prediction", __name__)

medicine_model = joblib.load("ml/medicine_model.pkl")


@prediction_bp.route("/predict_medicine", methods=["POST"])
def predict_medicine():

    data = request.get_json()

    new_data = pd.DataFrame({

        "Patients":[data["patients"]],

        "MedicineRequired":[data["medicineRequired"]],

        "AverageAge":[data["averageAge"]],

        "AverageTemperature":[data["averageTemperature"]],

        "AverageBP":[data["averageBP"]],

        "AverageSugar":[data["averageSugar"]],

        "AverageHeartRate":[data["averageHeartRate"]],

        "AverageOxygen":[data["averageOxygen"]],

        "CurrentStock":[data["currentStock"]],

        "YesterdayUsage":[data["yesterdayUsage"]],

        "Last7DaysAvg":[data["last7DaysAvg"]],

        "Last30DaysAvg":[data["last30DaysAvg"]],

        "Month":[data["month"]],

        "DayOfWeek":[data["dayOfWeek"]]

    })

    prediction = medicine_model.predict(new_data)

    return jsonify({

        "prediction": round(float(prediction[0]),2)

    })