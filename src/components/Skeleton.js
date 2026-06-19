import React from 'react';

const SkeletonCard = () => (
  <div className="col-md-4 my-3">
    <div className="card h-100" style={{ overflow: 'hidden' }}>
      {/* Image placeholder */}
      <div style={{
        height: '180px',
        background: 'linear-gradient(90deg, #1e2433 25%, #2a3144 50%, #1e2433 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
      <div className="card-body">
        {/* Title placeholder - 2 lines */}
        <div style={{ height: '16px', background: '#1e2433', borderRadius: '4px', marginBottom: '8px', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: '16px', background: '#1e2433', borderRadius: '4px', width: '70%', marginBottom: '16px', animation: 'shimmer 1.5s infinite' }} />
        {/* Description placeholder - 3 lines */}
        <div style={{ height: '12px', background: '#1e2433', borderRadius: '4px', marginBottom: '6px', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: '12px', background: '#1e2433', borderRadius: '4px', marginBottom: '6px', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: '12px', background: '#1e2433', borderRadius: '4px', width: '50%', animation: 'shimmer 1.5s infinite' }} />
      </div>
    </div>
  </div>
);

const Skeleton = ({ count = 6 }) => (
  <>
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
    <div className="container">
      <div className="row">
        {Array(count).fill(0).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  </>
);

export default Skeleton;