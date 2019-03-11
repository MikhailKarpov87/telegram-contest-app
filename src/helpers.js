export function maxBy(data, field) {
  const max = data.reduce((max, x, i, arr) => (x[field] > arr[max][field] ? i : max), 0);
  return data[max];
}

export function getItemsPositions(startWidth, width, itemsNum) {
  let positions = [];
  positions[0] = startWidth;

  const spaceBetween = Math.round(width / itemsNum);

  for (let i = 1; i < itemsNum; i++) {
    positions[i] = positions[i - 1] + spaceBetween;
  }

  return positions;
}

export function findClosestItem(x, currentItemsPositions) {
  return currentItemsPositions
    .map(value => Math.abs(value - x))
    .reduce((min, x, i, arr) => (x < arr[min] ? i : min), 0);
}

export function getYAxisMaxValue(max) {
  const divider = Math.max(10, 10 ** (max.toString().length - 1));
  const closestMax = Math.ceil(max / divider) * divider;
  const maxValue = Math.max(closestMax, Math.round(max / divider) * divider);
  return maxValue;
}
