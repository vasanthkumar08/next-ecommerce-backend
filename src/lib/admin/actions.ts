"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import type { Resource } from "@/types/rbac";

export async function assertCanWrite(resource: Resource) {
  const session = await auth();

  if (!session || !canWrite(session.user.role, resource)) {
    throw new Error("You do not have permission to modify this resource.");
  }
}

export async function updateUserRole() {
  await assertCanWrite("users");
  revalidatePath("/admin/users");
}

export async function saveProduct() {
  await assertCanWrite("products");
  revalidatePath("/admin/products");
}
