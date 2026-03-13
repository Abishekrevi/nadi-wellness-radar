'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

const { collectAllSignals } = require('./dataCollector');
const { calculateMomentumAccelerationScore, calculateDNAScores,
  findClosestHistoricalPattern, DNA_STRANDS } = require('./dnaEngine');
const { generateIntelligenceReport } = require('./reportGenerator');
const DATA_SOURCES = require('./dataSources');
const { retrieveSources, formatContext } = require('./ragEngine');
const { securityMiddleware, securityHeaders, buildCORSOptions,
  sanitizeString, getSecurityStatus } = require('./security');

const app = express();
const PORT = process.env.PORT || 3001;
const START_MS = Date.now();

// ══════════════════════════════════════════════
// SECURITY LAYER — applied before everything
// ══════════════════════════════════════════════
app.set('trust proxy', 1);                     // Render/Heroku proxy
app.use(securityHeaders);                      // Security headers on ALL responses
app.use(cors(buildCORSOptions()));             // Hardened CORS
app.use(express.json({ limit: '512kb' }));    // Body size limit (tightened from 10mb)
app.use(express.urlencoded({ extended: false, limit: '512kb' }));
app.use(securityMiddleware);                   // Injection/XSS/path traversal scanner

// ── Static files (production) ──────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist'), {
    maxAge: '1d', etag: true,
    setHeaders(res, filePath) {
      // No caching for HTML (for SPA routing)
      if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    },
  }));
}

// ── Rate limiter (tiered per endpoint) ────────────────────────
const rateMap = new Map();
function rateLimit(maxPerMin) {
  return (req, res, next) => {
    const ip = req.ip || 'x';
    const now = Date.now();
    const win = rateMap.get(ip + req.path) || { count: 0, start: now };
    if (now - win.start > 60_000) { win.count = 0; win.start = now; }
    win.count++;
    rateMap.set(ip + req.path, win);
    if (win.count > maxPerMin) return res.status(429).json({ error: 'RATE_LIMIT', message: 'Too many requests — wait 1 minute.' });
    next();
  };
}

// ── LRU Cache (30 min TTL) ─────────────────────────────────────
const CACHE_TTL = 30 * 60 * 1000;
const CACHE_MAX = 150;
const cache = new Map();
function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL) { cache.delete(key); return null; }
  cache.delete(key); cache.set(key, item);
  return item.data;
}
function setCache(key, data) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(key, { data, ts: Date.now() });
}

// ── Session scan history ───────────────────────────────────────
const scanHistory = [];

// ── Gemini caller with model fallback ─────────────────────────
// ══════════════════════════════════════════════════════════════
// AI CALLER — Groq (Llama 3.3 70B), 14,400 req/day free
// Falls through models if one is unavailable
// ══════════════════════════════════════════════════════════════
async function callAI(prompt, maxTokens = 2000) {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.length < 10) throw new Error('GROQ_API_KEY not set in Render environment variables.');

  const truncated = prompt.length > 10000 ? prompt.slice(0, 10000) + '\n[truncated]' : prompt;
  const maxTok = Math.min(maxTokens, 8000);

  const models = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ];

  let lastError = '';
  for (const model of models) {
    try {
      const r = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        { model, messages: [{ role: 'user', content: truncated }], max_tokens: maxTok, temperature: 0.3 },
        { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, timeout: 60000 }
      );
      const text = r.data?.choices?.[0]?.message?.content;
      if (text) { console.log(`[AI] ✅ Groq ${model}`); return text; }
      lastError = `empty response from ${model}`;
    } catch (e) {
      lastError = `${model}: ${e.response?.data?.error?.message || e.message}`;
      console.log(`[AI] ❌ ${lastError}`);
      const status = e.response?.status;
      // 429 = rate limited, try next model. Other errors = stop.
      if (status && status !== 429 && status !== 404) throw new Error(lastError);
    }
  }

  throw new Error('All Groq models failed: ' + lastError);
}

// Alias so reportGenerator.js still works without changes
const callGemini = callAI;

// ══════════════════════════════════════════════
// API ENDPOINTS
// ══════════════════════════════════════════════

// Health + security status
app.get('/api/health', (_req, res) => res.json({
  status: 'operational', version: '3.0.0',
  uptime_seconds: Math.round((Date.now() - START_MS) / 1000),
  cache_entries: cache.size, scans_this_session: scanHistory.length,
  security: getSecurityStatus(),
  apis: {
    groq: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here'),
    youtube: !!(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'your_youtube_api_key_here'),
    newsapi: !!(process.env.NEWS_API_KEY && process.env.NEWS_API_KEY !== 'your_news_api_key_here'),
    serpapi: !!(process.env.SERPAPI_KEY && process.env.SERPAPI_KEY !== 'your_serpapi_key_here'),
    resend: !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_key_here'),
  },
}));

