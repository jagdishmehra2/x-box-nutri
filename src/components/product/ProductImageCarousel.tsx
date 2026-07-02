import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImageCarouselProps {
  imageUrls?: string[]
  fallbackImage?: string
  productName: string
}

const PLACEHOLDER_IMAGE = '/placeholder-product.jpg'

export const ProductImageCarousel = ({
  imageUrls,
  fallbackImage,
  productName,
}: ProductImageCarouselProps) => {
  const availableImages = Array.from(
    new Set(
      [...(imageUrls ?? []), fallbackImage].filter(
        (image): image is string => Boolean(image?.trim()),
      ),
    ),
  )
  const images = availableImages.length ? availableImages : [PLACEHOLDER_IMAGE]
  const [activeIndex, setActiveIndex] = useState(0)
  const hasMultipleImages = images.length > 1

  const showPreviousImage = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    )
  }

  const showNextImage = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % images.length)
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
        <img
          key={images[activeIndex]}
          src={images[activeIndex]}
          alt={
            hasMultipleImages
              ? `${productName}, image ${activeIndex + 1} of ${images.length}`
              : productName
          }
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = PLACEHOLDER_IMAGE
          }}
          className="h-full w-full animate-in fade-in object-contain duration-300"
        />

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/85 text-white shadow-lg transition hover:border-lime-400 hover:text-lime-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400"
              aria-label="Show previous product image"
              title="Previous image"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/85 text-white shadow-lg transition hover:border-lime-400 hover:text-lime-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400"
              aria-label="Show next product image"
              title="Next image"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>

            <p
              className="absolute right-3 top-3 rounded-full bg-zinc-950/85 px-2.5 py-1 text-xs font-medium text-zinc-200"
              aria-live="polite"
            >
              {activeIndex + 1} / {images.length}
            </p>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Choose product image">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-zinc-900 p-1 transition ${
                index === activeIndex
                  ? 'border-lime-400'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
              aria-label={`Show product image ${index + 1}`}
              aria-pressed={index === activeIndex}
            >
              <img
                src={image}
                alt=""
                onError={(event) => {
                  event.currentTarget.onerror = null
                  event.currentTarget.src = PLACEHOLDER_IMAGE
                }}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
