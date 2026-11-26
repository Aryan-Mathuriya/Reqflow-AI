
import os
import json
import psycopg
from psycopg.rows import dict_row
from datetime import datetime, timezone

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing from environment variables")


def get_connection():
    return psycopg.connect(
        DATABASE_URL,
        row_factory=dict_row
    )


def initialize_database():
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
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

            cursor.execute("""
                ALTER TABLE analyses
                ADD COLUMN IF NOT EXISTS
                source_type TEXT DEFAULT 'text'
            """)

        connection.commit()

    finally:
        connection.close()


def save_analysis(analysis, source_type="text"):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO analyses (
                    project_name,
                    project_summary,
                    analysis_data,
                    created_at,
                    source_type
                )
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (
                analysis.get("project_name", "Untitled Project"),
                analysis.get("project_summary", ""),
                json.dumps(analysis),
                datetime.now(timezone.utc).isoformat(),
                source_type
            ))

            analysis_id = cursor.fetchone()["id"]

        connection.commit()
        return analysis_id

    finally:
        connection.close()


def get_all_analyses():
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, project_name, project_summary, created_at
                FROM analyses
                ORDER BY id DESC
            """)

            return cursor.fetchall()

    finally:
        connection.close()


def get_analysis_by_id(analysis_id):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM analyses WHERE id = %s",
                (analysis_id,)
            )

            result = cursor.fetchone()

            if result is None:
                return None

            analysis = dict(result)
            analysis["analysis_data"] = json.loads(
                analysis["analysis_data"]
            )

            return analysis

    finally:
        connection.close()


def delete_analysis(analysis_id):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "DELETE FROM analyses WHERE id = %s",
                (analysis_id,)
            )

            deleted = cursor.rowcount > 0

        connection.commit()
        return deleted

    finally:
        connection.close()


def get_dashboard_stats():
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    COUNT(*) AS total_analyses,
                    COALESCE(
                        SUM(
                            CASE WHEN source_type = 'document'
                            THEN 1 ELSE 0 END
                        ), 0
                    ) AS documents_processed
                FROM analyses
            """)

            result = cursor.fetchone()

            total_analyses = result["total_analyses"]
            documents_processed = result["documents_processed"]

            return {
                "total_analyses": total_analyses,
                "documents_processed": documents_processed,
                "time_saved_minutes": total_analyses * 30
            }

    finally:
        connection.close()
