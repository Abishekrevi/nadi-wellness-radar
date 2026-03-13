// ╔══════════════════════════════════════════════════════════════╗
// ║   NADI - Intelligence Report Generator                      ║
// ║   Generates founder-grade opportunity briefs via Gemini AI  ║
// ╚══════════════════════════════════════════════════════════════╝

const axios = require('axios');

/**
 * Generate a comprehensive intelligence report for a trend
 * using Google Gemini AI with real data as grounding
 */
async function generateIntelligenceReport(trendData, masResult, apiKey) {
  // Uses Groq via callAI (imported from server.js)
  const hasAnyKey = !!(process.env.GROQ_API_KEY?.length > 10);
  if (!hasAnyKey) {
    return generateTemplatedReport(trendData, masResult);
  }

  const systemPrompt = `You are NADI's Intelligence Engine — India's most advanced wellness trend analyst.

Your task is to generate a HIGH-INTELLIGENCE opportunity brief for Indian D2C founders.

CRITICAL RULES:
1. ONLY use the data provided. Never hallucinate statistics or make up numbers.
2. When you cite a number, it must come from the provided signal data.
3. Be specific, actionable, and brutally honest about risks.
4. Write like a top-tier strategy consultant, not a generic AI.
5. Every recommendation must have clear reasoning.

OUTPUT FORMAT: Return a JSON object with these exact fields:
{
  "executive_summary": "2-3 sentence bold summary of the opportunity",
  "why_now": "Why is the timing critical right now in India specifically?",
  "target_consumer": "Precise consumer profile with psychographics",
  "market_gap": "The specific gap no Indian brand is filling yet",
  "product_opportunity": "1-3 concrete product ideas with format, pricing, and positioning",
  "competitive_moat": "What would make this defensible in 18 months?",
  "risk_assessment": "3 key risks with mitigation strategies",
  "go_to_market": "Recommended first 90-day GTM strategy for an Indian D2C",
  "revenue_model": "How to monetize this in the Indian market",
  "signal_evidence": "The specific data points that make this compelling",
  "verdict": "STRONG BUY | WATCH | PASS — with one sentence reason",
  "confidence_level": "HIGH | MEDIUM | LOW",
  "action_timeline": "When a founder should act by"
}`;

  const userPrompt = `Analyze this wellness trend for the Indian D2C market:

TREND: ${trendData.keyword}
MOMENTUM ACCELERATION SCORE: ${masResult.score}/100
CLASSIFICATION: ${masResult.classification.label}
TIME TO MAINSTREAM: ${masResult.timeToMainstream}
MARKET SIZE POTENTIAL: ${masResult.marketSizePotential.tam} ${masResult.marketSizePotential.unit}

SIGNAL DATA COLLECTED:
- Reddit mentions (India): ${trendData.redditMentions}
- YouTube mentions: ${trendData.youtubeMentions}
- News articles: ${trendData.newsMentions}
- PubMed research papers: ${trendData.researchMentions}
- Amazon India products: ${trendData.ecommerceProducts}
- Search momentum (last 30 days): ${trendData.searchMomentum}%
- Indian brand adoption count: ${trendData.indianBrandAdoption}
- Average price point: Rs.${trendData.avgPricePoint}
- Has Ayurvedic backing: ${trendData.hasAyurvedicBacking}
- Has Ayush/FSSAI connection: ${trendData.hasAyushApproval}

DNA FINGERPRINT SCORES (0-1):
${JSON.stringify(masResult.dnaScores, null, 2)}

TOP REDDIT DISCUSSIONS:
${trendData.sourceData.reddit.topPosts?.slice(0, 3).map(p => `- "${p.title}" (${p.score} upvotes, ${p.comments} comments)`).join('\n') || 'Limited Reddit data'}

TOP NEWS COVERAGE:
${trendData.sourceData.news.articles?.slice(0, 3).map(a => `- "${a.title}" — ${a.source}`).join('\n') || 'Limited news data'}

ECOMMERCE LANDSCAPE:
${trendData.sourceData.ecommerce.topProducts?.slice(0, 3).map(p => `- ${p.title} (${p.price ? 'Rs.' + p.price : 'Price TBD'}, ${p.rating})`).join('\n') || 'Limited ecommerce data'}

Return ONLY a valid JSON object. No markdown, no backticks, no explanation text before or after the JSON.`;

  // Combine system + user prompt for Gemini (it uses a single prompt)
  const fullPrompt = systemPrompt + '\n\n' + userPrompt;

  try {
    // Use multi-provider AI caller (Gemini → Groq → Mistral → OpenRouter)
    const { callAI } = require('./server');
    let text;
    try {
      text = await callAI(fullPrompt, 2000);
    } catch (aiErr) {
      console.error('All AI providers failed in reportGenerator:', aiErr.message);
      return generateTemplatedReport(trendData, masResult);
    }
    if (!text) {
      console.error('[reportGenerator] AI returned empty text');
      return generateTemplatedReport(trendData, masResult);
    }

    // Strip markdown code fences
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    // Parse the JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr.message);
        return generateTemplatedReport(trendData, masResult);
      }
    }

    console.error('[reportGenerator] No JSON found in AI response');
    return generateTemplatedReport(trendData, masResult);

  } catch (err) {
    console.error('Gemini API error:', err.response?.data?.error?.message || err.message);
    return generateTemplatedReport(trendData, masResult);
  }
}

