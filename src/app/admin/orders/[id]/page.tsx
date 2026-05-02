import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Order detail</h1>
        <p className="mt-1 text-sm text-slate-500">
          Order ID: {id}. Full order lifecycle actions are available below.
        </p>
      </div>
      <AdminOrdersClient />
    </div>
  );
}
