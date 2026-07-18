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

const formatDescriptionParagraphs = (description: string) => {
  const explicitParagraphs = description
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (explicitParagraphs.length > 1) return explicitParagraphs;

  const normalizedDescription = description.replace(/\s+/g, " ").trim();
  const sentences =
    normalizedDescription.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [];
  const cleanSentences = sentences
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (cleanSentences.length <= 2) return normalizedDescription ? [normalizedDescription] : [];

  const paragraphs: string[] = [];

  for (let index = 0; index < cleanSentences.length; index += 2) {
    paragraphs.push(cleanSentences.slice(index, index + 2).join(" "));
  }

  return paragraphs;
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
  const descriptionParagraphs = formatDescriptionParagraphs(product.description);
  return (
    <section className="mx-auto w-full max-w-[100vw] overflow-hidden px-3 py-5 sm:px-6 sm:py-10 lg:max-w-6xl lg:px-8">
      <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-6 overflow-hidden lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10">
        <div className="min-w-0 max-w-full overflow-hidden">
          <ProductImageCarousel
            key={product.id}
            imageUrls={product.images}
            fallbackImage={product.image}
            productName={product.name}
          />
        </div>

        <article className="min-w-0 max-w-full overflow-hidden">
          <p className="text-xs uppercase tracking-wide text-lime-400 sm:text-sm">
            {product.category.replace("-", " ")}
          </p>
          <h1 className="mt-2 max-w-full break-words text-2xl font-semibold leading-tight text-white [overflow-wrap:anywhere] sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
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

          <div className="mt-5 max-w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:mt-6 sm:rounded-2xl">
            <h3 className="mb-3 text-base font-semibold text-white sm:text-lg">
              Product Details
            </h3>

            <dl className="grid min-w-0 gap-3 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
              {product.brand && (
                <>
                  <dt className="text-zinc-500">Brand</dt>

                  <dd className="min-w-0 break-words text-white [overflow-wrap:anywhere]">{product.brand}</dd>
                </>
              )}

              {product.subtype && (
                <>
                  <dt className="text-zinc-500">Type</dt>

                  <dd className="min-w-0 break-words text-white [overflow-wrap:anywhere]">{product.subtype}</dd>
                </>
              )}

              {product.flavor && (
                <>
                  <dt className="text-zinc-500">Flavor</dt>

                  <dd className="min-w-0 break-words text-white [overflow-wrap:anywhere]">{product.flavor}</dd>
                </>
              )}

              {product.weight && (
                <>
                  <dt className="text-zinc-500">Weight</dt>

                  <dd className="min-w-0 break-words text-white [overflow-wrap:anywhere]">{product.weight}</dd>
                </>
              )}
            </dl>
          </div>

          <div className="mt-5 sm:mt-6">
            {product.discountPrice ? (
              <>
                <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                  <p className="text-2xl font-semibold text-lime-400 sm:text-3xl">
                    {formatCurrency(product.discountPrice)}
                  </p>

                  <p className="text-base text-zinc-500 line-through sm:text-lg">
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
              <p className="text-2xl font-semibold text-lime-400 sm:text-3xl">
                {formatCurrency(product.price)}
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:items-center">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              aria-label={`Add ${product.name} to cart`}
            >
              {product.inStock ? "Add To Cart" : "Out of Stock"}
            </Button>
            <Link to="/cart" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Go To Cart
              </Button>
            </Link>
          </div>

          {descriptionParagraphs.length > 0 ? (
            <section className="mt-6 max-w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:mt-8 sm:rounded-2xl sm:p-5">
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Product Description
              </h2>

              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300 sm:text-base">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p
                    key={`${paragraph}-${index}`}
                    className="break-words [overflow-wrap:anywhere]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </div>

      <div className="mt-8 max-w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:mt-12 sm:rounded-2xl sm:p-5">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">Customer Reviews</h2>

        {canReview ? (
          <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
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
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${
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

            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmittingReview}>
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-zinc-400">{reviewReason}</p>
        )}

        <div className="mt-6 max-h-[420px] space-y-4 overflow-y-auto pr-1 sm:mt-8 sm:pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          {reviews.length ? (
            reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <p className="break-words font-semibold text-white">
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

                <p className="mt-3 break-words text-sm leading-6 text-zinc-300 [overflow-wrap:anywhere]">
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
