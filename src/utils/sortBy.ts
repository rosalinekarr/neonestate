export default function sortBy<T, U>(data: T[], callback: (datum: T) => U) {
  return data.sort((a, b) => {
    const aSort = callback(a);
    const bSort = callback(b);
    if (typeof aSort === "number" && typeof bSort === "number")
      return aSort - bSort;
    if (typeof aSort === "string" && typeof bSort === "string")
      return aSort.localeCompare(bSort);
    throw new Error("Unsupported sortBy comparator function");
  });
}
