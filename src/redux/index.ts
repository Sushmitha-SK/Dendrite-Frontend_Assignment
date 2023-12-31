import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";

// Reducers
import loginReducer from "./slice/userAuthSlice"

export const store = configureStore({
    reducer: {
        login: loginReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
