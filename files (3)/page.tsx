'use client';

import { useState, useRef, useCallback } from 'react';
import type { BillingResult, InputForm, BillingCode, MissedCode } from '@/lib/types';

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 16, className = '' }: { path: string; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
);

const icons = {
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  trending: 'M23 6l-9.5 9.5-5-5L1 18',
  alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  check: 'M20 6L9 17l-5-5',
  copy: 'M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2M8 4a2 2 0 012-2h4a2 2 0 012 2M8 4h8',
  chevronRight: 'M9 18l6-6-6-6',
  info: 'M12 16v-4M12 8h.01M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
  rupee: 'M6 3h12M6 8h12M6 3v18M6 8c0-2.761 2.686-5 6-5s6 2.239 6 5-2.686 5-6 5H6',
  fileText: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  xCircle: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM15 9l-6 6M9 9l6 6',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatINR = (val: number) =>
  '₹' + val.toLocaleString('en-IN');

const categoryMeta: Record<string, { label: string; tagClass: string; dot: string }> = {
  surgery:      { label: 'Surgery', tagClass: 'tag-surgery', dot: '#f43f5e' },
  procedure:    { label: 'Procedure', tagClass: 'tag-procedure', dot: '#3d8ef5' },
  diagnostic:   { label: 'Diagnostic', tagClass: 'tag-diagnostic', dot: '#f59e0b' },
  consultation: { label: 'Consultation', tagClass: 'tag-consultation', dot: '#2dd4bf' },
  implant:      { label: 'Implant', tagClass: 'tag-implant', dot: '#a855f7' },
  icu:          { label: 'ICU/HDU', tagClass: 'tag-icu', dot: '#ef4444' },
  anesthesia:   { label: 'Anesthesia', tagClass: 'tag-procedure', dot: '#3d8ef5' },
  medicine:     { label: 'Medicine', tagClass: 'tag-consultation', dot: '#2dd4bf' },
  nursing:      { label: 'Nursing', tagClass: 'tag-consultation', dot: '#2dd4bf' },
  physiotherapy:{ label: 'Physio', tagClass: 'tag-diagnostic', dot: '#f59e0b' },
};

const priorityMeta = {
  critical: { label: 'Critical', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.25)' },
  important: { label: 'Important', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  optional:  { label: 'Optional', color: '#8ba5cc', bg: 'rgba(99,160,255,0.07)', border: 'rgba(99,160,255,0.15)' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function CodeCard({ code, onCopy }: { code: BillingCode; onCopy: (text: string) => void }) {
  const meta = categoryMeta[code.category] || categoryMeta.procedure;
  const rateDisplay = code.cghs_rate_range
    ? `${formatINR(code.cghs_rate_range.min)} – ${formatINR(code.cghs_rate_range.max)}`
    : formatINR(code.cghs_rate_inr);

  return (
    <div className="copy-parent glass-card glass-card-hover rounded-xl p-4 transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="code-badge">{code.code}</span>
          {code.icd10_code && (
            <span className="code-badge" style={{ background: 'rgba(45,212,191,0.08)', color: '#5eead4', borderColor: 'rgba(45,212,191,0.2)' }}>
              ICD: {code.icd10_code}
            </span>
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${meta.tagClass}`}>{meta.label}</span>
          {code.requires_pre_auth && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
              Pre-Auth
            </span>
          )}
        </div>
        <button
          className="copy-btn shrink-0 p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'rgba(99,160,255,0.07)' }}
          onClick={() => onCopy(code.code)}
          title="Copy code"
        >
          <Icon path={icons.copy} size={13} />
        </button>
      </div>

      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{code.description}</p>
      {code.notes && <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{code.notes}</p>}

      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold" style={{ color: 'var(--accent-emerald)' }}>{rateDisplay}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>CGHS</span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className={`revenue-${code.revenue_impact}`}>
            {code.revenue_impact === 'high' ? '↑ High' : code.revenue_impact === 'medium' ? '→ Medium' : '↓ Low'} revenue
          </span>
          <span style={{ background: 'rgba(99,160,255,0.08)', padding: '1px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
            {code.confidence}% confidence
          </span>
        </div>
      </div>
    </div>
  );
}

function MissedCodeCard({ code, onCopy }: { code: MissedCode; onCopy: (text: string) => void }) {
  const meta = categoryMeta[code.category] || categoryMeta.procedure;
  const pMeta = priorityMeta[code.priority] || priorityMeta.optional;

  return (
    <div className="copy-parent rounded-xl p-4 transition-all duration-200 missed-highlight"
      style={{ background: pMeta.bg, border: `1px solid ${pMeta.border}` }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="code-badge">{code.code}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${meta.tagClass}`}>{meta.label}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ color: pMeta.color, background: pMeta.bg, border: `1px solid ${pMeta.border}` }}>
            {pMeta.label}
          </span>
        </div>
        <button
          className="copy-btn shrink-0 p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'rgba(99,160,255,0.07)' }}
          onClick={() => onCopy(code.code)}
          title="Copy code"
        >
          <Icon path={icons.copy} size={13} />
        </button>
      </div>

      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{code.description}</p>
      <div className="flex items-center gap-2 mt-1">
        <Icon path={icons.alert} size={12} style={{ color: pMeta.color, flexShrink: 0 }} />
        <p className="text-xs" style={{ color: pMeta.color }}>{code.reason}</p>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid ${pMeta.border}` }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--accent-emerald)' }}>{formatINR(code.cghs_rate_inr)}</span>
        <span className={`text-xs revenue-${code.revenue_impact}`}>
          {code.revenue_impact === 'high' ? '↑ High' : code.revenue_impact === 'medium' ? '→ Medium' : '↓ Low'} revenue
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-card rounded-xl p-4">
          <div className="flex gap-2 mb-3">
            <div className="shimmer h-5 w-20 rounded"></div>
            <div className="shimmer h-5 w-16 rounded"></div>
          </div>
          <div className="shimmer h-4 w-3/4 rounded mb-2"></div>
          <div className="shimmer h-3 w-1/2 rounded"></div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [form, setForm] = useState<InputForm>({
    clinical_input: '',
    patient_type: 'cghs',
    ward_type: 'general',
    hospital_type: 'empanelled_private',
  });
  const [result, setResult] = useState<BillingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'primary' | 'additional' | 'missed'>('primary');
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 1800);
    });
  }, []);

  const copyAllCodes = useCallback(() => {
    if (!result) return;
    const all = [
      ...result.primary_codes.map(c => c.code),
      ...result.additional_codes.map(c => c.code),
    ].join(', ');
    navigator.clipboard.writeText(all).then(() => {
      setCopiedCode('ALL');
      setTimeout(() => setCopiedCode(null), 2000);
    });
  }, [result]);

  const handleSubmit = async () => {
    if (!form.clinical_input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveTab('primary');

    try {
      const res = await fetch('/api/billing-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get billing codes');
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const exampleProcedures = [
    { label: 'Lap Appendectomy', text: 'Laparoscopic appendectomy for acute appendicitis, patient admitted for 2 days, ICU for 1 day post-op' },
    { label: 'PTCA + Stent', text: 'Coronary angiography followed by PTCA with DES stent placement to LAD, 2D Echo done pre-procedure' },
    { label: 'Knee Replacement', text: 'Total knee replacement right side, general anesthesia, ICU stay 1 day, physio started day 2' },
    { label: 'Thyroidectomy', text: 'Total thyroidectomy for multinodular goiter, thyroid profile done pre-op, post-op calcium monitoring' },
    { label: 'C-Section', text: 'Emergency LSCS at 38 weeks with neonatal care, epidural anesthesia, 3 days stay' },
  ];

  const totalRevenue = result?.total_estimated_revenue;
  const missedRevenue = result?.missed_codes.reduce((sum, c) => sum + c.cghs_rate_inr, 0) || 0;

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <header className="no-print sticky top-0 z-50" style={{ background: 'rgba(6,13,30,0.92)', borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a4b8e 0%, #0e3060 100%)', border: '1px solid rgba(61,142,245,0.3)' }}>
              <Icon path={icons.activity} size={15} className="" style={{ color: '#7ab8ff' } as React.CSSProperties} />
            </div>
            <div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                CGHS BillingAssist
              </span>
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(45,212,191,0.1)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.2)' }}>AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="pulse-dot"></div>
            <span>CGHS 2023 Rate Schedule</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10 no-print" style={{ animation: 'fadeUp 0.6s ease-out' }}>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            AI-Powered CGHS<br />
            <span style={{ background: 'linear-gradient(90deg, #3d8ef5, #2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Billing Code Optimizer
            </span>
          </h1>
          <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Describe any surgery, procedure, or diagnostic test in plain language. Our AI assigns accurate CGHS codes and uncovers missed revenue opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 no-print">
            <div className="glass-card rounded-2xl p-5 sticky top-20">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Icon path={icons.fileText} size={14} />
                CLINICAL INPUT
              </h2>

              {/* Patient type */}
              <div className="mb-4">
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Scheme Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['cghs', 'esi', 'echs', 'private'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setForm(f => ({ ...f, patient_type: type }))}
                      className="text-xs font-medium py-1.5 rounded-lg transition-all"
                      style={{
                        background: form.patient_type === type ? 'rgba(61,142,245,0.2)' : 'rgba(99,160,255,0.05)',
                        border: `1px solid ${form.patient_type === type ? 'rgba(61,142,245,0.5)' : 'var(--border-subtle)'}`,
                        color: form.patient_type === type ? '#7ab8ff' : 'var(--text-muted)',
                      }}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ward type */}
              <div className="mb-4">
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Ward Category</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { val: 'general', label: 'General' },
                    { val: 'semi-private', label: 'Semi-Pvt' },
                    { val: 'private', label: 'Private' },
                  ] as const).map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => setForm(f => ({ ...f, ward_type: val }))}
                      className="text-xs font-medium py-1.5 rounded-lg transition-all"
                      style={{
                        background: form.ward_type === val ? 'rgba(45,212,191,0.15)' : 'rgba(99,160,255,0.05)',
                        border: `1px solid ${form.ward_type === val ? 'rgba(45,212,191,0.4)' : 'var(--border-subtle)'}`,
                        color: form.ward_type === val ? '#2dd4bf' : 'var(--text-muted)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text input */}
              <div className="mb-4">
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Procedures / Surgeries / Tests Performed</label>
                <textarea
                  className="w-full rounded-xl px-3 py-3 text-sm focus-ring transition-all"
                  style={{
                    background: 'rgba(11,21,40,0.8)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    minHeight: '120px',
                    maxHeight: '300px',
                    lineHeight: '1.6',
                  }}
                  placeholder="e.g., Laparoscopic cholecystectomy for cholelithiasis, admitted 3 days, 2D Echo pre-op, general anesthesia..."
                  value={form.clinical_input}
                  onChange={e => setForm(f => ({ ...f, clinical_input: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
                />
              </div>

              {/* Examples */}
              <div className="mb-4">
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Quick examples:</p>
                <div className="flex flex-wrap gap-1.5">
                  {exampleProcedures.map(ex => (
                    <button
                      key={ex.label}
                      onClick={() => setForm(f => ({ ...f, clinical_input: ex.text }))}
                      className="text-xs px-2.5 py-1 rounded-lg transition-all"
                      style={{
                        background: 'rgba(99,160,255,0.07)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || !form.clinical_input.trim()}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: loading || !form.clinical_input.trim()
                    ? 'rgba(61,142,245,0.2)'
                    : 'linear-gradient(135deg, #1a4b8e 0%, #3d8ef5 100%)',
                  color: loading || !form.clinical_input.trim() ? 'var(--text-muted)' : '#fff',
                  border: '1px solid rgba(61,142,245,0.3)',
                  cursor: loading || !form.clinical_input.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Analyzing Codes...
                  </>
                ) : (
                  <>
                    <Icon path={icons.zap} size={14} />
                    Generate CGHS Codes
                  </>
                )}
              </button>
              <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>⌘+Enter to submit</p>

              {error && (
                <div className="mt-3 p-3 rounded-xl flex items-start gap-2" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
                  <Icon path={icons.xCircle} size={14} style={{ color: '#f43f5e', flexShrink: 0, marginTop: '1px' } as React.CSSProperties} />
                  <p className="text-xs" style={{ color: '#fb7185' }}>{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3" ref={resultRef}>
            {!result && !loading && (
              <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '400px' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(61,142,245,0.08)', border: '1px solid var(--border-subtle)' }}>
                  <Icon path={icons.clipboard} size={28} style={{ color: 'var(--text-muted)' } as React.CSSProperties} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                  Ready to Code
                </h3>
                <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
                  Enter any procedure, surgery, or diagnostic test in plain language. AI will assign CGHS codes and optimize your billing.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-sm">
                  {[
                    { icon: icons.search, label: 'AI Code Matching' },
                    { icon: icons.trending, label: 'Revenue Optimization' },
                    { icon: icons.alert, label: 'Missed Code Detection' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(99,160,255,0.05)', border: '1px solid var(--border-subtle)' }}>
                      <Icon path={item.icon} size={18} style={{ color: 'var(--accent-blue)', margin: '0 auto 6px' } as React.CSSProperties} />
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="pulse-dot"></div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI analyzing procedures and assigning codes...</span>
                </div>
                <LoadingSkeleton />
              </div>
            )}

            {result && !loading && (
              <div style={{ animation: 'fadeUp 0.5s ease-out' }}>
                {/* Summary bar */}
                <div className="glass-card rounded-2xl p-5 mb-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        {result.input_summary}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {result.identified_procedures.map((p, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(99,160,255,0.07)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={copyAllCodes}
                        className="no-print text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                        style={{ background: 'rgba(61,142,245,0.1)', border: '1px solid rgba(61,142,245,0.25)', color: '#7ab8ff' }}
                      >
                        <Icon path={copiedCode === 'ALL' ? icons.check : icons.copy} size={12} />
                        {copiedCode === 'ALL' ? 'Copied!' : 'Copy All'}
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="no-print text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                        style={{ background: 'rgba(99,160,255,0.07)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                      >
                        <Icon path={icons.printer} size={12} />
                        Print
                      </button>
                    </div>
                  </div>

                  {/* Revenue summary */}
                  {totalRevenue && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Optimal Revenue</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-display)' }}>
                          {formatINR(totalRevenue.optimal)}
                        </p>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: 'rgba(61,142,245,0.07)', border: '1px solid rgba(61,142,245,0.2)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Range</p>
                        <p className="text-sm font-semibold" style={{ color: '#7ab8ff' }}>
                          {formatINR(totalRevenue.min)}<br />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>to</span> {formatINR(totalRevenue.max)}
                        </p>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Missed Revenue</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-display)' }}>
                          {formatINR(missedRevenue)}
                        </p>
                      </div>
                    </div>
                  )}

                  {result.pre_auth_required && (
                    <div className="mt-3 flex items-center gap-2 text-xs p-2.5 rounded-lg" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
                      <Icon path={icons.info} size={12} />
                      Pre-authorization required for: {result.pre_auth_codes.join(', ')}
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 no-print" style={{ background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  {([
                    { key: 'primary', label: `Primary Codes (${result.primary_codes.length})` },
                    { key: 'additional', label: `Additional (${result.additional_codes.length})` },
                    { key: 'missed', label: `⚠ Missed (${result.missed_codes.length})` },
                  ] as const).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="flex-1 text-xs font-medium py-2 rounded-lg transition-all"
                      style={{
                        background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
                        color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                        border: activeTab === tab.key ? '1px solid var(--border-subtle)' : '1px solid transparent',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Code lists */}
                <div className="space-y-3">
                  {activeTab === 'primary' && result.primary_codes.map((code, i) => (
                    <div key={code.code} style={{ animation: `fadeUp 0.4s ease-out ${i * 0.05}s both` }}>
                      <CodeCard code={code} onCopy={handleCopy} />
                    </div>
                  ))}
                  {activeTab === 'additional' && (
                    result.additional_codes.length > 0
                      ? result.additional_codes.map((code, i) => (
                        <div key={code.code} style={{ animation: `fadeUp 0.4s ease-out ${i * 0.05}s both` }}>
                          <CodeCard code={code} onCopy={handleCopy} />
                        </div>
                      ))
                      : <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No additional codes identified</div>
                  )}
                  {activeTab === 'missed' && (
                    result.missed_codes.length > 0
                      ? result.missed_codes.map((code, i) => (
                        <div key={code.code} style={{ animation: `fadeUp 0.4s ease-out ${i * 0.05}s both` }}>
                          <MissedCodeCard code={code} onCopy={handleCopy} />
                        </div>
                      ))
                      : <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No missed codes — well done!</div>
                  )}
                </div>

                {/* Revenue Optimization Tips */}
                {result.revenue_optimization_tips.length > 0 && (
                  <div className="glass-card rounded-2xl p-5 mt-4">
                    <h4 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent-teal)' }}>
                      <Icon path={icons.trending} size={13} />
                      REVENUE OPTIMIZATION TIPS
                    </h4>
                    <ul className="space-y-2">
                      {result.revenue_optimization_tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: 'rgba(45,212,191,0.1)', color: '#2dd4bf' }}>{i + 1}</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Documentation Requirements */}
                {result.documentation_requirements.length > 0 && (
                  <div className="glass-card rounded-2xl p-5 mt-4">
                    <h4 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent-amber)' }}>
                      <Icon path={icons.fileText} size={13} />
                      DOCUMENTATION REQUIRED FOR CLAIM
                    </h4>
                    <ul className="space-y-1.5">
                      {result.documentation_requirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <Icon path={icons.check} size={11} style={{ color: 'var(--accent-emerald)', flexShrink: 0 } as React.CSSProperties} />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(99,160,255,0.04)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>⚠ Disclaimer: </span>
                    {result.disclaimer} Codes and rates are AI-generated for guidance only. Always verify with the official CGHS portal and a qualified medical coder before submission.
                  </p>
                </div>

                {/* Reset */}
                <button
                  onClick={() => { setResult(null); setForm(f => ({ ...f, clinical_input: '' })); }}
                  className="no-print w-full mt-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2"
                  style={{ background: 'rgba(99,160,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  <Icon path={icons.refresh} size={12} />
                  New Query
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Copied toast */}
        {copiedCode && copiedCode !== 'ALL' && (
          <div className="no-print fixed bottom-6 right-6 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 z-50"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.2s ease-out' }}>
            <Icon path={icons.check} size={12} />
            Copied: {copiedCode}
          </div>
        )}

        {/* Footer */}
        <footer className="no-print mt-12 text-center text-xs" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
          <p>CGHS BillingAssist · AI-powered billing code optimization for Indian healthcare providers</p>
          <p className="mt-1">For official CGHS rates, visit <a href="https://cghs.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>cghs.gov.in</a></p>
        </footer>
      </main>
    </div>
  );
}
