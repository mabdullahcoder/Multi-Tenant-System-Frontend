import React from 'react';

function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
            <div className="text-center">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ backgroundColor: 'var(--primary)' }}>
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Loading…</h2>
                <div className="flex items-center justify-center gap-1.5">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}

export default LoadingScreen;
