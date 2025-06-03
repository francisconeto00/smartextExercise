import { TextInput, MultiSelect } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useQueryParams } from "../../hooks/useQueryParams";

export default function SearchAndFilterBar({
  searchKey = "search",
  filterKey = "filter",
  filterOptions = [],
  children,
}) {
  const { getQueryParam, setQueryParam } = useQueryParams();

  const [search, setSearch] = useState(getQueryParam(searchKey) || "");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const [selectedFilters, setSelectedFilters] = useState(
    getQueryParam(filterKey)?.split(",") || []
  );

  useEffect(() => {
    setQueryParam(searchKey, debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    setQueryParam(filterKey, selectedFilters.join(","));
    setQueryParam("page", "1");
  }, [selectedFilters]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 mb-4">
      <TextInput
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        className="w-full "
      />
      {filterOptions.length > 0 && (
        <MultiSelect
          data={filterOptions}
          value={selectedFilters}
          onChange={setSelectedFilters}
          placeholder="Filter..."
          className="w-full "
          searchable
          clearable
        />
      )}
      {children}
    </div>
  );
}
