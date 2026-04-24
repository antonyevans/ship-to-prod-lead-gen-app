# Tinyfish + Senso → Vapi Integration Handoff

How to connect Nils's search module to your Vapi booking agent.

---

## What You're Getting

Call `client_search.py` with a user query. It returns a JSON array of verified SF businesses — phone numbers confirmed against Google via Tinyfish. Feed that JSON straight into Vapi.

---

## How to Call It

### Option A — Run as a subprocess from your code

```python
import subprocess
import json

def get_providers(query: str) -> list[dict]:
    result = subprocess.run(
        ["python3", "src/client_search.py", query],
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)

providers = get_providers("massage in SF under $90")
# providers is now a list ready for Vapi
```

### Option B — Import directly

```python
import sys
sys.path.insert(0, "src")
from client_search import search_providers

providers = search_providers("massage in SF under $90")
```

---

## Output Format

`search_providers()` returns a list of up to 3 dicts:

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

---

## Suggested Vapi Script

Use the first result to build the call context:

```python
provider = providers[0]

vapi_call = {
    "phone_number": provider["phone"],
    "assistant": {
        "firstMessage": f"Hi, I'm calling to book a {provider['service_type']} appointment. Do you have availability {provider['availability']}?",
        "context": f"Business: {provider['name']}. Service: {provider['service_type']}. Price: {provider['price']}."
    }
}
```

---

## Environment Setup

Make sure your `.env` has:

```
TINYFISH_API_KEY=sk-tinyfish-...
SENSO_API_KEY=...
```

Both keys are required. Ask Nils if you need them.

---

## Adding More Providers for Testing

```bash
python3 src/provider_upload.py --json '{"name":"Your Test Biz","service_type":"massage","price":"$80/hr","phone":"415-555-0000","location":"SOMA SF","availability":"Mon-Fri 10am-6pm","target_client":"anyone"}'
```

---

## Questions

Ping Nils. The two files you need are `src/client_search.py` and `src/provider_upload.py`.
