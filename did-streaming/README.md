# MediMitra: D-ID WebRTC Avatar Video Streaming Tier

## 🎥 Overview
This module integrates real-time, bidirectional WebRTC video streaming with D-ID's conversational digital human technology. It powers MediMitra's interactive AI Doctor avatar consultation mode with synchronized neural lip-sync and audio-visual responses.

### 👥 Development Team
- **Sheikh Mohammad Ashraf (A266)**
- **Samarth Srivastava (A255)**
- **Aadit Doshi (A251)**
- **Madhav Soni (A265)**
*Department of Computer Engineering, STME, SVKM's NMIMS, Navi Mumbai*
*Project Supervisor: Dr. Snehal Lohi*

---

## 🏗️ Architecture & Signal Flow

1. **SDP Handshake**: Creates a WebRTC peer connection session with the D-ID streaming gateway (`POST /talks/streams`).
2. **ICE Candidate Exchange**: Exchanges ICE candidates across client and remote media servers for NAT traversal.
3. **Medical Dialogue Routing**: Dispatches patient inquiries to MediMitra's backend consultation endpoint (`/chat`), which incorporates intent triage and clinical guidance.
4. **Speech & Video Synthesis**: Transmits response text to D-ID's streaming talk endpoint (`POST /talks/streams/{id}`), streaming synthesized H.264 video back to the HTML5 video element with sub-second latency.

---

## 📁 Directory Files

| File | Purpose |
|------|---------|
| `streaming-client-api.js` | WebRTC peer connection setup, SDP exchange, video track binding, and message handling |
| `index.html` | Clean standalone video streaming interface embedded via iframe in `/client` |
| `app.js` | Dedicated Express server with CORS support serving the streaming assets |
| `openai.js` | OpenAI/LLM dialogue fallback client with clinical prompt formatting |
| `api.json.example` | Template for configuring D-ID API credentials and voice selection |
| `package.json` | Dependencies and startup scripts |
| `oracle_Idle.mp4` | Looping idle video state for the digital doctor avatar |
| `oracle_pic.jpg` | High-resolution doctor portrait source image for D-ID generation |

---

## ⚙️ Configuration

1. Copy `api.json.example` to `api.json`:
   ```bash
   cp api.json.example api.json
   ```

2. Supply your credentials in `api.json`:
   ```json
   {
     "key": "your_did_api_key_here",
     "openai_key": "your_openai_api_key_here",
     "voice_id": "en-US-JennyNeural"
   }
   ```

---

## 🚀 Independent Execution

While the streaming tier is automatically launched or mounted by MediMitra's main backend orchestrator (`server/index.js`), it can also be tested independently:

```bash
# Install dependencies
npm install

# Run the local streaming server on port 8081
npm start
```
