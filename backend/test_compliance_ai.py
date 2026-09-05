import asyncio

from app.services.compliance_service import analyze_compliance_with_ai


async def main():
    result = await analyze_compliance_with_ai(
        requirement_text="Bidder must provide minimum 16 GB RAM.",
        evidence_text="The proposed system has 32 GB DDR5 RAM.",
    )

    print("\n===== AI COMPLIANCE RESULT =====")
    print(result)


if __name__ == "__main__":
    asyncio.run(main())