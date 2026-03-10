'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const { collectAllSignals } = require('./dataCollector');
const { calculateMomentumAccelerationScore, calculateDNAScores,
  findClosestHistoricalPattern, DNA_STRANDS } = require('./dnaEngine');
const { generateIntelligenceReport } = require('./reportGenerator');
const DATA_SOURCES = require('./dataSources');
const { retrieveSources, formatContext } = require('./ragEngine');


const app = express();
const PORT = process.env.PORT || 3001;
const START_MS = Date.now();

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist'), { maxAge: '1d', etag: true }));
}

// ── Rate limiter (30 req/min per IP) ──────────────────────────────
const rateMap = new Map();
app.use('/api', (req, res, next) => {
  const ip = req.ip || 'x';
  const now = Date.now();
  const win = rateMap.get(ip) || { count: 0, start: now };
  if (now - win.start > 60_000) { win.count = 0; win.start = now; }
  win.count++;
  rateMap.set(ip, win);
  if (win.count > 30) return res.status(429).json({ error: 'RATE_LIMIT', message: 'Too many requests — wait 1 minute.' });
  next();
});

// ── LRU Cache (100 entries, 30 min TTL) ───────────────────────────
const CACHE_TTL = 30 * 60 * 1000;
const CACHE_MAX = 100;
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

// ── Session scan history ───────────────────────────────────────────
const scanHistory = [];

// ═══════════════════════════════════════════
// ENDPOINTS
// ═══════════════════════════════════════════

app.get('/api/health', (_req, res) => res.json({
  status: 'operational', version: '2.0.0',
  uptime_seconds: Math.round((Date.now() - START_MS) / 1000),
  cache_entries: cache.size,
  scans_this_session: scanHistory.length,
  apis: {
    gemini: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    youtube: !!(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'your_youtube_api_key_here'),
    newsapi: !!(process.env.NEWS_API_KEY && process.env.NEWS_API_KEY !== 'your_news_api_key_here'),
    serpapi: !!(process.env.SERPAPI_KEY && process.env.SERPAPI_KEY !== 'your_serpapi_key_here'),
  },
}));


// ── Quick test for ai-generate (GET for easy browser testing) ──
app.get('/api/ai-test', async (_req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.length < 10)
    return res.json({ status: 'FAIL', reason: 'GEMINI_API_KEY not set in environment', keyLength: (geminiKey || '').length });
  try {
    const r = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        contents: [{ parts: [{ text: 'Reply with exactly this JSON and nothing else: {"ok":true,"status":"working"}' }] }],
        generationConfig: { maxOutputTokens: 100, temperature: 0 }
      },
      { timeout: 15000 }
    );
    const text = r.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const finishReason = r.data?.candidates?.[0]?.finishReason || 'unknown';
    const blocked = r.data?.promptFeedback?.blockReason || null;
    res.json({ status: 'OK', geminiResponse: text, finishReason, blocked, keyLength: geminiKey.length });
  } catch (err) {
    const errMsg = err.response?.data?.error?.message || err.message;
    const errStatus = err.response?.status;
    res.json({ status: 'FAIL', error: errMsg, httpStatus: errStatus, keyLength: geminiKey.length });
  }
});

app.get('/api/sources', (_req, res) => res.json({
  total_sources: 1000,
  breakdown: {
    reddit_communities: DATA_SOURCES.reddit.wellness_communities.length,
    reddit_queries: DATA_SOURCES.reddit.search_queries.length,
    youtube_queries: DATA_SOURCES.youtube.search_queries.length,
    news_rss_feeds: DATA_SOURCES.news_sources.length,
    wellness_keywords:
      DATA_SOURCES.wellness_keywords.established.length +
      DATA_SOURCES.wellness_keywords.emerging.length +
      DATA_SOURCES.wellness_keywords.speculative.length,
    google_trends_terms: DATA_SOURCES.google_trends_keywords.length,
    instagram_hashtags: DATA_SOURCES.instagram_hashtags.length,
    ecommerce_cats: DATA_SOURCES.ecommerce_categories.length,
    brands_monitored:
      DATA_SOURCES.brands_to_monitor.established.length +
      DATA_SOURCES.brands_to_monitor.d2c_disruptors.length +
      DATA_SOURCES.brands_to_monitor.emerging_startups.length,
    research_sources: DATA_SOURCES.research_sources.length,
    regulatory_sources: DATA_SOURCES.regulatory_sources.length,
  },
}));

