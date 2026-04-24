"""
Module 1: Provider Upload
Formats provider info as cited markdown and publishes it to the Senso Knowledge Base.

Usage:
    python provider_upload.py                         # interactive prompt
    python provider_upload.py --json < provider.json  # pipe JSON from stdin
    python provider_upload.py --json '{"name":...}'   # inline JSON string
"""

import json
import os
import sys
from dataclasses import asdict, dataclass

import requests
from dotenv import load_dotenv

load_dotenv(override=True)

SENSO_BASE_URL = "https://apiv2.senso.ai/api/v1"
SENSO_API_KEY = os.getenv("SENSO_API_KEY")
_raw_folder = os.getenv("SENSO_FOLDER_ID", "").strip()
SENSO_FOLDER_ID = _raw_folder if _raw_folder and not _raw_folder.startswith("#") else None


@dataclass
class ProviderInfo:
    name: str
    service_type: str
    price: str          # free-form, e.g. "$70-90/hr" or "80"
    location: str
    phone: str
    availability: str
    target_client: str


def _format_markdown(p: ProviderInfo) -> str:
    return f"""# {p.name}

**Service:** {p.service_type}
**Price:** {p.price}
**Location:** {p.location}
**Phone:** {p.phone}
**Availability:** {p.availability}
**Ideal for:** {p.target_client}
"""


def upload_provider(provider: ProviderInfo) -> dict:
    """POST provider info to Senso KB as cited markdown. Returns the API response."""
    if not SENSO_API_KEY:
        raise EnvironmentError("SENSO_API_KEY environment variable is not set.")

    payload = {
        "title": f"{provider.name} — {provider.service_type} in {provider.location}",
        "text": _format_markdown(provider),
    }
    if SENSO_FOLDER_ID:
        payload["kb_folder_node_id"] = SENSO_FOLDER_ID

    resp = requests.post(
        f"{SENSO_BASE_URL}/org/kb/raw",
        headers={
            "X-API-Key": SENSO_API_KEY,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    if not resp.ok:
        raise requests.HTTPError(
            f"{resp.status_code} {resp.reason}: {resp.text}", response=resp
        )
    return resp.json()


def _prompt_input() -> ProviderInfo:
    print("\n=== Provider Registration ===\n")
    return ProviderInfo(
        name=input("Provider name: ").strip(),
        service_type=input("Service type (e.g. massage, tutoring, plumbing): ").strip(),
        price=input("Price (e.g. $70-90/hr): ").strip(),
        location=input("Location (city / neighborhood): ").strip(),
        phone=input("Phone number: ").strip(),
        availability=input("Availability (e.g. Mon–Fri 9am–6pm): ").strip(),
        target_client=input("Target client description: ").strip(),
    )


def _from_json(source: str) -> ProviderInfo:
    data = json.loads(source)
    return ProviderInfo(
        name=data["name"],
        service_type=data["service_type"],
        price=str(data["price"]),
        location=data["location"],
        phone=data["phone"],
        availability=data["availability"],
        target_client=data["target_client"],
    )


if __name__ == "__main__":
    if "--json" in sys.argv:
        idx = sys.argv.index("--json")
        # Inline string: python provider_upload.py --json '{"name":...}'
        if idx + 1 < len(sys.argv):
            provider = _from_json(sys.argv[idx + 1])
        else:
            # Piped: python provider_upload.py --json < provider.json
            provider = _from_json(sys.stdin.read())
    else:
        provider = _prompt_input()

    print(f"\nUploading '{provider.name}' to Senso KB…")
    result = upload_provider(provider)
    print("Upload successful!\n")
    print(json.dumps(result, indent=2))
