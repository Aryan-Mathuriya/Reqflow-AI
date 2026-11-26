
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.llm_service import analyze_requirements
from app.services.pdf_service import generate_analysis_pdf
from app.database.database import save_analysis

router = APIRouter()


class AnalysisRequest(BaseModel):
    requirements: str


@router.post("/analyze")
def analyze(request: AnalysisRequest):
    try:
        # Generate AI analysis
        result = analyze_requirements(request.requirements)

        # Save analysis in SQLite
        analysis_id = save_analysis(result, source_type="text")

        return {
            "success": True,
            "analysis_id": analysis_id,
            "analysis": result
        }

    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))

    except Exception as error:
        print("Analysis error:", error)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong during AI analysis."
        )


@router.post("/download-report")
def download_report(analysis: dict):
    try:
        pdf_buffer = generate_analysis_pdf(analysis)

        filename = "ReqFlow_AI_Analysis_Report.pdf"

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )

    except Exception as error:
        print("PDF generation error:", error)
        raise HTTPException(
            status_code=500,
            detail="Unable to generate PDF report."
        )
