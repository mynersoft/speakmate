import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-memory cache for Metered ICE servers to handle credential expiration gracefully
interface CachedIceServers {
  data: any[];
  expiresAt: number;
  provider: string;
}

let iceServersCache: CachedIceServers | null = null;

// Official Metered Open Relay ICE Servers specification
// Metered provides the Open Relay Project with STUN, TURN (UDP/TCP), and TURNS (TLS)
function getMeteredOpenRelayFallback() {
  return [
    // Direct Google STUN for fast direct P2P NAT discovery
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
    // Metered Open Relay STUN
    {
      urls: 'stun:openrelay.metered.ca:80',
    },
    // Metered Open Relay TURN UDP (Port 80)
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    // Metered Open Relay TURN TCP (Port 80 Fallback for UDP-blocked networks)
    {
      urls: 'turn:openrelay.metered.ca:80?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    // Metered Open Relay TURN UDP (Port 443)
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    // Metered Open Relay TURN TCP (Port 443 HTTP/HTTPS traversal)
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    // Metered Open Relay TURNS TLS (Port 443 Encrypted TLS Fallback)
    {
      urls: 'turns:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ];
}

/**
 * Endpoint to securely fetch ICE server credentials (STUN + Metered Open Relay TURN)
 * Never exposes the secret METERED_API_KEY to the client.
 */
app.get('/api/ice-servers', async (_req: Request, res: Response) => {
  const now = Date.now();

  // Return cached credentials if still valid (cached for up to 10 minutes)
  if (iceServersCache && iceServersCache.expiresAt > now) {
    return res.json({
      success: true,
      iceServers: iceServersCache.data,
      provider: iceServersCache.provider,
      turnAvailable: true,
      protocols: ['stun', 'turn:udp', 'turn:tcp', 'turns:tls'],
      expiresAt: iceServersCache.expiresAt,
      cached: true,
    });
  }

  const meteredApiKey = process.env.METERED_API_KEY;
  const meteredDomain = process.env.METERED_DOMAIN || 'openrelay.metered.ca';

  // If a Metered Dashboard API key is configured, fetch live credentials from the Metered REST API
  if (meteredApiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const targetUrl = `https://${meteredDomain}/api/v1/turn/credentials?apiKey=${meteredApiKey}`;
      const response = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const fetchedServers = await response.json();
        if (Array.isArray(fetchedServers) && fetchedServers.length > 0) {
          // Add Google STUN to ensure direct P2P priority
          const fullServers = [
            {
              urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
              ],
            },
            ...fetchedServers,
          ];

          iceServersCache = {
            data: fullServers,
            expiresAt: now + 10 * 60 * 1000, // 10 minutes cache
            provider: `Metered Live (${meteredDomain})`,
          };

          return res.json({
            success: true,
            iceServers: fullServers,
            provider: iceServersCache.provider,
            turnAvailable: true,
            protocols: ['stun', 'turn:udp', 'turn:tcp', 'turns:tls'],
            expiresAt: iceServersCache.expiresAt,
            cached: false,
          });
        }
      }
    } catch (err: any) {
      console.warn('Metered API fetch notice (using Open Relay fallback):', err?.message || err);
    }
  }

  // Official Metered Open Relay credentials fallback
  const fallbackServers = getMeteredOpenRelayFallback();
  iceServersCache = {
    data: fallbackServers,
    expiresAt: now + 15 * 60 * 1000,
    provider: 'Metered Open Relay',
  };

  return res.json({
    success: true,
    iceServers: fallbackServers,
    provider: 'Metered Open Relay',
    turnAvailable: true,
    protocols: ['stun', 'turn:udp', 'turn:tcp', 'turns:tls'],
    expiresAt: iceServersCache.expiresAt,
    cached: false,
  });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SpeakMate Full-Stack Server',
    meteredConfigured: Boolean(process.env.METERED_API_KEY),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SpeakMate] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SpeakMate server:', err);
  process.exit(1);
});
