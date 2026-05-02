"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { persistAuthSession } from "@/features/auth/authStorage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type Values = z.infer<typeof schema>;

interface ApiLoginResponse {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user" | "manager";
  };
  message?: string;
}

export function AdminLoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: Values) {
    startTransition(async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as ApiLoginResponse;

      if (!response.ok || !result.success) {
        toast.error("Failed: check your credentials");
        return;
      }

      if (result.user.role !== "admin" && result.user.role !== "manager") {
        toast.error("Failed: admin access required");
        return;
      }

      persistAuthSession(result.accessToken, result.user);
      toast.success("Success: signed in");
      router.push("/admin/dashboard");
      router.refresh();
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFC] p-6">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB] text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Admin login</h1>
          <p className="mt-2 text-sm text-slate-500">JWT-protected admin workspace</p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input className="pl-9" {...form.register("email")} />
            </div>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input type="password" className="pl-9" {...form.register("password")} />
            </div>
          </label>
          <Button type="submit" loading={pending} fullWidth>
            Sign in
          </Button>
        </form>
      </section>
    </main>
  );
}
