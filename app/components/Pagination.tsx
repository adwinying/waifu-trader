import { Link } from "remix";

type Props = {
  baseUrl: string;
  total: number;
  currentPage: number;
  perPage: number;
};

export default function Pagination({
  baseUrl,
  total,
  currentPage,
  perPage,
}: Props) {
  if (total === 0) return null;

  const offset = (currentPage - 1) * perPage;
  const start = offset + 1;
  const end = Math.min(offset + perPage, total);

  const pageCount = Math.ceil(total / perPage);
  const pages = new Array(pageCount).fill(0).map((_, i) => i + 1);

  const getPageUrl = (page: number): string => {
    const url = new URL(baseUrl);
    url.searchParams.set("page", page.toString());
    return url.toString().replace(url.origin, "");
  };

  return (
    <div
      className="mb-6 items-center justify-between space-y-1"
      cy-data="pagination"
    >
      <span cy-data="paginationDescription">
        Showing {start.toLocaleString()} - {end.toLocaleString()} of{" "}
        {total.toLocaleString()}
      </span>

      <div className="btn-group">
        {pageCount > 1 &&
          pages.map((page) => (
            <Link
              className={`btn btn-sm ${
                page === currentPage ? "btn-active" : ""
              }`}
              cy-data="paginationEntry"
              data-page={page}
              to={getPageUrl(page)}
              prefetch="intent"
            >
              {page}
            </Link>
          ))}
      </div>
    </div>
  );
}
