"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@example.com",
      password: "password123",
    },
  });

  function onSubmit(values: LoginValues) {
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        toast.error("Failed");
        return;
      }

      toast.success("Success");
      router.push(searchParams.get("callbackUrl") ?? "/admin/dashboard");
      router.refresh();
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-white p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-[#2563eb] text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Admin sign in</CardTitle>
          <p className="text-sm text-[#64748b]">
            Demo: admin@example.com, manager@example.com, user@example.com. Password: password123.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#64748b]" />
                <Input className="pl-9" {...form.register("email")} />
              </div>
              {form.formState.errors.email ? (
                <span className="text-xs text-[#dc2626]">
                  {form.formState.errors.email.message}
                </span>
              ) : null}
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Password</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#64748b]" />
                <Input
                  type="password"
                  className="pl-9"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password ? (
                <span className="text-xs text-[#dc2626]">
                  {form.formState.errors.password.message}
                </span>
              ) : null}
            </label>
            {error ? <p className="text-sm text-[#dc2626]">{error}</p> : null}
            <Button type="submit" fullWidth loading={isPending}>
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
