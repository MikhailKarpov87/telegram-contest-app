export function loadData(url) {
  return fetch(url)
    .then(function(response) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }
      throw new TypeError("Incorrect data received!");
    })
    .then(result => parseData(result))
    .catch(function(error) {
      console.log(error);
    });
}

export function parseData(json) {
  const data = json[0];
  let result = { columns: {} };

  for (let item of data.columns) {
    const name = item[0];
    item.shift();
    result.columns[name] = item;
  }
  result.colors = data.colors;
  result.names = data.names;
  result.types = data.types;

  return result;
}

export function getItemsPositions(startWidth, width, itemsNum) {
  let positions = [];
  positions[0] = startWidth;

  const spaceBetween = Math.round((width - startWidth) / itemsNum);

  for (let i = 1; i < itemsNum; i++) {
    positions[i] = positions[i - 1] + spaceBetween;
  }

  return positions;
}

export function findClosestItem(x, currentItemsPositions) {
  //   console.log(x);
  //   console.log(currentItemsPositions);

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
