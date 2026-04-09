import { useState, useEffect, useCallback } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { useUI } from '../../context/UIContext';
import { useSocket } from '../../context/SocketContext';
import menuAPI from '../../services/menuAPI';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
    HiOutlineTag, HiOutlineCollection, HiOutlineX,
    HiOutlineCheck, HiOutlineEye, HiOutlineEyeOff,
} from 'react-icons/hi';

/* ── Helpers ── */
const EMPTY_CATEGORY = { name: '', description: '', isActive: true, sortOrder: 0 };
const EMPTY_ITEM = { name: '', description: '', price: '', originalPrice: '', image: '', category: '', isActive: true, sortOrder: 0 };

function Badge({ active }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {active ? <HiOutlineCheck className="w-3 h-3" /> : <HiOutlineEyeOff className="w-3 h-3" />}
            {active ? 'Active' : 'Hidden'}
        </span>
    );
}

/* ── Category Form Modal ── */
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="rounded-2xl shadow-2xl w-full max-w-md" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h2 className="text-heading-4">{initial ? 'Edit Category' : 'New Category'}</h2>
                    <button onClick={onClose} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    <div className="form-group">
                        <label className="label-base">Category Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-base"
                            placeholder="e.g. Pizzas"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="label-base">Description</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="input-base"
                            placeholder="Optional description"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label-base">Sort Order</label>
                            <input
                                type="number"
                                value={form.sortOrder}
                                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                                className="input-base"
                                min="0"
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                                />
                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Active</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
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

