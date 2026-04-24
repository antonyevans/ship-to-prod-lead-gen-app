"""
Module 2: Client Search
Searches the Senso Knowledge Base for providers matching a client query
and returns the top 3 as JSON — ready to feed into Vapi for booking.

Primary path : Senso KB API (fast, no scraping required)
Optional path: Tinyfish Web Agent (set PROVIDER_DIRECTORY_URL to a public page)

Usage:
    python client_search.py "massage in SF under $90"
    python client_search.py "yoga classes in Brooklyn on weekends"
"""

import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env", override=True)

SENSO_BASE_URL    = "https://apiv2.senso.ai/api/v1"
SENSO_API_KEY     = os.getenv("SENSO_API_KEY")

TINYFISH_ENDPOINT = "https://agent.tinyfish.ai/v1/automation/run-sse"
TINYFISH_API_KEY  = os.getenv("TINYFISH_API_KEY")

_raw_dir_url = os.getenv("PROVIDER_DIRECTORY_URL", "").strip()
PROVIDER_DIRECTORY_URL = (
    _raw_dir_url
    if _raw_dir_url and not _raw_dir_url.startswith("#") and "your-org" not in _raw_dir_url
    else None
)


# ---------------------------------------------------------------------------
# Primary path: Senso KB search
# ---------------------------------------------------------------------------

def _extract_keywords(query: str) -> list[str]:
    """Pull meaningful words from the query to use as Senso search terms."""
    stopwords = {"in", "at", "for", "the", "a", "an", "and", "or", "under", "over", "near"}
    words = re.findall(r"[a-zA-Z]+", query)
    return [w for w in words if w.lower() not in stopwords] or words


def _parse_markdown_provider(title: str, text: str) -> dict:
    """Extract structured fields from the provider markdown we wrote on upload."""
    def field(label: str) -> str:
        m = re.search(rf"\*\*{label}:\*\*\s*(.+)", text)
        return m.group(1).strip() if m else ""

    return {
        "name":         re.sub(r"\s*—.*", "", title).strip(),
        "phone":        field("Phone"),
        "price":        field("Price"),
        "availability": field("Availability"),
        "service_type": field("Service"),
        "location":     field("Location"),
    }


def search_senso(query: str) -> list[dict]:
    """Search Senso KB and return up to 3 matching provider dicts."""
    if not SENSO_API_KEY:
        raise EnvironmentError("SENSO_API_KEY is not set in .env")

    headers = {"X-API-Key": SENSO_API_KEY}
    keywords = _extract_keywords(query)
    seen_ids: set[str] = set()
    nodes: list[dict] = []

    # Search once per keyword, deduplicate by node id
    for kw in keywords:
        r = requests.get(
            f"{SENSO_BASE_URL}/org/kb/find",
            params={"q": kw},
            headers=headers,
            timeout=15,
        )
        r.raise_for_status()
        for node in r.json().get("nodes", []):
            nid = node.get("kb_node_id")
            if nid and nid not in seen_ids:
                seen_ids.add(nid)
                nodes.append(node)

    providers = []
    for node in nodes[:3]:
        nid = node["kb_node_id"]
        title = node.get("name", "")
        r = requests.get(
            f"{SENSO_BASE_URL}/org/kb/nodes/{nid}/content",
            headers=headers,
            timeout=15,
        )
        if r.ok:
            data = r.json()
            providers.append(_parse_markdown_provider(title, data.get("text", "")))

    return providers


# ---------------------------------------------------------------------------
# Optional path: Tinyfish Web Agent (requires a public directory URL)
# ---------------------------------------------------------------------------

def _parse_sse(response) -> list[dict]:
    events = []
    for raw_line in response.iter_lines(decode_unicode=True):
        if not raw_line or not raw_line.startswith("data:"):
            continue
        payload = raw_line[len("data:"):].strip()
        if payload == "[DONE]":
            break
        try:
            events.append(json.loads(payload))
        except json.JSONDecodeError:
            pass
    return events


def _extract_providers_from_text(result) -> list:
    text = result if isinstance(result, str) else json.dumps(result)
    m = re.search(r'\[[\s\S]*?\]', text)
    if m:
        try:
            parsed = json.loads(m.group())
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass
    if isinstance(result, dict) and "providers" in result:
        return result["providers"]
    return []


def search_tinyfish(query: str, directory_url: str) -> list[dict]:
    """Use Tinyfish to browse a public provider directory URL."""
    if not TINYFISH_API_KEY:
        raise EnvironmentError("TINYFISH_API_KEY is not set in .env")

    goal = (
        f'Find the top 3 providers matching: "{query}". '
        "For each extract name, phone, price, availability, service type, and location. "
        "Return a JSON array of provider objects."
    )
    resp = requests.post(
        TINYFISH_ENDPOINT,
        headers={
            "X-API-Key": TINYFISH_API_KEY,
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        },
        json={
            "url": directory_url,
            "goal": goal,
            "browser_profile": "stealth",
            "agent_config": {"max_steps": 30},
        },
        stream=True,
        timeout=120,
    )
    if not resp.ok:
        raise requests.HTTPError(f"{resp.status_code}: {resp.text}", response=resp)

    for event in reversed(_parse_sse(resp)):
        if event.get("type") == "COMPLETE":
            if event.get("status") != "COMPLETED":
                raise RuntimeError(f"Tinyfish: {event.get('error', 'unknown error')}")
            return _extract_providers_from_text(event.get("result", {}))[:3]

    raise RuntimeError("No COMPLETE event from Tinyfish.")


