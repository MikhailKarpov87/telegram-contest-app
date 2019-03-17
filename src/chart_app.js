import MainChart from "./main_chart";
import NavChart from "./nav_chart";
import NavChartControls from "./nav_chart_controls";

function loadChartApp(options) {
  const { data, appContainer } = options;
  const title = options.title || "Chart";
  const lines = data.names;

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

  //  Adding checkboxes
  const checkboxDiv = document.createElement("div");
  checkboxDiv.id = "controls";
  let selectedCharts = [];

  for (let name in lines) {
    const checkbox = createCheckbox(name);
    checkboxDiv.appendChild(checkbox);
  }

  function createCheckbox(id) {
    const container = document.createElement("div");
    const checkbox = document.createElement("input");
    checkbox.addEventListener("change", onCheckboxChange);
    const checkboxText = document.createTextNode(lines[id]);
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.checked = "true";
    const text = document.createTextNode(id);
    const label = document.createElement("label");
    label.htmlFor = id;
    const span = document.createElement("span");
    const ins = document.createElement("ins");
    const i = document.createElement("i");
    i.innerHTML = id;
    ins.appendChild(i);
    label.appendChild(span);
    label.appendChild(text);
    label.appendChild(ins);
    container.appendChild(checkbox);
    container.appendChild(label);
    selectedCharts.push(id);
    return container;
  }
  //   <label for='one'>
  //     <span></span>
  //     Off with your head
  //     <ins><i>Off with your head</i></ins>
  //   </label>

  container.appendChild(checkboxDiv);

  //    Creating instances of charts elements
  const mainChart = new MainChart({
    name: "main_chart",
    container: mainChartContainer,
    appContainer: container,
    data,
    selectedCharts,
    ratio: 0.5
  });

  const navChart = new NavChart({
    name: "nav_chart",
    container: navChartContainer,
    appContainer: container,
    data,
    selectedCharts,
    ratio: 0.15
  });

  const navChartControls = new NavChartControls({
    name: "nav_chart_controls",
    container: navChartContainer,
    appContainer: container,
    data: [],
    selectedCharts,
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
    const { checked, id } = e.target;
    checked && !selectedCharts.includes(id) && selectedCharts.push(id);
    !checked && selectedCharts.includes(id) && selectedCharts.splice(selectedCharts.indexOf(id), 1);
    mainChart.updateSelectedCharts(selectedCharts);
    navChart.updateSelectedCharts(selectedCharts);
  }

  appContainer.appendChild(container);

  window.addEventListener("load", setup);
  window.addEventListener("resize", onResize);
}

export default loadChartApp;
