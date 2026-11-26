
import sqlite3
import json
from pathlib import Path
from datetime import datetime, timezone

DATABASE_PATH = Path(__file__).resolve().parent / "reqflow.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name TEXT NOT NULL,
            project_summary TEXT,
            analysis_data TEXT NOT NULL,
            created_at TEXT NOT NULL,
            source_type TEXT DEFAULT 'text'
        )
    """)

    # Migrate existing databases without deleting saved analyses
    cursor.execute("PRAGMA table_info(analyses)")
    columns = [column["name"] for column in cursor.fetchall()]

    if "source_type" not in columns:
        cursor.execute("""
            ALTER TABLE analyses
            ADD COLUMN source_type TEXT DEFAULT 'text'
        """)

    connection.commit()
    connection.close()


def save_analysis(analysis, source_type="text"):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO analyses (
            project_name,
            project_summary,
            analysis_data,
            created_at,
            source_type
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        analysis.get("project_name", "Untitled Project"),
        analysis.get("project_summary", ""),
        json.dumps(analysis),
        datetime.now(timezone.utc).isoformat(),
        source_type
    ))

    analysis_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return analysis_id


def get_all_analyses():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id, project_name, project_summary, created_at
        FROM analyses
        ORDER BY id DESC
    """)

    results = [dict(row) for row in cursor.fetchall()]
    connection.close()

    return results


def get_analysis_by_id(analysis_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT * FROM analyses WHERE id = ?",
        (analysis_id,)
    )

    result = cursor.fetchone()
    connection.close()

    if result is None:
        return None

    analysis = dict(result)
    analysis["analysis_data"] = json.loads(
        analysis["analysis_data"]
    )

    return analysis


def delete_analysis(analysis_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM analyses WHERE id = ?",
        (analysis_id,)
    )

    deleted = cursor.rowcount > 0

    connection.commit()
    connection.close()

    return deleted


def get_dashboard_stats():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            COUNT(*) AS total_analyses,
            SUM(
                CASE WHEN source_type = 'document'
                THEN 1 ELSE 0 END
            ) AS documents_processed
        FROM analyses
    """)

    result = cursor.fetchone()
    connection.close()

    total_analyses = result["total_analyses"] or 0
    documents_processed = result["documents_processed"] or 0

    return {
        "total_analyses": total_analyses,
        "documents_processed": documents_processed,
        "time_saved_minutes": total_analyses * 30
    }
