import { useState } from 'react'
import axios from 'axios'

var API_URL = import.meta.env.VITE_API_URL || ''

export default function InvestorOnePager({ result }) {
    var [loading, setLoading] = useState(false)
    var [content, setContent] = useState(null)
    var [error, setError] = useState(null)
    var [open, setOpen] = useState(false)

    if (!result) return null

    async function generate() {
        setLoading(true); setError(null)
        try {
            var res = await axios.post(API_URL + '/api/one-pager', { result }, { timeout: 60000 })
            setContent(res.data.content)
            setOpen(true)
        } catch (e) {
            setError(e.response?.data?.message || e.message)
        } finally { setLoading(false) }
    }

    function copyToClipboard() {
        if (!content) return
        navigator.clipboard.writeText(content).then(() => {
            var btn = document.getElementById('copy-btn')
            if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy' }, 2000) }
        })
    }

    function saveReport() {
        if (!content) return
        try {
            var saved = JSON.parse(localStorage.getItem('nadi_saved_reports') || '[]')
            saved.unshift({ id: Date.now().toString(), keyword: result.keyword, type: 'Investor One-Pager', summary: content.slice(0, 300), fullContent: content, savedAt: new Date().toISOString() })
            if (saved.length > 20) saved = saved.slice(0, 20)
            localStorage.setItem('nadi_saved_reports', JSON.stringify(saved))
            var btn = document.getElementById('save-btn')
            if (btn) { btn.textContent = '✅ Saved!'; setTimeout(() => { btn.textContent = '💾 Save' }, 2000) }
        } catch (e) { }
    }

    function shareWhatsApp() {
        if (!content) return
        var excerpt = content.slice(0, 800) + '\n\n_Full report: NADI Wellness Radar_'
        window.open('https://wa.me/?text=' + encodeURIComponent(excerpt), '_blank')
    }

    return (
        <div style={{ marginTop: 16 }}>
            <button onClick={open ? () => setOpen(false) : (content ? () => setOpen(true) : generate)}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: open ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, cursor: loading ? 'default' : 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>
                {loading ? '⟳ Generating...' : open ? '▲ Investor One-Pager' : '📄 Generate Investor One-Pager'}
            </button>
            {error && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--red)' }}>⚠ {error}</div>}

            {open && content && (
                <div style={{ marginTop: 12, background: 'var(--bg-float)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>Investor One-Pager</div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{result.keyword} · MAS {result.momentumAccelerationScore}/100</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button id="copy-btn" onClick={copyToClipboard} style={{ padding: '5px 10px', fontSize: 11, background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 4, color: 'var(--text-2)', cursor: 'pointer' }}>📋 Copy</button>
                            <button id="save-btn" onClick={saveReport} style={{ padding: '5px 10px', fontSize: 11, background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 4, color: 'var(--text-2)', cursor: 'pointer' }}>💾 Save</button>
                            <button onClick={shareWhatsApp} style={{ padding: '5px 10px', fontSize: 11, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 4, color: '#25D366', cursor: 'pointer' }}>💬 Share</button>
                            <button onClick={generate} disabled={loading} style={{ padding: '5px 10px', fontSize: 11, background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 4, color: 'var(--text-2)', cursor: 'pointer' }}>↻ Regen</button>
                        </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'var(--f-sans)' }}>{content}</div>
                </div>
            )}
        </div>
    )
}