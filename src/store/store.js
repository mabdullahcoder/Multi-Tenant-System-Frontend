import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import orderReducer from './slices/orderSlice';
import reportReducer from './slices/reportSlice';
import uiReducer from './slices/uiSlice';
import cartReducer from './slices/cartSlice';
import menuReducer from './slices/menuSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        order: orderReducer,
        report: reportReducer,
        ui: uiReducer,
        cart: cartReducer,
        menu: menuReducer,
    },
});

export default store;
