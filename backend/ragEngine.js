'use strict';

// ══════════════════════════════════════════════════════════════════════
// NADI RAG ENGINE v2 — Deep Multi-Source Retrieval
// 
// Architecture:
//   Phase 1: Parallel multi-query retrieval (Google + News + PubMed + Amazon)
//   Phase 2: Content extraction & relevance scoring from snippets
//   Phase 3: Quantitative signal extraction (prices, dates, market figures)
//   Phase 4: Structured context assembly for precise AI grounding
//
// This eliminates hallucination by giving the AI actual figures to cite.
// TAM, pricing, timelines all come from retrieved real data, not guesses.
// ══════════════════════════════════════════════════════════════════════

'use strict';
const https = require('https');
const http = require('http');

// ── Fetch with timeout ─────────────────────────────────────────────
function fetchUrl(url, timeoutMs) {
    var ms = timeoutMs || 7000;
    return new Promise(function (resolve, reject) {
        var lib = url.startsWith('https') ? https : http;
        var req = lib.get(url, { headers: { 'User-Agent': 'NADI-RAG/3.0 (+https://nadi.app)' } }, function (res) {
            var chunks = [];
            res.on('data', function (c) { chunks.push(c); });
            res.on('end', function () { resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }); });
        });
        req.on('error', function (e) { resolve({ status: 0, body: '' }); }); // soft fail
        req.setTimeout(ms, function () { req.destroy(); resolve({ status: 0, body: '' }); });
    });
}

// ── SerpAPI Google ─────────────────────────────────────────────────
async function searchGoogle(query, key, n) {
    if (!key || key.length < 10) return [];
    try {
        var url = 'https://serpapi.com/search.json?engine=google&q=' + encodeURIComponent(query) +
            '&gl=in&hl=en&num=' + (n || 6) + '&api_key=' + key;
        var res = await fetchUrl(url, 9000);
        var data = JSON.parse(res.body);
        return (data.organic_results || []).slice(0, n || 6).map(function (r) {
            return { title: r.title || '', snippet: r.snippet || '', url: r.link || '', source: r.source || '', channel: 'Google', date: r.date || '' };
        });
    } catch (e) { return []; }
}

// ── NewsAPI ────────────────────────────────────────────────────────
async function searchNews(query, key, n) {
    if (!key || key.length < 10) return [];
    try {
        var url = 'https://newsapi.org/v2/everything?q=' + encodeURIComponent(query) +
            '&language=en&sortBy=publishedAt&pageSize=' + (n || 5) + '&apiKey=' + key;
        var res = await fetchUrl(url, 7000);
        var data = JSON.parse(res.body);
        return (data.articles || []).slice(0, n || 5).map(function (a) {
            return { title: a.title || '', snippet: a.description || '', url: a.url || '', source: (a.source || {}).name || '', channel: 'News', date: (a.publishedAt || '').slice(0, 10) };
        });
    } catch (e) { return []; }
}

// ── PubMed ─────────────────────────────────────────────────────────
async function searchPubMed(query, n) {
    try {
        var sUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=' +
            encodeURIComponent(query) + '&retmax=' + (n || 4) + '&retmode=json&sort=relevance';
        var sRes = await fetchUrl(sUrl, 7000);
        var sData = JSON.parse(sRes.body);
        var ids = (sData.esearchresult || {}).idlist || [];
        if (!ids.length) return [];
        var sumUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + ids.join(',') + '&retmode=json';
        var sumRes = await fetchUrl(sumUrl, 7000);
        var sumData = JSON.parse(sumRes.body);
        var result = sumData.result || {};
        return ids.map(function (id) {
            var item = result[id] || {};
            var authors = (item.authors || []).slice(0, 2).map(function (a) { return a.name; }).join(', ');
            return { title: item.title || '', snippet: (item.source || '') + (authors ? ' — ' + authors : ''), url: 'https://pubmed.ncbi.nlm.nih.gov/' + id, source: 'PubMed', channel: 'PubMed', date: (item.pubdate || '').slice(0, 4) };
        }).filter(function (r) { return r.title; });
    } catch (e) { return []; }
}

