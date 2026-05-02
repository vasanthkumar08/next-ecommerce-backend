"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, UserRound, UserPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,50}$/;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordTouched = password.length > 0;
  const passwordWeak = passwordTouched && !STRONG_PASSWORD.test(password);
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const formInvalid = loading || passwordMismatch || passwordWeak;

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formInvalid) return;

    const result = await dispatch(
      register({ name, email, password, confirmPassword })
    );

    if (register.fulfilled.match(result)) {
      router.push("/login");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#fff7ed] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-8 shadow-[0_24px_80px_rgba(154,52,18,0.14)] transition duration-300 hover:shadow-[0_28px_90px_rgba(154,52,18,0.18)]">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">
            Create account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Start shopping with a clean, secure account.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Full Name
            </label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-orange-500" />
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="h-11 rounded-xl border-gray-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400 transition focus-visible:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-orange-500" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-11 rounded-xl border-gray-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400 transition focus-visible:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-orange-500" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, upper, lower, number, symbol"
                className={`h-11 rounded-xl pl-9 transition focus-visible:ring-orange-500 ${
                passwordWeak
                  ? "border-red-400 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-red-400"
                  : "border-gray-300 bg-white text-slate-950 placeholder:text-slate-400"
              }`}
              />
            </div>
            {passwordWeak && (
              <p className="mt-2 text-xs font-medium text-red-500">
                Must be 8-50 chars with uppercase, lowercase, number and
                symbol (@$!%*?&)
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Confirm Password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-orange-500" />
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className={`h-11 rounded-xl pl-9 transition focus-visible:ring-orange-500 ${
                passwordMismatch
                  ? "border-red-400 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-red-400"
                  : "border-gray-300 bg-white text-slate-950 placeholder:text-slate-400"
              }`}
              />
            </div>
            {passwordMismatch && (
              <p className="mt-2 text-xs font-medium text-red-500">
                Passwords do not match
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={formInvalid}
            loading={loading}
            fullWidth
            className="h-11 rounded-xl bg-orange-500 font-black shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:ring-orange-500 active:scale-[0.98]"
          >
            Create Account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm font-medium text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-black text-orange-600 transition hover:text-orange-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
