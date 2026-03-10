// ══════════════════════════════════════════════════════════
// NADI RAG Hook — useRAG()
// Retrieves real web sources from backend before AI generation
// All AI components use this to eliminate hallucination
// ══════════════════════════════════════════════════════════

import { useState, useCallback } from 'react'

var API_URL = import.meta.env.VITE_API_URL || ''

// Cache to avoid repeated fetches within same session
var sessionCache = {}

export function useRAG() {
    var [retrieving, setRetrieving] = useState(false)
    var [sources, setSources] = useState(null)
    var [error, setError] = useState(null)

    var retrieve = useCallback(async function (keyword, mode) {
        var cacheKey = keyword + ':' + mode
        if (sessionCache[cacheKey]) {
            setSources(sessionCache[cacheKey])
            return sessionCache[cacheKey]
        }

        setRetrieving(true)
        setError(null)
        try {
            var res = await fetch(API_URL + '/api/rag-retrieve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, mode }),
            })
            if (!res.ok) throw new Error('RAG retrieval failed: ' + res.status)
            var data = await res.json()
            sessionCache[cacheKey] = data
            setSources(data)
            return data
        } catch (e) {
            setError(e.message)
            // Return empty context so AI can still run without RAG
            return { sources: [], context: '', sourceCount: 0 }
        } finally {
            setRetrieving(false)
        }
    }, [])

    return { retrieve, retrieving, sources, error }
}

// Source citation display component
export function SourcePanel({ sources, compact }) {
    if (!sources || !sources.length) return null

    if (compact) {
        return (
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12,
                padding: '10px 14px',
                background: 'rgba(0,229,204,0.04)',
                border: '1px solid rgba(0,229,204,0.12)',
                borderRadius: 8,
            }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.1em', marginRight: 4 }}>
                    SOURCES USED:
                </span>
                {sources.slice(0, 6).map(function (s, i) {
                    return (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '2px 8px',
                            background: 'rgba(0,229,204,0.06)',
                            border: '1px solid rgba(0,229,204,0.15)',
                            borderRadius: 20,
                            fontSize: 9, fontFamily: 'var(--f-mono)',
                            color: 'var(--teal)',
                            textDecoration: 'none',
                            transition: 'background 0.15s',
                        }}
                            onMouseEnter={function (e) { e.currentTarget.style.background = 'rgba(0,229,204,0.12)' }}
                            onMouseLeave={function (e) { e.currentTarget.style.background = 'rgba(0,229,204,0.06)' }}
                        >
                            ↗ {s.source || s.channel || 'Source ' + (i + 1)}
                        </a>
                    )
                })}
                {sources.length > 6 && (
                    <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', padding: '2px 6px' }}>
                        +{sources.length - 6} more
                    </span>
                )}
            </div>
        )
    }

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
                ✓ Real Sources Retrieved ({sources.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sources.slice(0, 8).map(function (s, i) {
                    return (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            padding: '10px 12px',
                            background: 'var(--bg-raised)',
                            border: '1px solid var(--border-dim)',
                            borderRadius: 8,
                            textDecoration: 'none',
                            transition: 'border-color 0.15s',
                        }}
                            onMouseEnter={function (e) { e.currentTarget.style.borderColor = 'rgba(0,229,204,0.25)' }}
                            onMouseLeave={function (e) { e.currentTarget.style.borderColor = 'var(--border-dim)' }}
                        >
                            <span style={{
                                flexShrink: 0,
                                padding: '2px 7px',
                                background: s.channel === 'PubMed' ? 'rgba(96,165,250,0.1)' : s.channel === 'News' ? 'rgba(251,146,60,0.1)' : 'rgba(0,229,204,0.08)',
                                border: '1px solid ' + (s.channel === 'PubMed' ? 'rgba(96,165,250,0.2)' : s.channel === 'News' ? 'rgba(251,146,60,0.2)' : 'rgba(0,229,204,0.15)'),
                                borderRadius: 20,
                                fontSize: 8,
                                fontWeight: 700,
                                fontFamily: 'var(--f-mono)',
                                color: s.channel === 'PubMed' ? '#60A5FA' : s.channel === 'News' ? '#FB923C' : 'var(--teal)',
                                letterSpacing: '0.08em',
                                whiteSpace: 'nowrap',
                            }}>
                                {s.channel || 'Web'}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 12, fontWeight: 600, color: 'var(--text-1)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    marginBottom: 3,
                                }}>
                                    {s.title || s.url}
                                </div>
                                {s.snippet && (
                                    <div style={{
                                        fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5,
                                        overflow: 'hidden', display: '-webkit-box',
                                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    }}>
                                        {s.snippet}
                                    </div>
                                )}
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--teal)', flexShrink: 0 }}>↗</span>
                        </a>
                    )
                })}
            </div>
        </div>
    )
}

// RAG status indicator shown during retrieval
export function RAGStatus({ retrieving, sourceCount }) {
    if (!retrieving && !sourceCount) return null

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: retrieving ? 'rgba(0,229,204,0.06)' : 'rgba(0,212,106,0.06)',
            border: '1px solid ' + (retrieving ? 'rgba(0,229,204,0.2)' : 'rgba(0,212,106,0.2)'),
            borderRadius: 8,
            marginBottom: 12,
        }}>
            {retrieving ? (
                <>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', animation: 'pulse-ring 1.5s infinite' }} />
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.08em' }}>
                        RETRIEVING REAL SOURCES... AI will answer from actual data
                    </span>
                </>
            ) : (
                <>
                    <span style={{ color: 'var(--green)', fontSize: 14 }}>✓</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.08em' }}>
                        {sourceCount} REAL SOURCES RETRIEVED — AI grounded in actual data
                    </span>
                </>
            )}
        </div>
    )
}