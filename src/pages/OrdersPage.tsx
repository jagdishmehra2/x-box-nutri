import { useCallback, useEffect, useRef, useState } from "react";
import { Package, Calendar, CreditCard, Truck } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";
import { Loader } from "../components/common/Loader";
import { useAppSelector } from "../hooks/useRedux";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { getOrders, type Order } from "../services/orderService";
import { formatCurrency } from "../utils/currency";
import { setDocumentMeta } from "../utils/seo";

const ORDERS_PER_PAGE = 5;

const OrdersPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreOrders, setHasMoreOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const loadMoreRequestRef = useRef(0);

  useEffect(() => {
    setDocumentMeta({
      title: "Orders | X-Box Nutrition",
      description:
        "Track your previous and current X-Box Nutrition orders.",
    });
  }, []);

  const loadMoreOrders = useCallback(async () => {
    if (!user?.id || isLoadingMore || !hasMoreOrders) return;

    const requestId = ++loadMoreRequestRef.current;

    try {
      setIsLoadingMore(true);
      setLoadMoreError("");

      const nextPage = await getOrders({
        userId: user.id,
        offset: orders.length,
        limit: ORDERS_PER_PAGE,
      });

      if (requestId !== loadMoreRequestRef.current) return;

      setOrders((currentOrders) => [...currentOrders, ...nextPage.orders]);
      setHasMoreOrders(nextPage.hasMore);
    } catch (error) {
      if (requestId !== loadMoreRequestRef.current) return;

      setLoadMoreError(
        error instanceof Error ? error.message : "Unable to load more orders.",
      );
      setHasMoreOrders(false);
    } finally {
      if (requestId === loadMoreRequestRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [hasMoreOrders, isLoadingMore, orders.length, user?.id]);

  const infiniteScrollRef = useInfiniteScroll({
    hasMore: hasMoreOrders,
    isLoading: isLoadingMore,
    onLoadMore: loadMoreOrders,
  });

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      if (!user?.id) {
        if (isMounted) setLoading(false);
        return;
      }

      loadMoreRequestRef.current += 1;
      setLoading(true);
      setOrders([]);
      setHasMoreOrders(false);
      setLoadMoreError("");

      try {
        const firstPage = await getOrders({
          userId: user.id,
          offset: 0,
          limit: ORDERS_PER_PAGE,
        });

        if (!isMounted) return;

        setOrders(firstPage.orders);
        setHasMoreOrders(firstPage.hasMore);
        setOrdersError("");
      } catch (error) {
        if (!isMounted) return;

        setOrdersError(
          error instanceof Error ? error.message : "Unable to load orders.",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
      loadMoreRequestRef.current += 1;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center">
        <Loader />
      </section>
    );
  }

  if (ordersError && !orders.length) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10">
        <EmptyState title="Unable to load orders" description={ordersError} />
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10">
        <EmptyState
          title="No Orders Yet"
          description="Looks like you haven't placed any orders."
        />
      </section>
    );
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400";

      case "pending":
        return "bg-yellow-500/20 text-yellow-400";

      default:
        return "bg-red-500/20 text-red-400";
    }
  };

  const getOrderBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500/20 text-blue-400";

      case "processing":
        return "bg-yellow-500/20 text-yellow-400";

      case "shipped":
        return "bg-purple-500/20 text-purple-400";

      case "delivered":
        return "bg-green-500/20 text-green-400";

      case "cancelled":
        return "bg-red-500/20 text-red-400";

      default:
        return "bg-zinc-700 text-white";
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8 text-lime-400" />

        <div>
          <h1 className="text-4xl font-bold text-white">
            My Orders
          </h1>

          <p className="mt-1 text-zinc-400">
            View your order history and track current orders.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {orders.map((order) => (
  <article
    key={order.id}
    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
  >
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-lg font-semibold text-white">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getOrderBadge(
              order.order_status,
            )}`}
          >
            {order.order_status}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentBadge(
              order.payment_status,
            )}`}
          >
            {order.payment_status}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />

            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />

            {order.payment_method === "online"
              ? "Paid Online"
              : "Cash on Delivery"}
          </div>

          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />

            {order.delivery_estimate}
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm text-zinc-400">Total Amount</p>

        <p className="text-2xl font-bold text-lime-400">
          {formatCurrency(order.total_amount)}
        </p>
      </div>
    </div>

    <div className="mt-6 border-t border-zinc-800 pt-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Products
      </h3>

      <div className="space-y-4">
        {order.order_items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <img
              src={item.product_image}
              alt={item.product_name}
              className="h-24 w-24 rounded-lg object-cover"
            />

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h4 className="font-semibold text-white">
                  {item.product_name}
                </h4>

                <p className="mt-1 text-sm text-zinc-400">
                  {item.product_brand}
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  {[
                    item.product_category,
                    item.product_subtype,
                    item.product_flavor,
                    item.product_weight,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-zinc-400">
                  Qty :
                  <span className="ml-1 font-semibold text-white">
                    {item.quantity}
                  </span>
                </p>

                <div className="text-right">
                  <p className="text-sm text-zinc-500">
                    {formatCurrency(item.unit_price)} ×{" "}
                    {item.quantity}
                  </p>

                  <p className="font-semibold text-lime-400">
                    {formatCurrency(item.total_price)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-6 border-t border-zinc-800 pt-6">
      <h3 className="text-lg font-semibold text-white">
        Delivery Address
      </h3>

      <div className="mt-3 space-y-1 text-sm text-zinc-400">
        <p className="font-medium text-white">
          {order.shipping_name}
        </p>

        <p>{order.shipping_phone}</p>

        <p>{order.shipping_address}</p>

        <p>
          {order.shipping_city}, {order.shipping_state}
        </p>

        <p>{order.shipping_pincode}</p>
      </div>
    </div>
  </article>
))}

        {hasMoreOrders && (
          <div
            ref={infiniteScrollRef}
            className="flex h-20 items-center justify-center"
            aria-hidden={!isLoadingMore}
          >
            {isLoadingMore && (
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-lime-400"
                role="status"
                aria-label="Loading more orders"
              />
            )}
          </div>
        )}

        {loadMoreError && (
          <p className="text-center text-sm text-red-400">{loadMoreError}</p>
        )}
      </div>
    </section>
  );
};

export default OrdersPage;
