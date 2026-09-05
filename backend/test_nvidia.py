import asyncio

from app.ai.nvidia_provider import NVIDIAProvider
from app.ai.models import ProviderRequest


async def main():
    print("Starting NVIDIA test...")

    provider = NVIDIAProvider()

    print("Provider:", provider.get_model_info().provider)
    print("Model:", provider.get_model_info().model_id)
    print("Sending request...")

    request = ProviderRequest(
        system_prompt="You are a helpful assistant.",
        user_message="Reply with only: NVIDIA TEST OK",
        max_tokens=50,
        temperature=0.0,
    )

    response = await provider.generate_structured(request)

    print("\n===== RESPONSE =====")
    print(response.content)

    print("\n===== PROVIDER =====")
    print(response.provider)

    print("\n===== MODEL =====")
    print(response.model_used)

    print("\n===== TOKENS =====")
    print("Input:", response.input_tokens)
    print("Output:", response.output_tokens)


if __name__ == "__main__":
    asyncio.run(main())