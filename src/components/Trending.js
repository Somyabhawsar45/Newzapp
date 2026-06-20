import React, { useEffect, useState, useCallback } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const categoryColors = {
  sports: '#10b981',
  technology: '#6366f1',
  business: '#f59e0b',
  general: '#3b82f6',
  entertainment: '#ec4899',
  health: '#14b8a6',
  science: '#8b5cf6',
  world: '#f43f5e',
};

const RANGES = [
  { key: '24h', label: '24h' },
  { key: '7d', label: '7 days' },
  { key: 'all', label: 'All time' },
];

function timeAgo(iso) {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Trending() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState('7d');

  const fetchTrending = useCallback((r) => {
    setLoading(true);
    setError(false);
    fetch(`${BACKEND_URL}/api/trending?range=${r}`)
      .then(res => {
        if (!res.ok) throw new Error('Bad response');
        return res.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  useEffect(() => { document.title = 'Trending - NewsSync'; }, []);
  useEffect(() => { fetchTrending(range); }, [range, fetchTrending]);

  const maxWordCount = data?.trendingTopics?.length
    ? Math.max(...data.trendingTopics.map(t => t.count), 1)
    : 1;
  const maxCatCount = data?.categoryTrends?.length
    ? Math.max(...data.categoryTrends.map(c => c.count), 1)
    : 1;

  return (
    <>
      <style>{`
        body {
          --tr-bg-page: #f0f2f8;
          --tr-card-bg: #ffffff;
          --tr-card-border: #e2e8f0;
          --tr-bar-track: #e2e8f0;
          --tr-bar-inactive: #c7c7d9;
          --tr-text-primary: #1a1a2e;
          --tr-text-secondary: #4a4a6a;
          --tr-text-muted: #8888a8;
          --tr-row-divider: #e8eaf0;
          --tr-rank-inactive: #b0b0c8;
          --tr-shimmer-a: #e8eaf2;
          --tr-shimmer-b: #d8dae8;
          --tr-hot-circle-bg: #e8eaf2;
          --tr-hot-circle-text: #8888a8;
          --tr-range-bg: #e8eaf2;
          --tr-range-border: #d0d4e8;
          --tr-range-inactive-text: #6666aa;
        }
        body.dark-mode {
          --tr-bg-page: #0d0d1a;
          --tr-card-bg: #15152a;
          --tr-card-border: #232340;
          --tr-bar-track: #1a1a2e;
          --tr-bar-inactive: #3a3a5a;
          --tr-text-primary: #ffffff;
          --tr-text-secondary: #cbd5e1;
          --tr-text-muted: #6b6b85;
          --tr-row-divider: #1f1f35;
          --tr-rank-inactive: #4a4a64;
          --tr-shimmer-a: #15152a;
          --tr-shimmer-b: #1d1d38;
          --tr-hot-circle-bg: #1f1f35;
          --tr-hot-circle-text: #888888;
          --tr-range-bg: #13131f;
          --tr-range-border: #25253f;
          --tr-range-inactive-text: #6b6b85;
        }
        @keyframes trendingPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes trendingShimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
      `}</style>

      <div style={{ paddingTop: '80px', paddingBottom: '60px', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '1040px' }}>

          {/* Header row */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
            alignItems: 'flex-end', gap: '18px', marginBottom: '32px'
          }}>
            <div>
              <p style={{
                color: '#6366f1', fontSize: '0.75rem', fontWeight: '600',
                textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 8px 0',
                display: 'flex', alignItems: 'center', gap: '7px'
              }}>
                <PulseDot live={!loading && !error} />
                Live analytics
              </p>
              <h1 style={{
                color: 'var(--tr-text-primary)',
                fontSize: '1.85rem', fontWeight: '700', margin: '0 0 6px 0'
              }}>
                Trending dashboard
              </h1>
              {!loading && !error && data && (
                <p style={{ color: 'var(--tr-text-muted)', fontSize: '0.82rem', margin: 0 }}>
                  {data.totalReads} read{data.totalReads !== 1 ? 's' : ''}
                  {data.lastUpdated && <> · updated {timeAgo(data.lastUpdated)}</>}
                </p>
              )}
            </div>

            <div style={{
              display: 'flex',
              background: 'var(--tr-range-bg)',
              border: '1px solid var(--tr-range-border)',
              borderRadius: '10px', padding: '3px', gap: '2px'
            }}>
              {RANGES.map(r => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  style={{
                    border: 'none', cursor: 'pointer',
                    padding: '7px 14px', borderRadius: '7px',
                    fontSize: '0.8rem', fontWeight: '600',
                    background: range === r.key ? '#6366f1' : 'transparent',
                    color: range === r.key ? '#fff' : 'var(--tr-range-inactive-text)',
                    transition: 'all 0.15s',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {loading && <LoadingState />}
          {!loading && error && <ErrorState onRetry={() => fetchTrending(range)} />}
          {!loading && !error && data && data.totalReads === 0 && <EmptyState range={range} />}

          {!loading && !error && data && data.totalReads > 0 && (
            <>
              <div style={{
                display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
                gap: '18px', marginBottom: '18px'
              }}>

                {/* Trending Topics */}
                <SectionCard label="Trending topics" icon="🔥">
                  {data.trendingTopics.length === 0 ? (
                    <EmptyNote text="No repeated topics yet — read a few more articles." />
                  ) : (
                    <div>
                      {data.trendingTopics.slice(0, 8).map((t, i) => (
                        <div key={t.word} style={{
                          display: 'grid',
                          gridTemplateColumns: '20px minmax(0,1fr) 40px',
                          alignItems: 'center', gap: '12px',
                          padding: '9px 0',
                          borderBottom: i < Math.min(data.trendingTopics.length, 8) - 1
                            ? '1px solid var(--tr-row-divider)' : 'none',
                        }}>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: '700',
                            color: i < 3 ? '#6366f1' : 'var(--tr-rank-inactive)',
                            fontVariantNumeric: 'tabular-nums'
                          }}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <div style={{
                              fontSize: '0.88rem', fontWeight: i < 3 ? 700 : 500,
                              color: i < 3 ? 'var(--tr-text-primary)' : 'var(--tr-text-secondary)',
                              marginBottom: '5px'
                            }}>
                              #{t.word}
                            </div>
                            <div style={{
                              height: '4px', borderRadius: '999px',
                              background: 'var(--tr-bar-track)', overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${(t.count / maxWordCount) * 100}%`,
                                height: '100%', borderRadius: '999px',
                                background: i < 3 ? '#6366f1' : 'var(--tr-bar-inactive)',
                                transition: 'width 0.5s ease'
                              }} />
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.78rem', fontWeight: '600',
                            color: 'var(--tr-text-muted)',
                            textAlign: 'right', fontVariantNumeric: 'tabular-nums'
                          }}>
                            {t.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                {/* Right panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                    borderRadius: '14px', padding: '20px',
                    boxShadow: '0 6px 20px rgba(99,102,241,0.22)'
                  }}>
                    <p style={{
                      color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem',
                      fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px',
                      margin: '0 0 6px 0'
                    }}>
                      Articles read
                    </p>
                    <h2 style={{ color: '#fff', fontSize: '2.4rem', fontWeight: '800', margin: '0 0 2px 0' }}>
                      {data.totalReads}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', margin: 0 }}>
                      {RANGES.find(r => r.key === range)?.label.toLowerCase()} · all users
                    </p>
                  </div>

                  <SectionCard label="Categories" icon="📂" compact>
                    {data.categoryTrends.length === 0 ? (
                      <EmptyNote text="No category data yet." />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                        {data.categoryTrends.slice(0, 5).map(({ category, count }) => {
                          const color = categoryColors[category] || '#6366f1';
                          const pct = (count / maxCatCount) * 100;
                          return (
                            <div key={category}>
                              <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                fontSize: '0.78rem', marginBottom: '5px'
                              }}>
                                <span style={{ color, fontWeight: 700, textTransform: 'capitalize' }}>
                                  {category}
                                </span>
                                <span style={{ color: 'var(--tr-text-muted)' }}>{count}</span>
                              </div>
                              <div style={{
                                height: '5px', borderRadius: '999px',
                                background: 'var(--tr-bar-track)', overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${pct}%`, height: '100%', borderRadius: '999px',
                                  background: color, transition: 'width 0.5s ease',
                                  minWidth: pct > 0 ? '5px' : 0
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </SectionCard>
                </div>
              </div>

              {/* Hot Right Now */}
              <SectionCard label="Hot right now" icon="🔴">
                {data.hotArticles.length === 0 ? (
                  <EmptyNote text="No hot articles yet." />
                ) : (
                  <div>
                    {data.hotArticles.map((article, i) => (
                      <a
                        key={i}
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '28px minmax(0,1fr) auto',
                          alignItems: 'center', gap: '14px',
                          padding: '12px 0',
                          borderBottom: i < data.hotArticles.length - 1
                            ? '1px solid var(--tr-row-divider)' : 'none',
                          textDecoration: 'none', transition: 'opacity 0.15s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        <span style={{
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: i === 0 ? '#f59e0b' : 'var(--tr-hot-circle-bg)',
                          color: i === 0 ? '#1a1100' : 'var(--tr-hot-circle-text)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.74rem', fontWeight: '700'
                        }}>
                          {i + 1}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            color: 'var(--tr-text-primary)', fontSize: '0.86rem', fontWeight: '500',
                            margin: '0 0 3px 0', lineHeight: '1.4',
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                          }}>
                            {article.title}
                          </p>
                          <p style={{ color: '#6366f1', fontSize: '0.74rem', margin: 0 }}>
                            {article.source}
                          </p>
                        </div>
                        <span style={{
                          fontSize: '0.74rem', fontWeight: '600',
                          color: 'var(--tr-text-muted)', whiteSpace: 'nowrap'
                        }}>
                          {article.count} read{article.count !== 1 ? 's' : ''}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function SectionCard({ label, icon, children, compact }) {
  return (
    <div style={{
      background: 'var(--tr-card-bg)',
      border: '1px solid var(--tr-card-border)',
      borderRadius: '14px', padding: compact ? '18px' : '20px 22px'
    }}>
      <h6 style={{
        color: 'var(--tr-text-muted)', fontSize: '0.72rem', fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: '0.6px',
        margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        <span style={{ fontSize: '0.9rem' }}>{icon}</span>{label}
      </h6>
      {children}
    </div>
  );
}

function EmptyNote({ text }) {
  return <p style={{ color: 'var(--tr-text-muted)', fontSize: '0.82rem', margin: 0 }}>{text}</p>;
}

function PulseDot({ live }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: '7px', height: '7px' }}>
      {live && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: '#6366f1', opacity: 0.6,
          animation: 'trendingPulse 1.6s ease-out infinite'
        }} />
      )}
      <span style={{
        position: 'relative', width: '7px', height: '7px',
        borderRadius: '50%', background: live ? '#6366f1' : '#444',
      }} />
    </span>
  );
}

function LoadingState() {
  return (
    <div>
      <style>{`
        @keyframes trendingShimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
      {[
        { cols: '1.6fr 1fr', h: '280px' },
      ].map((_, idx) => (
        <div key={idx} style={{
          display: 'grid', gridTemplateColumns: '1.6fr 1fr',
          gap: '18px', marginBottom: '18px'
        }}>
          {[0, 1].map(j => (
            <div key={j} style={{
              height: '280px', borderRadius: '14px',
              background: 'linear-gradient(90deg, var(--tr-shimmer-a) 25%, var(--tr-shimmer-b) 37%, var(--tr-shimmer-a) 63%)',
              backgroundSize: '400% 100%',
              animation: 'trendingShimmer 1.4s ease infinite',
            }} />
          ))}
        </div>
      ))}
      <div style={{
        height: '220px', borderRadius: '14px',
        background: 'linear-gradient(90deg, var(--tr-shimmer-a) 25%, var(--tr-shimmer-b) 37%, var(--tr-shimmer-a) 63%)',
        backgroundSize: '400% 100%',
        animation: 'trendingShimmer 1.4s ease infinite',
      }} />
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div style={{
      background: 'var(--tr-card-bg)', border: '1px solid var(--tr-card-border)',
      borderRadius: '14px', padding: '44px 24px', textAlign: 'center'
    }}>
      <p style={{ color: 'var(--tr-text-primary)', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 6px 0' }}>
        Couldn't reach the trending service
      </p>
      <p style={{ color: 'var(--tr-text-muted)', fontSize: '0.82rem', margin: '0 0 18px 0' }}>
        Check that the backend is running on port 5000.
      </p>
      <button
        onClick={onRetry}
        style={{
          background: '#6366f1', color: '#fff', border: 'none',
          padding: '9px 20px', borderRadius: '9px', fontWeight: '600',
          fontSize: '0.82rem', cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState({ range }) {
  const windowLabel = range === '24h' ? 'the last 24 hours' : range === '7d' ? 'the last 7 days' : 'NewsSync history';
  return (
    <div style={{
      background: 'var(--tr-card-bg)', border: '1px solid var(--tr-card-border)',
      borderRadius: '14px', padding: '44px 24px', textAlign: 'center'
    }}>
      <p style={{ color: 'var(--tr-text-primary)', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 6px 0' }}>
        No reads in {windowLabel} yet
      </p>
      <p style={{ color: 'var(--tr-text-muted)', fontSize: '0.82rem', margin: 0 }}>
        Trends build from what people click "Read More" on.
      </p>
    </div>
  );
}