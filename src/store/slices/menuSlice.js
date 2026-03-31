import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import menuAPI from '../../services/menuAPI';

/* ── Thunks ── */
export const fetchMenuGrouped = createAsyncThunk('menu/fetchGrouped', async (_, { rejectWithValue }) => {
    try {
        const res = await menuAPI.getMenuGrouped();
        return res.data; // array of { _id, name, slug, items: [...] }
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to load menu');
    }
});

export const fetchCategories = createAsyncThunk('menu/fetchCategories', async (includeInactive = false, { rejectWithValue }) => {
    try {
        const res = await menuAPI.getCategories(includeInactive);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to load categories');
    }
});

/* ── Slice ── */
const menuSlice = createSlice({
    name: 'menu',
    initialState: {
        grouped: [],       // [{ _id, name, slug, items }]
        categories: [],    // flat list
        isLoading: false,
        error: null,
    },
    reducers: {
        clearMenuError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenuGrouped.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchMenuGrouped.fulfilled, (state, action) => {
                state.isLoading = false;
                state.grouped = action.payload || [];
                state.categories = (action.payload || []).map(({ _id, name, slug }) => ({ _id, name, slug }));
            })
            .addCase(fetchMenuGrouped.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload || [];
            });
    },
});

export const { clearMenuError } = menuSlice.actions;
export default menuSlice.reducer;
