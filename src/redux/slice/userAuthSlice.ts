import { createSlice } from "@reduxjs/toolkit";

export const UserSlice: any = createSlice({
    name: "user",
    initialState: {
        isLoading: false,
        isAuthenticated: false,
        userInfo: []
    },
    reducers: {
        updateLogin: (state, { payload }) => {
            state.isAuthenticated = true;
            state.userInfo = payload;
            console.log("LOGIN", state);
            console.log("LOGIN DATA", state.userInfo);
        },
    }
})

export const { updateLogin } = UserSlice.actions;

export default UserSlice.reducer;