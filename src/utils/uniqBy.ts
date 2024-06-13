export default function uniqBy<T, U>(data: T[], callback: (datum: T) => U) {
  let keys: U[] = [];
  let results: T[] = [];

  data.forEach((datum) => {
    const key = callback(datum);
    if (keys.includes(key)) return;
    keys.push(key);
    results.push(datum);
  });

  return results;
}
