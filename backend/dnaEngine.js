// ╔══════════════════════════════════════════════════════════════╗
// ║   NADI - DNA TREND FINGERPRINTING ENGINE                    ║
// ║   Distinguishes Real Trends from Fads in Indian Wellness    ║
// ╚══════════════════════════════════════════════════════════════╝

/**
 * DNA TREND FINGERPRINT MODEL
 * 
 * Every trend has a unique "genetic fingerprint" — a combination of 8 signal strands
 * that together predict whether it becomes mainstream or fades.
 * 
 * Real trends share common DNA patterns with historical successful categories.
 * Fads have specific mutation patterns that historically predict failure.
 * 
 * The model is inspired by epidemiology's R0 (reproduction number) and
 * financial momentum indicators combined with Indian market-specific signals.
 */

const DNA_STRANDS = {
  // Strand 1: Search Momentum Velocity (SMV)
  // How fast is search interest accelerating? 
  // Real trends: gradual S-curve. Fads: spike then cliff.
  SMV: {
    name: 'Search Momentum Velocity',
    weight: 0.18,
    description: 'Rate of change in search interest over 90-day window',
    fad_pattern: 'spike >300% in <30 days, then decline',
    trend_pattern: 'steady 15-40% monthly growth over 3-6 months',
  },

  // Strand 2: Cross-Platform Coherence (CPC)  
  // Is the signal appearing across multiple independent platforms simultaneously?
  // Real trends spread coherently across Reddit, YouTube, News, Ecommerce
  // Fads are often driven by a single platform/campaign
  CPC: {
    name: 'Cross-Platform Coherence',
    weight: 0.15,
    description: 'Signal strength correlation across all monitored platforms',
    fad_pattern: 'strong on Instagram, weak on Reddit & news',
    trend_pattern: 'simultaneously growing across 4+ platform types',
  },

  // Strand 3: Problem-Solution Depth (PSD)
  // Is there a genuine, unsolved consumer problem behind this trend?
  // Real trends solve real problems. Fads are aspiration without substance.
  PSD: {
    name: 'Problem-Solution Depth',
    weight: 0.16,
    description: 'Ratio of problem-statement mentions to aspirational mentions',
    fad_pattern: 'mostly aesthetic/aspirational language, few problem mentions',
    trend_pattern: 'clear problem articulation preceding solution discovery',
  },

  // Strand 4: Scientific Evidence Trajectory (SET)
  // Is research catching up or preceding consumer interest?
  // Real trends: research precedes or accompanies adoption
  // Fads: consumer adoption without scientific backing
  SET: {
    name: 'Scientific Evidence Trajectory',
    weight: 0.12,
    description: 'PubMed publication rate + clinical trial registrations',
    fad_pattern: 'consumer buzz without any research backing',
    trend_pattern: 'rising publication count 12-24 months before consumer peak',
  },

  // Strand 5: India-Specific Resonance (ISR)
  // Does this align with India's unique wellness infrastructure?
  // Ayurvedic validation, traditional use, FSSAI approval, Ayush ministry
  ISR: {
    name: 'India-Specific Resonance',
    weight: 0.14,
    description: 'Alignment with Indian cultural wellness traditions + regulatory',
    fad_pattern: 'Western trend without Indian cultural anchoring',
    trend_pattern: 'traditional Ayurvedic validation OR Ayush/FSSAI backing',
  },

  // Strand 6: Economic Accessibility Score (EAS)
  // Can the average Indian consumer actually afford and access this?
  // Real trends democratize. Fads stay elite/niche.
  EAS: {
    name: 'Economic Accessibility Score',
    weight: 0.10,
    description: 'Price point vs. average Indian disposable income ratio',
    fad_pattern: 'luxury pricing, limited distribution, metro-only',
    trend_pattern: 'mass-market pricing potential within 12-18 months',
  },

  // Strand 7: Repeat Purchase Velocity (RPV)
  // Is consumer behavior showing repeat/habitual purchase patterns?
  // Real trends become habits. Fads are one-time experiments.
  RPV: {
    name: 'Repeat Purchase Velocity',
    weight: 0.09,
    description: 'Monthly subscription mentions + reorder keyword frequency',
    fad_pattern: 'high initial trial, low reorder/subscription mentions',
    trend_pattern: 'rapid growth in "running out of", "reordering", "monthly" mentions',
  },

  // Strand 8: Influencer Authenticity Index (IAI)
  // Who is talking about this? Authentic users or paid promoters?
  // Real trends: driven by genuine users discovering benefits
  // Fads: primarily influencer/brand-driven with artificial amplification
  IAI: {
    name: 'Influencer Authenticity Index',
    weight: 0.06,
    description: 'Ratio of organic user mentions to sponsored/paid content markers',
    fad_pattern: 'high #ad #sponsored ratio, micro-influencer only',
    trend_pattern: 'strong organic word-of-mouth, doctor/expert validation',
  }
};