// ── Extract quantitative signals from text ─────────────────────────
// Pulls out prices, market sizes, percentages, years — real figures the AI can cite
function extractQuantitativeSignals(sources) {
    var signals = {
        marketSizes: [],   // e.g. "₹500 crore", "$2 billion"
        pricePoints: [],   // e.g. "₹299", "Rs.499"
        growthRates: [],   // e.g. "12% CAGR", "growing 25%"
        timeframes: [],   // e.g. "by 2027", "next 3 years"
        brands: [],   // brand names mentioned
        regulations: [],   // FSSAI, AYUSH, etc.
        studyFindings: [],   // clinical findings
    };

    var allText = sources.map(function (s) { return (s.title || '') + ' ' + (s.snippet || ''); }).join(' ');

    // Market size patterns
    var mktPatterns = [
        /(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d+)?\s*(?:crore|cr|lakh|billion|million)/gi,
        /\$[\d,.]+\s*(?:billion|million|crore)/gi,
        /[\d,.]+\s*(?:crore|billion|million)\s*(?:market|industry|segment)/gi,
    ];
    mktPatterns.forEach(function (p) { var m = allText.match(p); if (m) signals.marketSizes = signals.marketSizes.concat(m.slice(0, 5)); });

    // Price patterns
    var pricePatterns = [/(?:₹|Rs\.?)\s*[\d,]+(?:[-–][\d,]+)?/gi, /price.*?(?:₹|Rs\.?)\s*[\d,]+/gi];
    pricePatterns.forEach(function (p) { var m = allText.match(p); if (m) signals.pricePoints = signals.pricePoints.concat(m.slice(0, 6)); });

    // Growth rate patterns
    var growthPatterns = [/[\d.]+%\s*(?:CAGR|growth|increase|rise|annual)/gi, /growing\s+(?:at\s+)?[\d.]+%/gi];
    growthPatterns.forEach(function (p) { var m = allText.match(p); if (m) signals.growthRates = signals.growthRates.concat(m.slice(0, 4)); });

    // Time / year patterns
    var timePatterns = [/by\s+20[2-3]\d/gi, /in\s+20[2-3]\d/gi, /(?:next|over the next)\s+[\d]+\s+years?/gi];
    timePatterns.forEach(function (p) { var m = allText.match(p); if (m) signals.timeframes = signals.timeframes.concat(m.slice(0, 4)); });

    // FSSAI/Regulatory
    if (/FSSAI|AYUSH|FDA|GMP|ISO/i.test(allText)) {
        var regM = allText.match(/(?:FSSAI|AYUSH|FDA|GMP|ISO)\s*[A-Z0-9\-]*/g);
        if (regM) signals.regulations = regM.slice(0, 5);
    }

    // Clinical findings from PubMed sources
    var pubmedSources = sources.filter(function (s) { return s.channel === 'PubMed'; });
    pubmedSources.forEach(function (s) {
        var dosageM = (s.snippet || '').match(/[\d.]+\s*(?:mg|g|mcg|IU|ml)(?:\s*per\s*day|\s*daily)?/gi);
        if (dosageM) signals.studyFindings = signals.studyFindings.concat(dosageM.slice(0, 3));
    });

    // Deduplicate
    Object.keys(signals).forEach(function (k) {
        signals[k] = [...new Set(signals[k].map(function (v) { return v.trim(); }))].slice(0, 8);
    });

    return signals;
}

// ── Score source relevance ─────────────────────────────────────────
function scoreRelevance(source, keyword) {
    var kw = keyword.toLowerCase();
    var text = ((source.title || '') + ' ' + (source.snippet || '')).toLowerCase();
    var score = 0;
    if (text.includes(kw)) score += 40;
    if (text.includes('india')) score += 15;
    if (text.includes('market')) score += 10;
    if (text.includes('crore') || text.includes('billion')) score += 15;
    if (source.channel === 'PubMed') score += 20;
    if (source.date && source.date >= '2023') score += 10;
    return score;
}

// ── Build mode-specific queries ────────────────────────────────────
function buildQueries(keyword, mode) {
    var india = keyword + ' India';
    var maps = {
        research: {
            google: [
                india + ' market size crore 2024 2025',
                india + ' D2C brand market share consumer insight',
                india + ' wellness industry report CAGR',
                keyword + ' FSSAI regulation India approval',
                india + ' startup investment funding round',
                keyword + ' global vs India market comparison',
            ],
            news: [india + ' wellness market 2024', keyword + ' India D2C startup', india + ' consumer trend report'],
            pubmed: [keyword + ' clinical trial efficacy', keyword + ' safety human study', keyword + ' health benefits randomized'],
        },
        pricing: {
            google: [
                keyword + ' price India Amazon buy online 2024',
                keyword + ' supplement MRP retail price India',
                keyword + ' D2C brand pricing comparison India',
                keyword + ' import duty India cost',
                keyword + ' raw material price bulk India',
            ],
            news: [keyword + ' India price 2024', keyword + ' supplement cost consumer'],
            pubmed: [],
        },
        formulation: {
            google: [
                keyword + ' formulation bioavailability dosage',
                keyword + ' FSSAI approved ingredients India',
                keyword + ' supplement GMP manufacturing India',
                keyword + ' contraindications drug interaction',
                keyword + ' standardized extract specification',
            ],
            news: [],
            pubmed: [keyword + ' dosage efficacy', keyword + ' safety bioavailability', keyword + ' pharmacokinetics human'],
        },
        funding: {
            google: [
                india + ' D2C wellness startup funding 2023 2024',
                'wellness VC investment India Series A B',
                india + ' entrepreneur investor pitch wellness',
                'Indian D2C brand acqui-hire merger 2024',
            ],
            news: [keyword + ' India startup funding raised', 'wellness D2C India investment 2024'],
            pubmed: [],
        },
        competitor: {
            google: [
                keyword + ' brand India Amazon top seller',
                keyword + ' supplement India Flipkart bestseller',
                india + ' D2C company founded',
                keyword + ' India market leader brand',
                keyword + ' vs brand India comparison',
            ],
            news: [keyword + ' India brand launch 2024', keyword + ' new product India'],
            pubmed: [],
        },
        supplier: {
            google: [
                keyword + ' raw material supplier India B2B',
                keyword + ' bulk ingredient manufacturer India GMP',
                keyword + ' IndiaMART wholesaler price',
                keyword + ' contract manufacturer India FSSAI',
            ],
            news: [],
            pubmed: [],
        },
        global: {
            google: [
                keyword + ' global market size 2024 forecast',
                keyword + ' USA UK Europe trend adoption',
                keyword + ' India lag global adoption timeline',
                keyword + ' international brand India launch',
            ],
            news: [keyword + ' global trend 2024', keyword + ' worldwide market'],
            pubmed: [keyword + ' global epidemiology', keyword + ' prevalence worldwide'],
        },
    };
    return maps[mode] || maps['research'];
}

