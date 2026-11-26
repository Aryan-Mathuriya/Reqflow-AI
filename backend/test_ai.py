from app.services.llm_service import analyze_requirements

requirements = """
I want to build an e-commerce website.

Users should be able to register, log in, browse products,
add products to cart, make online payments and track orders.

The admin should be able to manage products and orders.

My budget is approximately 2 lakh rupees.
The project should be completed within 45 days.
"""

try:
    result = analyze_requirements(requirements)

    print("\nAI ANALYSIS SUCCESSFUL\n")
    print(result)

except Exception as error:
    print("ERROR:", error)