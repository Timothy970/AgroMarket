import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export interface PaginationMeta {
    page: number;
    size: number;
    total_items: number;
    total_pages: number;
    has_prev: boolean;
    has_next: boolean;
}

interface SharedPaginationProps {
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
}

export default function SharedPagination({
    pagination,
    onPageChange,
}: SharedPaginationProps) {
    const { page, total_pages, has_prev, has_next } = pagination;

    return (
        <Pagination className="my-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (has_prev) onPageChange(page - 1);
                        }}
                        aria-disabled={!has_prev}
                        className={
                            !has_prev ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                    />
                </PaginationItem>

                <PaginationItem className="flex items-center px-4">
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {total_pages}
                    </span>
                </PaginationItem>

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (has_next) onPageChange(page + 1);
                        }}
                        aria-disabled={!has_next}
                        className={
                            !has_next ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
