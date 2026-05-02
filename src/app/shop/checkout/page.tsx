"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createOrder,
  PaymentMethod,
  ShippingAddress,
} from "@/features/order/order.api";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/features/payment/payment.api";
import { clearCart } from "@/features/cart/cartSlice";
import { createOrder as addOrderToHistory } from "@/features/orders/ordersSlice";
import type {
  RazorpayFailureResponse,
  RazorpaySuccessResponse,
} from "@/types/razorpay";

type CheckoutStep = 1 | 2 | 3 | 4 | 5 | 6;
type UpMethod = "gpay" | "phonepe" | "paytm";
type CardDetails = {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

type CheckoutForm = {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

const paymentOptions: Array<{
  id: PaymentMethod;
  title: string;
  description: string;
}> = [
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Confirm instantly and pay when your package arrives.",
  },
  {
    id: "upi",
    title: "UPI / Razorpay",
    description: "Pay with GPay, PhonePe, Paytm, or any UPI app.",
  },
  {
    id: "credit_card",
    title: "Credit Card",
    description: "Secure Razorpay card checkout.",
  },
  {
    id: "debit_card",
    title: "Debit Card",
    description: "Pay with your bank debit card.",
  },
];

const upiOptions: Array<{ id: UpMethod; label: string }> = [
  { id: "gpay", label: "GPay" },
  { id: "phonepe", label: "PhonePe" },
  { id: "paytm", label: "Paytm" },
];

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<CheckoutStep>(1);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [upiMethod, setUpiMethod] = useState<UpMethod | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardholderName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>();

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );
  const tax = useMemo(() => Math.round(subtotal * 0.1), [subtotal]);
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + tax + shipping;

  const stepLabels = useMemo(
    () => ["Cart", "Address", "Method", "Details", "Confirm", "Success"],
    []
  );

  const validatePaymentDetails = useCallback(() => {
    if (paymentMethod === "cod") return true;
    if (paymentMethod === "upi") return Boolean(upiMethod);

    const digits = cardDetails.cardNumber.replace(/\s/g, "");
    return (
      cardDetails.cardholderName.trim().length >= 2 &&
      digits.length >= 12 &&
      /^\d{2}\/\d{2}$/.test(cardDetails.expiry) &&
      /^\d{3,4}$/.test(cardDetails.cvv)
    );
  }, [cardDetails, paymentMethod, upiMethod]);

  const onAddressSubmit = useCallback((data: CheckoutForm) => {
    setShippingAddress({
      address: `${data.fullName}, ${data.address}`,
      city: data.city,
      pincode: data.postalCode,
      country: data.country,
    });
    setError(null);
    setStep(3);
  }, []);

  const continueToPaymentDetails = useCallback(() => {
    if (!paymentMethod) {
      setError("Select a payment method before continuing.");
      return;
    }

    setError(null);
    setStep(4);
  }, [paymentMethod]);

  const continueToConfirm = useCallback(() => {
    if (!validatePaymentDetails()) {
      setError("Complete payment details before reviewing your order.");
      return;
    }

    setError(null);
    setStep(5);
  }, [validatePaymentDetails]);

  const verifyRazorpay = useCallback(
    async (
      orderId: string,
      razorpayResponse: RazorpaySuccessResponse
    ): Promise<void> => {
      await verifyRazorpayPayment({
        orderId,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      });
    },
    []
  );

  const openRazorpay = useCallback(
    async (orderId: string): Promise<void> => {
      const ready = await loadRazorpayScript();
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!ready || !window.Razorpay || !key) {
        throw new Error("Razorpay checkout is not available");
      }

      const RazorpayCheckout = window.Razorpay;
      const razorpayOrder = await createRazorpayOrder(orderId);

      await new Promise<void>((resolve, reject) => {
        const checkout = new RazorpayCheckout({
          key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Vasanth Trends",
          description: "Secure checkout",
          order_id: razorpayOrder.id,
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          method: {
            upi: paymentMethod === "upi",
            card:
              paymentMethod === "credit_card" || paymentMethod === "debit_card",
            netbanking: false,
            wallet: paymentMethod === "upi",
          },
          handler: (response) => {
            verifyRazorpay(orderId, response).then(resolve).catch(reject);
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
          theme: {
            color: "#ff6700",
          },
        });

        checkout.on("payment.failed", (response: RazorpayFailureResponse) => {
          reject(new Error(response.error.description));
        });

        checkout.open();
      });
    },
    [paymentMethod, user, verifyRazorpay]
  );

  const handleCheckout = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/login?next=/shop/checkout");
      return;
    }

    if (!shippingAddress || !paymentMethod || !validatePaymentDetails()) {
      setError("Complete every checkout step before placing your order.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const order = await createOrder(
        items,
        total,
        shippingAddress,
        paymentMethod,
        user?.id
      );

      if (paymentMethod !== "cod") {
        await openRazorpay(order.id);
      }

      dispatch(addOrderToHistory(order));
      dispatch(clearCart());
      setSuccess(true);
      setStep(6);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }, [
    dispatch,
    isAuthenticated,
    items,
    openRazorpay,
    paymentMethod,
    router,
    shippingAddress,
    total,
    user,
    validatePaymentDetails,
  ]);

  if (!items.length && !success) {
    return (
      <div className="min-h-screen bg-white px-4 py-16 text-center">
        <div className="mx-auto max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(37,99,235,0.12)] backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-[#111111]">Cart is empty</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Add products before starting checkout.
          </p>
          <button
            onClick={() => router.push("/shop/products")}
            className="mt-6 rounded-2xl bg-[#ff6700] px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white px-4 py-16 text-center">
        <div className="mx-auto max-w-lg rounded-3xl border border-emerald-100 bg-white/85 p-10 shadow-[0_24px_80px_rgba(16,185,129,0.16)] backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl font-bold text-white">
            ✓
          </div>
          <h2 className="mt-5 text-3xl font-bold text-[#111111]">
            Order placed successfully
          </h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Your order is confirmed and ready to track.
          </p>
          <button
            onClick={() => router.push("/shop/orders")}
            className="mt-7 rounded-2xl bg-[#ff6700] px-7 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold text-[#0f172a]">Checkout</h1>

          <div className="mt-6 grid grid-cols-3 gap-2 text-xs font-semibold text-[#64748b] sm:grid-cols-6">
            {stepLabels.map((label, index) => {
              const active = step >= index + 1;
              return (
                <div
                  key={label}
                  className={`rounded-2xl px-3 py-2 text-center transition ${
                    active
                      ? "bg-[#ff6700] text-white shadow-sm"
                      : "bg-white text-slate-600"
                  }`}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="mt-7 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-[#0f172a]">
                      {item.title}
                    </p>
                    <p className="text-sm text-[#64748b]">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-[#0f172a]">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <button
                onClick={() => setStep(2)}
                className="mt-4 rounded-2xl bg-[#ff6700] px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95"
              >
                Continue to Address
              </button>
            </div>
          )}

          {step === 2 && (
            <form
              onSubmit={handleSubmit(onAddressSubmit)}
              className="mt-7 grid gap-4 md:grid-cols-2"
            >
              <input
                className="input-base md:col-span-2"
                placeholder="Full name"
                {...register("fullName", { required: "Name is required" })}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 md:col-span-2">
                  {errors.fullName.message}
                </p>
              )}
              <input
                className="input-base md:col-span-2"
                placeholder="House, street, area"
                {...register("address", { required: "Address is required" })}
              />
              <input
                className="input-base"
                placeholder="City"
                {...register("city", { required: "City is required" })}
              />
              <input
                className="input-base"
                placeholder="Postal code"
                {...register("postalCode", {
                  required: "Postal code is required",
                })}
              />
              <input
                className="input-base md:col-span-2"
                placeholder="Country"
                defaultValue="India"
                {...register("country", { required: "Country is required" })}
              />
              <button className="rounded-2xl bg-[#ff6700] px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95 md:col-span-2">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="mt-7 grid gap-3 md:grid-cols-2">
              {paymentOptions.map((option) => {
                const selected = paymentMethod === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      setPaymentMethod(option.id);
                      setError(null);
                    }}
                    className={`rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] ${
                      selected
                        ? "border-[#ff6700] bg-orange-50 shadow-sm"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="font-bold text-[#0f172a]">{option.title}</p>
                    <p className="mt-1 text-sm text-[#64748b]">
                      {option.description}
                    </p>
                  </button>
                );
              })}
              <button
                onClick={continueToPaymentDetails}
                className="rounded-2xl bg-[#ff6700] px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95 md:col-span-2"
              >
                Continue to Details
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="mt-7 space-y-5">
              {paymentMethod === "cod" && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-bold text-emerald-900">
                    Cash on Delivery selected
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    No online payment is required. Confirm the order on the next
                    step.
                  </p>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="grid gap-3 md:grid-cols-3">
                  {upiOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setUpiMethod(option.id);
                        setError(null);
                      }}
                      className={`rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] ${
                        upiMethod === option.id
                          ? "border-[#ff6700] bg-orange-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span
                        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6700] text-sm font-black text-white"
                      >
                        {option.label.slice(0, 2)}
                      </span>
                      <p className="font-bold text-[#0f172a]">
                        {option.label}
                      </p>
                      <p className="mt-1 text-xs text-[#64748b]">
                        Opens Razorpay UPI checkout.
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {(paymentMethod === "credit_card" ||
                paymentMethod === "debit_card") && (
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="input-base md:col-span-2"
                    placeholder="Cardholder name"
                    value={cardDetails.cardholderName}
                    onChange={(event) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        cardholderName: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="input-base md:col-span-2"
                    inputMode="numeric"
                    placeholder="Card number"
                    value={cardDetails.cardNumber}
                    onChange={(event) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        cardNumber: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="input-base"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(event) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        expiry: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="input-base"
                    inputMode="numeric"
                    placeholder="CVV"
                    value={cardDetails.cvv}
                    onChange={(event) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        cvv: event.target.value,
                      }))
                    }
                  />
                </div>
              )}

              <button
                onClick={continueToConfirm}
                className="rounded-2xl bg-[#ff6700] px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95"
              >
                Review Order
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="mt-7 space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#64748b]">
                  Ship to
                </p>
                <p className="mt-2 font-semibold text-[#0f172a]">
                  {shippingAddress?.address}
                </p>
                <p className="text-sm text-[#64748b]">
                  {shippingAddress?.city}, {shippingAddress?.pincode},{" "}
                  {shippingAddress?.country}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#64748b]">
                  Payment
                </p>
                <p className="mt-2 font-semibold text-[#0f172a]">
                  {
                    paymentOptions.find((option) => option.id === paymentMethod)
                      ?.title
                  }
                </p>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full rounded-2xl bg-[#ff6700] py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Processing securely..." : "Place Secure Order"}
              </button>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <h2 className="text-lg font-bold text-[#0f172a]">Order Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-[#64748b]">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#64748b]">
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#64748b]">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between text-xl font-bold text-[#0f172a]">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
