from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import logging
import os
from trigger_caller import trigger_outbound_call

app = FastAPI()
logging.basicConfig(level=logging.INFO)

# --- IN MEMORY DATABASE (MOCK INSFORGE) ---
# To test the UI, we store leads globally.
global_leads_db = []

# --- MODELS ---
class CampaignSetup(BaseModel):
    agentName: str
    productOffering: str
    idealProfile: str

# --- CORS & STATIC FILES ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the dashboard directory at root (will prioritize index.html if we point explicitly)
dashboard_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dashboard")

# --- ENDPOINTS ---

@app.post("/api/start-campaign")
async def start_campaign(data: CampaignSetup, background_tasks: BackgroundTasks):
    """
    Called by the UI to initialize the agent.
    Mocks TinyFish lead generation and fires VAPI calls.
    """
    logging.info(f"Starting Campaign for {data.agentName}...")
    
    # 1. Mock TinyFish Lead Search Output
    mock_leads = [
        {"name": "Alice Innovator", "company": "TechNova AI", "phone": "+14155551000", "status": "Calling", "summary": ""},
        {"name": "Bob Scaler", "company": "GrowthStack", "phone": "+14155552000", "status": "Calling", "summary": ""}
    ]
    
    global global_leads_db
    global_leads_db = mock_leads
    
    # 2. Trigger VAPI logic in background
    for lead in mock_leads:
        background_tasks.add_task(
            trigger_outbound_call,
            customer_number=lead["phone"],
            customer_name=lead["name"],
            product_offering=data.productOffering,
            ideal_client_profile=data.idealProfile
        )
        
    return {"status": "success"}

@app.get("/api/leads")
async def get_leads():
    """
    Polled by the UI to fetch the live client database states.
    """
    return {"leads": global_leads_db}

@app.post("/api/vapi/webhook")
async def handle_vapi_webhook(request: Request):
    """
    Endpoint for Vapi to send Webhooks during and after a call.
    """
    data = await request.json()
    message_type = data.get("message", {}).get("type")
    logging.info(f"Received Vapi Payload of type: {message_type}")
    
    if message_type == "end-of-call-report":
        call_summary = data.get("message", {}).get("summary", "No summary provided.")
        target_number = data.get("message", {}).get("call", {}).get("customer", {}).get("number")
        
        logging.info("--- CALL SUMMARY ---")
        logging.info(call_summary)
        
        # Update the live database based on phone number match
        global global_leads_db
        for lead in global_leads_db:
            if lead["phone"] == target_number or target_number is None: # fallback
                lead["status"] = "Completed"
                lead["summary"] = call_summary
                
    return {"status": "success"}

# Serve Frontend Index explicitly
@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(dashboard_path, "index.html"))

# Serve all other static assets (styles.css, app.js)
app.mount("/", StaticFiles(directory=dashboard_path), name="static")

if __name__ == "__main__":
    import uvicorn
    # Make sure your ngrok tunnel forwards exactly to port 8000!
    uvicorn.run(app, host="0.0.0.0", port=8000)
