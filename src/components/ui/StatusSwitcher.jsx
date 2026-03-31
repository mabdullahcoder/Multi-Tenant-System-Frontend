import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HiOutlineChevronDown, HiOutlineShieldCheck, 
    HiOutlineLightningBolt, HiOutlineRefresh 
} from 'react-icons/hi';

/**
 * StatusSwitcher - Senior Developer Approach (v2 with Portals)
 * A polished, popover-based status manager for admins.
 * Uses Portals to prevent clipping in high-density tables with overflow: hidden.
 */
function StatusSwitcher({ 
    orderId, 
    currentStatus, 
    onStatusChange, 
    statusConfig, 
    allStatuses, 
    availableTransitions, 
    userRole,
    isUpdating = false 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);

    // Calculate position when opening
    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const menuHeight = 280; // approximate max height
            
            // If not enough space below, open upwards
            const openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
            
            setPopoverPos({
                top: openUp ? rect.top + window.scrollY : rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                openUp: openUp
            });
        }
    };

    // Close on escape or outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                popoverRef.current && !popoverRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        // Re-calc position on scroll/resize
        const handleRefresh = () => {
            updatePosition();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        window.addEventListener('scroll', handleRefresh, true);
        window.addEventListener('resize', handleRefresh);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            window.removeEventListener('scroll', handleRefresh, true);
            window.removeEventListener('resize', handleRefresh);
        };
    }, [isOpen]);

    const handleOpen = () => {
        updatePosition();
        setIsOpen(!isOpen);
    };

    const activeConfig = statusConfig[currentStatus] || statusConfig.pending;
    const Icon = activeConfig.icon;
    const isAdmin = userRole === 'admin' || userRole === 'super-admin';
    const isSuperAdmin = userRole === 'super-admin';

    // Show suggested next steps (from standard transitions)
    const suggested = availableTransitions.filter(s => s !== currentStatus);
    
    // Show manual overrides (for super admins)
    const overrides = isSuperAdmin 
        ? allStatuses.filter(s => s !== currentStatus && !suggested.includes(s))
        : [];

    const handleSelect = (status) => {
        if (isUpdating) return;
        onStatusChange(orderId, status, currentStatus);
        setIsOpen(false);
    };

    if (!isAdmin) {
        return (
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${activeConfig.bgColor} ${activeConfig.textColor} ${activeConfig.borderColor}`}>
                <Icon className="w-3.5 h-3.5" />
                {activeConfig.label}
            </div>
        );
    }

    return (
        <div className="relative inline-block">
            <button
                ref={triggerRef}
                onClick={handleOpen}
                className={`
                    px-2.5 py-1 rounded-full text-xs font-semibold border 
                    flex items-center gap-1.5 transition-all duration-200
                    hover:ring-2 hover:ring-offset-1 focus:outline-none
                    ${activeConfig.bgColor} ${activeConfig.textColor} ${activeConfig.borderColor}
                    ${isOpen ? 'ring-2 ring-offset-1' : ''}
                    disabled:opacity-50 disabled:cursor-wait
                `}
                disabled={isUpdating}
            >
                {isUpdating ? (
                    <HiOutlineRefresh className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <Icon className="w-3.5 h-3.5" />
                )}
                {activeConfig.label}
                <HiOutlineChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Portal-rendered popover content */}
            {ReactDOM.createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={popoverRef}
                            initial={{ 
                                opacity: 0, 
                                y: popoverPos.openUp ? 8 : -8, 
                                scale: 0.95 
                            }}
                            animate={{ 
                                opacity: 1, 
                                y: popoverPos.openUp ? -4 : 4, 
                                scale: 1 
                            }}
                            exit={{ 
                                opacity: 0, 
                                y: popoverPos.openUp ? 8 : -8, 
                                scale: 0.95 
                            }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{
                                position: 'absolute',
                                top: popoverPos.top,
                                left: popoverPos.left,
                                zIndex: 9999,
                                transform: popoverPos.openUp ? 'translateY(-100%)' : 'none'
                            }}
                            className="w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="px-3 pb-2 pt-1 border-b border-gray-50 mb-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Manage Status</p>
                            </div>

                            {/* Standard Flow Section */}
                            {suggested.length > 0 && (
                                <div className="px-1.5 py-1">
                                    <p className="px-2 pb-1.5 pt-0.5 text-[9px] font-bold text-blue-500 uppercase tracking-tight flex items-center gap-1">
                                        <HiOutlineLightningBolt className="w-2.5 h-2.5" />
                                        Suggested Actions
                                    </p>
                                    {suggested.map(status => {
                                        const cfg = statusConfig[status];
                                        const SIcon = cfg.icon;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleSelect(status)}
                                                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                            >
                                                <div className={`p-1 rounded-md ${cfg.bgColor} ${cfg.textColor}`}>
                                                    <SIcon className="w-3.5 h-3.5" />
                                                </div>
                                                {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Manual Override Section */}
                            {overrides.length > 0 && (
                                <div className="px-1.5 py-1 border-t border-gray-50 mt-1">
                                    <p className="px-2 pb-1.5 pt-1.5 text-[9px] font-bold text-amber-500 uppercase tracking-tight flex items-center gap-1">
                                        <HiOutlineShieldCheck className="w-2.5 h-2.5" />
                                        Advanced Override
                                    </p>
                                    {overrides.map(status => {
                                        const cfg = statusConfig[status];
                                        const OIcon = cfg.icon;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleSelect(status)}
                                                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                                            >
                                                <div className="p-1 rounded-md bg-gray-100 text-gray-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                                                    <OIcon className="w-3.5 h-3.5" />
                                                </div>
                                                {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {suggested.length === 0 && overrides.length === 0 && (
                                <div className="px-3 py-4 text-center">
                                    <p className="text-xs text-gray-400 italic">No further actions available.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

export default StatusSwitcher;
