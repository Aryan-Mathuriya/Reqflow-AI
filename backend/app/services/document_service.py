
import fitz
from docx import Document
from io import BytesIO


def extract_text_from_document(file_bytes: bytes, filename: str):

    extension = filename.lower().split(".")[-1]

    if extension == "pdf":

        pdf_document = fitz.open(
            stream=file_bytes,
            filetype="pdf"
        )

        extracted_text = ""

        for page in pdf_document:
            extracted_text += page.get_text() + "\n"

        pdf_document.close()

        return extracted_text.strip()

    elif extension == "docx":

        document = Document(BytesIO(file_bytes))

        extracted_text = "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )

        return extracted_text.strip()

    else:
        raise ValueError("Only PDF and DOCX files are supported.")
