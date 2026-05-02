"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  createAdminProduct,
  deleteAdminProduct,
  updateAdminProduct,
} from "@/features/admin/admin.api";
import {
  loadAdminProducts,
  removeAdminProductOptimistic,
} from "@/features/admin/adminProductSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { AdminProduct } from "@/types/admin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  sku: z.string().trim().min(2, "SKU is required"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than zero"),
  discount: z.number().min(0).max(95),
  category: z.string().trim().min(2, "Category is required"),
  brand: z.string().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  ratings: z.number().min(0).max(5),
});

type ProductFormValues = z.infer<typeof productSchema>;

const emptyValues: ProductFormValues = {
  name: "",
  sku: "",
  description: "",
  price: 999,
  discount: 0,
  category: "",
  brand: "",
  stock: 10,
  imageUrl: "",
  ratings: 0,
};

const inputClass =
  "rounded-lg border-slate-200 bg-white text-black placeholder:text-slate-400 focus-visible:ring-[#2563EB]";
const tableHeadClass =
  "bg-[#F8FAFC] px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500";
const tableCellClass = "px-4 py-4 align-middle text-sm text-slate-700";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function ProductManager({ canManage = true }: { canManage?: boolean }) {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.adminProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void dispatch(loadAdminProducts({ page, keyword: query, limit: 10, category: category === "all" ? undefined : category }));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [category, dispatch, page, query]);

  useEffect(() => {
    setPage(1);
  }, [category, query]);

  const products = data?.products ?? [];
  const totalPages = Math.max(data?.pages ?? 1, 1);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort();
  }, [products]);

  useEffect(() => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  function openCreate() {
    if (!canManage) return;
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
    form.reset(emptyValues);
    setOpen(true);
  }

  function openEdit(product: AdminProduct) {
    if (!canManage) return;
    setEditing(product);
    setImageFile(null);
    const firstImage = product.images[0]?.url ?? "";
    setImagePreview(firstImage);
    form.reset({
      name: product.name,
      sku: product.sku ?? "",
      description: product.description,
      price: product.price,
      discount: product.discount ?? 0,
      category: product.category,
      brand: product.brand ?? "",
      stock: product.stock,
      imageUrl: firstImage,
      ratings: product.ratings,
    });
    setOpen(true);
  }

  function onSubmit(values: ProductFormValues) {
    const image = values.imageUrl?.trim() || imagePreview || editing?.images[0]?.url;

    if (!image) {
      toast.error("Failed: product image is required");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          name: values.name,
          sku: values.sku,
          description: values.description,
          price: values.price,
          discount: values.discount,
          category: values.category,
          brand: values.brand,
          stock: values.stock,
          ratings: values.ratings,
          countInStock: values.stock,
          images: [{ url: image, public_id: `admin-upload-${Date.now()}` }],
        };

        if (editing) {
          await updateAdminProduct(editing.id, payload);
          toast.success("Success: product updated");
        } else {
          await createAdminProduct(payload);
          toast.success("Success: product created");
        }

        void dispatch(loadAdminProducts({ page, keyword: query, limit: 10, category: category === "all" ? undefined : category }));
        setOpen(false);
      } catch {
        toast.error("Failed: product could not be saved");
      }
    });
  }

  function deleteProduct(productId: string) {
    if (!canManage) return;
    dispatch(removeAdminProductOptimistic(productId));
    startTransition(async () => {
      try {
        await deleteAdminProduct(productId);
        toast.success("Success: product deleted");
      } catch {
        toast.error("Failed: product could not be deleted");
        void dispatch(loadAdminProducts({ page, keyword: query, limit: 10, category: category === "all" ? undefined : category }));
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(220px,360px)_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products by name or SKU"
                className={`${inputClass} pl-9`}
              />
            </div>
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-black outline-none focus:ring-2 focus:ring-[#2563EB]">
              <option>All categories</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
          <Button onClick={openCreate} disabled={!canManage} className="bg-[#2563EB] text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-white p-4 text-sm font-medium text-red-600 shadow-sm">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="text-lg font-bold text-slate-950">No products found</h2>
            <p className="mt-2 text-sm text-slate-500">Add a product or adjust your search.</p>
            <Button className="mt-5 bg-[#2563EB] text-white hover:bg-blue-700" onClick={openCreate} disabled={!canManage}>
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className={tableHeadClass}>Product</th>
                  <th className={tableHeadClass}>Category</th>
                  <th className={tableHeadClass}>Price</th>
                  <th className={tableHeadClass}>Stock</th>
                  <th className={tableHeadClass}>Rating</th>
                  <th className={`${tableHeadClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const image = product.images[0]?.url ?? "/globe.svg";

                  return (
                    <tr key={product.id} className="transition hover:bg-[#F8FAFC]">
                      <td className={tableCellClass}>
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-[#F8FAFC]">
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                              unoptimized={image.startsWith("data:")}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-950">{product.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{product.sku ?? "No SKU"}</p>
                          </div>
                        </div>
                      </td>
                      <td className={tableCellClass}>{product.category}</td>
                      <td className={`${tableCellClass} font-semibold text-slate-950`}>{formatCurrency(product.price)}</td>
                      <td className={tableCellClass}>
                        <Badge variant={product.stock > 0 ? "success" : "danger"}>
                          {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                        </Badge>
                      </td>
                      <td className={tableCellClass}>{product.ratings.toFixed(1)}</td>
                      <td className={`${tableCellClass} text-right`}>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" disabled={!canManage} onClick={() => openEdit(product)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={!canManage || isPending}
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {data?.page ?? page} of {totalPages} · {(data?.total ?? products.length).toLocaleString("en-IN")} products
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>
              Next
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-950">{editing ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription className="text-slate-500">
              Validate product details, preview the image, then save to the catalog.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Product image</span>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-dashed border-slate-300 bg-[#F8FAFC]">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Product preview"
                    fill
                    sizes="(min-width: 768px) 512px, 100vw"
                    className="object-cover"
                    unoptimized={imagePreview.startsWith("data:")}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-sm">Upload image or paste a URL</span>
                  </div>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              />
              <Input
                placeholder="https://example.com/product.jpg"
                className={inputClass}
                {...form.register("imageUrl")}
                onChange={(event) => {
                  form.setValue("imageUrl", event.target.value);
                  setImagePreview(event.target.value);
                }}
              />
              {form.formState.errors.imageUrl ? (
                <span className="text-xs text-red-600">{form.formState.errors.imageUrl.message}</span>
              ) : null}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Name</span>
                <Input className={inputClass} {...form.register("name")} />
                {form.formState.errors.name ? <span className="text-xs text-red-600">{form.formState.errors.name.message}</span> : null}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">SKU</span>
                <Input className={inputClass} {...form.register("sku")} />
                {form.formState.errors.sku ? <span className="text-xs text-red-600">{form.formState.errors.sku.message}</span> : null}
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Description</span>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#2563EB]"
                  {...form.register("description")}
                />
                {form.formState.errors.description ? <span className="text-xs text-red-600">{form.formState.errors.description.message}</span> : null}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Price</span>
                <Input type="number" min="0" className={inputClass} {...form.register("price", { valueAsNumber: true })} />
                {form.formState.errors.price ? <span className="text-xs text-red-600">{form.formState.errors.price.message}</span> : null}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Discount</span>
                <Input type="number" min="0" max="95" className={inputClass} {...form.register("discount", { valueAsNumber: true })} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Category</span>
                <Input className={inputClass} {...form.register("category")} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Brand</span>
                <Input className={inputClass} {...form.register("brand")} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Stock</span>
                <Input type="number" min="0" className={inputClass} {...form.register("stock", { valueAsNumber: true })} />
                {form.formState.errors.stock ? <span className="text-xs text-red-600">{form.formState.errors.stock.message}</span> : null}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Ratings</span>
                <Input type="number" min="0" max="5" step="0.1" className={inputClass} {...form.register("ratings", { valueAsNumber: true })} />
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isPending} className="bg-[#2563EB] text-white hover:bg-blue-700">
                {editing ? "Save changes" : "Create product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

