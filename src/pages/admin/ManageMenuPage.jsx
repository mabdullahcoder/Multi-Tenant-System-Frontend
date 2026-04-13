import { useState, useEffect, useCallback } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { useUI } from '../../context/UIContext';
import { useSocket } from '../../context/SocketContext';
import menuAPI from '../../services/menuAPI';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
    HiOutlineTag, HiOutlineCollection, HiOutlineX,
    HiOutlineCheck, HiOutlineEyeOff,
} from 'react-icons/hi';

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */
const EMPTY_CATEGORY = { name: '', description: '', isActive: true, sortOrder: 0 };
const EMPTY_ITEM = {
    name: '', description: '', price: '', originalPrice: '',
    image: '', category: '', isActive: true, sortOrder: 0,
};

/** Reusable icon-action button */
function IconBtn({ onClick, title, hoverColor = 'blue', children }) {
    const hoverMap = {
        blue: { bg: 'rgba(59,130,246,0.10)', color: '#2563eb' },
        red: { bg: 'rgba(239,68,68,0.10)', color: '#dc2626' },
    };
    const h = hoverMap[hoverColor] || hoverMap.blue;
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            className="p-2 rounded-lg transition-colors flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = h.bg; e.currentTarget.style.color = h.color; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
            {children}
        </button>
    );
}

/** Active / Hidden badge */
function StatusBadge({ active }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {active ? <HiOutlineCheck className="w-3 h-3" /> : <HiOutlineEyeOff className="w-3 h-3" />}
            {active ? 'Active' : 'Hidden'}
        </span>
    );
}

/**
 * Custom toggle switch — replaces native checkbox.
 * Fully controlled: value/onChange mirror a boolean.
 */
