"use client";

import { useAppSelector } from "@/store/hooks";

export default function AuthStatus() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <div>Not logged in</div>;
  }

  return <div>{user.name}</div>;
}