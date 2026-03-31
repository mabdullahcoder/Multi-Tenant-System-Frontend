import { useUI } from '../../context/UIContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function MainLayout({ children, fullScreen = false }) {
    const { sidebar } = useUI();
    const isCollapsed = sidebar?.isCollapsed ?? false;

    return (
        <div className="flex min-h-screen touch-optimize" style={{ backgroundColor: 'var(--bg-base)' }}>
            <Sidebar />

            <div
                className="flex-1 flex flex-col min-w-0 transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                    marginLeft: 'var(--sidebar-responsive-margin)',
                    paddingTop: 'var(--navbar-h)',
                }}
            >
                {/* CSS to calculate responsive margin dynamically */}
                <style>{`
                    @media (max-width: 1023px) {
                        div {
                            --sidebar-responsive-margin: 0 !important;
                        }
                    }
                    @media (min-width: 1024px) {
                        div {
                            --sidebar-responsive-margin: ${isCollapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)'} !important;
                        }
                    }
                `}</style>
                <Navbar />
                <main className={`flex-1 ${fullScreen ? 'overflow-hidden' : 'overflow-y-auto'} w-full`}>
                    {fullScreen ? children : (
                        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 w-full min-h-full">
                            {children}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
