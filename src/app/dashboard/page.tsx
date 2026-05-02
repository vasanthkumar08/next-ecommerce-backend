import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {session?.user.name}
        </h1>
        <p className="text-sm text-[#64748b]">
          This route allows admin and manager roles. Regular users are redirected.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Assigned queue</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">18</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending approvals</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">7</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Role</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold capitalize">
            {session?.user.role}
          </CardContent>
        </Card>
      </div>
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Manager performance</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          <RevenueChart data={[]} />
        </CardContent>
      </Card>
    </div>
  );
}
