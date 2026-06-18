import React from 'react';

const Skeleton = ({ count = 6 }) => {
    return (
        <div className="container">
            <div className="row">
                {Array.from({ length: count }).map((_, i) => (
                    <div className="col-md-4" key={i}>
                        <div className="my-3 skeleton-card">
                            <div className="skeleton-img"></div>
                            <div className="skeleton-line" style={{ width: '80%' }}></div>
                            <div className="skeleton-line" style={{ width: '95%' }}></div>
                            <div className="skeleton-line" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Skeleton;