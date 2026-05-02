import type { Product } from "@/types/product";
import { getMockProductById, getMockProducts } from "@/services/mockDatabase";

export async function fetchMockProducts(): Promise<Product[]> {
  return getMockProducts();
}

export async function fetchMockProductById(id: string): Promise<Product | null> {
  return getMockProductById(id);
}
