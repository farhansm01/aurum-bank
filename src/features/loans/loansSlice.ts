import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// The shape of one loan
export type Loan = {
  id: string;
  type: string;             // "personal" | "home" | "car" | "education" | "business"
  amount: string;
  durationMonths: number;
  status: string;           // "pending" | "under_review" | "approved" | "rejected" | "active" | "completed"
  interestRate: string | null;
  monthlyPayment: string | null;
  remainingBalance: string;
  createdAt: string;
};

type LoansState = {
  loans: Loan[];
  loading: boolean;
  error: string | null;
};

const initialState: LoansState = {
  loans: [],
  loading: false,
  error: null,
};

// Fetches the logged-in customer's loan applications
export const fetchLoans = createAsyncThunk(
  "loans/fetchLoans",
  async (_, thunkAPI) => {
    const res = await fetch("/api/loans");
    const data = await res.json();

    if (!res.ok) {
      return thunkAPI.rejectWithValue(data.error ?? "Failed to load loans.");
    }

    return data.loans as Loan[];
  },
);

const loansSlice = createSlice({
  name: "loans",
  initialState,
  reducers: {
    clearLoans(state) {
      state.loans = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action: PayloadAction<Loan[]>) => {
        state.loading = false;
        state.loans = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLoans } = loansSlice.actions;
export default loansSlice.reducer;