function Toggle({ checked, onChange, label, id }) {
    return (
        <label
            htmlFor={id}
            className="flex items-center gap-2.5 cursor-pointer select-none"
        >
            {/* Track */}
            <span
                className="relative inline-flex items-center flex-shrink-0"
                style={{ width: '36px', height: '20px' }}
            >
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only"
                />
                {/* Track background */}
                <span
                    className="absolute inset-0 rounded-full transition-colors duration-200"
                    style={{
                        backgroundColor: checked ? 'var(--primary)' : 'var(--bg-surface-3)',
                        border: `1px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
                    }}
                />
                {/* Thumb */}
                <span
                    className="absolute top-0.5 rounded-full shadow transition-transform duration-200"
                    style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#fff',
                        transform: checked ? 'translateX(17px)' : 'translateX(2px)',
                    }}
                />
            </span>
            {label && (
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {label}
                </span>
            )}
        </label>
    );
}

/* ─────────────────────────────────────────────
   Category Form Modal
───────────────────────────────────────────── */
function CategoryModal({ initial, onSave, onClose }) {
    const [form, setForm] = useState(initial || EMPTY_CATEGORY);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="rounded-2xl shadow-2xl w-full max-w-md"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {initial ? 'Edit Category' : 'New Category'}
                    </h2>
                    <button
                        type="button" onClick={onClose} aria-label="Close"
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="form-group">
                        <label className="label-base">
                            Category Name <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                            type="text" value={form.name} autoFocus required
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-base" placeholder="e.g. Pizzas"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label-base">Description</label>
                        <input
                            type="text" value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="input-base" placeholder="Optional description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label-base">Sort Order</label>
                            <input
                                type="number" value={form.sortOrder} min="0"
                                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                                className="input-base"
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-base">Visibility</label>
                            <div className="flex items-center h-[44px]">
                                <Toggle
                                    id="cat-active"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    label="Active"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={onClose} className="btn-md btn-outline">Cancel</button>
                        <button type="submit" disabled={saving} className="btn-md btn-primary-solid">
                            {saving ? 'Saving…' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Item Form Modal
───────────────────────────────────────────── */
function ItemModal({ initial, categories, onSave, onClose }) {
    const [form, setForm] = useState(
        initial
            ? {
                ...initial,
                category: initial.category?._id || initial.category || '',
                price: String(initial.price),
                originalPrice: String(initial.originalPrice || ''),
            }
            : EMPTY_ITEM
    );
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || form.price === '' || !form.category) return;
        setSaving(true);
        await onSave({
            ...form,
            price: Number(form.price),
            originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        });
        setSaving(false);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
                {/* Sticky header */}
                <div
                    className="flex items-center justify-between px-6 py-4 flex-shrink-0 rounded-t-2xl"
                    style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
                >
                    <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {initial ? 'Edit Menu Item' : 'Add New Item'}
                    </h2>
                    <button
                        type="button" onClick={onClose} aria-label="Close"
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable form */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-y-auto flex-1 scrollbar-thin px-6 py-5 space-y-4"
                >
                    <div className="form-group">
                        <label className="label-base">
                            Category <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <select
                            value={form.category} required
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="input-base"
                        >
                            <option value="">Select a category…</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label-base">
                            Item Name <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                            type="text" value={form.name} required autoFocus
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-base" placeholder="e.g. Margherita Pizza"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label-base">Description</label>
                        <textarea
                            value={form.description} rows={2}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="input-base resize-none"
                            placeholder="Short description of the item"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label-base">
                                Price (Rs) <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <input
                                type="number" value={form.price} min="0" step="0.01" required
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="input-base"
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-base">Original Price (Rs)</label>
                            <input
                                type="number" value={form.originalPrice} min="0" step="0.01"
                                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                                className="input-base" placeholder="For discounts"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label-base">Image URL</label>
                        <input
                            type="text" value={form.image}
                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                            className="input-base" placeholder="https://example.com/image.jpg"
                        />
                        {form.image && (
                            <div
                                className="mt-2 p-2 rounded-lg"
                                style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border)' }}
                            >
                                <img
                                    src={form.image} alt="preview"
                                    className="h-20 w-28 object-cover rounded-md"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label-base">Sort Order</label>
                            <input
                                type="number" value={form.sortOrder} min="0"
                                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                                className="input-base"
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-base">Visibility</label>
                            <div className="flex items-center h-[44px]">
                                <Toggle
                                    id="item-active"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    label="Active"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={onClose} className="btn-md btn-outline">Cancel</button>
                        <button type="submit" disabled={saving} className="btn-md btn-primary-solid">
                            {saving ? 'Saving…' : 'Save Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
function ManageMenuPage() {
    const { addNotification } = useUI();
    const socket = useSocket();
    const [grouped, setGrouped] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('items'); // 'items' | 'categories'
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showInactive, setShowInactive] = useState(false);

    /* ── Data loading ── */
    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [groupedRes, catsRes] = await Promise.all([
                menuAPI.getMenuGrouped(),
                menuAPI.getCategories(true),
            ]);
            setGrouped(groupedRes.data || []);
            setCategories(catsRes.data || []);
        } catch (err) {
            console.error('Failed to load menu data:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    /* ── Real-time socket listeners ── */
    useEffect(() => {
        if (!socket) return;

        const handleMenuItemUpdated = (data) => {
            setGrouped((prev) => {
                const next = JSON.parse(JSON.stringify(prev));
                switch (data.actionType) {
                    case 'created': {
                        const cat = next.find(
                            (g) => g._id === (typeof data.category === 'object' ? data.category._id : data.category)
                        );
                        if (cat) { cat.items = cat.items || []; cat.items.push(data); }
                        addNotification({ type: 'info', message: `New item added: ${data.name}` });
                        break;
                    }
                    case 'updated': {
                        let found = false;
                        next.forEach((g) => {
                            const idx = g.items?.findIndex((i) => i._id === data._id);
                            if (idx !== undefined && idx >= 0) { g.items[idx] = { ...g.items[idx], ...data }; found = true; }
                        });
                        if (found) addNotification({ type: 'info', message: `Item updated: ${data.name}` });
                        break;
                    }
                    case 'deleted':
                        next.forEach((g) => { g.items = g.items?.filter((i) => i._id !== data._id) || []; });
                        addNotification({ type: 'warning', message: `Item deleted: ${data.name}` });
                        break;
                }
                return next;
            });
        };

        const handleMenuCategoryUpdated = (data) => {
            setCategories((prev) => {
                switch (data.actionType) {
                    case 'created':
                        addNotification({ type: 'info', message: `New category added: ${data.name}` });
                        return [...prev, data];
                    case 'updated':
                        addNotification({ type: 'info', message: `Category updated: ${data.name}` });
                        return prev.map((c) => c._id === data._id ? { ...c, ...data } : c);
                    case 'deleted':
                        addNotification({ type: 'warning', message: `Category deleted: ${data.name}` });
                        return prev.filter((c) => c._id !== data._id);
                    default: return prev;
                }
            });
            setGrouped((prev) => prev.map((g) => g._id === data._id ? { ...g, ...data } : g));
        };

        socket.on('menuItemUpdated', handleMenuItemUpdated);
        socket.on('menuCategoryUpdated', handleMenuCategoryUpdated);
        return () => {
            socket.off('menuItemUpdated', handleMenuItemUpdated);
            socket.off('menuCategoryUpdated', handleMenuCategoryUpdated);
        };
    }, [socket, addNotification]);

    /* ── Category CRUD ── */
    const handleSaveCategory = async (form) => {
        try {
            if (editingCategory) {
                await menuAPI.updateCategory(editingCategory._id, form);
                addNotification({ type: 'success', message: 'Category updated' });
            } else {
                await menuAPI.createCategory(form);
                addNotification({ type: 'success', message: 'Category created' });
            }
            setShowCategoryModal(false);
            setEditingCategory(null);
            load();
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to save category' });
        }
    };

    const handleDeleteCategory = async (cat) => {
        if (!window.confirm(`Delete category "${cat.name}"? This will fail if it has items.`)) return;
        try {
            await menuAPI.deleteCategory(cat._id);
            addNotification({ type: 'success', message: 'Category deleted' });
            load();
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to delete category' });
        }
    };

    /* ── Item CRUD ── */
    const handleSaveItem = async (form) => {
        try {
            if (editingItem) {
                await menuAPI.updateItem(editingItem._id, form);
                addNotification({ type: 'success', message: 'Item updated' });
            } else {
                await menuAPI.createItem(form);
                addNotification({ type: 'success', message: 'Item created' });
            }
            setShowItemModal(false);
            setEditingItem(null);
            load();
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to save item' });
        }
    };

    const handleDeleteItem = async (item) => {
        if (!window.confirm(`Delete "${item.name}"?`)) return;
        try {
            await menuAPI.deleteItem(item._id);
            addNotification({ type: 'success', message: 'Item deleted' });
            load();
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to delete item' });
        }
    };

    /* ── Derived data ── */
    const allItems = grouped.flatMap((g) => g.items || []);
    const visibleItems = allItems.filter((i) => showInactive || i.isActive);
    const displayedItems = (
        selectedCategoryId === 'all'
            ? visibleItems
            : visibleItems.filter((i) => i.category?._id === selectedCategoryId || i.category === selectedCategoryId)
    );
    const displayedCategories = categories.filter((c) => showInactive || c.isActive);

    /* ── Render ── */
    return (
        <MainLayout>
            <div className="space-y-5 pb-8">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-heading-2">Manage Menu</h1>
                        <p className="text-description mt-1">Add, edit and organise menu items and categories</p>
                    </div>

                    {/* Controls row */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Show hidden — custom toggle */}
                        <button
                            type="button"
                            onClick={() => setShowInactive((v) => !v)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
                            style={{
                                border: '1px solid var(--border)',
                                backgroundColor: showInactive ? 'rgba(59,130,246,0.06)' : 'var(--bg-surface)',
                                color: showInactive ? 'var(--primary)' : 'var(--text-secondary)',
                            }}
                        >
                            {/* Inline mini-toggle visual */}
                            <span
                                className="relative inline-flex items-center flex-shrink-0"
                                style={{ width: '32px', height: '18px' }}
                                aria-hidden="true"
                            >
                                <span
                                    className="absolute inset-0 rounded-full transition-colors duration-200"
                                    style={{
                                        backgroundColor: showInactive ? 'var(--primary)' : 'var(--bg-surface-3)',
                                        border: `1px solid ${showInactive ? 'var(--primary)' : 'var(--border)'}`,
                                    }}
                                />
                                <span
                                    className="absolute top-0.5 rounded-full shadow transition-transform duration-200"
                                    style={{
                                        width: '14px',
                                        height: '14px',
                                        backgroundColor: '#fff',
                                        transform: showInactive ? 'translateX(15px)' : 'translateX(2px)',
                                    }}
                                />
                            </span>
                            <span className="text-sm font-medium whitespace-nowrap">Show hidden</span>
                        </button>

                        {activeTab === 'categories' ? (
                            <button
                                onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
                                className="btn-md btn-primary-solid flex items-center gap-2"
                            >
                                <HiOutlinePlus className="w-4 h-4" />
                                Add Category
                            </button>
                        ) : (
                            <button
                                onClick={() => { setEditingItem(null); setShowItemModal(true); }}
                                className="btn-md btn-primary-solid flex items-center gap-2"
                            >
                                <HiOutlinePlus className="w-4 h-4" />
                                Add Item
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-0" style={{ borderBottom: '2px solid var(--border)' }}>
                    {[
                        { key: 'items', label: 'Menu Items', icon: HiOutlineCollection },
                        { key: 'categories', label: 'Categories', icon: HiOutlineTag },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-0.5"
                            style={
                                activeTab === key
                                    ? { borderColor: 'var(--primary)', color: 'var(--primary)' }
                                    : { borderColor: 'transparent', color: 'var(--text-secondary)' }
                            }
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Content ── */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="spinner" />
                    </div>
                ) : activeTab === 'items' ? (

                    /* ════════════ Items Tab ════════════ */
                    <div className="space-y-4">

                        {/* Category filter pills */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => setSelectedCategoryId('all')}
                                className="px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
                                style={
                                    selectedCategoryId === 'all'
                                        ? { backgroundColor: 'var(--primary)', color: '#fff' }
                                        : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                                }
                            >
                                All ({visibleItems.length})
                            </button>
                            {grouped.map((g) => {
                                const count = (g.items || []).filter((i) => showInactive || i.isActive).length;
                                return (
                                    <button
                                        key={g._id}
                                        onClick={() => setSelectedCategoryId(g._id)}
                                        className="px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
                                        style={
                                            selectedCategoryId === g._id
                                                ? { backgroundColor: 'var(--primary)', color: '#fff' }
                                                : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                                        }
                                    >
                                        {g.name} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        {/* Empty state */}
                        {displayedItems.length === 0 ? (
                            <div
                                className="flex flex-col items-center justify-center py-20 rounded-xl"
                                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                            >
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                                    style={{ backgroundColor: 'var(--bg-surface-3)' }}
                                >
                                    <HiOutlineCollection className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No items yet</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click "Add Item" to create your first menu item.</p>
                            </div>
                        ) : (
                            /* Item cards grid */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {displayedItems.map((item) => (
                                    <div
                                        key={item._id}
                                        className={`rounded-xl border flex flex-col transition-shadow hover:shadow-md ${!item.isActive ? 'opacity-60' : ''}`}
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                                    >
                                        {/* Image */}
                                        <div
                                            className="aspect-[4/3] relative overflow-hidden rounded-t-xl flex-shrink-0"
                                            style={{ backgroundColor: 'var(--bg-surface-3)' }}
                                        >
                                            {item.image ? (
                                                <img
                                                    src={item.image} alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                                                    <HiOutlineCollection className="w-10 h-10" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2">
                                                <StatusBadge active={item.isActive} />
                                            </div>
                                        </div>

                                        {/* Card body */}
                                        <div className="p-3 flex flex-col gap-1 flex-1">
                                            <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                                                {item.category?.name}
                                            </p>
                                            <h3 className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                                                {item.name}
                                            </h3>
                                            {item.description && (
                                                <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                                                    {item.description}
                                                </p>
                                            )}

                                            {/* Price + actions */}
                                            <div
                                                className="flex items-center justify-between mt-auto pt-2.5"
                                                style={{ borderTop: '1px solid var(--border)' }}
                                            >
                                                <div className="leading-tight">
                                                    {item.originalPrice && (
                                                        <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                                                            Rs {item.originalPrice}
                                                        </p>
                                                    )}
                                                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                                        Rs {item.price}
                                                    </p>
                                                </div>
                                                <div className="flex gap-0.5 flex-shrink-0">
                                                    <IconBtn
                                                        onClick={() => { setEditingItem(item); setShowItemModal(true); }}
                                                        title="Edit item"
                                                        hoverColor="blue"
                                                    >
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </IconBtn>
                                                    <IconBtn
                                                        onClick={() => handleDeleteItem(item)}
                                                        title="Delete item"
                                                        hoverColor="red"
                                                    >
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </IconBtn>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                ) : (

                    /* ════════════ Categories Tab ════════════ */
                    <div className="space-y-3">
                        {displayedCategories.length === 0 ? (
                            <div
                                className="flex flex-col items-center justify-center py-20 rounded-xl"
                                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                            >
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                                    style={{ backgroundColor: 'var(--bg-surface-3)' }}
                                >
                                    <HiOutlineTag className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No categories yet</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click "Add Category" to get started.</p>
                            </div>
                        ) : (
                            <div
                                className="rounded-xl border divide-y"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                            >
                                {displayedCategories.map((cat) => {
                                    const itemCount = grouped.find((g) => g._id === cat._id)?.items?.length ?? 0;
                                    return (
                                        <div key={cat._id} className="flex items-center gap-4 px-5 py-4">
                                            {/* Icon */}
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: 'rgba(59,130,246,0.08)' }}
                                            >
                                                <HiOutlineTag className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                        {cat.name}
                                                    </span>
                                                    <StatusBadge active={cat.isActive} />
                                                </div>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                    {itemCount} item{itemCount !== 1 ? 's' : ''} · sort order: {cat.sortOrder}
                                                </p>
                                            </div>

                                            {/* Actions — always visible, never clipped */}
                                            <div className="flex gap-0.5 flex-shrink-0">
                                                <IconBtn
                                                    onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }}
                                                    title="Edit category"
                                                    hoverColor="blue"
                                                >
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </IconBtn>
                                                <IconBtn
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    title="Delete category"
                                                    hoverColor="red"
                                                >
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </IconBtn>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {showCategoryModal && (
                <CategoryModal
                    initial={editingCategory}
                    onSave={handleSaveCategory}
                    onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
                />
            )}
            {showItemModal && (
                <ItemModal
                    initial={editingItem}
                    categories={categories.filter((c) => c.isActive !== false)}
                    onSave={handleSaveItem}
                    onClose={() => { setShowItemModal(false); setEditingItem(null); }}
                />
            )}
        </MainLayout>
    );
}

export default ManageMenuPage;
