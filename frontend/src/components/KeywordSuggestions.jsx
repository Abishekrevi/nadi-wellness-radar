import { useState, useEffect } from 'react'

function generateSuggestions(keyword) {
    if (!keyword || keyword.trim().length < 3) return []

    var base = keyword.toLowerCase().trim()
    var suggestions = []

    // Modifiers to generate related keywords
    var indiaModifiers = ['India', 'Indian market', 'Ayurvedic', 'FSSAI approved']
    var formatModifiers = ['supplement', 'powder', 'capsules', 'oil', 'tea', 'gummies', 'serum']
    var useCaseModifiers = ['weight loss', 'skin glow', 'hair growth', 'gut health', 'PCOS', 'sleep', 'energy', 'immunity']
    var audienceModifiers = ['women India', 'men India', 'over 40 India', 'vegetarian India']

    // Remove existing India/supplement type words to get the core
    var core = base
        .replace(/\bindia\b/gi, '')
        .replace(/\bsupplement\b/gi, '')
        .replace(/\bpowder\b/gi, '')
        .replace(/\bcapsules?\b/gi, '')
        .replace(/\bindian\b/gi, '')
        .trim()

    if (core.length < 2) core = base

    // Generate India-specific variants
    indiaModifiers.forEach(function (mod) {
        var suggestion = core + ' ' + mod
        if (suggestion.toLowerCase() !== base) suggestions.push(suggestion)
    })

    // Generate format variants
    formatModifiers.forEach(function (mod) {
        var suggestion = core + ' ' + mod + ' India'
        if (suggestion.toLowerCase() !== base) suggestions.push(suggestion)
    })

    // Generate use-case variants
    useCaseModifiers.forEach(function (mod) {
        var suggestion = core + ' ' + mod + ' India'
        if (suggestion.toLowerCase() !== base) suggestions.push(suggestion)
    })

    // Generate audience variants
    audienceModifiers.forEach(function (mod) {
        var suggestion = core + ' ' + mod
        if (suggestion.toLowerCase() !== base) suggestions.push(suggestion)
    })

    // Deduplicate and limit
    var seen = {}
    var unique = suggestions.filter(function (s) {
        var key = s.toLowerCase()
        if (seen[key]) return false
        seen[key] = true
        return true
    })

    return unique.slice(0, 12)
}

export default function KeywordSuggestions({ keyword, onSelect, disabled }) {
    var [suggestions, setSuggestions] = useState([])
    var [expanded, setExpanded] = useState(false)

    useEffect(function () {
        if (keyword && keyword.trim().length >= 3) {
            setSuggestions(generateSuggestions(keyword))
            setExpanded(false)
        } else {
            setSuggestions([])
        }
    }, [keyword])

    if (!suggestions.length) return null

    var visible = expanded ? suggestions : suggestions.slice(0, 6)

    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{
                fontFamily: 'var(--f-mono)', fontSize: 9,
                color: 'var(--text-3)', letterSpacing: '0.12em',
                marginBottom: 8,
            }}>
                RELATED KEYWORDS TO ANALYZE
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {visible.map(function (s) {
                    return (
                        <button
                            key={s}
                            onClick={function () { onSelect(s) }}
                            disabled={disabled}
                            style={{
                                padding: '5px 12px',
                                background: 'rgba(45,212,191,0.05)',
                                border: '1px solid rgba(45,212,191,0.18)',
                                borderRadius: 20,
                                cursor: 'pointer',
                                fontSize: 11, color: 'var(--teal)',
                                fontFamily: 'var(--f-mono)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={function (e) {
                                e.target.style.background = 'rgba(45,212,191,0.12)'
                                e.target.style.borderColor = 'rgba(45,212,191,0.35)'
                            }}
                            onMouseLeave={function (e) {
                                e.target.style.background = 'rgba(45,212,191,0.05)'
                                e.target.style.borderColor = 'rgba(45,212,191,0.18)'
                            }}
                        >
                            + {s}
                        </button>
                    )
                })}
                {suggestions.length > 6 && (
                    <button
                        onClick={function () { setExpanded(function (e) { return !e }) }}
                        style={{
                            padding: '5px 12px',
                            background: 'none',
                            border: '1px solid var(--border-dim)',
                            borderRadius: 20, cursor: 'pointer',
                            fontSize: 11, color: 'var(--text-3)',
                            fontFamily: 'var(--f-mono)',
                        }}
                    >
                        {expanded ? 'Show less ↑' : ('+' + (suggestions.length - 6) + ' more ↓')}
                    </button>
                )}
            </div>
        </div>
    )
}