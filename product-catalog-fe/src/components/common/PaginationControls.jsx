import { Select, Pagination } from "@mantine/core";
import { useQueryParams } from "../../hooks/useQueryParams";

export default function PaginationControls({ page, totalPages, pageSize }) {
  const { setQueryParam } = useQueryParams();

  const handlePageChange = (newPage) => {
    setQueryParam("page", newPage);
  };

  const handlePageSizeChange = (value) => {
    if (value) {
      setQueryParam({ page: 1, pageSize: parseInt(value, 12) });
    }
  };

  return (
    <div className="flex justify-between items-center mt-6">
      <Pagination total={totalPages} value={page} onChange={handlePageChange} />
      {!!totalPages && (
        <Select
          data={["9", "12", "18", "60"]}
          value={String(pageSize)}
          onChange={handlePageSizeChange}
          style={{ width: 80 }}
        />
      )}
    </div>
  );
}
