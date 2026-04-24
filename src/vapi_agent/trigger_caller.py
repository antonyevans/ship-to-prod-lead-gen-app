import os
import requests
from dotenv import load_dotenv

load_dotenv()

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_SERVER_URL = os.getenv("VAPI_SERVER_URL")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+18882742370")

if not VAPI_API_KEY or not VAPI_SERVER_URL:
    print("WARNING: Please explicitly set your VAPI_API_KEY and VAPI_SERVER_URL within the .env file!")
    exit(1)

def trigger_outbound_call(customer_number: str, customer_name: str, product_offering: str, ideal_client_profile: str):
    url = "https://api.vapi.ai/call"
    
    headers = {
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "phoneNumber": {
            "twilioPhoneNumber": TWILIO_PHONE_NUMBER, 
            "phoneNumber": customer_number
        },
        "model": {
            "provider": "openai",
            "model": "gpt-4-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        f"You are an energetic sales agent representing our Lead Gen team. "
                        f"The prospect you are speaking to is {customer_name}. "
                        f"Your core objective is to pitch the following product offering: '{product_offering}'. "
                        f"Target Context: We focus tightly on '{ideal_client_profile}'. "
                        f"At the end of the call, try to extract their budget requirements or explicitly ask "
                        f"what parameters they would need for a project quote so we can file it securely."
                    )
                }
            ]
        },
        "serverUrl": VAPI_SERVER_URL,
        "voice": {
            "provider": "11labs",
            "voiceId": "pMsXgVXv3BLzUgSXRplE"
        }
    }
    
    print(f"Triggering outbound call to {customer_name} at {customer_number} via VAPI...")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 201:
        print("Success! Vapi has initiated the call.")
        print(response.json())
    else:
        print(f"Failed to initiate call [Code {response.status_code}]: {response.text}")

if __name__ == "__main__":
    # Example execution testing structure. TinyFish search scripts will inject data dynamically here:
    print("Please modify the customer_number in __main__ prior to testing!")
    trigger_outbound_call(
        customer_number="+15551234567",
        customer_name="John Prospect",
        product_offering="Autonomous AI Workflows",
        ideal_client_profile="B2B saas startups"
    )
