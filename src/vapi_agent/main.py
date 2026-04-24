from fastapi import FastAPI, Request
import logging

app = FastAPI()
logging.basicConfig(level=logging.INFO)

@app.post("/api/vapi/webhook")
async def handle_vapi_webhook(request: Request):
    """
    Endpoint for Vapi to send Webhooks during and after a call.
    Expects to parse 'end-of-call-report' objects containing the transcript and summary.
    """
    data = await request.json()
    message_type = data.get("message", {}).get("type")
    logging.info(f"Received Vapi Payload of type: {message_type}")
    
    if message_type == "end-of-call-report":
        call_summary = data.get("message", {}).get("summary", "No summary provided.")
        transcript = data.get("message", {}).get("transcript", "")
        
        logging.info("--- CALL SUMMARY ---")
        logging.info(call_summary)
        
        # In a real payload, structured data extraction requested from the VAPI agent 
        # is available in data['message']['analysis']
        # This is where we will route the Lead quote back into InsForge.
        
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    # Make sure your ngrok tunnel forwards exactly to port 8000!
    uvicorn.run(app, host="0.0.0.0", port=8000)
