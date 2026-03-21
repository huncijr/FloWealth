import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactPaginate from "react-paginate";

interface PaginationProps {
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const CustomPagination = ({
  pageCount,
  currentPage,
  onPageChange,
}: PaginationProps) => {
  const handlePageClick = (event: { selected: number }) => {
    onPageChange(event.selected + 1);
  };

  return (
    <div className="inline-flex items-center rounded-xl border-2 border-secondary bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      <ReactPaginate
        onPageChange={handlePageClick}
        breakLabel="..."
        nextLabel={
          <div className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronRight
              size={18}
              className="text-gray-600 dark:text-gray-300"
            />
          </div>
        }
        pageRangeDisplayed={5}
        marginPagesDisplayed={1}
        pageCount={pageCount}
        previousLabel={
          <div className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-r border-gray-200 dark:border-gray-700">
            <ChevronLeft
              size={18}
              className="text-gray-600 dark:text-gray-300"
            />
          </div>
        }
        renderOnZeroPageCount={null}
        containerClassName="flex items-center"
        pageClassName="list-none border-r border-gray-200 dark:border-gray-700 last:border-r-0"
        pageLinkClassName="h-10 w-10 flex items-center justify-center text-sm font-medium tabular-nums text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer select-none"
        activeClassName="!bg-secondary [&>a]:text-white [&>a]:hover:bg-secondary/90"
        disabledClassName="opacity-40 cursor-not-allowed pointer-events-none"
        breakClassName="h-10 w-10 flex items-center justify-center border-r border-gray-200 dark:border-gray-700 text-gray-500 text-sm font-medium tracking-widest"
        previousClassName="list-none"
        nextClassName="list-none border-l border-gray-200 dark:border-gray-700"
        forcePage={currentPage - 1}
      />
    </div>
  );
};

export default CustomPagination;
