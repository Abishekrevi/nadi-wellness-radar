import { createContext, useContext, useState } from 'react'

export var LangContext = createContext({ lang: 'en', setLang: function () { } })

export function useLang() { return useContext(LangContext) }

export var TRANSLATIONS = {
    en: {
        appTagline: 'Neural Ayurvedic & Digital Intelligence',
        heroTitle: 'India Wellness Intelligence Platform',
        heroBody: 'Identify ₹30Cr+ D2C opportunities 6 months before they go mainstream — powered by DNA Trend Fingerprinting™ across 1,000+ live data sources.',
        tabRadar: 'Radar Scan',
        tabAnalyze: 'Deep Analyze',
        tabModel: 'DNA Model',
        tabCompare: 'Compare Trends',
        analyzeTitle: 'Deep Analyze',
        analyzeSubtitle: '— full DNA fingerprint for any signal',
        analyzeDesc: 'Enter any wellness ingredient, practice, or product category. Live data is fetched from all sources and a founder-grade opportunity brief is generated.',
        analyzePlaceholder: 'e.g. berberine supplement India',
        analyzeBtn: '🧬 Analyze',
        analyzingBtn: '⟳ Analyzing...',
        tryLabel: 'Try:',
        scanningMsg: 'Scanning Reddit · YouTube · Google Trends · PubMed · Amazon India · News',
        exportPDF: '📄 Export PDF',
        pitchDeck: '📊 Pitch Deck (.pptx)',
        listenBrief: '🔊 Listen to Brief',
        expandFull: '▼ Expand Full Brief',
        collapseFull: '▲ Collapse Report',
        footerSources: 'Reddit · YouTube · Google Trends · PubMed · Amazon India · News RSS',
    },
    hi: {
        appTagline: 'न्यूरल आयुर्वेदिक और डिजिटल इंटेलिजेंस',
        heroTitle: 'भारत वेलनेस इंटेलिजेंस प्लेटफ़ॉर्म',
        heroBody: 'मुख्यधारा से 6 महीने पहले ₹30Cr+ D2C अवसरों की पहचान करें — 1,000+ लाइव डेटा स्रोतों में DNA ट्रेंड फिंगरप्रिंटिंग™ द्वारा संचालित।',
        tabRadar: 'रडार स्कैन',
        tabAnalyze: 'डीप एनालाइज़',
        tabModel: 'DNA मॉडल',
        tabCompare: 'ट्रेंड तुलना',
        analyzeTitle: 'डीप एनालाइज़',
        analyzeSubtitle: '— किसी भी सिग्नल का पूर्ण DNA फिंगरप्रिंट',
        analyzeDesc: 'कोई भी वेलनेस सामग्री, अभ्यास या उत्पाद श्रेणी दर्ज करें। सभी स्रोतों से लाइव डेटा प्राप्त किया जाता है और एक संस्थापक-ग्रेड अवसर ब्रीफ तैयार की जाती है।',
        analyzePlaceholder: 'जैसे बेर्बेरिन सप्लीमेंट इंडिया',
        analyzeBtn: '🧬 एनालाइज़ करें',
        analyzingBtn: '⟳ विश्लेषण हो रहा है...',
        tryLabel: 'आज़माएं:',
        scanningMsg: 'Reddit · YouTube · Google Trends · PubMed · Amazon India · News स्कैन हो रहा है',
        exportPDF: '📄 PDF निर्यात करें',
        pitchDeck: '📊 पिच डेक (.pptx)',
        listenBrief: '🔊 ब्रीफ सुनें',
        expandFull: '▼ पूरी रिपोर्ट देखें',
        collapseFull: '▲ रिपोर्ट छुपाएं',
        footerSources: 'Reddit · YouTube · Google Trends · PubMed · Amazon India · News RSS',
    },
}

export function LangProvider({ children }) {
    var [lang, setLang] = useState('en')
    return (
        <LangContext.Provider value={{ lang, setLang }}>
            {children}
        </LangContext.Provider>
    )
}

export function LangToggle() {
    var { lang, setLang } = useLang()
    return (
        <button
            onClick={function () { setLang(lang === 'en' ? 'hi' : 'en') }}
            title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: 6, cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                color: 'var(--gold)',
                fontFamily: 'var(--f-mono)',
                letterSpacing: '0.05em',
            }}
        >
            {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
        </button>
    )
}