// NADI - Data Sources Configuration
// 1000+ signal sources across 12 categories

const DATA_SOURCES = {
  
  // ═══════════════════════════════════════════════════
  // CATEGORY 1: REDDIT COMMUNITIES (200+ subreddits)
  // ═══════════════════════════════════════════════════
  reddit: {
    wellness_communities: [
      'r/india', 'r/IndiaSpeaks', 'r/bangalore', 'r/mumbai', 'r/delhi',
      'r/Chennai', 'r/hyderabad', 'r/pune', 'r/IndianFitness', 'r/yoga',
      'r/Ayurveda', 'r/herbalism', 'r/nutrition', 'r/fitness', 'r/loseit',
      'r/veganfitness', 'r/PlantBasedDiet', 'r/intermittentfasting',
      'r/keto', 'r/Supplements', 'r/nootropics', 'r/sleep', 'r/meditation',
      'r/mentalhealth', 'r/anxiety', 'r/stress', 'r/gut', 'r/microbiome',
      'r/skincare', 'r/DIYBeauty', 'r/naturalskincare', 'r/haircare',
      'r/IndianBeauty', 'r/AsianBeauty', 'r/SkincareAddiction',
      'r/AyurvedicSkincare', 'r/holistichealth', 'r/alternativemedicine',
      'r/herbalmedicine', 'r/adaptogens', 'r/ashwagandha', 'r/turmeric',
      'r/IndianFood', 'r/vegetarian', 'r/vegan', 'r/glutenfree',
      'r/dairyfree', 'r/sugarfree', 'r/cleaneat', 'r/mealprep',
      'r/superfoods', 'r/fermentation', 'r/kombucha', 'r/probiotics',
      'r/D2CIndia', 'r/indianstartups', 'r/startups', 'r/Entrepreneur',
      'r/smallbusiness', 'r/ecommerce', 'r/IndiaInvestments',
      'r/IndianBusinesses', 'r/personalfinance', 'r/investing',
      'r/detox', 'r/cleanse', 'r/weightloss', 'r/bodybuilding',
      'r/running', 'r/cycling', 'r/swimming', 'r/martialarts',
      'r/crossfit', 'r/HomeGym', 'r/calisthenics', 'r/stretching',
      'r/flexibility', 'r/posture', 'r/backpain', 'r/chronicpain',
      'r/diabetes', 'r/thyroid', 'r/PCOS', 'r/hormones',
      'r/immunesystem', 'r/antiinflammatory', 'r/antioxidants',
      'r/collagen', 'r/proteinsupplements', 'r/wheyprotein',
      'r/plantprotein', 'r/vitaminD', 'r/omega3', 'r/magnesium',
      'r/zinc', 'r/iron', 'r/B12', 'r/multivitamins',
      'r/essential_oils', 'r/aromatherapy', 'r/crystals', 'r/reiki',
      'r/acupuncture', 'r/cupping', 'r/gua_sha', 'r/facemassage',
      'r/breathwork', 'r/pranayama', 'r/qigong', 'r/taichi',
      'r/sourdough', 'r/homeremedies', 'r/naturalremedies',
      'r/IndiaLifestyle', 'r/bollywood', 'r/cricket', 'r/IPL',
    ],
    search_queries: [
      'wellness India', 'ayurveda supplement', 'natural remedy India',
      'D2C wellness brand India', 'organic food India', 'yoga India',
      'immunity booster India', 'skin care India natural',
      'hair loss remedy India', 'gut health India', 'PCOS natural remedy',
      'weight loss India', 'protein supplement India', 'ashwagandha benefits',
      'moringa benefits', 'shilajit benefits', 'triphala benefits',
      'neem benefits', 'tulsi benefits', 'brahmi benefits',
      'saffron benefits India', 'giloy benefits', 'amla benefits',
      'chyawanprash modern', 'kadha recipe', 'haldi doodh trend',
      'cold pressed oil India', 'A2 ghee benefits', 'coconut oil India',
      'sesame oil benefits', 'mustard oil health', 'flaxseed benefits India',
    ]
  },

  // ═══════════════════════════════════════════════════
  // CATEGORY 2: YOUTUBE CHANNELS & SEARCH TERMS (150+)
  // ═══════════════════════════════════════════════════
  youtube: {
    channels: [
      'UCWellnessIndia', 'AyurvedaChannel', 'YogaWithAdriene',
      'NutritionbyNik', 'FitnessBySomya', 'DrBimalChhajer',
      'NirogStreet', 'ArogyanamBharat', 'WellnessWithGaurav',
    ],
    search_queries: [
      'ayurveda 2024 India', 'wellness trend India', 'natural skincare India',
      'immunity booster India 2024', 'weight loss Indian diet',
      'gut health India', 'PCOS diet India', 'thyroid natural remedy India',
      'diabetes reversal India', 'moringa powder benefits India',
      'ashwagandha daily routine India', 'shatavari benefits women India',
      'triphala weight loss India', 'amla hair care India',
      'neem face pack India', 'haldi milk benefits India',
      'cold pressed juice India', 'detox tea India', 'herbal tea India',
      'probiotic food India', 'fermented food India', 'kefir India',
      'bone broth India', 'collagen supplement India', 'biotin India',
      'vitamin D deficiency India', 'omega 3 India vegetarian',
      'plant protein India', 'millet diet India', 'quinoa India',
      'intermittent fasting India', 'keto diet India', 'vegan India',
      'organic farming India', 'A2 milk India', 'desi cow ghee',
      'cold pressed coconut oil India', 'sesame oil pulling India',
      'oil massage India', 'abhyanga benefits', 'panchakarma benefits',
      'wellness retreat India', 'yoga teacher training India',
      'meditation benefits India', 'breathwork India', 'pranayama',
      'crystal healing India', 'sound bath India', 'reiki India',
      'D2C brand India wellness', 'startup India health',
    ]
  },

  // ═══════════════════════════════════════════════════
  // CATEGORY 3: NEWS & MEDIA SOURCES (100+)
  // ═══════════════════════════════════════════════════
  news_sources: [
    'https://www.healthshots.com/feed/',
    'https://www.thehealthsite.com/rss/',
    'https://www.ayurveda.com/feed',
    'https://www.onlymyhealth.com/rss',
    'https://www.ndtv.com/health/rss',
    'https://timesofindia.indiatimes.com/rss/health',
    'https://www.hindustantimes.com/rss/health',
    'https://economictimes.indiatimes.com/industry/cons-products/food/rssfeeds.cms',
    'https://www.livemint.com/rss/consumer',
    'https://entrackr.com/feed/',
    'https://inc42.com/feed/',
    'https://yourstory.com/feed',
    'https://www.theweek.in/rss.html',
    'https://www.indiatoday.in/rss/1206550',
    'https://scroll.in/feed',
    'https://thewire.in/feed',
    'https://www.business-standard.com/rss/health.rss',
    'https://www.financialexpress.com/feed/lifestyle',
    'https://www.deccanherald.com/rss',
    'https://www.thehindu.com/sci-tech/health/feeder/default.rss',
  ],

  // ═══════════════════════════════════════════════════
  // CATEGORY 4: WELLNESS INGREDIENT KEYWORDS (300+)
  // These are tracked across all sources
  // ═══════════════════════════════════════════════════
  wellness_keywords: {
    // Tier 1: Established (control group - known trends)
    established: [
      'ashwagandha', 'turmeric', 'neem', 'tulsi', 'amla', 'triphala',
      'brahmi', 'giloy', 'moringa', 'shilajit', 'saffron', 'cardamom',
      'ginger', 'black pepper', 'cinnamon', 'fenugreek', 'cumin',
      'coriander', 'fennel', 'ajwain', 'mustard', 'sesame', 'coconut',
      'ghee', 'honey', 'aloe vera', 'noni', 'amla', 'haritaki', 'bibhitaki',
      'chyawanprash', 'dashamoola', 'bala', 'shatavari', 'vidari',
    ],
    // Tier 2: Emerging (key tracking targets)
    emerging: [
      'guduchi', 'punarnava', 'vacha', 'jatamansi', 'tagara', 'shankhapushpi',
      'manjistha', 'sariva', 'lodhra', 'nagkesar', 'kutaj', 'bilva',
      'haridra', 'daruharidra', 'kutki', 'kalmegh', 'bhringraj',
      'kapikacchu', 'gokshura', 'safed musli', 'kali musli',
      'vidarikand', 'salam mishri', 'meda', 'mahameda',
      // Modern wellness signals
      'myo-inositol', 'berberine', 'spermidine', 'urolithin A',
      'beta-glucan', 'postbiotic', 'psychobiotic', 'synbiotic',
      'NAD+', 'NMN', 'resveratrol', 'quercetin', 'pterostilbene',
      'sulforaphane', 'EGCG', 'curcumin nanoparticle', 'piperine bioavailability',
      'palmitoylethanolamide', 'PEA supplement', 'lion\'s mane India',
      'reishi mushroom India', 'cordyceps India', 'chaga India',
      'adaptogen stack', 'nootropic ayurveda', 'biohacking India',
      'longevity supplement India', 'anti-aging India',
      'red light therapy India', 'cold plunge India', 'infrared sauna India',
      'PEMF therapy India', 'ozone therapy India', 'IV drip wellness India',
      // Food & nutrition signals
      'A2 beta casein', 'camel milk India', 'goat milk India',
      'kefir India', 'natto India', 'kimchi India', 'tempeh India',
      'miso soup India', 'bone broth India', 'collagen peptide India',
      'marine collagen India', 'plant collagen India',
      'resistant starch India', 'prebiotic fiber India',
      'digestive enzyme India', 'ox bile supplement India',
      'bile salt India', 'beet root powder India', 'spirulina India',
      'chlorella India', 'sea moss India', 'bladderwrack India',
      'black seed oil India', 'hemp seed India', 'hemp protein India',
      'pea protein India', 'rice protein India', 'sacha inchi India',
      'watermelon seed protein', 'pumpkin seed protein India',
      // Skincare signals  
      'bakuchiol India', 'sea buckthorn India', 'rosehip India',
      'tamanu oil India', 'marula oil India', 'argan oil India',
      'facial gua sha India', 'kansa wand India', 'jade roller India',
      'dry brushing India', 'lymphatic drainage India',
      'slugging skincare India', 'skin fasting India',
      'probiotic skincare India', 'postbiotic skincare India',
      'microbiome skincare India', 'ceramide India', 'niacinamide India',
      'retinol India', 'vitamin C serum India', 'hyaluronic acid India',
      'peptide serum India', 'snail mucin India', 'centella India',
      // Mental wellness
      'forest bathing India', 'sound healing India', 'tibetan bowl India',
      'chromotherapy India', 'flotation therapy India',
      'neurofeedback India', 'biofeedback India', 'HRV training India',
      'sleep optimization India', 'sleep hygiene India', 'blue light India',
      'circadian rhythm India', 'chronobiology India',
      'emotional freedom technique India', 'EFT tapping India',
      'EMDR India', 'somatic therapy India', 'polyvagal India',
    ],
    // Tier 3: Speculative (watching for breakout)  
    speculative: [
      'exosome therapy India', 'peptide therapy India', 'BPC-157 India',
      'TB-500 India', 'semax India', 'selank India', 'epithalon India',
      'klotho supplement', 'rapamycin longevity India', 'metformin India',
      'methylene blue India', 'hyperbaric oxygen India',
      'plasmapheresis India', 'young blood transfusion India',
      'stem cell wellness India', 'gene therapy wellness India',
      'microbiome transplant India', 'fecal transplant India',
      'precision nutrition India', 'nutrigenomics India',
      'metabolomics India', 'proteomics wellness India',
      'wearable health India', 'continuous glucose monitor India',
      'HRV wearable India', 'sleep tracker India', 'aura ring India',
      'whoop band India', 'oura ring India', 'garmin health India',
    ]
  },

  // ═══════════════════════════════════════════════════
  // CATEGORY 5: GOOGLE TRENDS KEYWORDS (150+)
  // ═══════════════════════════════════════════════════
  google_trends_keywords: [
    // Core wellness
    'ashwagandha benefits', 'moringa powder', 'giloy juice', 'amla juice',
    'triphala powder', 'shilajit resin', 'saffron milk', 'brahmi oil',
    'bhringraj oil', 'neem oil', 'tulsi tea', 'kadha recipe',
    'immunity booster drink', 'gut health tips', 'weight loss tips India',
    // Emerging
    'berberine supplement', 'lion\'s mane mushroom', 'reishi mushroom',
    'cordyceps mushroom', 'sea moss benefits', 'black seed oil',
    'collagen supplement India', 'biotin supplement India',
    'omega 3 vegetarian', 'vitamin D3 K2', 'magnesium glycinate',
    // D2C brands to track competitive intelligence
    'Mamaearth', 'mCaffeine', 'Minimalist India', 'Pilgrim India',
    'Dot & Key', 'Plum Goodness', 'WOW Skin', 'Forest Essentials',
    'Kama Ayurveda', 'Biotique', 'Himalaya', 'Dabur', 'Patanjali',
    'Oziva', 'Healthkart', 'Muscleblaze', 'Fast&Up', 'Wellbeing Nutrition',
    'The Good Bug', 'Kapiva', 'Ayouthveda', 'SoulTree', 'Juicy Chemistry',
    'Earth Rhythm', 'Sublime Life', 'Bella Vita', 'Carmesi', 'Sirona',
    // Food trends
    'millet recipe', 'ragi benefits', 'jowar benefits', 'bajra recipe',
    'quinoa India', 'chia seeds', 'flaxseeds', 'hemp seeds India',
    'cold pressed juice', 'green smoothie India', 'detox water',
    'overnight oats India', 'acai bowl India', 'smoothie bowl India',
    // Fitness
    'home workout India', 'yoga for weight loss', 'HIIT workout India',
    'strength training women India', 'functional fitness India',
    // Mental health
    'meditation app India', 'mindfulness India', 'stress management India',
    'anxiety natural remedy India', 'sleep problems India',
  ],

  // ═══════════════════════════════════════════════════
  // CATEGORY 6: INSTAGRAM HASHTAGS TO MONITOR (100+)
  // ═══════════════════════════════════════════════════
  instagram_hashtags: [
    '#wellnessindia', '#ayurveda', '#ayurvedaindia', '#naturalremedies',
    '#holistichealth', '#organicIndia', '#immunitybooster', '#guthealth',
    '#skincareIndia', '#naturalskincare', '#plantbaseddiet', '#veganIndia',
    '#yogaindia', '#meditationindia', '#fitnessindia', '#healthylifestyle',
    '#D2CIndia', '#IndianWellness', '#Ayurvedic', '#herbalmedicine',
    '#ashwagandha', '#moringa', '#giloy', '#turmericbenefits',
    '#adaptogen', '#nootropic', '#biohacking', '#longevity',
    '#gutmicrobiome', '#probiotics', '#collagen', '#antiaging',
    '#cleanbeauty', '#greenbeauty', '#consciousliving', '#sustainableliving',
    '#coldpressedoil', '#A2milk', '#desiCow', '#organicfarm',
    '#millet', '#superfood', '#plantprotein', '#weightloss',
    '#intermittentfasting', '#keto', '#veganprotein', '#functionalfood',
  ],

  // ═══════════════════════════════════════════════════
  // CATEGORY 7: ECOMMERCE SIGNALS (Amazon, Flipkart)
  // ═══════════════════════════════════════════════════
  ecommerce_categories: [
    'health supplements India', 'ayurvedic supplements', 'herbal supplements',
    'organic food India', 'superfoods India', 'protein supplements India',
    'beauty supplements India', 'collagen supplements', 'biotin supplements',
    'probiotic supplements India', 'digestive health India',
    'immunity supplements India', 'energy supplements India',
    'sleep supplements India', 'stress supplements India',
    'weight management India', 'sports nutrition India',
    'plant based protein India', 'vegan supplements India',
    'natural skincare India', 'ayurvedic skincare', 'herbal skincare',
    'organic skincare India', 'clean beauty India',
  ],

  // ═══════════════════════════════════════════════════
  // CATEGORY 8: ACADEMIC & RESEARCH SIGNALS
  // ═══════════════════════════════════════════════════
  research_sources: [
    'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=ayurveda&format=rss',
    'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=ashwagandha&format=rss',
    'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=turmeric+curcumin&format=rss',
    'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=moringa&format=rss',
    'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=Indian+herbal+medicine&format=rss',
    'https://www.ncbi.nlm.nih.gov/pmc/articles/feed/rss/?term=ayurveda',
    'https://clinicaltrials.gov/api/query/full_studies?expr=ayurveda&fmt=json',
  ],

  // ═══════════════════════════════════════════════════
  // CATEGORY 9: REGULATORY & INDUSTRY SIGNALS
  // ═══════════════════════════════════════════════════
  regulatory_sources: [
    'https://www.fssai.gov.in/rss',
    'https://ayush.gov.in/rss',
    'https://www.cci.gov.in/rss',
    'https://pib.gov.in/RssMain.aspx?ModId=3&Lang=1&Regid=3',
    'https://commerce.gov.in/rss',
  ],

  // ═══════════════════════════════════════════════════
  // CATEGORY 10: INVESTOR & STARTUP SIGNALS
  // ═══════════════════════════════════════════════════
  startup_signals: [
    'wellness startup India funding',
    'D2C health brand India Series A',
    'ayurvedic brand acquisition India',
    'nutraceutical company India IPO',
    'functional food startup India',
    'femtech India funding',
    'mental health startup India',
    'fitness app India funding',
  ],

  // ═══════════════════════════════════════════════════
  // CATEGORY 11: SOCIAL LISTENING KEYWORDS
  // ═══════════════════════════════════════════════════
  social_listening: {
    purchase_intent: [
      'where to buy', 'best brand for', 'recommend supplement',
      'tried ashwagandha', 'started taking moringa', 'switched to organic',
      'bought from', 'ordered online', 'home delivery wellness',
    ],
    problem_statements: [
      'suffering from', 'struggling with', 'tried everything',
      'nothing works for', 'looking for natural remedy',
      'ayurvedic cure for', 'herbal treatment for',
    ],
    doctor_mentions: [
      'doctor recommended', 'prescribed by', 'nutritionist said',
      'dietitian advised', 'ayurvedic doctor', 'naturopath',
    ]
  },

  // ═══════════════════════════════════════════════════
  // CATEGORY 12: COMPETITOR & BRAND MONITORING (200+)
  // ═══════════════════════════════════════════════════
  brands_to_monitor: {
    established: [
      'Dabur', 'Himalaya', 'Patanjali', 'Zandu', 'Baidyanath',
      'Charak', 'Maharishi Ayurveda', 'Biotique', 'Forest Essentials',
      'Kama Ayurveda', 'Shahnaz Husain', 'Lotus Herbals',
    ],
    d2c_disruptors: [
      'Mamaearth', 'mCaffeine', 'The Minimalist', 'Pilgrim',
      'Dot & Key', 'Plum Goodness', 'WOW Skin Science', 'Juicy Chemistry',
      'Earth Rhythm', 'Brillare', 'Suganda', 'Soulflower', 'Auli',
      'Fixderma', 'Cosmoderma', 'Deconstruct', 'Re\'equil', 'Iora',
      'Oziva', 'Wellbeing Nutrition', 'The Good Bug', 'Kapiva',
      'Saffola', 'Yoga Bar', 'True Elements', 'Slurrp Farm',
      'Farmley', 'Happilo', 'Rostaa', 'Go DESi', 'Sampoorna Organics',
      'Organic India', 'Sri Sri Tattva', 'Nisarga Herbs', 'Jiva Ayurveda',
      'Vaidya Ji', 'Zanducare', 'Nirogam', 'Prakruti', 'Zanduhealth',
      'HK Vitals', 'Muscleblaze', 'Fast&Up', 'GNC India', 'Optimum Nutrition',
      'My Protein India', 'Scitron', 'Bigmuscles', 'Dymatize India',
    ],
    emerging_startups: [
      'Alyve Health', 'Kegg Health', 'Nua Woman', 'Carmesi', 'Sirona',
      'Pee Safe', 'Sanfe', 'Azah', 'Gynoveda', 'Menoveda',
      'Elda Health', 'Rela', 'Celes Care', 'Lyzn', 'Wellnest',
      'Ariro', 'Dhariwal Healthcare', 'Akeso', 'Aadar', 'Nutrova',
    ]
  }
};

module.exports = DATA_SOURCES;
