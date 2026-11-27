import os
import json
import psycopg
from psycopg.rows import dict_row
from datetime import datetime, timezone

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing from environment variables")


def get_connection():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


def initialize_database():
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id BIGSERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS analyses (
                    id BIGSERIAL PRIMARY KEY,
                    project_name TEXT NOT NULL,
                    project_summary TEXT,
                    analysis_data TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    source_type TEXT DEFAULT 'text'
                )
            """)
            cursor.execute("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'text'")
            cursor.execute("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id)")
        connection.commit()
    finally:
        connection.close()


def create_user(name, email, password_hash):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO users (name, email, password_hash, created_at)
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, email
            """, (name, email, password_hash, datetime.now(timezone.utc).isoformat()))
            user = cursor.fetchone()
        connection.commit()
        return dict(user)
    finally:
        connection.close()


def get_user_by_email(email):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, name, email, password_hash FROM users WHERE email = %s", (email,))
            result = cursor.fetchone()
            return dict(result) if result else None
    finally:
        connection.close()


def get_user_by_id(user_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
            result = cursor.fetchone()
            return dict(result) if result else None
    finally:
        connection.close()


def save_analysis(analysis, user_id, source_type="text"):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO analyses (project_name, project_summary, analysis_data, created_at, source_type, user_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (analysis.get("project_name", "Untitled Project"), analysis.get("project_summary", ""),
                  json.dumps(analysis), datetime.now(timezone.utc).isoformat(), source_type, user_id))
            analysis_id = cursor.fetchone()["id"]
        connection.commit()
        return analysis_id
    finally:
        connection.close()


def get_all_analyses(user_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, project_name, project_summary, created_at
                FROM analyses WHERE user_id = %s ORDER BY id DESC
            """, (user_id,))
            return cursor.fetchall()
    finally:
        connection.close()


def get_analysis_by_id(analysis_id, user_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM analyses WHERE id = %s AND user_id = %s", (analysis_id, user_id))
            result = cursor.fetchone()
            if result is None:
                return None
            analysis = dict(result)
            analysis["analysis_data"] = json.loads(analysis["analysis_data"])
            return analysis
    finally:
        connection.close()


def delete_analysis(analysis_id, user_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM analyses WHERE id = %s AND user_id = %s", (analysis_id, user_id))
            deleted = cursor.rowcount > 0
        connection.commit()
        return deleted
    finally:
        connection.close()


def get_dashboard_stats(user_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) AS total_analyses,
                    COALESCE(SUM(CASE WHEN source_type = 'document' THEN 1 ELSE 0 END), 0) AS documents_processed
                FROM analyses WHERE user_id = %s
            """, (user_id,))
            result = cursor.fetchone()
            total = result["total_analyses"]
            return {"total_analyses": total, "documents_processed": result["documents_processed"],
                    "time_saved_minutes": total * 30}
    finally:
        connection.close()
