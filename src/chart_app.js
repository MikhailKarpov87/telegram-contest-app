import MainChart from "./main_chart";
import NavChart from "./nav_chart";
import NavChartControls from "./nav_chart_controls";

function loadChartApp(options) {
  const { data, appContainer } = options;
  const title = options.title || "Chart";
  const lines = data.names;
  let selectedLines = [];

  const container = document.createElement("div");
  container.name = title;

  const appTitle = document.createElement("h2");
  appTitle.innerHTML = title;

  const mainChartContainer = document.createElement("div");
  mainChartContainer.id = "main_chart_container";

  const navChartContainer = document.createElement("div");
  navChartContainer.id = "nav_chart_container";

  container.appendChild(appTitle);
  container.appendChild(mainChartContainer);
  container.appendChild(navChartContainer);

  for (let name in lines) {
    const inputDiv = document.getElementById("controls");
    const checkbox = document.createElement("input");
    const checkboxText = document.createTextNode(lines[name]);
    checkbox.type = "checkbox";
    checkbox.name = name;
    checkbox.checked = "true";
    selectedLines.push(name);
    inputDiv.appendChild(checkboxText);
    inputDiv.appendChild(checkbox);
    checkbox.addEventListener("change", onCheckboxChange);
  }

  const mainChart = new MainChart({
    name: "main_chart",
    container: mainChartContainer,
    appContainer: container,
    data,
    selectedLines,
    ratio: 0.35
  });

  const navChart = new NavChart({
    name: "nav_chart",
    container: navChartContainer,
    appContainer: container,
    data,
    selectedLines,
    ratio: 0.15
  });

  const navChartControls = new NavChartControls({
    name: "nav_chart_controls",
    container: navChartContainer,
    appContainer: container,
    data: [],
    selectedLines,
    ratio: 0.15,
    controlledChart: mainChart
  });

  function setup() {
    mainChart.setup();
    navChart.setup();
    navChartControls.setup();
  }

  function onResize() {
    mainChart.resize();
    navChartControls.resize();
    navChart.resize();
  }

  function onCheckboxChange(e) {
    const { checked, name } = e.target;
    checked && !selectedLines.includes(name) && selectedLines.push(name);
    !checked &&
      selectedLines.includes(name) &&
      selectedLines.splice(selectedLines.indexOf(name), 1);
    mainChart.updateSelectedLines(selectedLines);
    navChart.update(data, selectedLines);
  }

  appContainer.appendChild(container);

  window.addEventListener("load", setup);
  window.addEventListener("resize", onResize);
}

export default loadChartApp;
