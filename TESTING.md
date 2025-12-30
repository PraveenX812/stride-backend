# EcoInsight Testing Guide

This guide ensures you can verify every feature of the application, from simple visualizations to complex AI interactions.

## 1. Prerequisites
- [ ] Check that `node_modules` are installed in both `/server` and `/client`.
- [ ] Ensure the server is running on Port 3000 and the client on Port 5173 (or 4173 if using Docker).
- [ ] **Recommended:** Have a valid `GEMINI_API_KEY` and `TAVILY_API_KEY` in `server/.env` for the full experience. (Without them, you will test the "Simulation Mode").

---

## 2. Visual Inspection (The Dashboard)
**Goal:** Verify data accuracy and responsiveness.

1. **Launch the App**: Open your browser to the client URL.
2. **Check the Cards**: 
   - Verify "Total CO2" matches the 2023 sum of all sectors (approx 39k Mt).
   - Verify "Highest Emitter" says "Energy".
3. **Check the Charts**:
   - **Bar Chart**: Should show 5 bars (years 2019-2023). Hover over the 2023 bar; the tooltip should show individual sector breakdowns.
   - **Doughnut Chart**: Confirm it has a "Hollow" center with "100%" text.
4. **Responsiveness**: Resize your browser window. The sidebar should stay fixed, but the charts grid should adjust (e.g., from 2 columns to 1 column).

---

## 3. Chat Panel Interaction

### Test Case A: "Smart Fallback" (No API Keys)
**Scenario**: You want to verify the app works for a grader who doesn't have keys.
1. **Action**: Temporarily rename or clear your `.env` file so the server has no keys. Restart server.
2. **Input**: Type "Tell me about transport emissions".
3. **Expected Output**:
   - The bot should reply almost instantly (simulated typing delay ~1s).
   - The answer must be the pre-canned response regarding "road vehicles and freight".
   - The source label (small text above message) should say **"Simulated AI (Keyword Match)"**.

### Test Case B: "Live AI Internet Search" (With Keys)
**Scenario**: Verifying the 'Internet Query' requirement.
1. **Action**: Restore your `.env` with valid `GEMINI_API_KEY` and `TAVILY_API_KEY`. Restart server.
2. **Input**: Type a question about a *recent* real-world event, e.g., *"What were the key outcomes of COP28 regarding methane?"*
3. **Execution Flow**:
   - The app will hit the Tavily API (Search).
   - It will pass results to Gemini.
4. **Expected Output**:
   - The answer should contain specific details not found in the local database (e.g., "transition away from fossil fuels").
   - It should cite sources or links.
   - The source label should say **"Live AI (Gemini) + Web Search"**.

---

## 4. API Endpoint Verification (Technical)
You can use **Postman** or `curl` to verify the backend independently.

**1. GET Emissions Data**
```bash
curl http://localhost:3000/api/emissions
```
*Expected*: A JSON array containing 5 objects (Energy, Transport, etc.).

**2. POST Chat Message**
```bash
curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "energy trends"}'
```
*Expected*: A JSON object: `{ "answer": "...", "source": "..." }`.

---

## 5. Deployment Verification (Docker)
1. Stop all running local terminals.
2. Run `docker-compose up --build`.
3. Wait for `server-1` and `client-1` to start.
4. Visit `http://localhost:4173`.
5. If the site loads and the dashboard appears, the **"Deploy on a Server"** requirement is passed.
