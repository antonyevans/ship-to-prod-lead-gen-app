# SF Service Agent

An autonomous agent that connects clients with local service providers in San Francisco — built at the Ship to Prod Hackathon.

## What It Does

Service providers upload their info once. Clients search in natural language. The agent finds a match, verifies it against the live web, and hands off to a voice agent to book the appointment.

> "Massage in SF under $90" → finds Luna Massage → verifies their real phone → Vapi calls to book.

## Pipeline

```
Provider                     Senso KB                      Client
────────                     ────────                       ──────
Name, service,   ──upload──▶ Cited markdown   ◀──search──  Natural language query
price, phone                 Agent-readable                 │
                                                            ▼
                                                       Tinyfish
                                                       Verifies real phone via Google
                                                            │
                                                            ▼
                                                         Vapi
                                                       Voice call → books appointment
```

## Sponsor Tools Used

| Tool | Role |
|------|------|
| **Senso** | Knowledge base — stores provider listings as cited, agent-readable markdown |
| **Tinyfish** | Web agent — verifies each provider's real phone number against Google |
| **Vapi** | Voice AI — makes the booking call on the client's behalf |

## Modules

### `provider_upload.py` — Provider side
Formats a service provider's info as structured markdown and publishes it to the Senso Knowledge Base via API.

```bash
# Interactive
python3 provider_upload.py

# Inline JSON
python3 provider_upload.py --json '{"name":"Luna Massage","service_type":"massage","price":"$70-90/hr","phone":"415-555-0101","location":"Mission District SF","availability":"Mon-Fri 9am-7pm","target_client":"adults seeking relaxation"}'
```

### `client_search.py` — Client side
Takes a natural language query, searches Senso KB for matching providers, runs Tinyfish verification on each result, and returns Vapi-ready JSON.

```bash
python3 client_search.py "massage in SF under $90"
```

Output:
```json
[
  {
    "name": "Luna Massage",
    "phone": "(415) 513-2560",
    "price": "$70-90/hr",
    "availability": "Mon-Fri 9am-7pm",
    "service_type": "massage",
    "location": "Mission District, SF",
    "website": "solylunaspa.com"
  }
]
```

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
```

Fill in `.env`:
```
TINYFISH_API_KEY=your_tinyfish_key
SENSO_API_KEY=your_senso_key
```

## How Tinyfish Is Used

After Senso returns provider matches, Tinyfish sends a real browser agent to Google to verify each business exists and fetch their actual phone number. This replaces placeholder data with ground truth from the live web.

> Senso stores what providers say about themselves. Tinyfish verifies it against the real web.

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

## Team

Built at the **Ship to Prod Hackathon** — SF, April 2026.