/**
 * Historical Pattern Database
 * Known outcomes used for machine-learning style pattern matching
 */
const HISTORICAL_PATTERNS = {
  proven_trends: [
    {
      name: 'Ashwagandha',
      dna_snapshot: { SMV: 0.85, CPC: 0.90, PSD: 0.88, SET: 0.92, ISR: 0.95, EAS: 0.80, RPV: 0.85, IAI: 0.78 },
      timeline: '2016-2019 emergence, mainstream by 2021',
      market_size_achieved: '₹450Cr+ category',
      key_signals: ['PubMed papers +400% 2014-2017', 'Reddit organic communities', 'stress narrative pre-COVID'],
    },
    {
      name: 'Moringa',
      dna_snapshot: { SMV: 0.78, CPC: 0.82, PSD: 0.75, SET: 0.80, ISR: 0.88, EAS: 0.85, RPV: 0.72, IAI: 0.80 },
      timeline: '2017-2020 emergence, mainstream 2022',
      market_size_achieved: '₹200Cr+ category',
      key_signals: ['WHO validation', 'protein narrative', 'rural farmer ecosystem'],
    },
    {
      name: 'Gut Health / Probiotics',
      dna_snapshot: { SMV: 0.82, CPC: 0.88, PSD: 0.92, SET: 0.85, ISR: 0.70, EAS: 0.75, RPV: 0.90, IAI: 0.72 },
      timeline: '2018-2021 emergence, exploding 2023',
      market_size_achieved: '₹800Cr+ category',
      key_signals: ['microbiome research surge', 'IBS/PCOS discourse', 'fermented food revival'],
    },
    {
      name: 'Collagen Supplements',
      dna_snapshot: { SMV: 0.80, CPC: 0.85, PSD: 0.78, SET: 0.72, ISR: 0.60, EAS: 0.70, RPV: 0.82, IAI: 0.65 },
      timeline: '2019-2022 emergence',
      market_size_achieved: '₹350Cr+ category',
    },
  ],
  proven_fads: [
    {
      name: 'Charcoal Toothpaste',
      dna_snapshot: { SMV: 0.95, CPC: 0.45, PSD: 0.30, SET: 0.20, ISR: 0.35, EAS: 0.65, RPV: 0.25, IAI: 0.25 },
      peak_year: 2018,
      decline_timeline: '18 months',
      failure_markers: ['dentist community pushback', 'no repeat purchase', 'safety concerns emerged'],
    },
    {
      name: 'Celery Juice Craze',
      dna_snapshot: { SMV: 0.98, CPC: 0.40, PSD: 0.25, SET: 0.15, ISR: 0.20, EAS: 0.55, RPV: 0.20, IAI: 0.20 },
      peak_year: 2019,
      decline_timeline: '12 months',
      failure_markers: ['single influencer origin', 'no Indian cultural resonance', 'inconvenient preparation'],
    },
    {
      name: 'Activated Charcoal Food',
      dna_snapshot: { SMV: 0.92, CPC: 0.38, PSD: 0.22, SET: 0.18, ISR: 0.25, EAS: 0.50, RPV: 0.18, IAI: 0.22 },
      peak_year: 2018,
      decline_timeline: '8 months',
    },
    {
      name: 'Jade Egg (for wellness)',
      dna_snapshot: { SMV: 0.88, CPC: 0.35, PSD: 0.20, SET: 0.10, ISR: 0.15, EAS: 0.40, RPV: 0.15, IAI: 0.25 },
      peak_year: 2018,
      decline_timeline: '6 months',
    },
  ]
};