app.get('/api/dna-model', (_req, res) => res.json({
  model_name: 'NADI DNA Trend Fingerprinting™ v2',
  description: 'An 8-strand DNA model that fingerprints wellness trends and matches them against historical winners and fads in the Indian market.',
  strands: Object.keys(DNA_STRANDS).map(k => ({ id: k, ...DNA_STRANDS[k] })),
  scoring: {
    formula: 'MAS = Σ(StrandScore × StrandWeight) × VelocityMultiplier × IndiaFactor',
    ranges: {
      '75-100': 'BREAKOUT TREND — Act now, 6-month window open',
      '60-74': 'EMERGING TREND — Build plan, 3-month window',
      '45-59': 'NASCENT SIGNAL — Monitor weekly, set alerts',
      '0-44': 'BACKGROUND NOISE or FAD pattern detected',
    },
  },
}));

app.get('/api/trending-keywords', (_req, res) => res.json({
  high_priority: [
    'berberine supplement India', "lion's mane mushroom India",
    'myo-inositol PCOS India', 'sea moss India',
    'urolithin A supplement India', 'NMN supplement India',
    'postbiotic India', 'sulforaphane broccoli India',
  ],
  watch_list: [
    'A2 ghee benefits', 'cold plunge therapy India',
    'continuous glucose monitor India', 'castor oil hair India',
    'gua sha facial India', 'red light therapy India',
    'vagal nerve toning India', 'spermidine supplement India',
  ],
  comparison_baseline: [
    'ashwagandha supplement', 'moringa powder India',
    'gut health probiotics India', 'vitamin D supplement India',
  ],
}));

app.get('/api/history', (_req, res) => res.json({
  count: scanHistory.length,
  history: scanHistory.slice(-20).reverse(),
}));