/**
 * Fallback template-based report (no AI required)
 */
function generateTemplatedReport(trendData, masResult) {
  const keyword = trendData.keyword;
  const score = masResult.score;
  const classification = masResult.classification;
  const isAyurvedic = trendData.hasAyurvedicBacking;

  let verdict = 'WATCH';
  let verdictReason = 'Signals are building but need confirmation across more platforms.';

  if (score >= 75) {
    verdict = 'STRONG BUY';
    verdictReason = `High momentum with ${masResult.confidence} confidence data — first-mover window is now.`;
  } else if (score >= 60) {
    verdict = 'BUY';
    verdictReason = 'Emerging trend with multiple confirming signals — act within 3 months.';
  } else if (score < 40) {
    verdict = 'PASS';
    verdictReason = 'Insufficient signal strength or fad pattern detected.';
  }

  const productIdeas = generateProductIdeas(keyword, isAyurvedic, trendData.avgPricePoint);

  return {
    executive_summary: `${keyword} is showing ${classification.label.toLowerCase()} characteristics in the Indian wellness market with a Momentum Acceleration Score of ${score}/100. ${trendData.redditMentions + trendData.newsMentions} combined media mentions detected across monitored sources in the last 30 days. ${isAyurvedic ? 'Strong Ayurvedic validation provides a unique moat for Indian brands.' : 'Opportunity exists to anchor this trend in Indian wellness traditions.'}`,

    why_now: `Search momentum of ${trendData.searchMomentum > 0 ? '+' : ''}${trendData.searchMomentum}% indicates ${trendData.searchMomentum > 20 ? 'accelerating' : 'building'} consumer interest. ${trendData.researchMentions} PubMed papers provide scientific validation that typically precedes consumer mainstream adoption by 12-18 months. Post-COVID Indian consumers are actively seeking ${isAyurvedic ? 'traditional remedies backed by science' : 'evidence-based natural wellness solutions'}.`,

    target_consumer: `Urban Indian, 25-40 years, household income ₹8-25L, actively researching wellness on social media. ${trendData.redditMentions > 20 ? 'High Reddit activity suggests early-adopter, research-driven consumer — ideal for building authentic brand voice.' : 'Relatively untapped on social platforms — opportunity to educate and own the conversation.'} Likely female-skewing (60-65%) based on category patterns.`,

    market_gap: `Only ${trendData.indianBrandAdoption} Indian brands currently offer ${keyword} products on Amazon India, suggesting ${trendData.indianBrandAdoption < 3 ? 'a largely untapped market with no dominant Indian brand yet' : 'early competition but no clear category leader yet'}. No brand has combined ${keyword} with ${isAyurvedic ? 'modern bioavailability science' : 'traditional Indian wellness wisdom'}.`,

    product_opportunity: productIdeas,

    competitive_moat: `Build defensibility through: (1) Original research partnerships with Indian Ayurvedic universities for clinical validation; (2) Quality certifications — AYUSH Premium Mark + third-party testing; (3) Community-first approach — own the online conversation before competition arrives; (4) Sourcing relationships with Indian farmers/cooperatives for supply chain moat.`,

    risk_assessment: `Risk 1: If global trend doesn't translate to India (mitigation: A/B test with small batch, DTC-first). Risk 2: Regulatory changes by FSSAI on health claims (mitigation: conservative claims, focus on wellness not medicine). Risk 3: Competition from established Ayurvedic brands with distribution advantage (mitigation: digital-first, community-built brand that incumbents can't replicate).`,

    go_to_market: `Days 1-30: Launch micro-DTC on website + Instagram. Create educational content around ${keyword} backed by data. Partner with 3-5 credentialed nutritionists/doctors for authentic endorsement. Days 31-60: Launch on Amazon India + Meesho for reach. Target Tier-1 city WhatsApp health groups. Days 61-90: Scale what's working. Aim for ₹5L MRR before scaling paid ads.`,

    revenue_model: `Primary: Direct DTC product sales (₹${Math.max(200, trendData.avgPricePoint - 100)}-${trendData.avgPricePoint + 200} price point). Secondary: Monthly subscription model (15-20% margin uplift). Tertiary: White-label B2B for other wellness brands. Goal: ₹1Cr ARR within 12 months of launch with 40%+ gross margins.`,

    signal_evidence: `Key evidence: ${trendData.redditMentions} Reddit mentions (organic consumer discussion), ${trendData.researchMentions} academic papers (scientific validation), ${trendData.ecommerceProducts} Amazon products (market exists but uncrowded), ${trendData.searchMomentum > 0 ? '+' + trendData.searchMomentum + '% search momentum' : trendData.searchMomentum + '% search momentum'}, DNA Fingerprint similarity to ${masResult.historicalPattern?.closestTrend?.name || 'known successful trends'} (${masResult.historicalPattern?.trendScore || 0}% match).`,

    verdict,
    confidence_level: masResult.confidence,
    action_timeline: score >= 75 ? 'Act within 30 days — window is open NOW' :
      score >= 60 ? 'Act within 60-90 days — early mover window' :
        'Monitor for 60 more days before committing resources',
  };
}

