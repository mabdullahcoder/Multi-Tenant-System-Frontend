import { useRef } from 'react';
import { HiOutlineX, HiOutlinePrinter, HiOutlineDownload, HiOutlineCheckCircle } from 'react-icons/hi';

/* ─── helpers ─── */
const fmt = (n) =>
    Number(n).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pad = (n, len = 6) => String(n).padStart(len, '0');

/* ─── Divider ─── */
const Divider = ({ dashed = false }) => (
    <div className={`my-3 border-t ${dashed ? 'border-dashed border-gray-300' : 'border-gray-200'}`} />
);

/* ─── Row ─── */
const Row = ({ label, value, bold = false, large = false, green = false }) => (
    <div className={`flex items-start justify-between gap-4 py-0.5 ${bold ? 'font-semibold' : ''}`}>
        <span className={`${large ? 'text-sm' : 'text-xs'} text-gray-500`}>{label}</span>
        <span className={`${large ? 'text-sm font-bold' : 'text-xs font-medium'} text-right ${green ? 'text-emerald-600' : 'text-gray-900'}`}>
            {value}
        </span>
    </div>
);

function ReceiptModal({
    isOpen,
    onClose,
    cartItems = [],
    cartTotal = 0,
    cartItemCount = 0,
    deliveryAddress = {},
    user,
    orderIds = [],       // real order IDs from API
    placedAt,            // Date object / ISO string
}) {
    const printRef = useRef(null);

    if (!isOpen) return null;

    /* stable values — computed once when modal opens */
    const now = placedAt ? new Date(placedAt) : new Date();
    const receiptNo = orderIds[0]
        ? orderIds[0].slice(-8).toUpperCase()
        : pad(Date.now() % 1000000);

    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const handlePrint = () => window.print();

    return (
        <>
            {/* ── Overlay ── */}
            <div
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:hidden"
                onClick={onClose}
            >
                {/* ── Modal shell ── */}
                <div
                    className="rounded-2xl shadow-2xl w-full max-w-sm max-h-[92vh] flex flex-col overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Modal header ── */}
                    <div
                        className="flex items-center justify-between px-5 py-3.5 flex-shrink-0 print:hidden"
                        style={{ borderBottom: '1px solid var(--border)' }}
                    >
                        <div className="flex items-center gap-2">
                            <HiOutlineCheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Order Receipt</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handlePrint}
                                title="Print"
                                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                                <HiOutlinePrinter className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handlePrint}
                                title="Save as PDF"
                                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                                <HiOutlineDownload className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                                <HiOutlineX className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* ── Scrollable receipt body ── */}
                    <div className="flex-1 overflow-y-auto receipt-scroll">
                        <div ref={printRef} className="receipt-content px-6 py-5">

                            {/* Brand */}
                            <div className="text-center mb-5">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2.5">
                                    <img src="../logo.svg" alt="logo" />
                                </div>
                                <h1 className="text-base font-bold text-gray-900 tracking-wide">Restaurant</h1>
                                <p className="text-xs text-gray-400 mt">Order Confirmation</p>
                            </div>

                            {/* Receipt number + date */}
                            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Receipt No.</p>
                                        <p className="text-sm font-bold text-gray-900 font-mono">#{receiptNo}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Date & Time</p>
                                        <p className="text-xs font-medium text-gray-700">{dateStr}</p>
                                        <p className="text-xs text-gray-500">{timeStr}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer + delivery */}
                            <div className="mb-4">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Customer</p>
                                <Row label="Name" value={`${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim()} />
                                {user?.email && <Row label="Email" value={user.email} />}
                            </div>

                            {deliveryAddress?.street && (
                                <div className="mb-4">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Delivery Address</p>
                                    <Row label="Street" value={deliveryAddress.street} />
                                    {deliveryAddress.city && (
                                        <Row
                                            label="City"
                                            value={`${deliveryAddress.city}${deliveryAddress.zipCode ? `, ${deliveryAddress.zipCode}` : ''}`}
                                        />
                                    )}
                                    {deliveryAddress.state && <Row label="State" value={deliveryAddress.state} />}
                                    {deliveryAddress.country && <Row label="Country" value={deliveryAddress.country} />}
                                </div>
                            )}

                            <Divider dashed />

                            {/* Items */}
                            <div className="mb-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Order Items</p>
                                <div className="space-y-2.5">
                                    {cartItems.map((item, i) => (
                                        <div key={i} className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-900 leading-snug truncate">{item.name}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {item.quantity} × ₨{fmt(item.price)}
                                                </p>
                                            </div>
                                            <p className="text-xs font-bold text-gray-900 flex-shrink-0">
                                                ₨{fmt(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Divider dashed />

                            {/* Totals */}
                            <div className="space-y-1 mb-1">
                                <Row label={`Subtotal (${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'})`} value={`₨${fmt(cartTotal)}`} />
                                <Row label="Delivery" value="Free" green />
                                <Row label="Tax / GST" value="Included" />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between py-1">
                                <span className="text-sm font-bold text-gray-900">Total</span>
                                <span className="text-base font-bold text-gray-900">₨{fmt(cartTotal)}</span>
                            </div>

                            <Divider />

                            {/* Payment method */}
                            <Row label="Payment Method" value="Cash on Delivery" />
                            <Row label="Order Status" value="Confirmed" green />

                            {/* Order IDs if multiple */}
                            {/* {orderIds.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Order Reference(s)</p>
                                    {orderIds.map((id, i) => (
                                        <p key={i} className="text-[11px] font-mono text-gray-600 leading-relaxed">
                                            {i + 1}. {id}
                                        </p>
                                    ))}
                                </div>
                            )} */}

                            {/* Footer */}
                            <div className="mt-5 pt-4 border-t border-dashed border-gray-200 text-center">
                                <p className="text-xs font-semibold text-gray-700 mb-0.5">Thank you for your order!</p>
                                <p className="text-[11px] text-gray-400">We'll deliver to your address shortly.</p>
                                <p className="text-[10px] text-gray-300 mt-3">
                                    {dateStr} · {timeStr}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* ── Footer actions ── */}
                    <div
                        className="flex gap-2 px-5 py-3.5 flex-shrink-0 print:hidden"
                        style={{ borderTop: '1px solid var(--border)' }}
                    >
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px]"
                            style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                        >
                            Close
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                            style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                        >
                            <HiOutlinePrinter className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Print styles ── */}
            <style>{`
                @media print {
                    body > * { visibility: hidden; }
                    .receipt-content,
                    .receipt-content * { visibility: visible; }
                    .receipt-content {
                        position: fixed;
                        inset: 0;
                        padding: 24px;
                        max-width: 380px;
                        margin: 0 auto;
                    }
                }
                .receipt-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #e5e7eb transparent;
                }
                .receipt-scroll::-webkit-scrollbar { width: 4px; }
                .receipt-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
            `}</style>
        </>
    );
}

export default ReceiptModal;
