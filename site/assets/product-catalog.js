export const PRODUCT_PAGE_SIZE = 4;

export function filterProductsForRegion(items, region) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && item.name && (
    region === "global"
    || !item.country
    || item.country === "global"
    || item.country === region
  ));
}

export function getNextVisibleCount(currentCount, totalCount, pageSize = PRODUCT_PAGE_SIZE) {
  const current = Math.max(0, Number.isFinite(currentCount) ? currentCount : 0);
  const total = Math.max(0, Number.isFinite(totalCount) ? totalCount : 0);
  const increment = Math.max(1, Number.isFinite(pageSize) ? pageSize : PRODUCT_PAGE_SIZE);
  return Math.min(current + increment, total);
}
