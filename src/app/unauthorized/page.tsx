import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-[#fee2e2] text-[#dc2626]">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-sm text-[#64748b]">
          Your account is signed in, but it does not have permission to view this page.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white transition hover:bg-[#1d4ed8]"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
