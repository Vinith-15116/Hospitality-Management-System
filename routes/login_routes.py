from flask import Blueprint, render_template, request, redirect, session, url_for
from config import DB_CONFIG
from werkzeug.security import check_password_hash
import mysql.connector


login_bp = Blueprint("login", __name__)


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
# LOGIN PAGE
# =========================================================

@login_bp.route("/login-page", methods=["GET"])
def login_page():

    # Already logged in
    if session.get("logged_in"):
        return redirect("/")

    return render_template("login.html")


# =========================================================
# LOGIN
# =========================================================

@login_bp.route("/login", methods=["POST"])
def login():

    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")


    if username == "" or password == "":

        return render_template(
            "login.html",
            error="Please enter username and password."
        )


    conn = None
    cursor = None

    try:

        conn = get_db_connection()

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                id,
                username,
                password_hash,
                role
            FROM users
            WHERE username = %s
            LIMIT 1
        """, (username,))


        user = cursor.fetchone()


        if user and check_password_hash(
            user["password_hash"],
            password
        ):

            session["logged_in"] = True
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            session["role"] = user["role"]


            return redirect("/")


        return render_template(
            "login.html",
            error="Invalid username or password."
        )


    except Exception as e:

        print("LOGIN ERROR:", e)

        return render_template(
            "login.html",
            error="Unable to connect to database."
        )


    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =========================================================
# LOGOUT
# =========================================================

@login_bp.route("/logout", methods=["GET"])
def logout():

    session.clear()

    return redirect("/login-page")