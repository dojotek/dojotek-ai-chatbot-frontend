import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
};

function getPaginationItems(
  total: number,
  current: number,
  siblingCount: number = 1
): (number | "ellipsis")[] {
  const totalNumbers = siblingCount * 2 + 5;
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(2, current - siblingCount);
  const right = Math.min(total - 1, current + siblingCount);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  const items: (number | "ellipsis")[] = [1];
  if (showLeftEllipsis) items.push("ellipsis");
  for (let i = left; i <= right; i++) items.push(i);
  if (showRightEllipsis) items.push("ellipsis");
  items.push(total);
  return items;
}

function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const disabledPrev = currentPage <= 1;
  const disabledNext = currentPage >= totalPages;

  if (totalPages <= 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => !disabledPrev && onPageChange(currentPage - 1)}
        disabled={disabledPrev}
        className="rounded-md border p-1.5 disabled:opacity-50"
        aria-label="Previous page"
        title="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {getPaginationItems(totalPages, currentPage, siblingCount).map((item, idx) =>
        item === "ellipsis" ? (
          <span key={`el-${idx}`} className="px-2 text-sm text-muted-foreground">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
              item === currentPage
                ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary font-semibold"
                : "bg-background text-foreground hover:bg-muted"
            )}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => !disabledNext && onPageChange(currentPage + 1)}
        disabled={disabledNext}
        className="rounded-md border p-1.5 disabled:opacity-50"
        aria-label="Next page"
        title="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export const Pagination = memo(PaginationComponent);
export default Pagination;
