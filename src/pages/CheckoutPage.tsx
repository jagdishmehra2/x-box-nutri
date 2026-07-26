import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { PaymentLoadingOverlay } from "../components/checkout/PaymentLoadingOverlay";
import { clearCart } from "../features/cart/cartSlice";
import { supabase } from "../lib/supabase";
import {
  createRazorpayOrder,
  openRazorpayCheckout,
  reportRazorpayPaymentFailure,
  verifyRazorpayPayment,
} from "../services/razorpay";
import { formatCurrency } from "../utils/currency";
import {
  calculateDeliveryCharge,
  isCashOnDeliveryAvailableForPincode,
} from "../utils/deliveryCharge";
import { setDocumentMeta } from "../utils/seo";
import { DeliveryAddressForm, type DeliveryAddress } from "src/pages/Address";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const items = useAppSelector((state) => state.cart.items);
  const user = useAppSelector((state) => state.auth.user);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(
    null,
  );
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddress, setSelectedAddress] =
    useState<DeliveryAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(
    "online",
  );
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccessRedirect, setPaymentSuccessRedirect] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(10);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const paymentAttemptInFlightRef = useRef(false);
  const paymentInteractionLocked = paymentLoading || paymentSuccessRedirect;
  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        (item.product.discountPrice ?? item.product.price) * item.quantity,
      0,
    );
  }, [items]);
  const totalMrp = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  }, [items]);

  const totalSavings = totalMrp - subtotal;
  const deliveryCharge = useMemo(() => {
    if (!selectedAddress) return null;

    return calculateDeliveryCharge(
      selectedAddress.pincode,
      items.map((item) => ({
        weight: item.product.weight,
        quantity: item.quantity,
      })),
    );
  }, [items, selectedAddress]);
  const isCashOnDeliveryAvailable = useMemo(() => {
    if (!selectedAddress) return false;

    return isCashOnDeliveryAvailableForPincode(selectedAddress.pincode);
  }, [selectedAddress]);
  const isCashOnDeliveryUnavailable =
    selectedAddress !== null && !isCashOnDeliveryAvailable;
  const finalTotal = subtotal + (deliveryCharge ?? 0);
  useEffect(() => {
    const loadAddress = async () => {
      if (!user?.id || !supabase) {
        setIsLoadingAddress(false);
        return;
      }

      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddress(data[0]);
        }
      }

      setIsLoadingAddress(false);
    };

    loadAddress();
  }, [user]);
  useEffect(() => {
    setDocumentMeta({
      title: "Checkout | NutriStack",
      description: "Complete your payment securely with Razorpay Checkout.",
    });
  }, []);
  useEffect(() => {
    if (!paymentSuccessRedirect) return;

    const timer = window.setInterval(() => {
      setRedirectCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [paymentSuccessRedirect]);
  useEffect(() => {
    if (paymentSuccessRedirect && redirectCountdown === 0) {
      navigate("/orders", { replace: true });
    }
  }, [navigate, paymentSuccessRedirect, redirectCountdown]);
  useEffect(() => {
    if (!paymentInteractionLocked) return;

    const previousOverflow = document.body.style.overflow;
    const preventLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("beforeunload", preventLeaving);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("beforeunload", preventLeaving);
    };
  }, [paymentInteractionLocked]);
  useEffect(() => {
    if (paymentMethod === "cod" && isCashOnDeliveryUnavailable) {
      setPaymentMethod("online");
    }
  }, [isCashOnDeliveryUnavailable, paymentMethod]);
  const handleDeleteAddress = async (id: string) => {
    if (!supabase) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?",
    );

    if (!confirmed) return;

    const { error } = await supabase.from("addresses").delete().eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    const updatedAddresses = addresses.filter((address) => address.id !== id);

    setAddresses(updatedAddresses);

    if (selectedAddress?.id === id) {
      setSelectedAddress(updatedAddresses.length ? updatedAddresses[0] : null);
    }

    toast.success("Address deleted successfully.");
  };
  const saveOrderInSupabase = async () => {
    if (!supabase) {
      throw new Error("Something Went Wrong");
    }

    if (!user?.id) {
      throw new Error("You must be logged in to place an order.");
    }

    if (!selectedAddress) {
      throw new Error("Please select a delivery address.");
    }

    if (deliveryCharge === null) {
      throw new Error("Delivery charge is unavailable for a cart product.");
    }

    if (!isCashOnDeliveryAvailable) {
      throw new Error("Cash on delivery is not available for your order.");
    }

    const deliveryEstimate =
      selectedAddress.pincode === "262308"
        ? "Same Day Delivery"
        : "2-3 Business Days";

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: finalTotal,
        shipping_charge: deliveryCharge,
        payment_method: "cod",
        payment_status: "pending",
        order_status: "confirmed",
        shipping_name: selectedAddress.full_name,
        shipping_phone: selectedAddress.phone,
        shipping_address: selectedAddress.address,
        shipping_landmark: selectedAddress.landmark,
        shipping_city: selectedAddress.city,
        shipping_state: selectedAddress.state,
        shipping_pincode: selectedAddress.pincode,
        address_id: selectedAddress.id,
        delivery_estimate: deliveryEstimate,
      })
      .select("id, created_at")
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? "Unable to create order.");
    }

    const orderItemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_image: item.product.image,
      product_brand: item.product.brand,
      product_category: item.product.category,
      product_subtype: item.product.subtype,
      product_flavor: item.product.flavor,
      product_weight: item.product.weight,
      unit_price: item.product.discountPrice ?? item.product.price,
      quantity: item.quantity,
      mrp: item.product.price,
      total_price:
        (item.product.discountPrice ?? item.product.price) * item.quantity,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (orderItemsError) {
      throw new Error(orderItemsError.message);
    }

    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      user_id: user.id,
      amount: finalTotal,
      payment_method: "cod",
      payment_status: "pending",
    });

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    return order;
  };
  const handlePayNow = async () => {
    if (paymentAttemptInFlightRef.current) return;

    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!user?.id) {
      toast.error("Please login before checkout.");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    if (deliveryCharge === null) {
      toast.error("Delivery charge is unavailable for a cart product.");
      return;
    }

    if (paymentMethod === "cod" && !isCashOnDeliveryAvailable) {
      toast.error("Cash on delivery is not available for your order.");
      return;
    }

    paymentAttemptInFlightRef.current = true;

    if (paymentMethod === "cod") {
      try {
        setIsProcessingPayment(true);

        const savedOrder = await saveOrderInSupabase();

        dispatch(clearCart());

        toast.success("Order placed successfully.");

        navigate("/order-success", {
          replace: true,
          state: {
            orderId: savedOrder.id,
            amount: finalTotal,
            paymentMethod: "Cash on Delivery",
            createdAt: savedOrder.created_at,
          },
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to place order.",
        );
      } finally {
        setIsProcessingPayment(false);
        paymentAttemptInFlightRef.current = false;
      }

      return;
    }

    setIsProcessingPayment(true);
    setPaymentLoading(true);

    try {
      const paymentOrder = await createRazorpayOrder({
        addressId: selectedAddress.id,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });
      let paymentResultHandled = false;

      const markPaymentFailed = async (failureReason: string) => {
        if (paymentResultHandled) return;
        paymentResultHandled = true;
        setPaymentLoading(false);

        try {
          await reportRazorpayPaymentFailure({
            local_order_id: paymentOrder.localOrderId,
            razorpay_order_id: paymentOrder.razorpayOrderId,
            payment_failed: true,
            failure_reason: failureReason,
          });

          toast.error("Payment failed. Please try again.");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to update failed payment.",
          );
        } finally {
          setIsProcessingPayment(false);
          paymentAttemptInFlightRef.current = false;
        }
      };

      await openRazorpayCheckout({
        key: paymentOrder.keyId,
        orderId: paymentOrder.razorpayOrderId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "NutriStack",
        description: `Payment for ${items.length} item${items.length > 1 ? "s" : ""}`,

        prefill: {
          email: user.email,
        },

        notes: {
          app: "NutriStack",
          user_id: user.id,
        },

        onDismiss: () => {
          void markPaymentFailed("Payment cancelled by user.");
        },

        onFailure: (response) => {
          void markPaymentFailed(
            response.error?.description ??
              response.error?.reason ??
              "Payment failed in Razorpay Checkout.",
          );
        },

        onSuccess: async (paymentResponse) => {
          paymentResultHandled = true;

          try {
            await verifyRazorpayPayment({
              ...paymentResponse,
              local_order_id: paymentOrder.localOrderId,
            });

            setRedirectCountdown(10);
            setPaymentLoading(false);
            setPaymentSuccessRedirect(true);
            dispatch(clearCart());

            toast.success("Payment successful.");
          } catch (error) {
            setPaymentLoading(false);
            toast.error(
              error instanceof Error
                ? error.message
                : "Payment verification failed.",
            );
          } finally {
            setIsProcessingPayment(false);
            paymentAttemptInFlightRef.current = false;
          }
        },
      });
    } catch (error) {
      setPaymentLoading(false);
      toast.error(
        error instanceof Error ? error.message : "Unable to open Razorpay.",
      );

      setIsProcessingPayment(false);
      paymentAttemptInFlightRef.current = false;
    }
  };
  if (!items.length && !paymentSuccessRedirect) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <EmptyState
          title="No items to checkout"
          description="Add products to your cart before entering checkout."
          actionLabel="Go to Products"
          onAction={() => navigate("/products")}
        />
      </section>
    );
  }
  return (
    <>
      {paymentLoading && <PaymentLoadingOverlay mode="opening" />}
      {paymentSuccessRedirect && (
        <PaymentLoadingOverlay
          mode="success"
          countdown={redirectCountdown}
        />
      )}
      <section
        className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"
        inert={paymentInteractionLocked}
        aria-hidden={paymentInteractionLocked}
      >
      <header>
        <h1 className="text-4xl font-semibold text-white">Checkout</h1>
        <p className="mt-2 text-zinc-400">
          Complete your payment after successful payment, your order will be
          shipped.
        </p>
      </header>
      {!isLoadingAddress && user && (editingAddress || showAddAddressForm) && (
        <DeliveryAddressForm
          userId={user.id}
          initialAddress={editingAddress}
          onCancelEdit={() => {
            setEditingAddress(null);
            setShowAddAddressForm(false);
          }}
          onAddressSaved={(savedAddress) => {
            if (editingAddress) {
              setAddresses((prev) =>
                prev.map((address) =>
                  address.id === savedAddress.id ? savedAddress : address,
                ),
              );
            } else {
              setAddresses((prev) => [savedAddress, ...prev]);
            }

            setSelectedAddress(savedAddress);
            setEditingAddress(null);
            setShowAddAddressForm(false);
          }}
        />
      )}

      {!editingAddress && !showAddAddressForm && addresses.length === 3 && (
        <div className="mt-5 rounded-xl border border-yellow-700 bg-yellow-500/10 p-4 text-sm text-yellow-300">
          You can save a maximum of 3 delivery addresses. Delete one to add
          another.
        </div>
      )}

      {!editingAddress && !showAddAddressForm && (
        <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold text-white">Delivery Address</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {addresses.map((address) => {
              const active = selectedAddress?.id === address.id;
              return (
                <div
                  key={address.id}
                  onClick={() => setSelectedAddress(address)}
                  className={`relative cursor-pointer rounded-xl border p-4 transition ${
                    active
                      ? "border-lime-400 bg-lime-400/10"
                      : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                  }`}
                >
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAddress(address);
                      }}
                    >
                      {active && <Pencil className="h-4 w-4" />}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="cursor-pointer text-red-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                    >
                      {active && <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="font-semibold text-white">
                    {address.full_name}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">{address.phone}</p>
                  <p className="mt-3 text-sm text-zinc-300">
                    {address.address}
                  </p>
                  {address.landmark && (
                    <p className="text-sm text-zinc-400">{address.landmark}</p>
                  )}
                  <p className="mt-2 text-sm text-zinc-400">
                    {address.city}, {address.state}
                  </p>
                  <p className="text-sm text-zinc-400">{address.pincode}</p>
                  {active && (
                    <div className="mt-3 rounded-lg bg-lime-400/10 px-3 py-2">
                      {deliveryCharge === null ? (
                        <p className="text-sm font-medium text-red-400">
                          Delivery charge unavailable
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-lime-400">
                          Delivery charge: {formatCurrency(deliveryCharge)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {addresses.length < 3 && (
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddAddressForm(true);
                }}
                className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900 transition hover:border-lime-400 hover:bg-zinc-800"
              >
                <Plus className="mb-3 h-10 w-10 text-lime-400" />

                <p className="font-semibold text-white">Add Address</p>

                <p className="mt-1 text-sm text-zinc-500">
                  Add another delivery address
                </p>
              </button>
            )}
          </div>
        </article>
      )}
      {!editingAddress && (
        <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold text-white">Payment Method</h2>

          <div className="mt-5 space-y-3">
            <label
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                paymentMethod === "online"
                  ? "border-lime-400 bg-lime-400/10"
                  : "border-zinc-800"
              }`}
            >
              <div>
                <p className="font-medium text-white">Pay Online</p>

                <p className="text-sm text-zinc-400">
                  Secure payment via Razorpay
                </p>
              </div>

              <input
                type="radio"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
            </label>

            <label
              aria-disabled={isCashOnDeliveryUnavailable}
              className={`flex items-center justify-between rounded-xl border p-4 transition ${
                isCashOnDeliveryUnavailable
                  ? "cursor-not-allowed border-zinc-800 bg-zinc-950/60 opacity-70"
                  : paymentMethod === "cod"
                    ? "border-lime-400 bg-lime-400/10"
                    : "cursor-pointer border-zinc-800"
              }`}
            >
              <div>
                <p className="font-medium text-white">Cash on Delivery</p>

                {isCashOnDeliveryUnavailable ? (
                  <p className="text-sm text-red-400">
                    Cash on delivery is not available for your order.
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400">
                    Pay when your order arrives.
                  </p>
                )}
              </div>

              <input
                type="radio"
                checked={paymentMethod === "cod"}
                disabled={isCashOnDeliveryUnavailable}
                onChange={() => {
                  if (!isCashOnDeliveryUnavailable) {
                    setPaymentMethod("cod");
                  }
                }}
              />
            </label>
          </div>
        </article>
      )}

      {!editingAddress && !showAddAddressForm && (
        <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold text-white">Order Summary</h2>

          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const mrp = item.product.price;
              const sellingPrice =
                item.product.discountPrice ?? item.product.price;

              return (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3 text-sm"
                >
                  <p className="text-zinc-300">
                    {item.product.name}{" "}
                    <span className="text-zinc-500">x {item.quantity}</span>
                  </p>

                  <div className="text-right">
                    {item.product.discountPrice ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-zinc-500 line-through">
                          {formatCurrency(mrp * item.quantity)}
                        </span>

                        <span className="font-medium text-lime-400">
                          {formatCurrency(sellingPrice * item.quantity)}
                        </span>
                      </div>
                    ) : (
                      <p className="font-medium text-zinc-100">
                        {formatCurrency(mrp * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-green-400">
            <p>You Save</p>
            <p>{formatCurrency(totalSavings)}</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-zinc-300">
            <p>Delivery charge</p>
            <p>
              {selectedAddress
                ? deliveryCharge === null
                  ? "Unavailable"
                  : formatCurrency(deliveryCharge)
                : "Select an address"}
            </p>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
            <p className="text-sm text-zinc-400">Total</p>
            <p className="text-3xl font-bold text-lime-400">
              {formatCurrency(finalTotal)}
            </p>
          </div>

          {selectedAddress ? (
            <Button
              className="mt-6 w-full"
              size="lg"
              onClick={handlePayNow}
              disabled={
                isProcessingPayment ||
                deliveryCharge === null ||
                (paymentMethod === "cod" && !isCashOnDeliveryAvailable)
              }
              aria-label="Pay now using Razorpay"
            >
              {isProcessingPayment
                ? "Processing..."
                : paymentMethod === "cod"
                  ? "Confirm Your Order"
                  : "Pay Now"}
            </Button>
          ) : (
            <Button className="mt-6 w-full" size="lg" disabled>
              Select a Delivery Address
            </Button>
          )}
        </article>
      )}
      </section>
    </>
  );
};

export default CheckoutPage;
