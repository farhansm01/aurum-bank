import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import accountsReducer from "@/features/accounts/accountsSlice";
import transactionsReducer from "@/features/transactions/transactionsSlice";
import loansReducer from "@/features/loans/loansSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    transactions: transactionsReducer,
    loans: loansReducer,
  },
});

// These two types are used throughout the app instead of plain "any"
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
