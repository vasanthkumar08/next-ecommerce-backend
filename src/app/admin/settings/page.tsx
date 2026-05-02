import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Admin settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Store profile, payment methods, and security settings.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Store settings</h2>
          <div className="mt-4 space-y-4">
            <Input defaultValue="vasanthtrends" aria-label="Store name" />
            <Input defaultValue="Razorpay" aria-label="Payment methods" />
            <Button>Save store settings</Button>
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Security</h2>
          <div className="mt-4 space-y-4">
            <Input type="password" placeholder="Current password" />
            <Input type="password" placeholder="New password" />
            <Button variant="outline">Change password</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
