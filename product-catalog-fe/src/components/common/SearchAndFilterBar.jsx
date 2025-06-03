import { TextInput, MultiSelect } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useQueryParams } from "../../hooks/useQueryParams";

export default function SearchAndFilterBar({
  searchKey = "search",
  filterKey = "filter",
  filterOptions = [],
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
  }, [selectedFilters]);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <TextInput
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        className="w-full md:w-1/2"
      />
      <MultiSelect
        data={filterOptions}
        value={selectedFilters}
        onChange={setSelectedFilters}
        placeholder="Filter..."
        className="w-full md:w-1/2"
        searchable
        clearable
      />
    </div>
  );
}
