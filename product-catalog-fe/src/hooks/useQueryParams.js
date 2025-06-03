import { useLocation, useNavigate } from "react-router-dom";

export function useQueryParams() {
  const location = useLocation();
  const navigate = useNavigate();

  const getQueryParam = (key) => {
    const params = new URLSearchParams(location.search);
    return params.get(key);
  };

  const setQueryParam = (keyOrObject, value) => {
    const params = new URLSearchParams(location.search);

    if (typeof keyOrObject === "string") {
      // Atualiza um único parâmetro
      if (value === undefined || value === null || value === "") {
        params.delete(keyOrObject);
      } else {
        params.set(keyOrObject, value);
      }
    } else if (typeof keyOrObject === "object" && keyOrObject !== null) {
      // multiple sets
      Object.entries(keyOrObject).forEach(([key, val]) => {
        if (val === undefined || val === null || val === "") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
    }

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  };

  return { getQueryParam, setQueryParam };
}
