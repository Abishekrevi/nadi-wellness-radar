import { useState, useEffect } from 'react'

export function useTheme() {
    var [theme, setTheme] = useState(function () {
        return localStorage.getItem('nadi-theme') || 'dark'
    })

    useEffect(function () {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('nadi-theme', theme)
    }, [theme])

    function toggle() { setTheme(function (t) { return t === 'dark' ? 'light' : 'dark' }) }

    return { theme, toggle }
}

export default function ThemeToggle({ theme, onToggle }) {
    var isDark = theme === 'dark'

    return (
        <button
            onClick={onToggle}
            title={'Switch to ' + (isDark ? 'light' : 'dark') + ' theme'}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--text-2)',
                textTransform: 'uppercase',
            }}
            onMouseEnter={function (e) {
                e.currentTarget.style.borderColor = 'var(--gold)'
                e.currentTarget.style.color = 'var(--gold)'
            }}
            onMouseLeave={function (e) {
                e.currentTarget.style.borderColor = 'var(--border-mid)'
                e.currentTarget.style.color = 'var(--text-2)'
            }}
        >
            <span style={{ fontSize: 15 }}>{isDark ? '☀️' : '🌙'}</span>
            {isDark ? 'Light' : 'Dark'}
        </button>
    )
}