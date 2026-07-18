import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { getLatestReviews } from "../../services/reviewService";

const MAX_RATING = 5;

type ReviewProductRelation =
  | {
      name?: string | null;
    }
  | {
      name?: string | null;
    }[]
  | null;

const getReviewedProductName = (
  products: ReviewProductRelation,
) => {
  if (Array.isArray(products)) {
    return products[0]?.name ?? "";
  }

  return products?.name ?? "";
};

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  review: string;
  role: string;
}

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <article className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-950 p-5">
    <div className="flex items-start justify-between gap-4">
      <div
        className="flex gap-1"
        role="img"
        aria-label={`${testimonial.rating} out of ${MAX_RATING} stars`}
      >
        {Array.from({ length: MAX_RATING }, (_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < testimonial.rating
                ? "fill-lime-400 text-lime-400"
                : "fill-zinc-800 text-zinc-700"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <Quote className="h-5 w-5 shrink-0 text-zinc-700" aria-hidden="true" />
    </div>

    <blockquote className="mt-5 flex-1 text-sm leading-6 text-zinc-300">
      &ldquo;{testimonial.review}&rdquo;
    </blockquote>

    <footer className="mt-6 border-t border-zinc-800 pt-4">
      <p className="font-semibold text-white">{testimonial.name}</p>
      <p className="mt-1 text-xs text-zinc-500">{testimonial.role}</p>
    </footer>
  </article>
);

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLatestReviews = async () => {
      try {
        const reviews = await getLatestReviews();

        const formattedReviews = reviews.map((review) => {
          const productName = getReviewedProductName(
            review.products as ReviewProductRelation,
          );

          return {
            id: review.id,
            name: review.customer_name,
            rating: Math.min(Math.max(review.rating, 1), MAX_RATING),
            review: review.comment,
            role: productName
              ? `Reviewed ${productName}`
              : "Verified customer",
          };
        });

        setTestimonials(formattedReviews);
      } catch (error) {
        console.error("Failed to load testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLatestReviews();
  }, []);

  if (!isLoading && testimonials.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-zinc-800 bg-zinc-900/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-lime-400">
            Customer reviews
          </p>

          <h2 className="mt-2 text-3xl font-semibold text-white">
            Trusted by everyday athletes
          </h2>

          <p className="mt-3 text-zinc-400">
            Real feedback from customers who use NutriStack to support
            their training.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-lg border border-zinc-800 bg-zinc-950"
              />
            ))}
          </div>
        ) : (
          <div
            className="testimonial-marquee mt-7"
            aria-label="Customer testimonials"
          >
            <div className="testimonial-track">
              <div className="flex shrink-0 items-stretch gap-4">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-[min(82vw,22rem)] shrink-0 sm:w-88"
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
