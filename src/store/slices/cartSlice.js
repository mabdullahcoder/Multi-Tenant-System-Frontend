import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
    try {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        return [];
    }
};

// Save cart to localStorage
const saveCartToStorage = (items) => {
    try {
        localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
};

const initialState = {
    items: loadCartFromStorage(),
    isLoading: false,
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const existingItem = state.items.find((item) => item.id === product.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({ ...product, quantity: 1 });
            }
            saveCartToStorage(state.items);
        },

        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
            saveCartToStorage(state.items);
        },

        updateQuantity: (state, action) => {
            const { productId, quantity } = action.payload;
            const item = state.items.find((item) => item.id === productId);

            if (item) {
                if (quantity <= 0) {
                    state.items = state.items.filter((item) => item.id !== productId);
                } else {
                    item.quantity = quantity;
                }
            }
            saveCartToStorage(state.items);
        },

        clearCart: (state) => {
            state.items = [];
            saveCartToStorage(state.items);
        },

        setCartError: (state, action) => {
            state.error = action.payload;
        },

        clearCartError: (state) => {
            state.error = null;
        },

        // Seed cart from an existing order's items (admin edit-mode)
        seedCartFromOrder: (state, action) => {
            // action.payload: array of { id, name, description, price, quantity }
            state.items = action.payload;
            saveCartToStorage(state.items);
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCartError,
    clearCartError,
    seedCartFromOrder,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
    state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectCartItemCount = (state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export default cartSlice.reducer;
