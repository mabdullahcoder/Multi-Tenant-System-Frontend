import { createContext, useContext, useReducer } from 'react';

const loadCart = () => {
    try {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const saveCart = (items) => {
    try {
        localStorage.setItem('cart', JSON.stringify(items));
    } catch { /* ignore */ }
};

const initialState = {
    items: loadCart(),
    error: null,
};

function cartReducer(state, action) {
    let items;
    switch (action.type) {
        case 'ADD_TO_CART': {
            const existing = state.items.find((i) => i.id === action.payload.id);
            items = existing
                ? state.items.map((i) => i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...state.items, { ...action.payload, quantity: 1 }];
            saveCart(items);
            return { ...state, items };
        }
        case 'REMOVE_FROM_CART':
            items = state.items.filter((i) => i.id !== action.payload);
            saveCart(items);
            return { ...state, items };

        case 'UPDATE_QUANTITY': {
            const { productId, quantity } = action.payload;
            items = quantity <= 0
                ? state.items.filter((i) => i.id !== productId)
                : state.items.map((i) => i.id === productId ? { ...i, quantity } : i);
            saveCart(items);
            return { ...state, items };
        }
        case 'CLEAR_CART':
            saveCart([]);
            return { ...state, items: [] };

        case 'SET_CART_ERROR':
            return { ...state, error: action.payload };

        case 'CLEAR_CART_ERROR':
            return { ...state, error: null };

        default:
            return state;
    }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    const addToCart = (product) => dispatch({ type: 'ADD_TO_CART', payload: product });
    const removeFromCart = (id) => dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    const updateQuantity = (productId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    const clearCart = () => dispatch({ type: 'CLEAR_CART' });
    const setCartError = (msg) => dispatch({ type: 'SET_CART_ERROR', payload: msg });
    const clearCartError = () => dispatch({ type: 'CLEAR_CART_ERROR' });

    const cartTotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cartItemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider value={{
            ...state,
            cartTotal,
            cartItemCount,
            addToCart, removeFromCart, updateQuantity,
            clearCart, setCartError, clearCartError,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
