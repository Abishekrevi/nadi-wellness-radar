'use strict';

// ══════════════════════════════════════════════════════════
// NADI RAG ENGINE — Web Search Retrieval Augmented Generation
// Fetches real sources FIRST, then passes to AI for grounded answers
// Eliminates hallucination by anchoring AI to real retrieved content
// ══════════════════════════════════════════════════════════

const https = require('https');
const http = require('http');

// ── Fetch helper with timeout ──────────────────────────────
function fetchUrl(url, timeoutMs = 6000) {
    return new Promise(function (resolve, reject) {
        var lib = url.startsWith('https') ? https : http;
        var req = lib.get(url, { headers: { 'User-Agent': 'NADI-RAG/3.0' } }, function (res) {
            var chunks = [];
            res.on('data', function (c) { chunks.push(c); });
            res.on('end', function () {
                resolve({
                    status: res.statusCode,
                    body: Buffer.concat(chunks).toString('utf8').slice(0, 8000), // cap at 8KB per source
                });
            });
        });
        req.on('error', reject);
        req.setTimeout(timeoutMs, function () { req.destroy(new Error('timeout')); });
    });
}

// ── SerpAPI Google Search ──────────────────────────────────
async function searchGoogle(query, serpApiKey, numResults) {
    if (!serpApiKey || serpApiKey === 'your_serpapi_key_here') return [];
    var n = numResults || 5;
    try {
        var url = 'https://serpapi.com/search.json?engine=google&q=' +
            encodeURIComponent(query) +
            '&gl=in&hl=en&num=' + n +
            '&api_key=' + serpApiKey;
        var res = await fetchUrl(url, 8000);
        var data = JSON.parse(res.body);
        var results = (data.organic_results || []).slice(0, n).map(function (r) {
            return {
                title: r.title || '',
                snippet: r.snippet || '',
                url: r.link || '',
                source: r.source || '',
            };
        });
        return results;
    } catch (e) {
        console.warn('[RAG] Google search failed:', e.message);
        return [];
    }
}

// ── NewsAPI Search ─────────────────────────────────────────
async function searchNews(query, newsApiKey, numResults) {
    if (!newsApiKey || newsApiKey === 'your_newsapi_key_here') return [];
    var n = numResults || 5;
    try {
        var url = 'https://newsapi.org/v2/everything?q=' +
            encodeURIComponent(query) +
            '&language=en&sortBy=relevancy&pageSize=' + n +
            '&apiKey=' + newsApiKey;
        var res = await fetchUrl(url, 6000);
        var data = JSON.parse(res.body);
        var articles = (data.articles || []).slice(0, n).map(function (a) {
            return {
                title: a.title || '',
                snippet: a.description || '',
                url: a.url || '',
                source: (a.source && a.source.name) || 'News',
                publishedAt: a.publishedAt || '',
            };
        });
        return articles;
    } catch (e) {
        console.warn('[RAG] News search failed:', e.message);
        return [];
    }
}

// ── PubMed Search ──────────────────────────────────────────
async function searchPubMed(query, numResults) {
    var n = numResults || 3;
    try {
        var searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=' +
            encodeURIComponent(query) +
            '&retmax=' + n + '&retmode=json&sort=relevance';
        var searchRes = await fetchUrl(searchUrl, 6000);
        var searchData = JSON.parse(searchRes.body);
        var ids = (searchData.esearchresult && searchData.esearchresult.idlist) || [];
        if (!ids.length) return [];

        var summaryUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' +
            ids.join(',') + '&retmode=json';
        var summaryRes = await fetchUrl(summaryUrl, 6000);
        var summaryData = JSON.parse(summaryRes.body);
        var result = summaryData.result || {};

        return ids.map(function (id) {
            var item = result[id] || {};
            return {
                title: item.title || 'PubMed Study',
                snippet: item.source || '',
                url: 'https://pubmed.ncbi.nlm.nih.gov/' + id,
                source: 'PubMed',
                year: item.pubdate ? item.pubdate.slice(0, 4) : '',
            };
        }).filter(function (r) { return r.title; });
    } catch (e) {
        console.warn('[RAG] PubMed search failed:', e.message);
        return [];
    }
}