// AI test — shows which provider responds
app.get('/api/ai-test', async (_req, res) => {
  try {
    const text = await callAI('Respond with exactly: {"ok":true,"status":"working"}', 50);
    res.json({ status: 'OK', response: text, groq: !!(process.env.GROQ_API_KEY?.length > 10) });
  } catch (err) {
    res.json({ status: 'FAIL', error: err.message, groq: !!(process.env.GROQ_API_KEY?.length > 10) });
  }
});

// Data sources info
app.get('/api/sources', (_req, res) => res.json({
  total_sources: 1000,
  breakdown: {
    reddit_communities: DATA_SOURCES.reddit.wellness_communities.length,
    reddit_queries: DATA_SOURCES.reddit.search_queries.length,
    youtube_queries: DATA_SOURCES.youtube.search_queries.length,
    news_rss_feeds: DATA_SOURCES.news_sources.length,
    wellness_keywords: DATA_SOURCES.wellness_keywords.established.length + DATA_SOURCES.wellness_keywords.emerging.length + DATA_SOURCES.wellness_keywords.speculative.length,
    google_trends_terms: DATA_SOURCES.google_trends_keywords.length,
    instagram_hashtags: DATA_SOURCES.instagram_hashtags.length,
    ecommerce_cats: DATA_SOURCES.ecommerce_categories.length,
    brands_monitored: DATA_SOURCES.brands_to_monitor.established.length + DATA_SOURCES.brands_to_monitor.d2c_disruptors.length + DATA_SOURCES.brands_to_monitor.emerging_startups.length,
    research_sources: DATA_SOURCES.research_sources.length,
    regulatory_sources: DATA_SOURCES.regulatory_sources.length,
  },
}));

app.get('/api/dna-model', (_req, res) => res.json({
  model_name: 'NADI DNA Trend Fingerprinting™ v3',
  strands: Object.keys(DNA_STRANDS).map(k => ({ id: k, ...DNA_STRANDS[k] })),
  scoring: {
    formula: 'MAS = Σ(StrandScore × StrandWeight) × VelocityMultiplier × IndiaFactor',
    ranges: { '75-100': 'BREAKOUT', '60-74': 'EMERGING', '45-59': 'NASCENT', '0-44': 'NOISE' },
  },
}));

app.get('/api/trending-keywords', (_req, res) => res.json({
  high_priority: ['berberine supplement India', "lion's mane mushroom India", 'myo-inositol PCOS India', 'sea moss India', 'urolithin A supplement India', 'NMN supplement India', 'postbiotic India', 'sulforaphane broccoli India'],
  watch_list: ['A2 ghee benefits', 'cold plunge therapy India', 'continuous glucose monitor India', 'castor oil hair India', 'gua sha facial India', 'red light therapy India', 'vagal nerve toning India', 'spermidine supplement India'],
  comparison_baseline: ['ashwagandha supplement', 'moringa powder India', 'gut health probiotics India', 'vitamin D supplement India'],
}));

app.get('/api/history', (_req, res) => res.json({ count: scanHistory.length, history: scanHistory.slice(-20).reverse() }));