/* ── Item Form Modal ── */
function ItemModal({ initial, categories, onSave, onClose }) {
    const [form, setForm] = useState(initial
        ? { ...initial, category: initial.category?._id || initial.category || '', price: String(initial.price), originalPrice: String(initial.originalPrice || '') }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between px-6 py-4 sticky top-0 rounded-t-2xl z-10" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                    <h2 className="text-heading-4">{initial ? 'Edit Menu Item' : 'Add New Item'}</h2>
                    <button onClick={onClose} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    <div className="form-group">
                        <label className="label-base">Category *</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="input-base"
                            required
                        >
                            <option value="">Select a category…</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label-base">Item Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-base"
                            placeholder="e.g. Margherita Pizza"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label-base">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={2}
                            className="input-base resize-none"
                            placeholder="Short description of the item"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label-base">Price (Rs) *</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="input-base"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-base">Original Price (Rs)</label>
                            <input
                                type="number"
                                value={form.originalPrice}
                                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                                className="input-base"
                                min="0"
                                step="0.01"
                                placeholder="For discounts"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label-base">Image URL</label>
                        <input
                            type="text"
                            value={form.image}
                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                            className="input-base"
                            placeholder="https://example.com/image.jpg"
                        />
                        {form.image && (
                            <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                <img src={form.image} alt="preview" className="h-24 w-32 object-cover rounded border border-gray-300" onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label-base">Sort Order</label>
                            <input
                                type="number"
                                value={form.sortOrder}
                                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                                className="input-base"
                                min="0"
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                                />
                                <span className="text-sm text-gray-700 font-medium">Active</span>
                            </label>
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

/* ── Main Page ── */
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

    /**
     * SENIOR FIX: Real-time Socket.IO listeners for menu item updates
     * Allows admins to see changes from other admins/users without refresh
     * Handles: create, update, delete operations
     */
    useEffect(() => {
        if (!socket) return;

        const handleMenuItemUpdated = (data) => {
            console.log('✓ Real-time menu item update received:', data);

            setGrouped((prevGrouped) => {
                const newGrouped = JSON.parse(JSON.stringify(prevGrouped)); // Deep clone

                switch (data.actionType) {
                    case 'created':
                        // Add new item to the appropriate category
                        const categoryToAdd = newGrouped.find(
                            (g) => g._id === (typeof data.category === 'object' ? data.category._id : data.category)
                        );
                        if (categoryToAdd) {
                            categoryToAdd.items = categoryToAdd.items || [];
                            categoryToAdd.items.push(data);
                            addNotification({
                                type: 'info',
                                message: `📝 New item added: ${data.name}`,
                            });
                        }
                        break;

                    case 'updated':
                        // Find and update the item
                        let found = false;
                        newGrouped.forEach((group) => {
                            const itemIndex = group.items?.findIndex((item) => item._id === data._id);
                            if (itemIndex !== undefined && itemIndex >= 0) {
                                group.items[itemIndex] = {
                                    ...group.items[itemIndex],
                                    ...data,
                                };
                                found = true;
                            }
                        });
                        if (found) {
                            addNotification({
                                type: 'info',
                                message: `✏️ Item updated: ${data.name}`,
                            });
                        }
                        break;

                    case 'deleted':
                        // Remove item from all categories
                        newGrouped.forEach((group) => {
                            group.items = group.items?.filter((item) => item._id !== data._id) || [];
                        });
                        addNotification({
                            type: 'warning',
                            message: `🗑️ Item deleted: ${data.name}`,
                        });
                        break;
                }

                return newGrouped;
            });
        };

        const handleMenuCategoryUpdated = (data) => {
            console.log('✓ Real-time menu category update received:', data);

            setCategories((prevCategories) => {
                switch (data.actionType) {
                    case 'created':
                        addNotification({
                            type: 'info',
                            message: `📂 New category added: ${data.name}`,
                        });
                        return [...prevCategories, data];

                    case 'updated':
                        const updated = prevCategories.map((cat) =>
                            cat._id === data._id ? { ...cat, ...data } : cat
                        );
                        addNotification({
                            type: 'info',
                            message: `✏️ Category updated: ${data.name}`,
                        });
                        return updated;

                    case 'deleted':
                        addNotification({
                            type: 'warning',
                            message: `🗑️ Category deleted: ${data.name}`,
                        });
                        return prevCategories.filter((cat) => cat._id !== data._id);

                    default:
                        return prevCategories;
                }
            });

            // Also update grouped to reflect category changes
            setGrouped((prevGrouped) =>
                prevGrouped.map((group) =>
                    group._id === data._id ? { ...group, ...data } : group
                )
            );
        };

        // Listen to socket events
        socket.on('menuItemUpdated', handleMenuItemUpdated);
        socket.on('menuCategoryUpdated', handleMenuCategoryUpdated);

        return () => {
            socket.off('menuItemUpdated', handleMenuItemUpdated);
            socket.off('menuCategoryUpdated', handleMenuCategoryUpdated);
        };
    }, [socket, addNotification]);

    /* ── Category actions ── */
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

    /* ── Item actions ── */
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
    const displayedItems = (selectedCategoryId === 'all' ? allItems : allItems.filter((i) => i.category?._id === selectedCategoryId || i.category === selectedCategoryId))
        .filter((i) => showInactive || i.isActive);
    const displayedCategories = categories.filter((c) => showInactive || c.isActive);

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-heading-2">Manage Menu</h1>
                        <p className="text-description mt-1">Add, edit and organize menu items and categories</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="w-4 h-4 rounded text-blue-600 cursor-pointer" />
                            Show hidden items
                        </label>
                        {activeTab === 'categories' ? (
                            <button
                                onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
                                className="btn-md btn-primary-solid flex items-center gap-2"
                            >
                                <HiOutlinePlus className="w-4 h-4" /> Add Category
                            </button>
                        ) : (
                            <button
                                onClick={() => { setEditingItem(null); setShowItemModal(true); }}
                                className="btn-md btn-primary-solid flex items-center gap-2"
                            >
                                <HiOutlinePlus className="w-4 h-4" /> Add Item
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1" style={{ borderBottom: '1px solid var(--border)' }}>
                    {[
                        { key: 'items', label: 'Menu Items', icon: HiOutlineCollection },
                        { key: 'categories', label: 'Categories', icon: HiOutlineTag },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px"
                            style={activeTab === key
                                ? { borderColor: 'var(--primary)', color: 'var(--primary)' }
                                : { borderColor: 'transparent', color: 'var(--text-secondary)' }
                            }
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="spinner" />
                    </div>
                ) : activeTab === 'items' ? (
                    /* ── Items Tab ── */
                    <div className="space-y-4">
                        {/* Category filter */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => setSelectedCategoryId('all')}
                                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all min-h-[36px]"
                                style={selectedCategoryId === 'all'
                                    ? { backgroundColor: 'var(--primary)', color: '#fff' }
                                    : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                                }
                            >
                                All ({allItems.filter((i) => showInactive || i.isActive).length})
                            </button>
                            {grouped.map((g) => {
                                const count = (g.items || []).filter((i) => showInactive || i.isActive).length;
                                return (
                                    <button
                                        key={g._id}
                                        onClick={() => setSelectedCategoryId(g._id)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all min-h-[36px]"
                                        style={selectedCategoryId === g._id
                                            ? { backgroundColor: 'var(--primary)', color: '#fff' }
                                            : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                                        }
                                    >
                                        {g.name} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        {displayedItems.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <HiOutlineCollection className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">No items yet</p>
                                <p className="text-sm mt-1">Click "Add Item" to create your first menu item.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {displayedItems.map((item) => (
                                    <div key={item._id} className={`rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${!item.isActive ? 'opacity-60' : ''}`} style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                        <div className="aspect-[4/3] relative overflow-hidden" style={{ backgroundColor: 'var(--bg-surface-3)' }}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                                                    <HiOutlineCollection className="w-10 h-10" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2">
                                                <Badge active={item.isActive} />
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--primary)' }}>{item.category?.name}</p>
                                            <h3 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>{item.name}</h3>
                                            <p className="text-xs line-clamp-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div>
                                                    {item.originalPrice && (
                                                        <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>Rs{item.originalPrice}</p>
                                                    )}
                                                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Rs{item.price}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => { setEditingItem(item); setShowItemModal(true); }}
                                                        className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item)}
                                                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Categories Tab ── */
                    <div className="space-y-3">
                        {displayedCategories.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <HiOutlineTag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">No categories yet</p>
                                <p className="text-sm mt-1">Click "Add Category" to get started.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                                {displayedCategories.map((cat) => {
                                    const itemCount = grouped.find((g) => g._id === cat._id)?.items?.length ?? 0;
                                    return (
                                        <div key={cat._id} className="flex items-center justify-between px-5 py-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <HiOutlineTag className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                                                        <Badge active={cat.isActive} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''} · sort: {cat.sortOrder}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }}
                                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
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
