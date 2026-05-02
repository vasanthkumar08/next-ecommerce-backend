import { ProductManager } from "@/components/admin/ProductManager";
import { getAdminSession } from "@/lib/admin/auth";

export default async function AddProductPage() {
  const session = await getAdminSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Add product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Use the Add product action to create a database-backed product with image preview.
        </p>
      </div>
      <ProductManager canManage={session?.role === "admin"} />
    </div>
  );
}