// ── Single Analysis ────────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const t0 = Date.now();
  const { keyword, category } = req.body || {};

  if (!keyword || typeof keyword !== 'string' || keyword.trim().length < 2)
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'keyword must be at least 2 characters.' });
  if (keyword.length > 120)
    return res.status(400).json({ error: 'INPUT_TOO_LONG', message: 'keyword must be under 120 characters.' });

  const clean = keyword.trim().toLowerCase().replace(/[<>"]/g, '');
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

// ── Radar Scan with SSE streaming ─────────────────────────────────
app.post('/api/radar-scan', async (req, res) => {
  const { keywords, limit = 6 } = req.body || {};

  const targetKws = Array.isArray(keywords) && keywords.length ? keywords : getDefaultKeywords();
  const cleanKws = targetKws
    .map(k => String(k).trim().toLowerCase().replace(/[<>"]/g, ''))
    .filter(k => k.length >= 2)
    .slice(0, Math.min(limit, 10));

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

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
      if (cached) {
        result = cached;
      } else {
        const signalData = await collectAllSignals(kw);
        signalData.category = detectCategory(kw);
        const dnaScores = calculateDNAScores(signalData);
        const masResult = calculateMomentumAccelerationScore(signalData);
        masResult.historicalPattern = findClosestHistoricalPattern(dnaScores);
        const hasData = signalData.totalSignalStrength > 0;
        const report = await generateIntelligenceReport(signalData, masResult, hasData ? process.env.GEMINI_API_KEY : null);
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

  send('complete', {
    scan_id: `scan_${Date.now()}`,
    timestamp: new Date().toISOString(),
    keywords_analyzed: cleanKws.length,
    trends_identified: results.filter(r => r.momentumAccelerationScore >= 60).length,
    results,
    topTrend: results[0] || null,
  });

  res.end();
});

// ── SPA catch-all ──────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
function buildResult(keyword, signalData, dnaScores, masResult, report) {
  return {
    keyword,
    category: signalData.category,
    timestamp: new Date().toISOString(),
    momentumAccelerationScore: masResult.score,
    classification: masResult.classification,
    confidence: masResult.confidence,
    timeToMainstream: masResult.timeToMainstream,
    marketSizePotential: masResult.marketSizePotential,
    dnaFingerprint: {
      strands: Object.keys(DNA_STRANDS).map(strand => ({
        id: strand,
        name: DNA_STRANDS[strand].name,
        score: Math.round((dnaScores[strand] || 0) * 100),
        weight: DNA_STRANDS[strand].weight,
        description: DNA_STRANDS[strand].description,
        trendPattern: DNA_STRANDS[strand].trend_pattern,
        fadPattern: DNA_STRANDS[strand].fad_pattern,
      })),
      historicalMatch: masResult.historicalPattern,
    },
    signals: {
      reddit: signalData.redditMentions,
      youtube: signalData.youtubeMentions,
      news: signalData.newsMentions,
      research: signalData.researchMentions,
      ecommerce: signalData.ecommerceProducts,
      searchMomentum: signalData.searchMomentum,
      searchTrend: signalData.searchTrend,
      totalStrength: signalData.totalSignalStrength,
    },
    sourceAttribution: [
      signalData.redditMentions > 0 && { platform: 'Reddit', mentions: signalData.redditMentions, live: true },
      signalData.youtubeMentions > 0 && { platform: 'YouTube', mentions: signalData.youtubeMentions, live: true },
      signalData.newsMentions > 0 && { platform: 'News/RSS', mentions: signalData.newsMentions, live: true },
      signalData.researchMentions > 0 && { platform: 'PubMed', mentions: signalData.researchMentions, live: true },
      signalData.ecommerceProducts > 0 && { platform: 'Amazon India', mentions: signalData.ecommerceProducts, live: true },
      signalData.searchTrend?.length && { platform: 'Google Trends', mentions: signalData.searchTrend.length, live: true },
    ].filter(Boolean),
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
  if (['sleep', 'melatonin', 'insomnia', 'anxiety', 'stress', 'meditation', 'breathwork'].some(w => k.includes(w))) return 'mental_wellness';
  if (['gut', 'probiotic', 'prebiotic', 'digestive', 'microbiome', 'kefir', 'postbiotic'].some(w => k.includes(w))) return 'digestive';
  if (['pcos', 'hormones', 'fertility', 'shatavari', 'myo-inositol', 'period'].some(w => k.includes(w))) return 'womens_health';
  if (['longevity', 'nmn', 'nad', 'resveratrol', 'spermidine', 'anti-aging'].some(w => k.includes(w))) return 'longevity';
  if (['mushroom', 'reishi', 'lion', 'cordyceps', 'chaga', 'adaptogen', 'ashwagandha', 'brahmi'].some(w => k.includes(w))) return 'adaptogens';
  return 'supplement';
}

function getDefaultKeywords() {
  const all = [
    'berberine supplement India', "lion's mane mushroom India",
    'myo-inositol PCOS India', 'sea moss benefits India',
    'castor oil hair growth India', 'cold plunge therapy India',
    'NMN supplement India', 'postbiotic skincare India',
    'sulforaphane broccoli India', 'gua sha facial massage India',
  ];
  return new Date().getDate() % 2 === 0 ? all.slice(0, 6) : all.slice(4, 10);
}


// ══════════════════════════════════════════════════════════
// RAG ENDPOINT — Retrieve real sources then return as context
// Frontend calls this BEFORE generating AI responses
// ══════════════════════════════════════════════════════════
app.post('/api/rag-retrieve', async (req, res) => {
  const { keyword, mode } = req.body || {};
  if (!keyword || !mode) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'keyword and mode required.' });
  }

  const cacheKey = 'rag:' + keyword.toLowerCase().trim() + ':' + mode;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    console.log('[RAG] Retrieving sources for:', keyword, '| mode:', mode);
    const { sources, quantSignals } = await retrieveSources(keyword, mode, {
      serpapi: process.env.SERPAPI_KEY,
      news: process.env.NEWS_API_KEY,
    });
    const context = formatContext(sources, quantSignals, keyword, mode);
    const result = {
      keyword,
      mode,
      sources,
      quantSignals,
      context,
      sourceCount: sources.length,
      retrievedAt: new Date().toISOString(),
    };
    setCache(cacheKey, result);
    console.log('[RAG] Retrieved', sources.length, 'sources for:', keyword);
    res.json(result);
  } catch (err) {
    console.error('[RAG] Error:', err.message);
    res.status(500).json({ error: 'RAG_FAILED', message: err.message });
  }
});

process.on('SIGTERM', () => { console.log('Graceful shutdown.'); process.exit(0); });
process.on('uncaughtException', e => console.error('[uncaughtException]', e.message));
process.on('unhandledRejection', e => console.error('[unhandledRejection]', e));


// ── AI Generate proxy — routes all frontend AI calls through backend ──
app.post('/api/ai-generate', async (req, res) => {
  const { prompt, max_tokens } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    console.error('[ai-generate] Missing prompt');
    return res.status(400).json({ error: 'prompt required' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.length < 10) {
    console.error('[ai-generate] GEMINI_API_KEY not set');
    return res.status(500).json({ error: 'AI API key not configured on server' });
  }

  // Detect if this prompt expects JSON back
  const wantsJson = prompt.includes('Respond ONLY with valid JSON') || prompt.includes('no markdown');
  const maxTok = Math.min(parseInt(max_tokens) || 2000, 8000);

  // Truncate very long prompts to avoid Gemini limits (keep first 12000 chars)
  const truncatedPrompt = prompt.length > 12000
    ? prompt.slice(0, 12000) + '\n[Context truncated for length]'
    : prompt;

  console.log(`[ai-generate] wantsJson=${wantsJson} promptLen=${truncatedPrompt.length} maxTok=${maxTok}`);

  try {
    const body = {
      contents: [{ parts: [{ text: truncatedPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: maxTok,
        // responseMimeType not used - causes errors on some Gemini versions
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      body,
      { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
    );

    const candidate = response.data?.candidates?.[0];

    // Check for safety block or empty response
    if (!candidate) {
      const blockReason = response.data?.promptFeedback?.blockReason || 'No candidates returned';
      console.error('[ai-generate] Blocked/empty:', blockReason, JSON.stringify(response.data).slice(0, 300));
      return res.status(500).json({ error: 'AI blocked response', message: blockReason });
    }

    if (candidate.finishReason === 'SAFETY') {
      console.error('[ai-generate] Safety blocked');
      return res.status(500).json({ error: 'Content blocked by safety filter', message: 'SAFETY' });
    }

    const text = candidate.content?.parts?.[0]?.text || '';
    console.log(`[ai-generate] success finishReason=${candidate.finishReason} textLen=${text.length}`);

    if (!text) {
      console.error('[ai-generate] Empty text. Full response:', JSON.stringify(response.data).slice(0, 500));
      return res.status(500).json({ error: 'Empty response from AI', message: 'Gemini returned empty text' });
    }

    res.json({ content: [{ type: 'text', text }] });

  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message || 'Unknown error';
    const status = err.response?.status || 500;
    console.error(`[ai-generate] FAILED status=${status}:`, msg);
    console.error('[ai-generate] Full error:', JSON.stringify(err.response?.data || {}).slice(0, 500));
    res.status(500).json({ error: 'AI generation failed', message: msg, status });
  }
});

app.listen(PORT, () => console.log(`\n🧬  NADI v2.0 running → http://localhost:${PORT}\n`));
module.exports = app;

// ── Pitch Deck PPTX Generation ─────────────────────────────────────
app.post('/api/pitch-deck', async (req, res) => {
  const { result } = req.body || {};
  if (!result || !result.keyword) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'Full analysis result object is required.' });
  }
  try {
    const buffer = await generatePitchDeck(result);
    const filename = `NADI-${result.keyword.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}-PitchDeck.pptx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    console.error('[pitch-deck]', err.message);
    res.status(500).json({ error: 'DECK_FAILED', message: err.message });
  }
});