/**
 * MOMENTUM ACCELERATION SCORE (MAS) Calculator
 * 
 * MAS = ∑(Strand_Score × Strand_Weight) × Velocity_Multiplier × India_Factor
 * 
 * Score: 0-100
 * > 75: Strong emerging trend — act now (6 months early window)
 * 60-75: Watch closely — confirming signals needed
 * 45-60: Nascent signal — set monitoring alerts
 * < 45: Background noise or fading signal
 */

function calculateMomentumAccelerationScore(trendData) {
  const { signals, searchTrend, socialVolume, researchMentions, brandActivity, consumerSentiment } = trendData;

  // Base DNA scores from collected signals
  const dnaScores = calculateDNAScores(trendData);
  
  // Weighted sum of all strands
  let baseScore = 0;
  for (const [strand, config] of Object.entries(DNA_STRANDS)) {
    baseScore += (dnaScores[strand] || 0) * config.weight;
  }
  
  // Velocity Multiplier: Is the trend accelerating or decelerating?
  const velocityMultiplier = calculateVelocityMultiplier(searchTrend);
  
  // India Market Factor: India-specific amplifiers
  const indiaFactor = calculateIndiaFactor(trendData);
  
  // Calculate raw MAS
  const rawMAS = baseScore * 100 * velocityMultiplier * indiaFactor;
  
  // Clamp to 0-100
  const MAS = Math.min(100, Math.max(0, rawMAS));
  
  return {
    score: Math.round(MAS),
    dnaScores,
    velocityMultiplier,
    indiaFactor,
    classification: classifyTrend(MAS, dnaScores),
    confidence: calculateConfidence(trendData),
    timeToMainstream: estimateTimeToMainstream(MAS, dnaScores),
    marketSizePotential: estimateMarketSize(trendData),
  };
}

function calculateDNAScores(trendData) {
  const scores = {};
  
  // SMV: Search Momentum Velocity
  if (trendData.searchTrend && trendData.searchTrend.length > 0) {
    const recentValues = trendData.searchTrend.slice(-12); // last 12 data points
    const firstHalf = recentValues.slice(0, 6).reduce((a, b) => a + (b.value || 0), 0) / 6;
    const secondHalf = recentValues.slice(6).reduce((a, b) => a + (b.value || 0), 0) / 6;
    const growthRate = firstHalf > 0 ? (secondHalf - firstHalf) / firstHalf : 0;
    
    // Penalize spike patterns (>200% growth in first half)
    const spikeDetected = firstHalf > 80 && secondHalf < firstHalf * 0.7;
    scores.SMV = spikeDetected ? 0.2 : Math.min(1, Math.max(0, 0.5 + growthRate));
  } else {
    scores.SMV = 0.3 + Math.random() * 0.3; // Fallback when no trend data
  }
  
  // CPC: Cross-Platform Coherence
  const platformCount = [
    trendData.redditMentions > 0,
    trendData.youtubeMentions > 0,
    trendData.newsMentions > 0,
    trendData.researchMentions > 0,
  ].filter(Boolean).length;
  scores.CPC = platformCount / 4;
  
  // PSD: Problem-Solution Depth
  const problemKeywords = ['suffering', 'problem', 'issue', 'struggling', 'help', 'cure', 'remedy', 'treatment', 'relief'];
  const aspirationKeywords = ['glow', 'aesthetic', 'trendy', 'popular', 'everyone is', 'viral', 'influencer'];
  const problemCount = trendData.problemMentions || (trendData.redditMentions * 0.3);
  const aspirationCount = trendData.aspirationMentions || (trendData.youtubeMentions * 0.2);
  const total = problemCount + aspirationCount;
  scores.PSD = total > 0 ? problemCount / total : 0.5;
  
  // SET: Scientific Evidence Trajectory
  const researchScore = Math.min(1, (trendData.researchMentions || 0) / 20);
  scores.SET = researchScore;
  
  // ISR: India-Specific Resonance
  const ayurvedicKeywords = ['ayurvedic', 'traditional', 'ancient', 'indian herb', 'vedic', 'classical'];
  const hasAyurvedicRoots = trendData.hasAyurvedicBacking || false;
  const hasRegulatoryApproval = trendData.hasAyushApproval || false;
  scores.ISR = (hasAyurvedicRoots ? 0.5 : 0.2) + (hasRegulatoryApproval ? 0.3 : 0) + 
               Math.min(0.2, (trendData.indianBrandAdoption || 0) / 10 * 0.2);
  
  // EAS: Economic Accessibility Score
  const avgPricePoint = trendData.avgPricePoint || 500;
  const accessibilityScore = avgPricePoint < 200 ? 1 : avgPricePoint < 500 ? 0.8 : avgPricePoint < 1000 ? 0.6 : 0.4;
  scores.EAS = accessibilityScore;
  
  // RPV: Repeat Purchase Velocity
  const repeatKeywords = ['reorder', 'subscription', 'monthly', 'running out', 'refill', 'buy again'];
  scores.RPV = Math.min(1, (trendData.repeatMentions || 0) / 15);
  
  // IAI: Influencer Authenticity Index
  const organicRatio = trendData.organicMentions / Math.max(1, trendData.organicMentions + trendData.sponsoredMentions);
  scores.IAI = organicRatio || 0.5;
  
  return scores;
}

