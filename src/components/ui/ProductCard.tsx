"use client";

import { memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import BaseProductCard from "@/components/ProductCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import { flyProductImageToCart } from "@/utils/flyToCart";
import { openCartDrawer } from "@/utils/cartDrawerEvents";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/features/wishlist/wishlistSlice";
import { toast as sonnerToast } from "sonner";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const toRupees = (price: number) => Math.max(1, Math.round(price));

function getPricing(product: Product) {
  const hash = Array.from(product.id).reduce(
    (total, char) => total + char.charCodeAt(0),
    0
  );
  const discount = 24 + ((hash * 9) % 46);
  const price = toRupees(product.price);
  const originalPrice = Math.round(price / (1 - discount / 100));
  return { price, originalPrice, discount };
}

function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pricing = useMemo(() => getPricing(product), [product]);
  const isLoggedIn = useAppSelector((state) => state.auth.isAuthenticated);
  const role = useAppSelector((state) => state.auth.user?.role);

  const isWishlisted = useAppSelector((state) =>
    state.wishlist.items.some((item) => item.id === product.id)
  );

  const handleAddToCart = useCallback(
    async (trigger?: HTMLElement | null) => {
    if (!isLoggedIn) {
      sonnerToast.error("Failed");
      router.push(`/login?next=${encodeURIComponent("/cart")}`);
      return;
    }

    if (role === "admin") {
      sonnerToast.error("Failed");
      router.push("/admin");
      return;
    }

    await flyProductImageToCart(trigger);
      dispatch(addToCart(product));
      openCartDrawer(product);
      sonnerToast.success("Success");
    },
    [dispatch, isLoggedIn, product, role, router]
  );

  const handleWishlist = useCallback(() => {
    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
      sonnerToast.success("Success");
      return;
    }

    dispatch(addToWishlist(product));
    sonnerToast.success("Success");
  }, [dispatch, isWishlisted, product]);

  return (
    <BaseProductCard
      id={product.id}
      name={product.title}
      price={pricing.price}
      originalPrice={pricing.originalPrice}
      discount={pricing.discount}
      image={product.image}
      rating={product.rating?.rate ?? 0}
      reviewCount={product.rating?.count ?? 0}
      category={product.category}
      description={product.description}
      wishlisted={isWishlisted}
      onAddToCart={handleAddToCart}
      onToggleWishlist={handleWishlist}
    />
  );
}

export default memo(ProductCard);
