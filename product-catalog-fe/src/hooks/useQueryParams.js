import { useLocation, useNavigate } from "react-router-dom";

export function useQueryParams() {
  const location = useLocation();
  const navigate = useNavigate();

  const getQueryParam = (key) => {
    const params = new URLSearchParams(location.search);
    return params.get(key);
  };

  const setQueryParam = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value === undefined || value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  return { getQueryParam, setQueryParam };
}
