import type { MouseEvent } from "react";

type TablePaginationProps = {
  totalItems: number;
};

export function TablePagination({ totalItems }: TablePaginationProps) {
  const hasPages = totalItems > 0;
  const currentPage = hasPages ? 1 : 0;
  const totalPages = hasPages ? 1 : 0;
  const start = hasPages ? 1 : 0;
  const end = hasPages ? totalItems : 0;

  const linkBaseClass = "text-sm transition-colors";
  const enabledClass = "text-gray-700 hover:text-[var(--color-text-highlight)]";
  const disabledClass = "pointer-events-none cursor-not-allowed text-[var(--color-text-disabled)]";

  const linkClass = (enabled: boolean) =>
    `${linkBaseClass} ${enabled ? enabledClass : disabledClass}`;
  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
  };

  return (
    <div className="flex justify-end px-3 py-2">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
        <span>Go to:</span>
        <a href="#" aria-disabled={!hasPages} className={linkClass(hasPages)} onClick={handleLinkClick}>
          {currentPage}
        </a>
        <span>of {totalPages}</span>
        <a href="#" aria-disabled={!hasPages} className={linkClass(hasPages)} onClick={handleLinkClick}>
          {"<"}
        </a>
        <a href="#" aria-disabled={!hasPages} className={linkClass(hasPages)} onClick={handleLinkClick}>
          First
        </a>
        <a href="#" aria-disabled={!hasPages} className={linkClass(hasPages)} onClick={handleLinkClick}>
          Previous
        </a>
        <span>
          {start}-{end} of {totalItems}
        </span>
        <a href="#" aria-disabled={!hasPages} className={linkClass(hasPages)} onClick={handleLinkClick}>
          Next
        </a>
        <a href="#" aria-disabled={!hasPages} className={linkClass(hasPages)} onClick={handleLinkClick}>
          Last
        </a>
        <a href="#" aria-disabled={!hasPages} className={linkClass(hasPages)} onClick={handleLinkClick}>
          {">"}
        </a>
      </div>
    </div>
  );
}
