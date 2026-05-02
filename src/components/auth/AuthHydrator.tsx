"use client";

import axios from "axios";
import { useEffect } from "react";
import { hydrateAuth } from "@/features/auth/authSlice";
import type { AuthResponse } from "@/features/auth/auth.api";
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredUser,
  persistAuthSession,
} from "@/features/auth/authStorage";
import { useAppDispatch } from "@/store/hooks";

export default function AuthHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;
    const storedUser = getStoredUser();
    const storedAccessToken = getStoredAccessToken();

    dispatch(
      hydrateAuth({
        user: storedUser,
        accessToken: storedAccessToken,
      })
    );

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || (!storedUser && !storedAccessToken)) return;

    axios
      .post<AuthResponse>(`${apiUrl}/v1/auth/refresh`, {}, { withCredentials: true })
      .then((response) => {
        if (cancelled) return;

        persistAuthSession(response.data.accessToken, response.data.user);
        dispatch(
          hydrateAuth({
            user: response.data.user,
            accessToken: response.data.accessToken,
          })
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        if (status === 401 || status === 403) {
          clearAuthSession();
          dispatch(hydrateAuth({ user: null, accessToken: null }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