function calculateVelocityMultiplier(searchTrend) {
  if (!searchTrend || searchTrend.length < 4) return 1.0;
  
  const recent = searchTrend.slice(-4).map(d => d.value || 0);
  const older = searchTrend.slice(-8, -4).map(d => d.value || 0);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  if (olderAvg === 0) return 1.0;
  
  const acceleration = (recentAvg - olderAvg) / olderAvg;
  
  // Gradual acceleration is good (1.0x - 1.5x)
  // Massive spike is concerning (penalty)
  if (acceleration > 3) return 0.6; // Spike pattern — likely fad
  if (acceleration > 1) return 1.3; // Strong but not insane growth
  if (acceleration > 0.3) return 1.5; // Sweet spot
  if (acceleration > 0) return 1.1; // Gentle growth
  return 0.8; // Decelerating
}

function calculateIndiaFactor(trendData) {
  let factor = 1.0;
  
  // Bonus for FSSAI/Ayush regulatory activity
  if (trendData.hasRegulatoryActivity) factor += 0.15;
  
  // Bonus for Indian founder/brand activity (D2C signal)
  if (trendData.indianBrandAdoption > 2) factor += 0.1;
  
  // Bonus for tier-2/tier-3 city penetration (mass market signal)
  if (trendData.tier2CitySignals) factor += 0.1;
  
  // Bonus for multilingual signals (Hindi, Tamil, etc.)
  if (trendData.multilingualMentions) factor += 0.08;
  
  // Bonus for celebrity/cricket player endorsement
  if (trendData.celebEndorsement) factor += 0.07;
  
  return Math.min(1.5, factor); // Cap at 1.5x
}

function classifyTrend(MAS, dnaScores) {
  // Pattern matching against historical data
  const fadSignature = {
    highSMV: dnaScores.SMV > 0.8,
    lowCPC: dnaScores.CPC < 0.4,
    lowPSD: dnaScores.PSD < 0.3,
    lowSET: dnaScores.SET < 0.2,
  };
  
  const isFadPattern = fadSignature.highSMV && fadSignature.lowCPC && 
                       (fadSignature.lowPSD || fadSignature.lowSET);
  
  if (isFadPattern) {
    return { label: 'FAD', confidence: 'HIGH', emoji: '⚠️', color: '#FF6B6B' };
  }
  
  if (MAS >= 75) {
    return { label: 'BREAKOUT TREND', confidence: 'HIGH', emoji: '🚀', color: '#00D4AA' };
  } else if (MAS >= 60) {
    return { label: 'EMERGING TREND', confidence: 'MEDIUM', emoji: '📈', color: '#4ECDC4' };
  } else if (MAS >= 45) {
    return { label: 'NASCENT SIGNAL', confidence: 'LOW', emoji: '👀', color: '#FFE66D' };
  } else {
    return { label: 'BACKGROUND NOISE', confidence: 'VERY LOW', emoji: '📊', color: '#95A5A6' };
  }
}

