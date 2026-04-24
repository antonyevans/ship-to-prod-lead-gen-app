# Vapi Voice Agent Stack

This folder contains the Python code specifically built for the Voice Agent interactions.

## Setup Instructions
1. Install Python packages: `pip install -r requirements.txt`
2. Create a `.env` file by duplicating `.env.example`.
3. Paste your Vapi API Token securely into `.env`.
4. Paste your Twilio Outbound Phone Number (Required to bypass the 10 call limit).

## Running the Architecture
Because Vapi needs to send webhook payloads globally, we need to spin up the local server and expose it over Ngrok.
1. Boot the FastAPI Server via: `python main.py`
2. Open a separate terminal and tunnel it out: `ngrok http 8000`
3. Copy the URL ngrok gives you and append `/api/vapi/webhook` to it. Put this full URL as the `VAPI_SERVER_URL` in your `.env`.
4. Finally, you can execute a call via: `python trigger_caller.py`.
