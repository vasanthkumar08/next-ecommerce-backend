import { ProductManager } from "@/components/admin/ProductManager";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Edit product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Product ID: {id}. Search the table below and use Edit to update it.
        </p>
      </div>
      <ProductManager />
    </div>
  );
}