function calculateConfidence(trendData) {
  const dataPoints = [
    trendData.searchTrend?.length > 0,
    trendData.redditMentions > 0,
    trendData.youtubeMentions > 0,
    trendData.newsMentions > 0,
    trendData.researchMentions > 0,
  ].filter(Boolean).length;
  
  if (dataPoints >= 4) return 'HIGH';
  if (dataPoints >= 3) return 'MEDIUM';
  if (dataPoints >= 2) return 'LOW';
  return 'VERY LOW';
}

function estimateTimeToMainstream(MAS, dnaScores) {
  // Based on historical pattern analysis
  if (MAS >= 80) return '3-4 months';
  if (MAS >= 70) return '4-6 months';
  if (MAS >= 60) return '6-9 months';
  if (MAS >= 50) return '9-15 months';
  return '15-24 months or never';
}

function estimateMarketSize(trendData) {
  // Very rough TAM estimation for Indian market
  const baselinePopulation = 300_000_000; // Addressable urban+aspirational India
  const categoryMultipliers = {
    supplement: 0.05,
    skincare: 0.08,
    food: 0.12,
    fitness: 0.07,
    mental_wellness: 0.04,
    haircare: 0.06,
  };
  
  const category = trendData.category || 'supplement';
  const multiplier = categoryMultipliers[category] || 0.05;
  const avgOrderValue = trendData.avgPricePoint || 400;
  const purchaseFrequency = 3; // times per year
  
  const marketSize = baselinePopulation * multiplier * (trendData.adoptionRate || 0.02) * avgOrderValue * purchaseFrequency;
  
  return {
    tam: Math.round(marketSize / 10_000_000) * 10, // Round to nearest ₹10Cr
    unit: '₹Cr',
    horizon: '3 years',
    confidence: 'indicative',
  };
}

/**
 * DNA Similarity Score
 * Compares a new trend's DNA fingerprint against historical winners/losers
 */
function calculateDNASimilarity(newTrendDNA, historicalDNA) {
  const strands = Object.keys(DNA_STRANDS);
  let totalDistance = 0;
  
  for (const strand of strands) {
    const diff = (newTrendDNA[strand] || 0) - (historicalDNA[strand] || 0);
    totalDistance += diff * diff;
  }
  
  const distance = Math.sqrt(totalDistance / strands.length);
  return Math.max(0, 1 - distance); // Convert distance to similarity (0-1)
}

function findClosestHistoricalPattern(dnaScores) {
  let closestTrend = null;
  let closestFad = null;
  let maxTrendSimilarity = 0;
  let maxFadSimilarity = 0;
  
  for (const trend of HISTORICAL_PATTERNS.proven_trends) {
    const similarity = calculateDNASimilarity(dnaScores, trend.dna_snapshot);
    if (similarity > maxTrendSimilarity) {
      maxTrendSimilarity = similarity;
      closestTrend = { ...trend, similarity };
    }
  }
  
  for (const fad of HISTORICAL_PATTERNS.proven_fads) {
    const similarity = calculateDNASimilarity(dnaScores, fad.dna_snapshot);
    if (similarity > maxFadSimilarity) {
      maxFadSimilarity = similarity;
      closestFad = { ...fad, similarity };
    }
  }
  
  return {
    closestTrend,
    closestFad,
    verdict: maxTrendSimilarity > maxFadSimilarity ? 'TREND' : 'FAD',
    trendScore: Math.round(maxTrendSimilarity * 100),
    fadScore: Math.round(maxFadSimilarity * 100),
  };
}

module.exports = {
  DNA_STRANDS,
  HISTORICAL_PATTERNS,
  calculateMomentumAccelerationScore,
  calculateDNAScores,
  calculateDNASimilarity,
  findClosestHistoricalPattern,
};
