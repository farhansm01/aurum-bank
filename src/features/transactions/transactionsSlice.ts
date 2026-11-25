import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// The shape of one transaction
export type Transaction = {
  id: string;
  txnRef: string;
  type: string;              // "deposit" | "withdrawal" | "transfer" | "loan_disbursement" | "loan_repayment"
  senderAccountId: string | null;
  receiverAccountId: string | null;
  amount: string;
  fee: string;
  status: string;            // "pending" | "completed" | "failed" | "reversed"
  description: string | null;
  flagged: boolean;
  createdAt: string;
};

type TransactionsState = {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
};

const initialState: TransactionsState = {
  transactions: [],
  loading: false,
  error: null,
};

// Fetches transactions. Pass an accountId to filter by account.
export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (accountId: string | undefined, thunkAPI) => {
    const url = accountId
      ? `/api/transactions?accountId=${accountId}`
      : "/api/transactions";

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      return thunkAPI.rejectWithValue(data.error ?? "Failed to load transactions.");
    }

    return data.transactions as Transaction[];
  },
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearTransactions(state) {
      state.transactions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;
