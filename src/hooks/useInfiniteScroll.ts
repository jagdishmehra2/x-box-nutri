import { useEffect, useRef } from 'react'

type UseInfiniteScrollOptions = {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  rootMargin?: string
}

export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = '300px',
}: UseInfiniteScrollOptions) => {
  const targetRef = useRef<HTMLDivElement>(null)
  const onLoadMoreRef = useRef(onLoadMore)
  const loadRequestedRef = useRef(false)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    if (!isLoading) {
      loadRequestedRef.current = false
    }
  }, [isLoading])

  useEffect(() => {
    const target = targetRef.current

    if (!target || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadRequestedRef.current) return

        loadRequestedRef.current = true
        onLoadMoreRef.current()
      },
      { rootMargin },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [hasMore, isLoading, rootMargin])

  return targetRef
}
