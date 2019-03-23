import createChartApp from "./chart_app";
const url = "./chart_data.json";
const appContainer = document.getElementById("app");
const dce = elem => document.createElement(elem);
const ac = (container, elem) => container.appendChild(elem);
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

const chartsSelectorDiv = dce("div");
function createChartsSelector(data) {
  chartsSelectorDiv.className = "charts-selector";

  const select = dce("select");
  select.addEventListener("change", selectChart);

  const option = dce("option");
  option.value = -1;
  option.selected = true;

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
  e.preventDefault();
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
