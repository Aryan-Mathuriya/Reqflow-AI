from fastapi import APIRouter, HTTPException, Depends

from app.auth import get_current_user
from app.database.database import get_all_analyses, get_analysis_by_id, delete_analysis, get_dashboard_stats

router = APIRouter()


@router.get("/history")
def get_history(current_user: dict = Depends(get_current_user)):
    try:
        analyses = get_all_analyses(current_user["id"])
        return {"success": True, "total": len(analyses), "history": analyses}
    except Exception as error:
        print("History error:", error)
        raise HTTPException(status_code=500, detail="Unable to retrieve analysis history.")


@router.get("/history/{analysis_id}")
def get_saved_analysis(analysis_id: int, current_user: dict = Depends(get_current_user)):
    try:
        analysis = get_analysis_by_id(analysis_id, current_user["id"])
        if analysis is None:
            raise HTTPException(status_code=404, detail="Analysis not found.")
        return {"success": True, "analysis": analysis}
    except HTTPException:
        raise
    except Exception as error:
        print("Analysis retrieval error:", error)
        raise HTTPException(status_code=500, detail="Unable to retrieve saved analysis.")


@router.delete("/history/{analysis_id}")
def remove_analysis(analysis_id: int, current_user: dict = Depends(get_current_user)):
    try:
        deleted = delete_analysis(analysis_id, current_user["id"])
        if not deleted:
            raise HTTPException(status_code=404, detail="Analysis not found.")
        return {"success": True, "message": "Analysis deleted successfully."}
    except HTTPException:
        raise
    except Exception as error:
        print("Delete error:", error)
        raise HTTPException(status_code=500, detail="Unable to delete analysis.")


@router.get("/dashboard-stats")
def dashboard_stats(current_user: dict = Depends(get_current_user)):
    try:
        return {"success": True, "stats": get_dashboard_stats(current_user["id"])}
    except Exception as error:
        print("Dashboard statistics error:", error)
        raise HTTPException(status_code=500, detail="Unable to retrieve dashboard statistics.")
