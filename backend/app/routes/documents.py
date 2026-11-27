from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from app.auth import get_current_user
from app.services.document_service import extract_text_from_document
from app.services.llm_service import analyze_requirements
from app.database.database import save_analysis

router = APIRouter()


@router.post("/upload-document")
async def upload_document(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    allowed_extensions = ["pdf", "docx"]
    extension = file.filename.lower().split(".")[-1] if file.filename else ""
    if extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded document is empty.")
        extracted_text = extract_text_from_document(content, file.filename)
        if not extracted_text.strip():
            raise HTTPException(status_code=422, detail="No readable text found in document.")
        analysis = analyze_requirements(extracted_text)
        analysis_id = save_analysis(analysis, user_id=current_user["id"], source_type="document")
        return {"success": True, "analysis_id": analysis_id, "filename": file.filename,
                "extracted_text": extracted_text, "analysis": analysis}
    except HTTPException:
        raise
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
    except Exception as error:
        print("Document processing error:", error)
        raise HTTPException(status_code=500, detail="Document processing failed.")
    finally:
        await file.close()
