
from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)

def generate_analysis_pdf(analysis: dict):
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=24,
        textColor=colors.HexColor("#2563EB"),
        alignment=TA_CENTER,
        spaceAfter=8,
    )

    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#64748B"),
        alignment=TA_CENTER,
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#2563EB"),
        spaceBefore=16,
        spaceAfter=8,
    )

    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontSize=9,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6,
    )

    small_style = ParagraphStyle(
        "Small",
        parent=body_style,
        fontSize=8,
    )

    story = []

    def safe_text(value):
        """Escape text before inserting it into ReportLab paragraphs."""
        from xml.sax.saxutils import escape
        return escape(str(value if value is not None else ""))

    def add_section(title):
        story.append(Paragraph(safe_text(title), heading_style))
        story.append(
            HRFlowable(
                width="100%",
                thickness=0.7,
                color=colors.HexColor("#DBEAFE"),
            )
        )
        story.append(Spacer(1, 8))

    def add_bullet(text):
        story.append(
            Paragraph(
                f"&bull; {safe_text(text)}",
                body_style,
            )
        )

    # Cover heading
    story.append(Paragraph("ReqFlow AI", title_style))
    story.append(
        Paragraph(
            "AI-Powered Client Requirement Analysis Report",
            subtitle_style,
        )
    )

    story.append(
        Paragraph(
            f"Generated on: {datetime.now().strftime('%d %B %Y, %I:%M %p')}",
            subtitle_style,
        )
    )

    # Project overview
    add_section("1. Project Overview")

    story.append(
        Paragraph(
            f"<b>Project Name:</b> {safe_text(analysis.get('project_name', 'Untitled Project'))}",
            body_style,
        )
    )

    story.append(
        Paragraph(
            f"<b>Project Summary:</b> {safe_text(analysis.get('project_summary', ''))}",
            body_style,
        )
    )

    # Objectives
    add_section("2. Project Objectives")

    for item in analysis.get("objectives", []):
        add_bullet(item.get("objective", ""))

    # Functional requirements
    add_section("3. Functional Requirements")

    for item in analysis.get("functional_requirements", []):
        story.append(
            Paragraph(
                f"<b>{safe_text(item.get('feature', ''))}</b> "
                f"({safe_text(item.get('priority', ''))})",
                body_style,
            )
        )
        story.append(
            Paragraph(
                safe_text(item.get("description", "")),
                small_style,
            )
        )

    # Non-functional requirements
    add_section("4. Non-Functional Requirements")

    for item in analysis.get("non_functional_requirements", []):
        story.append(
            Paragraph(
                f"<b>{safe_text(item.get('feature', ''))}</b> "
                f"({safe_text(item.get('priority', ''))})",
                body_style,
            )
        )
        story.append(
            Paragraph(
                safe_text(item.get("description", "")),
                small_style,
            )
        )

    # Technical requirements
    add_section("5. Technical Requirements")

    for item in analysis.get("technical_requirements", []):
        story.append(
            Paragraph(
                f"<b>{safe_text(item.get('category', ''))}:</b> "
                f"{safe_text(item.get('requirement', ''))}",
                body_style,
            )
        )

    # Recommended technology stack
    add_section("6. Recommended Technology Stack")

    for item in analysis.get("recommended_stack", []):
        story.append(
            Paragraph(
                f"<b>{safe_text(item.get('technology', ''))}</b> "
                f"— {safe_text(item.get('purpose', ''))}",
                body_style,
            )
        )
        story.append(
            Paragraph(
                safe_text(item.get("reason", "")),
                small_style,
            )
        )

    # Milestones
    add_section("7. Project Milestones")

    for index, item in enumerate(analysis.get("milestones", []), start=1):
        story.append(
            Paragraph(
                f"<b>Milestone {index}: {safe_text(item.get('milestone', ''))}</b>",
                body_style,
            )
        )

        story.append(
            Paragraph(
                f"Duration: {safe_text(item.get('duration', ''))}",
                small_style,
            )
        )

        for deliverable in item.get("deliverables", []):
            add_bullet(deliverable)

        story.append(Spacer(1, 5))

    # Clarification questions
    add_section("8. Clarification Questions")

    for index, item in enumerate(
        analysis.get("clarification_questions", []),
        start=1,
    ):
        story.append(
            Paragraph(
                f"<b>{index}. {safe_text(item.get('question', ''))}</b>",
                body_style,
            )
        )
        story.append(
            Paragraph(
                f"Reason: {safe_text(item.get('reason', ''))}",
                small_style,
            )
        )

    # Footer
    story.append(Spacer(1, 25))
    story.append(
        Paragraph(
            "Generated by ReqFlow AI | Intelligent Requirement Analysis",
            subtitle_style,
        )
    )

    doc.build(story)

    buffer.seek(0)
    return buffer