// ── Single Analysis ─────────────────────────────────────────────
app.post('/api/analyze', rateLimit(20), async (req, res) => {
  const t0 = Date.now();
  const { keyword, category } = req.body || {};
  if (!keyword || typeof keyword !== 'string' || keyword.trim().length < 2)
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'keyword must be at least 2 characters.' });
  if (keyword.length > 120)
    return res.status(400).json({ error: 'INPUT_TOO_LONG', message: 'keyword must be under 120 characters.' });

  const clean = sanitizeString(keyword.trim().toLowerCase());
  const cacheKey = `analyze:${clean}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, cached: true, response_ms: Date.now() - t0 });

  try {
    const signalData = await collectAllSignals(clean);
    signalData.category = category || detectCategory(clean);
    const dnaScores = calculateDNAScores(signalData);
    const masResult = calculateMomentumAccelerationScore(signalData);
    masResult.historicalPattern = findClosestHistoricalPattern(dnaScores);
    const hasData = signalData.totalSignalStrength > 0 || signalData.searchTrend?.length > 0;
    const report = await generateIntelligenceReport(signalData, masResult, hasData ? process.env.GEMINI_API_KEY : null);
    const result = buildResult(clean, signalData, dnaScores, masResult, report);
    setCache(cacheKey, result);
    scanHistory.push({ keyword: clean, score: masResult.score, timestamp: result.timestamp });
    if (scanHistory.length > 200) scanHistory.shift();
    res.json({ ...result, cached: false, response_ms: Date.now() - t0 });
  } catch (err) {
    console.error('[analyze]', err.message);
    res.status(500).json({ error: 'ANALYSIS_FAILED', message: err.message });
  }
});

// ── Radar Scan with SSE ─────────────────────────────────────────
app.post('/api/radar-scan', rateLimit(5), async (req, res) => {
  const { keywords, limit = 6 } = req.body || {};
  const targetKws = Array.isArray(keywords) && keywords.length ? keywords : getDefaultKeywords();
  const cleanKws = targetKws.map(k => sanitizeString(String(k).trim().toLowerCase())).filter(k => k.length >= 2).slice(0, Math.min(limit, 10));

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  send('start', { total: cleanKws.length, keywords: cleanKws });
  const results = [];
  for (let i = 0; i < cleanKws.length; i++) {
    const kw = cleanKws[i];
    const cacheKey = `analyze:${kw}`;
    const cached = getCached(cacheKey);
    send('progress', { index: i, keyword: kw, total: cleanKws.length, status: cached ? 'cached' : 'scanning' });
    try {
      let result;
      if (cached) { result = cached; } else {
        const signalData = await collectAllSignals(kw);
        signalData.category = detectCategory(kw);
        const dnaScores = calculateDNAScores(signalData);
        const masResult = calculateMomentumAccelerationScore(signalData);
        masResult.historicalPattern = findClosestHistoricalPattern(dnaScores);
        const report = await generateIntelligenceReport(signalData, masResult, process.env.GEMINI_API_KEY);
        result = buildResult(kw, signalData, dnaScores, masResult, report);
        setCache(cacheKey, result);
        scanHistory.push({ keyword: kw, score: masResult.score, timestamp: result.timestamp });
      }
      results.push(result);
      send('result', { index: i, keyword: kw, score: result.momentumAccelerationScore, classification: result.classification, verdict: result.intelligenceReport?.verdict });
    } catch (err) {
      console.error(`[radar] ${kw}:`, err.message);
      send('error', { index: i, keyword: kw, message: err.message });
    }
    await new Promise(r => setTimeout(r, 400));
  }
  results.sort((a, b) => b.momentumAccelerationScore - a.momentumAccelerationScore);
  send('complete', { scan_id: `scan_${Date.now()}`, timestamp: new Date().toISOString(), keywords_analyzed: cleanKws.length, trends_identified: results.filter(r => r.momentumAccelerationScore >= 60).length, results, topTrend: results[0] || null });
  res.end();
});

// ── AI Generate proxy ───────────────────────────────────────────
app.post('/api/ai-generate', rateLimit(30), async (req, res) => {
  const { prompt, max_tokens } = req.body || {};
  if (!prompt || typeof prompt !== 'string')
    return res.status(400).json({ error: 'prompt required' });
  try {
    const text = await callAI(prompt, max_tokens);
    res.json({ content: [{ type: 'text', text }] });
  } catch (err) {
    console.error('[ai-generate]', err.message);
    res.status(500).json({ error: 'AI generation failed', message: err.message });
  }
});

// ── RAG Retrieve ────────────────────────────────────────────────
app.post('/api/rag-retrieve', rateLimit(20), async (req, res) => {
  const { keyword, mode } = req.body || {};
  if (!keyword || !mode) return res.status(400).json({ error: 'keyword and mode required.' });
  const cacheKey = 'rag:' + sanitizeString(keyword).toLowerCase() + ':' + mode;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);
  try {
    const { sources, quantSignals } = await retrieveSources(keyword, mode, { serpapi: process.env.SERPAPI_KEY, news: process.env.NEWS_API_KEY });
    const context = formatContext(sources, quantSignals, keyword, mode);
    const result = { keyword, mode, sources, quantSignals, context, sourceCount: sources.length, retrievedAt: new Date().toISOString() };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('[RAG]', err.message);
    res.status(500).json({ error: 'RAG_FAILED', message: err.message });
  }
});

// ── Send Email ──────────────────────────────────────────────────
app.post('/api/send-email', rateLimit(10), async (req, res) => {
  const { to, subject, body, keyword } = req.body || {};
  if (!to || !to.includes('@')) return res.status(400).json({ error: 'Valid email required' });
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && resendKey.length > 10) {
    try {
      await axios.post('https://api.resend.com/emails', {
        from: 'NADI Intelligence <reports@nadi.app>',
        to: [to], subject: subject || ('NADI Report — ' + (keyword || 'Trend')),
        text: body, html: body ? body.replace(/\n/g, '<br>') : body,
      }, { headers: { 'Authorization': 'Bearer ' + resendKey }, timeout: 15000 });
      return res.json({ success: true, method: 'resend' });
    } catch (err) { console.error('[send-email]', err.response?.data || err.message); }
  }
  const mailtoUrl = 'mailto:' + to + '?subject=' + encodeURIComponent(subject || 'NADI Report') + '&body=' + encodeURIComponent(body || '');
  res.json({ success: true, method: 'mailto', mailtoUrl });
});

// ── Pitch Deck ──────────────────────────────────────────────────
app.post('/api/pitch-deck', rateLimit(5), async (req, res) => {
  const { result } = req.body || {};
  if (!result?.keyword) return res.status(400).json({ error: 'Full analysis result required.' });
  try {
    const { generatePitchDeck } = require('./pitchDeck');
    const buffer = await generatePitchDeck(result);
    const filename = `NADI-${result.keyword.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}-PitchDeck.pptx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('[pitch-deck]', err.message);
    res.status(500).json({ error: 'DECK_FAILED', message: err.message });
  }
});