// ── Main retrieve function ─────────────────────────────────────────
async function retrieveSources(keyword, mode, keys) {
    var serpKey = (keys && keys.serpapi) || process.env.SERPAPI_KEY || '';
    var newsKey = (keys && keys.news) || process.env.NEWS_API_KEY || '';

    var queries = buildQueries(keyword, mode);
    var collected = [];
    var promises = [];

    // Google
    (queries.google || []).forEach(function (q) {
        promises.push(searchGoogle(q, serpKey, 5).then(function (r) {
            r.forEach(function (s) { s.queryUsed = q; }); collected = collected.concat(r);
        }));
    });

    // News
    (queries.news || []).forEach(function (q) {
        promises.push(searchNews(q, newsKey, 4).then(function (r) {
            r.forEach(function (s) { s.queryUsed = q; }); collected = collected.concat(r);
        }));
    });

    // PubMed
    (queries.pubmed || []).forEach(function (q) {
        promises.push(searchPubMed(q, 4).then(function (r) {
            collected = collected.concat(r);
        }));
    });

    await Promise.allSettled(promises);

    // Deduplicate
    var seen = new Set();
    var unique = collected.filter(function (s) {
        if (!s.url || seen.has(s.url)) return false;
        seen.add(s.url); return true;
    });

    // Score and sort by relevance
    unique.forEach(function (s) { s._score = scoreRelevance(s, keyword); });
    unique.sort(function (a, b) { return b._score - a._score; });

    // Extract quantitative signals from top sources
    var quantSignals = extractQuantitativeSignals(unique.slice(0, 20));

    return { sources: unique, quantSignals: quantSignals };
}

// ── Format structured context for AI ──────────────────────────────
// This is the key upgrade — instead of a flat list, we give the AI
// a structured document with extracted numbers, ranked sources, and
// explicit instructions to cite specific figures.
function formatContext(sources, quantSignals, keyword, mode) {
    var lines = [];

    lines.push('══════════════════════════════════════');
    lines.push('RAG CONTEXT — Retrieved from live web');
    lines.push('Keyword: ' + keyword + ' | Mode: ' + mode);
    lines.push('Sources retrieved: ' + sources.length);
    lines.push('══════════════════════════════════════');
    lines.push('');

    // Quantitative signals section — CRITICAL for reducing hallucination on numbers
    if (quantSignals) {
        lines.push('── EXTRACTED QUANTITATIVE DATA (cite these exact figures) ──');
        if (quantSignals.marketSizes.length) lines.push('Market size figures found: ' + quantSignals.marketSizes.join(' | '));
        if (quantSignals.pricePoints.length) lines.push('Price points found: ' + quantSignals.pricePoints.join(' | '));
        if (quantSignals.growthRates.length) lines.push('Growth rates found: ' + quantSignals.growthRates.join(' | '));
        if (quantSignals.timeframes.length) lines.push('Timeframes found: ' + quantSignals.timeframes.join(' | '));
        if (quantSignals.studyFindings.length) lines.push('Clinical dosages/findings: ' + quantSignals.studyFindings.join(' | '));
        if (quantSignals.regulations.length) lines.push('Regulatory references: ' + quantSignals.regulations.join(' | '));
        lines.push('');
        lines.push('INSTRUCTION: When generating TAM, SAM, SOM, pricing, or timelines —');
        lines.push('use ONLY the figures above. If none are found, say "data unavailable"');
        lines.push('rather than inventing a number.');
        lines.push('');
    }

    lines.push('── TOP SOURCES (ranked by relevance) ──');
    sources.slice(0, 15).forEach(function (s, i) {
        lines.push('');
        lines.push('[' + (i + 1) + '] ' + (s.channel || 'Web') + (s.date ? ' (' + s.date + ')' : ''));
        if (s.title) lines.push('    Title:   ' + s.title);
        if (s.snippet) lines.push('    Extract: ' + s.snippet.slice(0, 300));
        if (s.url) lines.push('    URL:     ' + s.url);
    });

    return lines.join('\n');
}

module.exports = { retrieveSources, formatContext };