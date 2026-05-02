"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, LogIn, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { login } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function UnifiedLoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    startTransition(async () => {
      const result = await dispatch(login(values));

      if (login.rejected.match(result)) {
        toast.error("Failed");
        return;
      }

      const { user } = result.payload;
      toast.success("Success");

      const next = searchParams.get("next");
      if (
        next &&
        next.startsWith("/") &&
        !next.startsWith("//") &&
        ((user.role === "admin" && next.startsWith("/admin")) ||
          ((user.role === "user" || user.role === "manager") && !next.startsWith("/admin")))
      ) {
        router.push(next);
        router.refresh();
        return;
      }

      router.push(user.role === "admin" || user.role === "manager" ? "/admin" : "/");
      router.refresh();
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#fff7ed] p-6">
      <section className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-8 shadow-[0_24px_80px_rgba(154,52,18,0.14)] transition duration-300 hover:shadow-[0_28px_90px_rgba(154,52,18,0.18)]">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Login</h1>
          <p className="mt-2 text-sm text-slate-500">
            Access your account with your registered email.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-orange-500" />
                <Input
                  className="h-11 rounded-xl border-gray-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400 transition focus-visible:ring-orange-500"
                  placeholder="you@example.com"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email ? (
                <span className="text-xs font-medium text-red-600">
                  {form.formState.errors.email.message}
                </span>
              ) : null}
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Password</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-orange-500" />
                <Input
                  type="password"
                  className="h-11 rounded-xl border-gray-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400 transition focus-visible:ring-orange-500"
                  placeholder="Enter password"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password ? (
                <span className="text-xs font-medium text-red-600">
                  {form.formState.errors.password.message}
                </span>
              ) : null}
            </label>
            <Button
              type="submit"
              loading={pending}
              fullWidth
              className="h-11 rounded-xl bg-orange-500 font-black shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:ring-orange-500 active:scale-[0.98]"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
        </form>
        <p className="mt-6 text-center text-sm font-medium text-slate-600">
          New customer?{" "}
          <Link
            href="/register"
            className="font-black text-orange-600 transition hover:text-orange-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
