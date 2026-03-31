import React from 'react';

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className="text-white" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" className="text-white" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" className="text-white" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Mr Abdullah</h2>
                <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}

export default LoadingScreen;
