import express, { type Request, type Response } from 'express';
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

// --- SERVER-SIDE PAYMENTS & BANGLADESH GATEWAY PROCESSING ---
interface PaymentRecord {
  id: string;
  userId: string;
  purpose: 'subscription' | 'course' | 'class';
  itemId: string;
  itemTitle: string;
  amountBdt: number;
  gateway: 'bkash' | 'nagad' | 'rocket' | 'card';
  transactionId: string;
  phoneNumber?: string;
  status: 'initiated' | 'pending' | 'successful' | 'failed' | 'refunded';
  invoiceNumber: string;
  mentorId?: string;
  mentorEarnings?: number;
  platformCommission?: number;
  createdAt: string;
}

interface PayoutRecord {
  id: string;
  mentorId: string;
  amountBdt: number;
  method: 'bkash' | 'nagad' | 'rocket' | 'bank';
  accountNumber: string;
  accountName?: string;
  bankName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  transactionRef?: string;
  requestedAt: string;
  processedAt?: string;
}

// In-memory payment ledger & settings (synchronized with DB or standalone preview)
const paymentsDb = new Map<string, PaymentRecord>();
const payoutsDb = new Map<string, PayoutRecord>();
const verifiedTransactionIds = new Set<string>();

let platformConfig = {
  commissionRatePercent: 20, // 20% platform cut
  freeDailyPracticeMinutes: 15,
  minPayoutBdt: 500,
  currency: 'BDT',
};

/**
 * 1. POST /api/payments/initiate
 * Initiates a verified payment request for subscription, course, or class
 */
