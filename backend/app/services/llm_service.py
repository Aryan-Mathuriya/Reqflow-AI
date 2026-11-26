
import json
from groq import Groq

from app.config import GROQ_API_KEY, GROQ_MODEL
from app.prompts.analysis_prompt import SYSTEM_PROMPT
from app.schemas.analysis_schema import RequirementAnalysis


client = Groq(api_key=GROQ_API_KEY)


def analyze_requirements(requirements: str):

    if not requirements or not requirements.strip():
        raise ValueError("Requirements cannot be empty")

    # Get the exact output structure from our Pydantic schema
    output_schema = RequirementAnalysis.model_json_schema()

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": f"""
Analyze these client requirements:

{requirements}

IMPORTANT:
Return JSON matching this exact Pydantic JSON schema.
Use the exact field names and data types.
Do not add alternative field names.
Do not omit required fields.

EXPECTED JSON SCHEMA:

{json.dumps(output_schema, indent=2)}

Return only valid JSON.
"""
            }
        ],
        temperature=0.1,
        response_format={"type": "json_object"}
    )

    result = response.choices[0].message.content

    try:
        parsed_result = json.loads(result)

        validated_result = RequirementAnalysis.model_validate(
            parsed_result
        )

        return validated_result.model_dump()

    except (json.JSONDecodeError, ValueError) as error:
        print("\nRAW LLM RESPONSE:\n", result)

        raise ValueError(
            f"Requirement analysis validation failed: {error}"
        )
