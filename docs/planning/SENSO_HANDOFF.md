# Senso KB Integration Handoff

How to query the provider knowledge base directly from your Vapi agent.

---

## What Senso Is Doing Here

Senso stores every service provider's listing as structured markdown — name, service, price, phone, availability. It's the database that powers the search. When a client asks for a service, we query Senso to find matches.

---

## Query Senso Directly

If you want to call Senso yourself without going through `client_search.py`:

```python
import requests
import os

SENSO_API_KEY = os.getenv("SENSO_API_KEY")

def query_senso(keyword: str) -> list[dict]:
    r = requests.get(
        "https://apiv2.senso.ai/api/v1/org/kb/find",
        params={"q": keyword},
        headers={"X-API-Key": SENSO_API_KEY},
        timeout=15
    )
    r.raise_for_status()
    return r.json().get("nodes", [])

results = query_senso("massage")
```

Each node has a `kb_node_id` and `name`. To get the full content of a node:

```python
def get_node_content(node_id: str) -> str:
    r = requests.get(
        f"https://apiv2.senso.ai/api/v1/org/kb/nodes/{node_id}/content",
        headers={"X-API-Key": SENSO_API_KEY},
        timeout=15
    )
    return r.json().get("text", "")
```

---

## Recommended: Just Use client_search.py

The simplest path — let our module handle Senso + Tinyfish verification and return clean JSON:

```python
import sys
sys.path.insert(0, "src")
from client_search import search_providers

providers = search_providers("massage in SF under $90")
# Returns verified list with real phone numbers, ready for Vapi
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

---

## Upload a Provider Manually

To add test data to the Senso KB:

```bash
python3 src/provider_upload.py --json '{
  "name": "Test Spa SF",
  "service_type": "massage",
  "price": "$80/hr",
  "phone": "415-555-0000",
  "location": "SOMA SF",
  "availability": "Mon-Fri 10am-6pm",
  "target_client": "anyone"
}'
```

---

## Environment Variables Needed

```
SENSO_API_KEY=...
TINYFISH_API_KEY=...
```

Ask Nils for the keys.

---

## How It Fits With Vapi

```
Client speaks → Vapi captures intent
                     │
                     ▼
              search_providers("massage in SF")
                     │
              Senso KB returns matches
                     │
              Tinyfish verifies phone
                     │
                     ▼
              Vapi calls the business
```

---

## Questions

Ping Nils. Files: `src/client_search.py` and `src/provider_upload.py`.
