import createChartApp from "./chart_app";
const url = "./chart_data.json";
const appContainer = document.getElementById("app");
let data;

//  loading JSON data(url, chart_id)
window.addEventListener("DOMContentLoaded", () => {
  const req = new XMLHttpRequest();
  req.overrideMimeType("application/json");
  req.open("GET", url, true);
  req.onload = function() {
    data = parseData(JSON.parse(req.responseText));
    createChartsSelector(data);
    new createChartApp({ title: "Chart #1", data: data[0], appContainer });
  };
  req.send();
});

//  requestAnimationFrame polyfill for stable work
// (function() {
//   var lastTime = 0;
//   var vendors = ["ms", "moz", "webkit", "o"];
//   for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
//     window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
//     window.cancelAnimationFrame =
//       window[vendors[x] + "CancelAnimationFrame"] ||
//       window[vendors[x] + "CancelRequestAnimationFrame"];
//   }

//   if (!window.requestAnimationFrame)
//     window.requestAnimationFrame = function(callback, element) {
//       var currTime = new Date().getTime();
//       var timeToCall = Math.max(0, 16 - (currTime - lastTime));
//       var id = window.setTimeout(function() {
//         callback(currTime + timeToCall);
//       }, timeToCall);
//       lastTime = currTime + timeToCall;
//       return id;
//     };

//   if (!window.cancelAnimationFrame)
//     window.cancelAnimationFrame = function(id) {
//       clearTimeout(id);
//     };
// })();

//  Parsing data function
function parseData(json) {
  return json.map(data => {
    let result = { ...data, columns: {} };
    for (let item of data.columns) {
      const name = item[0];
      item.shift();
      result.columns[name] = item;
    }
    return result;
  });
}

function createChartsSelector(data) {
  const chartsSelectorDiv = dce("div");
  chartsSelectorDiv.className = "charts-selector";
  const select = dce("select");
  select.addEventListener("change", selectChart);

  const option = dce("option");
  option.value = -1;
  option.innerHTML = "Select chart...";
  ac(select, option);

  data.map((chart, id) => {
    const option = dce("option");
    option.value = id;
    option.innerHTML = "Chart #" + (id + 1);
    ac(select, option);
  });
  ac(chartsSelectorDiv, select);
  document.body.prepend(chartsSelectorDiv);
}

function selectChart(e) {
  const id = +e.target.value;
  if (id === -1) return;

  while (appContainer.firstChild) {
    appContainer.removeChild(appContainer.firstChild);
  }
  setDayMode();

  const title = "Chart #" + (id + 1);
  new createChartApp({ title, data: data[id], appContainer });
}

function setDayMode() {
  document.body.style.backgroundColor = "#FFFFFF";
  document.body.style.color = "#222222";
}

const dce = elem => document.createElement(elem);
const ac = (container, elem) => container.appendChild(elem);
