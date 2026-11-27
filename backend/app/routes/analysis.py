from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.auth import get_current_user
from app.services.llm_service import analyze_requirements
from app.services.pdf_service import generate_analysis_pdf
from app.database.database import save_analysis, get_analysis_by_id

router = APIRouter()


class AnalysisRequest(BaseModel):
    requirements: str


class ReportRequest(BaseModel):
    analysis_id: int


@router.post("/analyze")
def analyze(request: AnalysisRequest, current_user: dict = Depends(get_current_user)):
    try:
        result = analyze_requirements(request.requirements)
        analysis_id = save_analysis(result, user_id=current_user["id"], source_type="text")
        return {"success": True, "analysis_id": analysis_id, "analysis": result}
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
    except Exception as error:
        print("Analysis error:", error)
        raise HTTPException(status_code=500, detail="Something went wrong during AI analysis.")


@router.post("/download-report")
def download_report(request: ReportRequest, current_user: dict = Depends(get_current_user)):
    try:
        saved_analysis = get_analysis_by_id(request.analysis_id, current_user["id"])
        if saved_analysis is None:
            raise HTTPException(status_code=404, detail="Analysis not found.")
        pdf_buffer = generate_analysis_pdf(saved_analysis["analysis_data"])
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="ReqFlow_AI_Analysis_Report.pdf"'}
        )
    except HTTPException:
        raise
    except Exception as error:
        print("PDF generation error:", error)
        raise HTTPException(status_code=500, detail="Unable to generate PDF report.")
