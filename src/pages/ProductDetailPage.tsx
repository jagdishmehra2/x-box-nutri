import { type FormEvent, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch } from "../hooks/useRedux";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { Loader } from "../components/common/Loader";
import { ProductImageCarousel } from "../components/product/ProductImageCarousel";
import { addToCart } from "../features/cart/cartSlice";
import { getProductBySlug } from "../services/productService";
import {
  addProductReview,
  getProductReviews,
  getReviewEligibility,
} from "../services/reviewService";
import type { Product } from "../types/product";
import { formatCurrency } from "../utils/currency";
import { setDocumentMeta } from "../utils/seo";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

const ProductDetailPage = () => {
  const { id = "" } = useParams();
  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewReason, setReviewReason] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setIsLoadingProduct(true);
      setProductError("");

      try {
        const selectedProduct = await getProductBySlug(id);

        if (!isMounted) return;

        setProduct(selectedProduct);

        if (!selectedProduct) {
          setDocumentMeta({
            title: "Product Not Found | NutriStack",
            description: "The product you are looking for could not be found.",
          });
          return;
        }

        setDocumentMeta({
          title: `${selectedProduct.name} | NutriStack`,
          description: selectedProduct.shortDescription,
        });
      } catch (error) {
        if (!isMounted) return;

        setProduct(null);
        setProductError(
          error instanceof Error
            ? error.message
            : "Unable to load this product.",
        );
      } finally {
        if (isMounted) setIsLoadingProduct(false);
      }
    };

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!product?.id) return;

    let isMounted = true;

    const loadReviewData = async () => {
      try {
        const [productReviews, eligibility] = await Promise.all([
          getProductReviews(product.id),
          getReviewEligibility(product.id),
        ]);

        if (!isMounted) return;

        const visibleReviews = productReviews.reviews;
        const existingReview = eligibility.existingReview;

        setReviews(
          existingReview &&
            !visibleReviews.some((review) => review.id === existingReview.id)
            ? [existingReview, ...visibleReviews]
            : visibleReviews,
        );
        setCanReview(eligibility.canReview);
        setReviewReason(eligibility.reason);
      } catch (error) {
        console.error("Unable to load reviews:", error);
      }
    };

    void loadReviewData();

    return () => {
      isMounted = false;
    };
  }, [product?.id]);

  if (isLoadingProduct) return <Loader />;

  if (productError) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <EmptyState title="Unable to load product" description={productError} />
      </section>
    );
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-white">Product not found</h1>
        <p className="mt-2 text-zinc-400">
          The product may have been removed or renamed.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block text-lime-400 hover:text-lime-300"
        >
          Go back to products
        </Link>
      </section>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart`);
  };
  const formatReviewCount = (count: number) => {
    if (count < 1000) return String(count);

    const formattedCount = count / 1000;

    return Number.isInteger(formattedCount)
      ? `${formattedCount}k`
      : `${formattedCount.toFixed(1)}k`;
  };
  const handleSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reviewComment.trim()) {
      toast.error("Please write your review.");
      return;
    }

    try {
      setIsSubmittingReview(true);

      const submittedReview = await addProductReview({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      toast.success("Review submitted successfully");

      setReviewComment("");
      setReviewRating(5);
      setCanReview(false);
      setReviewReason("You have already reviewed this product.");
      setReviews((currentReviews) => [submittedReview, ...currentReviews]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit review.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };
  const reviewCount = reviews.length;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) /
        reviewCount
      : 0;

  const displayRating = averageRating.toFixed(1);
  const displayReviewCount = formatReviewCount(reviewCount);
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductImageCarousel
          key={product.id}
          imageUrls={product.images}
          fallbackImage={product.image}
          productName={product.name}
        />

        <article>
          <p className="text-sm uppercase tracking-wide text-lime-400">
            {product.category.replace("-", " ")}
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
            <Star
              className={`h-4 w-4 ${
                reviewCount > 0
                  ? "fill-lime-300 text-lime-300"
                  : "fill-zinc-800 text-zinc-700"
              }`}
            />

            <span>
              {reviewCount > 0
                ? `${displayRating} (${displayReviewCount} reviews)`
                : "No reviews yet"}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="mb-3 text-lg font-semibold text-white">
              Product Details
            </h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {product.brand && (
                <>
                  <span className="text-zinc-500">Brand</span>

                  <span className="text-white">{product.brand}</span>
                </>
              )}

              {product.subtype && (
                <>
                  <span className="text-zinc-500">Type</span>

                  <span className="text-white">{product.subtype}</span>
                </>
              )}

              {product.flavor && (
                <>
                  <span className="text-zinc-500">Flavor</span>

                  <span className="text-white">{product.flavor}</span>
                </>
              )}

              {product.weight && (
                <>
                  <span className="text-zinc-500">Weight</span>

                  <span className="text-white">{product.weight}</span>
                </>
              )}
              {product.description && (
                <>
                  <span className="text-zinc-500">Description</span>

                  <span className="text-white">{product.description}</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-6">
            {product.discountPrice ? (
              <>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-semibold text-lime-400">
                    {formatCurrency(product.discountPrice)}
                  </p>

                  <p className="text-lg text-zinc-500 line-through">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <p className="mt-1 text-sm font-medium text-green-400">
                  {Math.round(
                    ((product.price - product.discountPrice) / product.price) *
                      100,
                  )}
                  % OFF
                </p>
              </>
            ) : (
              <p className="text-3xl font-semibold text-lime-400">
                {formatCurrency(product.price)}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              aria-label={`Add ${product.name} to cart`}
            >
              {product.inStock ? "Add To Cart" : "Out of Stock"}
            </Button>
            <Link to="/cart">
              <Button size="lg" variant="secondary">
                Go To Cart
              </Button>
            </Link>
          </div>
        </article>
      </div>

      <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="text-2xl font-semibold text-white">Customer Reviews</h2>

        {canReview ? (
          <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-300">Rating:</span>

              <div
                className="flex gap-1"
                role="radiogroup"
                aria-label="Review rating"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewRating(rating)}
                    className="rounded p-1 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    aria-label={`${rating} star${rating > 1 ? "s" : ""}`}
                    aria-pressed={reviewRating === rating}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating <= reviewRating
                          ? "fill-lime-400 text-lime-400"
                          : "fill-zinc-800 text-zinc-600"
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              required
              minLength={10}
              placeholder="Write your review..."
              className="min-h-28 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white placeholder:text-zinc-500"
            />

            <Button type="submit" disabled={isSubmittingReview}>
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-zinc-400">{reviewReason}</p>
        )}

        <div className="mt-8 max-h-[420px] space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          {reviews.length ? (
            reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">
                    {review.customer_name}
                  </p>

                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < review.rating
                            ? "fill-lime-400 text-lime-400"
                            : "text-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  {review.comment}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No reviews yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductDetailPage;
