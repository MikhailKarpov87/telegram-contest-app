import createChartApp from "./chart_app";
const url = "./chart_data.json";
const id = 0;

//  loads JSON data(url, chart_id)
window.addEventListener("DOMContentLoaded", () => {
  let data;
  const req = new XMLHttpRequest();
  req.overrideMimeType("application/json");
  req.open("GET", url, true);
  req.onload = function() {
    const jsonResponse = JSON.parse(req.responseText);
    data = parseData(jsonResponse, id);
    new createChartApp({ title: "Chart1", data, appContainer: document.getElementById("app") });
  };
  req.send();
});

//  requestAnimationFrame polyfill for stable work
(function() {
  var lastTime = 0;
  var vendors = ["ms", "moz", "webkit", "o"];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vendors[x] + "CancelAnimationFrame"] ||
      window[vendors[x] + "CancelRequestAnimationFrame"];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
})();

//  Parsing data function
function parseData(json, id) {
  const data = json[id];
  let result = { ...data, columns: {} };

  for (let item of data.columns) {
    const name = item[0];
    item.shift();
    result.columns[name] = item;
  }

  return result;
}
