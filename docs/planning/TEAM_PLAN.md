# Lead Gen Agent - Team Plan

## Project Overview
We are building an autonomous **Lead Gen Agent**, designed to source, pitch, and qualify potential clients for users.

**Data Flow:**
1. **Input:** User provides their name, phone, email, website, offering details, and ideal client profile.
2. **Process:** The agent will:
   - Search the web for relevant leads using TinyFish.
   - Automatically initiate phone calls to the leads via Vapi.
   - Pitch the user's offering and gather details about a potential project.
   - Populate a database with the lead's contact info, a mini-case study, potential project details, and a pricing quote.
3. **Output:** A frontend Dashboard displaying the database of qualified clients.

## Team Communication & Roles
* **Team Discord Chat:** [Internal DM Group]

This project will utilize at least 3 sponsor tools (as required by the judging criteria):

* **Nils0217**: Search and Web Interaction
  * **Tool:** **TinyFish** ($ npm install -g @tiny-fish/cli)
  * **Tasks:** Build the agent capabilities to search the web for fresh leads, extract clean data of targeted companies/contacts, and structure it.
  
* **antonyevans**: Infrastructure and Backend
  * **Tool:** **Guild.ai / InsForge**
  * **Tasks:** Manage the overall backend architecture. If using InsForge, build out the full-stack database and agent-hosting environment. Provide the dashboard logic where leads are saved.
  * *Note:* InsForge is offering a cash + credits prize for the "Best Use of InsForge".
  
* **Daniel Goodwyn (@DanielGoodwyn)**: Voice Agent & Autocalling
  * **Tool:** **VAPI**
  * **Tasks:** Set up the voice infrastructure. Configure the VAPI agent prompts using the user's input to smoothly pitch leads on the phone, extract project details, and funnel the call transcript/extracted data back into the InsForge backend.

## Missing Parts to Complete
To make sure we finish before the 4:30 PM deadline, we need to address:
1. **Frontend Dashboard:** Who is building the UI for the user to input their data and view the output dashboard? (We could use something quick like Streamlit or Vercel/React).
2. **Hackathon Tokens & API Keys:** We need a central `.env` to share API tokens for Vapi, TinyFish, and InsForge.

### Optional Challenges
* **Monetization Requirement:** The hackathon rules suggest monetizing the agent with payment rails (x402, MPP, CDP, or agentic.market). 
* **Publish to `cited.md`:** We can ensure the agent's output publishes to `cited.md` at the end of the pipeline.

## Submission Guide
* **Deadline:** 4:30 PM today (April 24, 2026). Demos begin at 4:30 PM.
* **Platform:** Submit via Devpost: [https://bit.ly/devpost-apr](https://bit.ly/devpost-apr)
* **Checklist:**
  - [ ] Every team member (max 4) must be registered on Devpost.
  - [ ] Only ONE submission per team.
  - [ ] Select EACH sponsor prize we want to be considered for (TinyFish, Vapi, InsForge, Guild.ai, etc.).
  - [ ] Include a 3-minute demo video or script for the demo presentation.
  - [ ] Agent must demonstrate real-world actions on the web and use 3+ sponsor tools.
