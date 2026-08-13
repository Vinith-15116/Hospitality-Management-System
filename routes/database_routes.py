from flask import Blueprint, jsonify
import mysql.connector

from config import DB_CONFIG


database_bp = Blueprint(
    "database",
    __name__
)


@database_bp.route("/api/database-test")
def database_test():

    try:

        connection = mysql.connector.connect(
            **DB_CONFIG
        )

        if connection.is_connected():

            connection.close()

            return jsonify({
                "success": True,
                "message": "MySQL connection successful!"
            })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500