# ---------------------------------------------------------------------------
# Step 2: Tinyfish Google verification
# ---------------------------------------------------------------------------

def _tinyfish_verify(business_name: str) -> dict:
    """
    Use Tinyfish to search Google for a business and return
    verified phone, website, and service_type. Returns {} on any failure.
    """
    if not TINYFISH_API_KEY or not business_name:
        return {}

    goal = (
        f"Search for {business_name} in San Francisco. "
        "Extract their real phone number, website URL, and confirm their service type. "
        "Return a JSON object with keys: phone, website, service_type."
    )
    try:
        resp = requests.post(
            TINYFISH_ENDPOINT,
            headers={
                "X-API-Key": TINYFISH_API_KEY,
                "Content-Type": "application/json",
                "Accept": "text/event-stream",
            },
            json={
                "url": f"https://www.google.com/search?q={requests.utils.quote(business_name + ' San Francisco')}",
                "goal": goal,
                "browser_profile": "stealth",
                "agent_config": {"max_steps": 15},
            },
            stream=True,
            timeout=90,
        )
        if not resp.ok:
            return {}

        for event in reversed(_parse_sse(resp)):
            if event.get("type") == "COMPLETE" and event.get("status") == "COMPLETED":
                return _parse_verification(event.get("result", {}))
    except Exception:
        pass
    return {}


def _parse_verification(result) -> dict:
    """Extract phone/website/service_type from whatever Tinyfish returned."""
    if isinstance(result, dict):
        # Direct keys
        if any(k in result for k in ("phone", "website", "service_type")):
            return {
                "phone":        str(result.get("phone", "") or ""),
                "website":      str(result.get("website", "") or ""),
                "service_type": str(result.get("service_type", "") or ""),
            }

    # Try to pull a JSON object out of a string result
    text = result if isinstance(result, str) else json.dumps(result)
    m = re.search(r'\{[\s\S]*?\}', text)
    if m:
        try:
            obj = json.loads(m.group())
            if isinstance(obj, dict):
                return {
                    "phone":        str(obj.get("phone", "") or ""),
                    "website":      str(obj.get("website", "") or ""),
                    "service_type": str(obj.get("service_type", "") or ""),
                }
        except json.JSONDecodeError:
            pass
    return {}


def _verify_providers(providers: list[dict]) -> list[dict]:
    """
    Run Tinyfish Google verification for each provider in parallel,
    then merge verified phone/website back into the result.
    """
    if not TINYFISH_API_KEY:
        print("(Skipping Tinyfish verification — TINYFISH_API_KEY not set)\n")
        return providers

    print(f"Verifying {len(providers)} provider(s) via Tinyfish Google search…\n")

    def verify_one(provider: dict) -> tuple[int, dict]:
        idx = provider["_idx"]
        name = provider.get("name", "")
        verified = _tinyfish_verify(name)
        return idx, verified

    indexed = [{**p, "_idx": i} for i, p in enumerate(providers)]
    results = [{}] * len(providers)

    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(verify_one, p): p for p in indexed}
        for future in as_completed(futures):
            idx, verified = future.result()
            results[idx] = verified

    merged = []
    for i, provider in enumerate(providers):
        v = results[i]
        merged_provider = dict(provider)
        # Replace phone only if Tinyfish found a real one
        if v.get("phone"):
            print(f"  ✓ {provider['name']}: phone updated → {v['phone']}")
            merged_provider["phone"] = v["phone"]
        else:
            print(f"  – {provider['name']}: could not verify phone, keeping original")
        if v.get("website"):
            merged_provider["website"] = v["website"]
        if v.get("service_type"):
            merged_provider["service_type_verified"] = v["service_type"]
        merged.append(merged_provider)

    print()
    return merged


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def search_providers(query: str) -> list[dict]:
    """
    Step 1: Find up to 3 matching providers from Senso KB (or Tinyfish directory).
    Step 2: Verify each result's phone number via Tinyfish Google search.
    Returns Vapi-ready JSON.
    """
    if PROVIDER_DIRECTORY_URL:
        print(f"Searching via Tinyfish: {PROVIDER_DIRECTORY_URL}\n")
        raw = search_tinyfish(query, PROVIDER_DIRECTORY_URL)
    else:
        print("Searching Senso KB…\n")
        raw = search_senso(query)

    providers = [
        {
            "name":         str(p.get("name", "")),
            "phone":        str(p.get("phone", "")),
            "price":        str(p.get("price", "")),
            "availability": str(p.get("availability", "")),
            "service_type": str(p.get("service_type", "")),
            "location":     str(p.get("location", "")),
        }
        for p in raw
    ]

    # Step 2: verify phone numbers via Tinyfish + Google
    providers = _verify_providers(providers)

    return providers


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python client_search.py "<query>"')
        print('Example: python client_search.py "massage in SF under $90"')
        sys.exit(1)

    query = sys.argv[1]
    print(f"Query: {query}")

    results = search_providers(query)
    print(json.dumps(results, indent=2))
