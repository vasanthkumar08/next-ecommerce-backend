"use client";

const FLY_DURATION_MS = 620;

const getTargetCart = () =>
  document.querySelector<HTMLElement>("[data-cart-target='primary']") ??
  document.querySelector<HTMLElement>("[data-cart-target]");

const getSourceImage = (trigger?: HTMLElement | null) => {
  const scope = trigger?.closest<HTMLElement>("[data-product-scope]");
  return scope?.querySelector<HTMLImageElement>("[data-fly-image] img") ?? null;
};

export async function flyProductImageToCart(
  trigger?: HTMLElement | null
): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const sourceImage = getSourceImage(trigger);
  const targetCart = getTargetCart();

  if (!sourceImage || !targetCart) return;

  const sourceRect = sourceImage.getBoundingClientRect();
  const targetRect = targetCart.getBoundingClientRect();

  if (sourceRect.width === 0 || sourceRect.height === 0) return;

  const clone = sourceImage.cloneNode(true) as HTMLImageElement;
  const startSize = Math.min(sourceRect.width, sourceRect.height, 120);
  const startX = sourceRect.left + sourceRect.width / 2 - startSize / 2;
  const startY = sourceRect.top + sourceRect.height / 2 - startSize / 2;
  const endX = targetRect.left + targetRect.width / 2 - startSize / 2;
  const endY = targetRect.top + targetRect.height / 2 - startSize / 2;

  clone.removeAttribute("srcset");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${startSize}px`,
    height: `${startSize}px`,
    objectFit: "cover",
    borderRadius: "1rem",
    pointerEvents: "none",
    zIndex: "9999",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.22)",
    willChange: "transform, opacity",
  });

  document.body.appendChild(clone);

  try {
    await clone.animate(
      [
        { transform: "translate3d(0, 0, 0) scale(1)", opacity: 0.96 },
        {
          transform: `translate3d(${(endX - startX) * 0.58}px, ${
            (endY - startY) * 0.35
          }px, 0) scale(0.72)`,
          opacity: 0.9,
          offset: 0.6,
        },
        {
          transform: `translate3d(${endX - startX}px, ${
            endY - startY
          }px, 0) scale(0.24)`,
          opacity: 0,
        },
      ],
      {
        duration: FLY_DURATION_MS,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      }
    ).finished;
  } catch {
    // If the animation is interrupted, still let the cart action continue.
  } finally {
    clone.remove();
  }
}
