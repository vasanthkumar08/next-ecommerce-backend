import { ProductManager } from "@/components/admin/ProductManager";
import { getAdminSession } from "@/lib/admin/auth";

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  const canManage = session?.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Products</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage catalog CRUD with validated forms, image previews, search, and pagination.
        </p>
      </div>
      <ProductManager canManage={canManage} />
    </div>
  );
}
