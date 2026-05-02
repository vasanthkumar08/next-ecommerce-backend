import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  AuthResponse,
  RegisterResponse,
  User,
  loginUser,
  registerUser,
} from "./auth.api";
import {
  clearAuthSession,
  persistAuthSession,
} from "./authStorage";

// ✅ Define ONCE — all thunks in this file inherit rejectValue: string
const createAuthThunk = createAsyncThunk.withTypes<{
  rejectValue: string;
}>();

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const login = createAuthThunk(
  "auth/login",
  async (
    data: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const result: AuthResponse = await loginUser(data);
      return result;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Login failed"
      );
    }
  }
);

export const register = createAuthThunk(
  "auth/register",
  async (
    data: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const result: RegisterResponse = await registerUser(data);
      return result;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Registration failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth: (
      state,
      action: {
        payload: {
          user: User | null;
          accessToken: string | null;
        };
      }
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = Boolean(
        action.payload.user && action.payload.accessToken
      );
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      clearAuthSession();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        persistAuthSession(action.payload.accessToken, action.payload.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Registration failed";
      });
  },
});

export const { hydrateAuth, logout } = authSlice.actions;
export default authSlice.reducer;
