// import "whatwg-fetch";

export function loadData(url, id) {
  return fetch(url)
    .then(function(response) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }
      throw new TypeError("Incorrect data received!");
    })
    .then(result => parseData(result, id))
    .catch(function(error) {
      console.log(error);
    });
}

export function parseData(json, id) {
  const data = json[id];
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

export function findClosestItem(x, coords) {
  return coords
    .map(value => Math.abs(value.x - x))
    .reduce((min, x, i, arr) => (x < arr[min] ? i : min), 0);
}

export function getYAxisMaxValue(max) {
  const divider = Math.max(10, 10 ** (max.toString().length - 1));
  const closestMax = Math.ceil(max / divider) * divider;
  const maxValue = Math.max(closestMax, Math.round(max / divider) * divider);
  return maxValue;
}