// ── Investor one-pager ──────────────────────────────────────────
app.post('/api/one-pager', rateLimit(5), async (req, res) => {
  const { result } = req.body || {};
  if (!result?.keyword) return res.status(400).json({ error: 'result required' });
  try {
    const prompt = buildOnePagerPrompt(result);
    const text = await callAI(prompt, 3000);
    res.json({ content: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Bulk batch scan ─────────────────────────────────────────────
app.post('/api/batch-scan', rateLimit(3), async (req, res) => {
  const { keywords } = req.body || {};
  if (!Array.isArray(keywords) || !keywords.length) return res.status(400).json({ error: 'keywords array required' });
  const clean = keywords.map(k => sanitizeString(String(k).trim().toLowerCase())).filter(k => k.length >= 2).slice(0, 15);

  // Run in parallel batches of 3
  const results = [];
  for (let i = 0; i < clean.length; i += 3) {
    const batch = clean.slice(i, i + 3);
    const batchResults = await Promise.allSettled(batch.map(async kw => {
      const cached = getCached(`analyze:${kw}`);
      if (cached) return cached;
      const signalData = await collectAllSignals(kw);
      signalData.category = detectCategory(kw);
      const dnaScores = calculateDNAScores(signalData);
      const masResult = calculateMomentumAccelerationScore(signalData);
      masResult.historicalPattern = findClosestHistoricalPattern(dnaScores);
      const report = await generateIntelligenceReport(signalData, masResult, process.env.GEMINI_API_KEY);
      const r = buildResult(kw, signalData, dnaScores, masResult, report);
      setCache(`analyze:${kw}`, r);
      return r;
    }));
    for (const br of batchResults) {
      if (br.status === 'fulfilled') results.push(br.value);
    }
  }
  results.sort((a, b) => b.momentumAccelerationScore - a.momentumAccelerationScore);
  res.json({ count: results.length, results });
});

// ── Community leaderboard ───────────────────────────────────────
app.get('/api/leaderboard', (_req, res) => {
  const grouped = {};
  for (const scan of scanHistory) {
    if (!grouped[scan.keyword] || grouped[scan.keyword].score < scan.score) grouped[scan.keyword] = scan;
  }
  const sorted = Object.values(grouped).sort((a, b) => b.score - a.score).slice(0, 10);
  res.json({ leaderboard: sorted, total_scans: scanHistory.length, updated: new Date().toISOString() });
});

// ── SPA catch-all ──────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));
}

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function buildResult(keyword, signalData, dnaScores, masResult, report) {
  return {
    keyword, category: signalData.category, timestamp: new Date().toISOString(),
    momentumAccelerationScore: masResult.score,
    classification: masResult.classification, confidence: masResult.confidence,
    timeToMainstream: masResult.timeToMainstream, marketSizePotential: masResult.marketSizePotential,
    dnaFingerprint: {
      strands: Object.keys(DNA_STRANDS).map(strand => ({
        id: strand, name: DNA_STRANDS[strand].name,
        score: Math.round((dnaScores[strand] || 0) * 100),
        weight: DNA_STRANDS[strand].weight, description: DNA_STRANDS[strand].description,
        trendPattern: DNA_STRANDS[strand].trend_pattern, fadPattern: DNA_STRANDS[strand].fad_pattern,
      })),
      historicalMatch: masResult.historicalPattern,
    },
    signals: {
      reddit: signalData.redditMentions, youtube: signalData.youtubeMentions,
      news: signalData.newsMentions, research: signalData.researchMentions,
      ecommerce: signalData.ecommerceProducts, searchMomentum: signalData.searchMomentum,
      searchTrend: signalData.searchTrend, totalStrength: signalData.totalSignalStrength,
      trendDirection: signalData.trendDirection, breakoutKeywords: signalData.breakoutKeywords,
      relatedQueries: signalData.relatedQueries, amazonAvgPrice: signalData.amazonAvgPrice,
      amazonBrands: signalData.amazonBrands, amazonPricePoints: signalData.amazonPricePoints,
    },
    sourceData: signalData.sourceData,
    intelligenceReport: report,
    dataQuality: (() => {
      const n = [signalData.redditMentions, signalData.youtubeMentions, signalData.newsMentions, signalData.researchMentions, signalData.searchTrend?.length].filter(v => v > 0).length;
      return n >= 4 ? { grade: 'A', label: 'HIGH', color: '#00D4AA' }
        : n >= 3 ? { grade: 'B', label: 'MEDIUM', color: '#FFE04A' }
          : n >= 2 ? { grade: 'C', label: 'LOW', color: '#FF9F43' }
            : { grade: 'D', label: 'MINIMAL', color: '#FF5555' };
    })(),
  };
}

function detectCategory(k) {
  if (['skin', 'face', 'serum', 'gua sha', 'cleanser', 'retinol', 'niacinamide', 'spf'].some(w => k.includes(w))) return 'skincare';
  if (['hair', 'scalp', 'bhringraj', 'castor oil hair', 'dandruff'].some(w => k.includes(w))) return 'haircare';
  if (['protein', 'creatine', 'bcaa', 'whey', 'fitness', 'workout', 'gym', 'muscle'].some(w => k.includes(w))) return 'fitness';
  if (['sleep', 'melatonin', 'insomnia', 'anxiety', 'stress', 'meditation'].some(w => k.includes(w))) return 'mental_wellness';
  if (['gut', 'probiotic', 'prebiotic', 'digestive', 'microbiome', 'postbiotic'].some(w => k.includes(w))) return 'digestive';
  if (['pcos', 'hormones', 'fertility', 'shatavari', 'myo-inositol', 'period'].some(w => k.includes(w))) return 'womens_health';
  if (['longevity', 'nmn', 'nad', 'resveratrol', 'spermidine', 'anti-aging'].some(w => k.includes(w))) return 'longevity';
  if (['mushroom', 'reishi', 'lion', 'cordyceps', 'chaga', 'adaptogen', 'ashwagandha'].some(w => k.includes(w))) return 'adaptogens';
  return 'supplement';
}

function getDefaultKeywords() {
  const all = ['berberine supplement India', "lion's mane mushroom India", 'myo-inositol PCOS India', 'sea moss benefits India', 'castor oil hair growth India', 'cold plunge therapy India', 'NMN supplement India', 'postbiotic skincare India', 'sulforaphane broccoli India', 'gua sha facial massage India'];
  return new Date().getDate() % 2 === 0 ? all.slice(0, 6) : all.slice(4, 10);
}

function buildOnePagerPrompt(result) {
  const r = result.intelligenceReport || {};
  return `You are a McKinsey-grade analyst preparing an investor one-pager for an Indian D2C wellness startup.
Create a concise, data-driven one-pager for the trend: "${result.keyword}"

Data:
- MAS Score: ${result.momentumAccelerationScore}/100 (${result.classification?.label})
- Market TAM: ₹${result.marketSizePotential?.tam}Cr
- Amazon products found: ${result.signals?.ecommerce}
- Reddit mentions: ${result.signals?.reddit}
- YouTube mentions: ${result.signals?.youtube}
- Research papers: ${result.signals?.research}
- Trend direction: ${result.signals?.trendDirection || 'stable'}

Intelligence:
- Executive summary: ${r.executive_summary}
- Market gap: ${r.market_gap}
- Target consumer: ${r.target_consumer}
- Product opportunity: ${r.product_opportunity}
- Verdict: ${r.verdict}

Write a professional one-pager with sections: Market Opportunity | Why Now | Consumer Insight | Product Strategy | Revenue Model | Key Risks | Recommendation
Keep it concise, data-driven, and investment-ready. Use real numbers from the data above.`;
}

process.on('SIGTERM', () => { console.log('Graceful shutdown.'); process.exit(0); });
process.on('uncaughtException', e => console.error('[uncaughtException]', e.message));
process.on('unhandledRejection', e => console.error('[unhandledRejection]', e));

app.listen(PORT, () => console.log(`\n🧬  NADI v3.0 running → http://localhost:${PORT}\n`));
module.exports = app;