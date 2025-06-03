import React from "react";

export default function GridWrapper({
  children,
  columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  gap = "gap-4",
  className = "",
}) {
  return (
    <div className={`grid ${columns} ${gap} ${className}`}>
      {children}
    </div>
  );
}
