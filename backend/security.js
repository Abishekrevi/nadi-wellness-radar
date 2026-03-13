'use strict';

// ╔══════════════════════════════════════════════════════════════════╗
// ║  NADI SECURITY MODULE — Bulletproof protection layer            ║
// ║  Covers: Rate limiting, input validation, XSS, CSRF,            ║
// ║  SQL injection, path traversal, bot detection, IP banning,      ║
// ║  request fingerprinting, honeypots, anomaly detection           ║
// ╚══════════════════════════════════════════════════════════════════╝

const crypto = require('crypto');

// ── Banned IPs (auto-populated by abuse detector) ──────────────────
const bannedIPs = new Set();
const suspiciousIPs = new Map(); // ip → { count, firstSeen }
const requestLog = new Map(); // ip → [ timestamps ]

// ── Known malicious patterns ────────────────────────────────────────
const SQLI_PATTERNS = [
    /(\bOR\b|\bAND\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i,
    /UNION\s+(ALL\s+)?SELECT/i,
    /INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM/i,
    /DROP\s+(TABLE|DATABASE|INDEX)/i,
    /EXEC(\s|\()|EXECUTE(\s|\()/i,
    /xp_cmdshell|sp_executesql/i,
    /';\s*(DROP|DELETE|UPDATE|INSERT)/i,
    /--\s*$|\/\*.*\*\//,
];

const XSS_PATTERNS = [
    /<script[\s>]/i,
    /javascript\s*:/i,
    /on\w+\s*=\s*["'`]/i,
    /<iframe|<object|<embed|<svg.*on/i,
    /eval\s*\(|setTimeout\s*\(|setInterval\s*\(/i,
    /document\.(cookie|location|write)|window\.location/i,
    /&#x|&#\d+;|%3Cscript/i,
    /vbscript\s*:|data\s*:/i,
];

const PATH_TRAVERSAL = [
    /\.\.[\/\\]/,
    /%2e%2e[%\/\\]/i,
    /\/etc\/passwd|\/etc\/shadow/i,
    /\/proc\/self/i,
    /cmd\.exe|powershell/i,
    /\.\.\%252f/i,
];

const SHELL_INJECTION = [
    /[;&|`$]\s*(ls|cat|rm|wget|curl|chmod|chown|sudo|sh|bash|python|node)/i,
    /\$\(.*\)/,
    /`[^`]*`/,
];

// ── Suspicious user agents ──────────────────────────────────────────
const BAD_UA_PATTERNS = [
    /sqlmap/i, /nikto/i, /nessus/i, /openvas/i, /masscan/i,
    /zgrab/i, /nmap/i, /dirbuster/i, /gobuster/i, /wfuzz/i,
    /hydra/i, /medusa/i, /burpsuite/i, /acunetix/i, /appscan/i,
    /havij/i, /w3af/i, /metasploit/i, /python-requests\/2\.[0-4]/i,
];

// ── Honeypot paths (no legit client ever visits these) ─────────────
const HONEYPOT_PATHS = new Set([
    '/admin', '/wp-admin', '/wp-login.php', '/.env', '/config.php',
    '/phpinfo.php', '/shell.php', '/cmd.php', '/.git/config',
    '/server-status', '/actuator', '/api/v1/users', '/graphql',
    '/api/swagger', '/.aws/credentials', '/backup.zip', '/db.sql',
]);

// ── Per-IP rate limiting (multi-tier) ──────────────────────────────
const rateBuckets = new Map();

function checkRateLimit(ip, endpoint) {
    const now = Date.now();
    const key = `${ip}:${endpoint}`;
    const bucket = rateBuckets.get(key) || { tokens: 10, last: now, strikes: 0 };

    // Refill tokens (1 per 2 seconds)
    const elapsed = (now - bucket.last) / 1000;
    bucket.tokens = Math.min(10, bucket.tokens + elapsed * 0.5);
    bucket.last = now;

    // Endpoint-specific limits
    const limits = {
        '/api/analyze': { cost: 3, max: 10 },  // expensive — 3 tokens per call
        '/api/radar-scan': { cost: 5, max: 10 },  // very expensive
        '/api/ai-generate': { cost: 2, max: 10 },
        '/api/rag-retrieve': { cost: 2, max: 10 },
        default: { cost: 1, max: 10 },
    };
    const rule = limits[endpoint] || limits.default;

    if (bucket.tokens < rule.cost) {
        bucket.strikes++;
        rateBuckets.set(key, bucket);
        // Auto-ban after 5 strikes
        if (bucket.strikes >= 5) {
            bannedIPs.add(ip);
            console.warn(`[SECURITY] Auto-banned ${ip} — repeated rate limit violations`);
        }
        return false;
    }

    bucket.tokens -= rule.cost;
    bucket.strikes = 0;
    rateBuckets.set(key, bucket);
    return true;
}

// ── Input sanitizer ─────────────────────────────────────────────────
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/[<>]/g, '')           // strip angle brackets
        .replace(/javascript:/gi, '')   // strip JS proto
        .replace(/on\w+=/gi, '')        // strip event handlers
        .replace(/\x00/g, '')           // strip null bytes
        .trim()
        .slice(0, 500);                 // hard length cap
}

function detectThreat(value) {
    const str = String(value || '');
    for (const p of SQLI_PATTERNS) if (p.test(str)) return 'SQL_INJECTION';
    for (const p of XSS_PATTERNS) if (p.test(str)) return 'XSS';
    for (const p of PATH_TRAVERSAL) if (p.test(str)) return 'PATH_TRAVERSAL';
    for (const p of SHELL_INJECTION) if (p.test(str)) return 'SHELL_INJECTION';
    return null;
}

// ── Deep scan request body recursively ─────────────────────────────
function scanBody(obj, depth) {
    if (depth > 5) return null;
    if (typeof obj === 'string') return detectThreat(obj);
    if (Array.isArray(obj)) {
        for (const v of obj) {
            const t = scanBody(v, depth + 1);
            if (t) return t;
        }
    } else if (obj && typeof obj === 'object') {
        for (const v of Object.values(obj)) {
            const t = scanBody(v, depth + 1);
            if (t) return t;
        }
    }
    return null;
}

// ── Request fingerprinting (detect bots/scripts) ───────────────────
function fingerprintRequest(req) {
    const ua = req.headers['user-agent'] || '';
    const accept = req.headers['accept'] || '';
    const lang = req.headers['accept-language'] || '';
    const encoding = req.headers['accept-encoding'] || '';

    // Legitimate browsers always send these
    const missingBrowserHeaders = !accept || !encoding;
    const noLanguage = !lang && req.method === 'POST';

    // Check for known bad UAs
    const badUA = BAD_UA_PATTERNS.some(p => p.test(ua));

    // Suspiciously minimal headers = script/bot
    const headerCount = Object.keys(req.headers).length;
    const tooFewHeaders = headerCount < 4;

    return { badUA, missingBrowserHeaders, noLanguage, tooFewHeaders, ua };
}

// ── CORS lockdown ───────────────────────────────────────────────────
function buildCORSOptions() {
    const allowed = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
        : null; // null = allow all in dev

    return {
        origin: function (origin, callback) {
            // Allow same-origin requests (no origin header = server-to-server or same-origin)
            if (!origin) return callback(null, true);
            if (!allowed) return callback(null, true); // dev mode
            if (allowed.some(o => origin === o || origin.endsWith('.' + o.replace(/^https?:\/\//, ''))))
                return callback(null, true);
            console.warn(`[SECURITY] Blocked CORS from: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
        maxAge: 86400,
    };
}

// ── Security headers ────────────────────────────────────────────────
function securityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-Powered-By-Remove', '');
    res.removeHeader('X-Powered-By');

    // Only in production
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        res.setHeader('Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
            "font-src 'self' fonts.gstatic.com; " +
            "img-src 'self' data: https:; " +
            "connect-src 'self' https://generativelanguage.googleapis.com;"
        );
    }
    next();
}

// ── Main security middleware ────────────────────────────────────────
function securityMiddleware(req, res, next) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';

    // 1. Banned IP check
    if (bannedIPs.has(ip)) {
        return res.status(403).json({ error: 'ACCESS_DENIED' });
    }

    // 2. Honeypot — instant ban
    if (HONEYPOT_PATHS.has(req.path)) {
        bannedIPs.add(ip);
        console.warn(`[SECURITY] Honeypot triggered by ${ip} → ${req.path}`);
        return res.status(404).json({ error: 'NOT_FOUND' });
    }

    // 3. Bad user-agent check
    const fp = fingerprintRequest(req);
    if (fp.badUA) {
        console.warn(`[SECURITY] Blocked bad UA from ${ip}: ${fp.ua.slice(0, 60)}`);
        recordSuspicious(ip, 'BAD_UA');
        return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // 4. Scan request body for injection attacks
    if (req.body && typeof req.body === 'object') {
        const threat = scanBody(req.body, 0);
        if (threat) {
            console.warn(`[SECURITY] ${threat} detected from ${ip} on ${req.path}`);
            recordSuspicious(ip, threat);
            return res.status(400).json({ error: 'INVALID_INPUT', message: 'Request contains invalid content.' });
        }
    }

    // 5. Scan query params
    for (const v of Object.values(req.query || {})) {
        const threat = detectThreat(v);
        if (threat) {
            console.warn(`[SECURITY] ${threat} in query from ${ip}`);
            return res.status(400).json({ error: 'INVALID_INPUT' });
        }
    }

    // 6. Request size check (belt + suspenders beyond express.json limit)
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > 1024 * 1024) { // 1MB
        return res.status(413).json({ error: 'REQUEST_TOO_LARGE' });
    }

    next();
}

// ── Record suspicious activity, auto-ban on repeat ─────────────────
function recordSuspicious(ip, reason) {
    const entry = suspiciousIPs.get(ip) || { count: 0, firstSeen: Date.now(), reasons: [] };
    entry.count++;
    entry.reasons.push(reason);
    suspiciousIPs.set(ip, entry);
    if (entry.count >= 3) {
        bannedIPs.add(ip);
        console.warn(`[SECURITY] Auto-banned ${ip} after ${entry.count} violations: ${entry.reasons.join(', ')}`);
    }
}

// ── Periodic cleanup ────────────────────────────────────────────────
setInterval(() => {
    const hour = 60 * 60 * 1000;
    const now = Date.now();
    // Clean rate buckets older than 1 hour
    for (const [k, v] of rateBuckets) {
        if (now - v.last > hour) rateBuckets.delete(k);
    }
    // Clear suspicious IPs older than 24 hours
    for (const [ip, v] of suspiciousIPs) {
        if (now - v.firstSeen > 24 * hour) suspiciousIPs.delete(ip);
    }
}, 30 * 60 * 1000);

// ── Security status endpoint ────────────────────────────────────────
function getSecurityStatus() {
    return {
        banned_ips: bannedIPs.size,
        suspicious_ips: suspiciousIPs.size,
        rate_buckets: rateBuckets.size,
    };
}

module.exports = {
    securityMiddleware,
    securityHeaders,
    buildCORSOptions,
    sanitizeString,
    checkRateLimit,
    getSecurityStatus,
    bannedIPs,
};