function generateProductIdeas(keyword, isAyurvedic, pricePoint) {
  const ideas = [];
  const kw = keyword.toLowerCase();

  // Supplement idea
  ideas.push(`1. ${keyword} Premium Supplement — Bioavailability-enhanced formula (liposomal or with piperine), priced at ₹${Math.round(pricePoint / 100) * 100 + 200}-${Math.round(pricePoint / 100) * 100 + 500}/month supply. USP: Third-party tested, FSSAI-approved, transparent sourcing. Targeting: ₹30Cr TAM opportunity.`);

  // Functional food/drink idea
  if (isAyurvedic) {
    ideas.push(`2. ${keyword} Wellness Shots — 30ml daily shot format combining ${keyword} with complementary adaptogens. ₹600-800 for 30-day supply. Modern format with traditional wisdom positioning. Target: ₹800Cr functional beverages market.`);
  } else {
    ideas.push(`2. ${keyword}-Infused Functional Food — RTD format (powder or gummies) for modern Indian consumer. ₹400-600 price point. Mass-market positioning. Target: First-mover in this specific format in India.`);
  }

  // Knowledge/community idea
  ideas.push(`3. ${keyword} Wellness Protocol — Subscription program combining product + personalized guidance + community. ₹1,500-2,500/month. High retention model. 12-month value: ₹18-30K per subscriber.`);

  return ideas.join('\n\n');
}

module.exports = { generateIntelligenceReport };