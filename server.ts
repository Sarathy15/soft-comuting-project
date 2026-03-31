import express from "express";
import { createServer as createHttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- AI Tools to track ---
const AI_TOOLS = [
  "ChatGPT", "Gemini", "Grok", "Perplexity", "Claude", "Llama", "Mistral", 
  "DeepSeek", "Copilot", "Midjourney", "Stable Diffusion", "Sora"
];

const INDUSTRIES = ["Student", "IT", "Finance", "Healthcare", "Marketing"];
const REGIONS = ["Chennai", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune"];

// --- Count-Min Sketch Implementation ---
class CountMinSketch {
  width: number;
  depth: number;
  table: number[][];
  hashes: ((s: string) => number)[];

  constructor(epsilon: number, delta: number) {
    this.width = Math.ceil(Math.E / epsilon);
    this.depth = Math.ceil(Math.log(1 / delta));
    this.table = Array.from({ length: this.depth }, () => new Array(this.width).fill(0));
    
    // Simple hash functions using different seeds
    this.hashes = Array.from({ length: this.depth }, (_, i) => {
      return (s: string) => {
        let hash = 0;
        for (let j = 0; j < s.length; j++) {
          hash = (hash * (31 + i) + s.charCodeAt(j)) % this.width;
        }
        return Math.abs(hash);
      };
    });
  }

  add(item: string) {
    for (let i = 0; i < this.depth; i++) {
      const idx = this.hashes[i](item);
      this.table[i][idx]++;
    }
  }

  estimate(item: string): number {
    let min = Infinity;
    for (let i = 0; i < this.depth; i++) {
      const idx = this.hashes[i](item);
      min = Math.min(min, this.table[i][idx]);
    }
    return min === Infinity ? 0 : min;
  }

  reset() {
    for (let i = 0; i < this.depth; i++) {
      this.table[i].fill(0);
    }
  }
}

// --- Top-K Tracker ---
class TopKTracker {
  cms: CountMinSketch;
  k: number;
  topK: { item: string; count: number }[] = [];

  constructor(k: number, epsilon: number, delta: number) {
    this.cms = new CountMinSketch(epsilon, delta);
    this.k = k;
  }

  update(item: string) {
    this.cms.add(item);
    const count = this.cms.estimate(item);

    const existingIdx = this.topK.findIndex(t => t.item === item);
    if (existingIdx !== -1) {
      this.topK[existingIdx].count = count;
    } else {
      if (this.topK.length < this.k) {
        this.topK.push({ item, count });
      } else if (count > this.topK[this.topK.length - 1].count) {
        this.topK[this.topK.length - 1] = { item, count };
      }
    }
    this.topK.sort((a, b) => b.count - a.count);
  }

  getTopK() {
    return this.topK;
  }
}

// --- Server Setup ---
async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const wss = new WebSocketServer({ server: httpServer });
  const PORT = 3000;

  // Analytics Engines
  const globalShortWindow = new TopKTracker(10, 0.001, 0.01); // 5 min
  const globalLongWindow = new TopKTracker(10, 0.001, 0.01);  // 1 hour
  
  const regionShortWindows: Record<string, TopKTracker> = {};
  REGIONS.forEach(r => {
    regionShortWindows[r] = new TopKTracker(10, 0.001, 0.01);
  });

  const regionStats: Record<string, number> = {};
  REGIONS.forEach(r => regionStats[r] = 0);

  const alerts: { id: string; message: string; timestamp: number }[] = [];

  // Broadcast to all clients
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // --- Hacker News Ingestion ---
  let lastProcessedId = 0;
  const fetchHN = async () => {
    try {
      const response = await fetch("https://hacker-news.firebaseio.com/v0/newstories.json");
      const ids = await response.json() as number[];
      const newIds = ids.filter(id => id > lastProcessedId).slice(0, 10);
      
      for (const id of newIds) {
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        const item = await itemRes.json() as any;
        if (item && item.title) {
          processText(item.title);
        }
        lastProcessedId = Math.max(lastProcessedId, id);
      }
    } catch (e) {
      console.error("HN Fetch Error", e);
    }
  };

  const processText = (text: string) => {
    const lowerText = text.toLowerCase();
    AI_TOOLS.forEach(tool => {
      if (lowerText.includes(tool.toLowerCase())) {
        const event = {
          tool,
          industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
          region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
          timestamp: Date.now()
        };

        // Update Analytics
        const oldRank = globalShortWindow.getTopK().findIndex(t => t.item === tool);
        globalShortWindow.update(tool);
        globalLongWindow.update(tool);
        
        // Update Region-specific tracker
        regionShortWindows[event.region].update(tool);
        
        regionStats[event.region]++;

        const newRank = globalShortWindow.getTopK().findIndex(t => t.item === tool);
        
        // Detect rank change alert
        if (oldRank !== -1 && newRank !== -1 && newRank < oldRank) {
          const alert = {
            id: Math.random().toString(36).substr(2, 9),
            message: `${tool} moved up to rank ${newRank + 1} globally!`,
            timestamp: Date.now()
          };
          alerts.unshift(alert);
          if (alerts.length > 10) alerts.pop();
        }

        broadcast({ type: "EVENT", event });
      }
    });
  };

  // Simulation to keep it lively
  setInterval(() => {
    const randomTool = AI_TOOLS[Math.floor(Math.random() * AI_TOOLS.length)];
    if (Math.random() > 0.3) { // 70% chance to simulate an event
      processText(`Discussion about ${randomTool} in the industry`);
    }
  }, 2000);

  setInterval(fetchHN, 10000);

  // Periodic state broadcast
  setInterval(() => {
    const regionTopK: Record<string, any[]> = {};
    REGIONS.forEach(r => {
      regionTopK[r] = regionShortWindows[r].getTopK();
    });

    broadcast({
      type: "STATS",
      shortTopK: globalShortWindow.getTopK(),
      longTopK: globalLongWindow.getTopK(),
      regionTopK,
      regionStats,
      alerts
    });
  }, 1000);

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