// ── Main RAG retrieval function ────────────────────────────
// mode: 'research' | 'pricing' | 'formulation' | 'funding' | 'competitor' | 'supplier'
async function retrieveSources(keyword, mode, keys) {
    var serpKey = (keys && keys.serpapi) || process.env.SERPAPI_KEY || '';
    var newsKey = (keys && keys.news) || process.env.NEWS_API_KEY || '';

    var queries = buildQueries(keyword, mode);
    var allSources = [];

    // Run searches in parallel
    var promises = [];

    // Google searches
    queries.google.forEach(function (q) {
        promises.push(
            searchGoogle(q, serpKey, 4).then(function (r) {
                r.forEach(function (s) { s.queryUsed = q; s.channel = 'Google'; });
                allSources = allSources.concat(r);
            }).catch(function () { })
        );
    });

    // News searches
    if (queries.news) {
        queries.news.forEach(function (q) {
            promises.push(
                searchNews(q, newsKey, 3).then(function (r) {
                    r.forEach(function (s) { s.queryUsed = q; s.channel = 'News'; });
                    allSources = allSources.concat(r);
                }).catch(function () { })
            );
        });
    }

    // PubMed for research/formulation
    if (queries.pubmed) {
        queries.pubmed.forEach(function (q) {
            promises.push(
                searchPubMed(q, 3).then(function (r) {
                    r.forEach(function (s) { s.channel = 'PubMed'; });
                    allSources = allSources.concat(r);
                }).catch(function () { })
            );
        });
    }

    await Promise.allSettled(promises);

    // Deduplicate by URL
    var seen = new Set();
    var unique = allSources.filter(function (s) {
        if (!s.url || seen.has(s.url)) return false;
        seen.add(s.url);
        return true;
    });

    return unique;
}

// ── Query builder per mode ─────────────────────────────────
function buildQueries(keyword, mode) {
    var base = keyword + ' India';

    var modeQueries = {
        research: {
            google: [
                base + ' market size 2024 2025',
                base + ' D2C brand consumer trend',
                base + ' clinical study health benefits',
                keyword + ' India regulations FSSAI',
            ],
            news: [base + ' wellness market', keyword + ' India startup'],
            pubmed: [keyword + ' clinical trial', keyword + ' health benefits study'],
        },
        pricing: {
            google: [
                keyword + ' price India Amazon',
                keyword + ' supplement MRP India buy online',
                keyword + ' D2C brand India cost',
                base + ' retail price market',
            ],
            news: [keyword + ' India price market'],
            pubmed: [],
        },
        formulation: {
            google: [
                keyword + ' formulation ingredients',
                keyword + ' supplement dosage safety',
                keyword + ' FSSAI approved India',
                keyword + ' manufacturing India GMP',
            ],
            news: [],
            pubmed: [keyword + ' dosage efficacy', keyword + ' safety human study'],
        },
        funding: {
            google: [
                keyword + ' India D2C startup funding',
                base + ' venture capital investment 2024',
                'wellness D2C India VC funding 2024',
                base + ' brand Series A funding',
            ],
            news: [keyword + ' India startup funding', 'Indian wellness D2C funding 2024'],
            pubmed: [],
        },
        competitor: {
            google: [
                keyword + ' brand India top',
                keyword + ' supplement India buy Amazon Flipkart',
                base + ' D2C company market leader',
                keyword + ' India product review',
            ],
            news: [keyword + ' India brand launch'],
            pubmed: [],
        },
        supplier: {
            google: [
                keyword + ' raw material supplier India',
                keyword + ' manufacturer India B2B',
                keyword + ' ingredient bulk supplier IndiaMART',
                keyword + ' contract manufacturer India GMP',
            ],
            news: [],
            pubmed: [],
        },
        global: {
            google: [
                keyword + ' global market size',
                keyword + ' United States Europe trend 2024',
                keyword + ' USA UK Australia market',
                keyword + ' India vs global comparison',
            ],
            news: [keyword + ' global trend 2024', keyword + ' worldwide market'],
            pubmed: [keyword + ' global prevalence'],
        },
    };

    return modeQueries[mode] || modeQueries['research'];
}

// ── Format sources into RAG context string ─────────────────
function formatContext(sources) {
    if (!sources || !sources.length) return 'No external sources retrieved.';

    return sources.map(function (s, i) {
        var lines = ['[SOURCE ' + (i + 1) + '] — ' + (s.source || s.channel || 'Web')];
        if (s.title) lines.push('Title: ' + s.title);
        if (s.snippet) lines.push('Content: ' + s.snippet);
        if (s.url) lines.push('URL: ' + s.url);
        if (s.publishedAt) lines.push('Date: ' + s.publishedAt.slice(0, 10));
        if (s.year) lines.push('Year: ' + s.year);
        return lines.join('\n');
    }).join('\n\n---\n\n');
}

module.exports = { retrieveSources, formatContext };