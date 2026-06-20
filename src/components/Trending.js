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
            <h1 style={{ color: '#fff', fontSize: '1.85rem', fontWeight: '700', margin: '0 0 6px 0' }}>
              Trending dashboard
            </h1>
            {!loading && !error && data && (
              <p style={{ color: '#6b6b85', fontSize: '0.82rem', margin: 0 }}>
                {data.totalReads} read{data.totalReads !== 1 ? 's' : ''}
                {data.lastUpdated && <> · updated {timeAgo(data.lastUpdated)}</>}
              </p>
            )}
          </div>

          <div style={{
            display: 'flex', background: '#13131f', border: '1px solid #25253f',
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
                  color: range === r.key ? '#fff' : '#6b6b85',
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
            {/* Top row: trending topics (left, wider) + stat/category panel (right) */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
              gap: '18px', marginBottom: '18px'
            }}>

              {/* Trending Topics — ranked compact list */}
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
                        borderBottom: i < Math.min(data.trendingTopics.length, 8) - 1 ? '1px solid #1f1f35' : 'none',
                      }}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: '700',
                          color: i < 3 ? '#6366f1' : '#4a4a64',
                          fontVariantNumeric: 'tabular-nums'
                        }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div style={{
                            fontSize: '0.88rem', fontWeight: i < 3 ? 700 : 500,
                            color: i < 3 ? '#fff' : '#cbd5e1', marginBottom: '5px'
                          }}>
                            #{t.word}
                          </div>
                          <div style={{
                            height: '4px', borderRadius: '999px',
                            background: '#1a1a2e', overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${(t.count / maxWordCount) * 100}%`,
                              height: '100%', borderRadius: '999px',
                              background: i < 3 ? '#6366f1' : '#3a3a5a',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.78rem', fontWeight: '600', color: '#888',
                          textAlign: 'right', fontVariantNumeric: 'tabular-nums'
                        }}>
                          {t.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* Right panel: stat + category breakdown stacked */}
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
                              <span style={{ color: '#777' }}>{count}</span>
                            </div>
                            <div style={{
                              height: '5px', borderRadius: '999px',
                              background: '#13131f', overflow: 'hidden'
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

            {/* Hot Right Now — full width feed */}
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
                        borderBottom: i < data.hotArticles.length - 1 ? '1px solid #1f1f35' : 'none',
                        textDecoration: 'none', transition: 'opacity 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <span style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: i === 0 ? '#f59e0b' : '#1f1f35',
                        color: i === 0 ? '#1a1100' : '#888',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.74rem', fontWeight: '700'
                      }}>
                        {i + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          color: '#e2e8f0', fontSize: '0.86rem', fontWeight: '500',
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
                        fontSize: '0.74rem', fontWeight: '600', color: '#777',
                        whiteSpace: 'nowrap'
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
  );
}

function SectionCard({ label, icon, children, compact }) {
  return (
    <div style={{
      background: '#15152a', border: '1px solid #232340',
      borderRadius: '14px', padding: compact ? '18px' : '20px 22px'
    }}>
      <h6 style={{
        color: '#9999b3', fontSize: '0.72rem', fontWeight: '700',
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
  return <p style={{ color: '#6b6b85', fontSize: '0.82rem', margin: 0 }}>{text}</p>;
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
      <style>{`
        @keyframes trendingPulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.8); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
      `}</style>
    </span>
  );
}

function LoadingState() {
  const shimmer = {
    background: 'linear-gradient(90deg, #15152a 25%, #1d1d38 37%, #15152a 63%)',
    backgroundSize: '400% 100%',
    animation: 'trendingShimmer 1.4s ease infinite',
    borderRadius: '14px',
  };
  return (
    <div>
      <style>{`@keyframes trendingShimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '18px', marginBottom: '18px' }}>
        <div style={{ ...shimmer, height: '280px' }} />
        <div style={{ ...shimmer, height: '280px' }} />
      </div>
      <div style={{ ...shimmer, height: '220px' }} />
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div style={{
      background: '#15152a', border: '1px solid #232340', borderRadius: '14px',
      padding: '44px 24px', textAlign: 'center'
    }}>
      <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 6px 0' }}>
        Couldn't reach the trending service
      </p>
      <p style={{ color: '#777', fontSize: '0.82rem', margin: '0 0 18px 0' }}>
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
      background: '#15152a', border: '1px solid #232340', borderRadius: '14px',
      padding: '44px 24px', textAlign: 'center'
    }}>
      <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 6px 0' }}>
        No reads in {windowLabel} yet
      </p>
      <p style={{ color: '#777', fontSize: '0.82rem', margin: 0 }}>
        Trends build from what people click "Read More" on.
      </p>
    </div>
  );
}