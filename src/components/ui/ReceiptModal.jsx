import { useRef } from 'react';
import { HiOutlineX, HiOutlinePrinter, HiOutlineDownload, HiOutlineCheckCircle } from 'react-icons/hi';

/* ─── helpers ─── */
const fmt = (n) =>
    Number(n).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pad = (n, len = 6) => String(n).padStart(len, '0');

/* ─── Divider ─── */
const Divider = ({ dashed = false }) => (
    <div
        className={`my-3 border-t ${dashed ? 'border-dashed' : ''}`}
        style={{ borderColor: 'var(--border)' }}
    />
);

/* ─── Row ─── */
const Row = ({ label, value, bold = false, large = false, green = false }) => (
    <div className={`flex items-start justify-between gap-4 py-0.5 ${bold ? 'font-semibold' : ''}`}>
        <span className={`${large ? 'text-sm' : 'text-xs'}`} style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span
            className={`${large ? 'text-sm font-bold' : 'text-xs font-medium'} text-right`}
            style={{ color: green ? 'var(--success)' : 'var(--text-primary)' }}
        >
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

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;

        const printWindow = window.open('', '_blank', 'width=480,height=700');
        if (!printWindow) {
            // Fallback: inject a temporary print-only stylesheet and use window.print()
            const style = document.createElement('style');
            style.id = '__receipt_print_style__';
            style.textContent = `
                @media print {
                    body > *:not(#__receipt_print_root__) { display: none !important; }
                    #__receipt_print_root__ { display: block !important; position: fixed; inset: 0; padding: 24px; }
                }
            `;
            const wrapper = document.createElement('div');
            wrapper.id = '__receipt_print_root__';
            wrapper.innerHTML = content.innerHTML;
            document.head.appendChild(style);
            document.body.appendChild(wrapper);
            window.print();
            document.head.removeChild(style);
            document.body.removeChild(wrapper);
            return;
        }

        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Order Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #111; background: #fff; padding: 24px; max-width: 380px; margin: 0 auto; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .font-mono { font-family: monospace; }
    .text-xs { font-size: 11px; }
    .text-sm { font-size: 12px; }
    .text-\\[11px\\] { font-size: 11px; }
    .text-\\[9px\\] { font-size: 9px; }
    .text-\\[10px\\] { font-size: 10px; }
    .uppercase { text-transform: uppercase; }
    .tracking-widest { letter-spacing: 0.1em; }
    .tracking-wide { letter-spacing: 0.05em; }
    .leading-snug { line-height: 1.375; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .flex { display: flex; }
    .items-start { align-items: flex-start; }
    .justify-between { justify-content: space-between; }
    .gap-4 { gap: 16px; }
    .gap-3 { gap: 12px; }
    .flex-1 { flex: 1; }
    .flex-shrink-0 { flex-shrink: 0; }
    .min-w-0 { min-width: 0; }
    .space-y-2 > * + * { margin-top: 8px; }
    .space-y-1 > * + * { margin-top: 4px; }
    .mb-4 { margin-bottom: 16px; }
    .mb-3 { margin-bottom: 12px; }
    .mb-2 { margin-bottom: 8px; }
    .mb-1 { margin-bottom: 4px; }
    .mb-1\\.5 { margin-bottom: 6px; }
    .mb-0\\.5 { margin-bottom: 2px; }
    .mb-1 { margin-bottom: 4px; }
    .mt-4 { margin-top: 16px; }
    .mt-2 { margin-top: 8px; }
    .mt-0\\.5 { margin-top: 2px; }
    .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
    .py-1 { padding-top: 4px; padding-bottom: 4px; }
    .px-3\\.5 { padding-left: 14px; padding-right: 14px; }
    .py-2\\.5 { padding-top: 10px; padding-bottom: 10px; }
    .pt-3 { padding-top: 12px; }
    .rounded-lg { border-radius: 8px; }
    .border { border: 1px solid #e5e7eb; }
    .border-t { border-top: 1px solid #e5e7eb; }
    .border-dashed { border-style: dashed; }
    .my-3 { margin-top: 12px; margin-bottom: 12px; }
    .receipt-info-box { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; }
    .receipt-section-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 6px; }
    .color-muted { color: #6b7280; }
    .color-primary-text { color: #111; }
    .color-success { color: #059669; }
    .color-primary { color: #3b82f6; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>${content.innerHTML}</body>
</html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };

    return (
        <>
            {/* ── Overlay ── */}
            <div
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
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
                        className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
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
                            <div className="text-center mb-4">
                                <h1 className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>Restaurant</h1>
                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Order Confirmation</p>
                            </div>

                            {/* Receipt number + date */}
                            <div className="rounded-lg px-3.5 py-2.5 mb-4" style={{ backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Receipt No.</p>
                                        <p className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>#{receiptNo}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Date & Time</p>
                                        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{dateStr}</p>
                                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{timeStr}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer + delivery */}
                            <div className="mb-3">
                                <p className="text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Customer</p>
                                <Row label="Name" value={`${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim()} />
                                {user?.email && <Row label="Email" value={user.email} />}
                            </div>

                            {deliveryAddress?.street && (
                                <div className="mb-3">
                                    <p className="text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Delivery Address</p>
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
                                <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Order Items</p>
                                <div className="space-y-2">
                                    {cartItems.map((item, i) => (
                                        <div key={i} className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold leading-snug truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                    {item.quantity} × ₨{fmt(item.price)}
                                                </p>
                                            </div>
                                            <p className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
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
                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                                <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>₨{fmt(cartTotal)}</span>
                            </div>

                            <Divider />

                            {/* Payment method */}
                            <Row label="Payment Method" value="Cash on Delivery" />
                            <Row label="Order Status" value="Confirmed" green />

                            {/* Footer */}
                            <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px dashed var(--border)' }}>
                                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>Thank you for your order!</p>
                                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>We'll deliver to your address shortly.</p>
                                <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                                    {dateStr} · {timeStr}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* ── Footer actions ── */}
                    <div
                        className="flex gap-2 px-5 py-3.5 flex-shrink-0"
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

            <style>{`
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
