// NADI DEBUG COMPONENT - Add this temporarily to AnalyzeSingle to diagnose
// Usage: <NADIDebug keyword={result.keyword} />
import { useState } from 'react'

export default function NADIDebug({ keyword }) {
    const [log, setLog] = useState([])
    const [running, setRunning] = useState(false)

    function addLog(msg, color = '#EDE8DC') {
        setLog(prev => [...prev, { msg: String(msg), color, time: new Date().toLocaleTimeString() }])
    }

    async function runDiagnostics() {
        setLog([])
        setRunning(true)
        addLog('🔍 Starting diagnostics for: ' + keyword, '#00C9B1')

        // Test 1: Can we reach the backend at all?
        try {
            addLog('Test 1: Checking /api/health...')
            const r = await fetch('/api/health')
            const d = await r.json()
            addLog('✅ Backend reachable. Status: ' + JSON.stringify(d).slice(0, 100), '#00D46A')
        } catch (e) {
            addLog('❌ Backend unreachable: ' + e.message, '#FF4757')
        }

        // Test 2: Can we reach /api/ai-test (Gemini connectivity)
        try {
            addLog('Test 2: Checking /api/ai-test (Gemini API)...')
            const r = await fetch('/api/ai-test')
            const d = await r.json()
            if (d.status === 'OK') {
                addLog('✅ Gemini works! Response: ' + d.geminiResponse, '#00D46A')
            } else {
                addLog('❌ Gemini FAILED: ' + (d.reason || d.error), '#FF4757')
            }
        } catch (e) {
            addLog('❌ /api/ai-test failed: ' + e.message, '#FF4757')
        }

        // Test 3: POST to /api/ai-generate with a simple prompt
        try {
            addLog('Test 3: POST to /api/ai-generate...')
            const r = await fetch('/api/ai-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: 'Reply with exactly this JSON: {"test":true,"keyword":"' + keyword + '"}', max_tokens: 100 })
            })
            addLog('  Response status: ' + r.status + ' ' + r.statusText, r.ok ? '#EDE8DC' : '#FF4757')
            const d = await r.json()
            addLog('  Response body: ' + JSON.stringify(d).slice(0, 300), r.ok ? '#00D46A' : '#FF4757')
            if (d.content && d.content[0]) {
                addLog('  Extracted text: ' + d.content[0].text.slice(0, 200), '#00C9B1')
            }
        } catch (e) {
            addLog('❌ /api/ai-generate failed: ' + e.message, '#FF4757')
        }

        // Test 4: POST to /api/rag-retrieve
        try {
            addLog('Test 4: POST to /api/rag-retrieve...')
            const r = await fetch('/api/rag-retrieve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, mode: 'research' })
            })
            addLog('  Status: ' + r.status, r.ok ? '#EDE8DC' : '#FF4757')
            const d = await r.json()
            addLog('  sourceCount: ' + (d.sourceCount || 0) + ', context length: ' + (d.context || '').length, '#00C9B1')
        } catch (e) {
            addLog('❌ /api/rag-retrieve failed: ' + e.message, '#FF4757')
        }

        setRunning(false)
        addLog('🏁 Diagnostics complete', '#E8A020')
    }

    return (
        <div style={{ margin: '12px 0', padding: 16, background: '#0C1120', border: '1px solid #E8A020', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: '#E8A020', fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>🔧 NADI Diagnostics</span>
                <button onClick={runDiagnostics} disabled={running} style={{ padding: '6px 16px', background: '#E8A020', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>
                    {running ? 'Running...' : 'Run Diagnostics'}
                </button>
            </div>
            {log.length > 0 && (
                <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.8, maxHeight: 400, overflowY: 'auto' }}>
                    {log.map((l, i) => (
                        <div key={i} style={{ color: l.color }}>
                            <span style={{ color: '#3A4F68' }}>[{l.time}] </span>{l.msg}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}