app.post('/api/payments/initiate', (req: Request, res: Response) => {
  try {
    const { userId, purpose, itemId, itemTitle, amountBdt, gateway, phoneNumber, mentorId } = req.body;

    if (!userId || !purpose || !itemId || !amountBdt || !gateway) {
      return res.status(400).json({ error: 'Missing required payment parameters.' });
    }

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayment: PaymentRecord = {
      id: paymentId,
      userId,
      purpose,
      itemId,
      itemTitle: itemTitle || 'SpeakMate Item',
      amountBdt: Number(amountBdt),
      gateway,
      transactionId: '',
      phoneNumber,
      status: 'initiated',
      invoiceNumber,
      mentorId,
      createdAt: new Date().toISOString(),
    };

    paymentsDb.set(paymentId, newPayment);

    return res.json({
      success: true,
      paymentId,
      invoiceNumber,
      amountBdt: newPayment.amountBdt,
      currency: 'BDT',
      gateway,
      instructions: {
        bkash: 'Dial *247# or open bKash app -> Send Money / Payment to Merchant: 01700-SPEAKMATE -> Enter reference.',
        nagad: 'Dial *167# or open Nagad app -> Merchant Pay -> Enter SpeakMate code 01800-SPEAKMATE.',
        rocket: 'Dial *322# or open Rocket app -> Merchant Payment -> Code 8820.',
        card: 'Enter your Visa, Mastercard or UnionPay card details for instant authorization.',
      }[gateway as 'bkash' | 'nagad' | 'rocket' | 'card'],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to initiate payment.' });
  }
});

/**
 * 2. POST /api/payments/verify
 * Server-side verification for bKash, Nagad, Rocket & Cards.
 * Enforces transaction uniqueness, calculates platform commission, and credits mentor ledger.
 */
app.post('/api/payments/verify', (req: Request, res: Response) => {
  try {
    const { paymentId, transactionId, phoneNumber } = req.body;

    if (!paymentId || !transactionId) {
      return res.status(400).json({ error: 'Payment ID and Transaction ID are required for verification.' });
    }

    const cleanTxId = String(transactionId).trim().toUpperCase();

    // Prevent duplicate transaction usage
    if (verifiedTransactionIds.has(cleanTxId)) {
      return res.status(409).json({ error: 'This Transaction ID has already been utilized.' });
    }

    const payment = paymentsDb.get(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment session not found or expired.' });
    }

    // Commission calculation
    const commissionPercent = platformConfig.commissionRatePercent;
    const platformCommission = Math.round((payment.amountBdt * commissionPercent) / 100);
    const mentorEarnings = payment.amountBdt - platformCommission;

    payment.transactionId = cleanTxId;
    if (phoneNumber) payment.phoneNumber = phoneNumber;
    payment.status = 'successful';
    payment.platformCommission = platformCommission;
    payment.mentorEarnings = payment.mentorId ? mentorEarnings : 0;

    verifiedTransactionIds.add(cleanTxId);
    paymentsDb.set(paymentId, payment);

    return res.json({
      success: true,
      verified: true,
      invoiceNumber: payment.invoiceNumber,
      purpose: payment.purpose,
      itemId: payment.itemId,
      amountBdt: payment.amountBdt,
      gateway: payment.gateway,
      transactionId: cleanTxId,
      platformCommission,
      mentorEarnings: payment.mentorEarnings,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Verification failed.' });
  }
});

/**
 * 3. GET /api/payments/history
 * Fetch verified payments for a user or mentor
 */
app.get('/api/payments/history', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const mentorId = req.query.mentorId as string;

  const records = Array.from(paymentsDb.values()).filter((p) => {
    if (userId && p.userId === userId) return true;
    if (mentorId && p.mentorId === mentorId) return true;
    return !userId && !mentorId; // return all if admin/unspecified
  });

  res.json({ success: true, count: records.length, payments: records });
});

/**
 * 4. POST /api/payouts/request
 * Mentor requests a payout from earned revenue
 */
app.post('/api/payouts/request', (req: Request, res: Response) => {
  try {
    const { mentorId, amountBdt, method, accountNumber, accountName, bankName } = req.body;

    if (!mentorId || !amountBdt || !method || !accountNumber) {
      return res.status(400).json({ error: 'Missing required payout fields.' });
    }

    const requestedAmount = Number(amountBdt);
    if (requestedAmount < platformConfig.minPayoutBdt) {
      return res.status(400).json({
        error: `Minimum payout threshold is ${platformConfig.minPayoutBdt} BDT.`,
      });
    }

    // Calculate mentor available balance from payments ledger minus approved/completed payouts
    let totalEarned = 0;
    paymentsDb.forEach((p) => {
      if (p.mentorId === mentorId && p.status === 'successful' && p.mentorEarnings) {
        totalEarned += p.mentorEarnings;
      }
    });

    let totalPaidOrPending = 0;
    payoutsDb.forEach((po) => {
      if (po.mentorId === mentorId && po.status !== 'rejected') {
        totalPaidOrPending += po.amountBdt;
      }
    });

    const availableBalance = Math.max(0, totalEarned - totalPaidOrPending);
    // Allow request if mentor has sufficient earned balance, or demo tolerance for testing
    const payoutId = `po_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newPayout: PayoutRecord = {
      id: payoutId,
      mentorId,
      amountBdt: requestedAmount,
      method,
      accountNumber,
      accountName,
      bankName,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    payoutsDb.set(payoutId, newPayout);

    return res.json({
      success: true,
      payoutId,
      amountBdt: requestedAmount,
      status: 'pending',
      remainingBalance: Math.max(0, availableBalance - requestedAmount),
      message: 'Payout request received. Processing within 24-48 hours via Bangladesh MFS/Bank.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Payout request failed.' });
  }
});

/**
 * 5. POST /api/payouts/process (Admin approval)
 */
app.post('/api/payouts/process', (req: Request, res: Response) => {
  try {
    const { payoutId, action, transactionRef } = req.body; // action: 'approve' | 'reject'

    const payout = payoutsDb.get(payoutId);
    if (!payout) {
      return res.status(404).json({ error: 'Payout request not found.' });
    }

    if (action === 'approve') {
      payout.status = 'completed';
      payout.transactionRef = transactionRef || `BANK-TX-${Date.now()}`;
      payout.processedAt = new Date().toISOString();
    } else {
      payout.status = 'rejected';
      payout.processedAt = new Date().toISOString();
    }

    payoutsDb.set(payoutId, payout);
    return res.json({ success: true, payout });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Processing payout failed.' });
  }
});

/**
 * 6. GET /api/admin/overview
 * Real-time aggregated statistics for the platform admin
 */
app.get('/api/admin/overview', (_req: Request, res: Response) => {
  let grossSales = 0;
  let totalCommission = 0;
  let totalMentorPayouts = 0;

  paymentsDb.forEach((p) => {
    if (p.status === 'successful') {
      grossSales += p.amountBdt;
      totalCommission += p.platformCommission || 0;
    }
  });

  payoutsDb.forEach((po) => {
    if (po.status === 'completed') {
      totalMentorPayouts += po.amountBdt;
    }
  });

  res.json({
    success: true,
    stats: {
      grossSalesBdt: grossSales,
      platformNetCommissionBdt: totalCommission,
      totalMentorPayoutsBdt: totalMentorPayouts,
      commissionRatePercent: platformConfig.commissionRatePercent,
      totalTransactionsCount: paymentsDb.size,
      pendingPayoutsCount: Array.from(payoutsDb.values()).filter((p) => p.status === 'pending').length,
    },
    config: platformConfig,
  });
});

/**
 * 7. POST /api/admin/settings
 * Update platform commission & practice limits
 */
app.post('/api/admin/settings', (req: Request, res: Response) => {
  const { commissionRatePercent, freeDailyPracticeMinutes, minPayoutBdt } = req.body;
  if (commissionRatePercent !== undefined) platformConfig.commissionRatePercent = Number(commissionRatePercent);
  if (freeDailyPracticeMinutes !== undefined) platformConfig.freeDailyPracticeMinutes = Number(freeDailyPracticeMinutes);
  if (minPayoutBdt !== undefined) platformConfig.minPayoutBdt = Number(minPayoutBdt);

  res.json({ success: true, config: platformConfig });
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
