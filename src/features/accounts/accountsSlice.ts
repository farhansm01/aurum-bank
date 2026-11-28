import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// The shape of one bank account
export type BankAccount = {
  id: string;
  accountNumber: string;
  type: string;    // "savings" | "current" | "business"
  balance: string; // comes as a string from the DB, like "5000.00"
  status: string;  // "active" | "frozen"
};

type AccountsState = {
  accounts: BankAccount[];
  selectedAccountNumber: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: AccountsState = {
  accounts: [],
  selectedAccountNumber: null,
  loading: false,
  error: null,
};

// Fetches the logged-in customer's accounts from the API
export const fetchAccounts = createAsyncThunk(
  "accounts/fetchAccounts",
  async (_, thunkAPI) => {
    const res = await fetch("/api/accounts");
    const data = await res.json();

    if (!res.ok) {
      return thunkAPI.rejectWithValue(data.error ?? "Failed to load accounts.");
    }

    return data.accounts as BankAccount[];
  },
);

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    setSelectedAccount(state, action: PayloadAction<string | null>) {
      state.selectedAccountNumber = action.payload;
    },
    // Call this to wipe the list (e.g. on logout)
    clearAccounts(state) {
      state.accounts = [];
      state.selectedAccountNumber = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action: PayloadAction<BankAccount[]>) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedAccount, clearAccounts } = accountsSlice.actions;
export default accountsSlice.reducer;
