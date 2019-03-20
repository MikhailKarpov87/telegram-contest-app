import MainChart from "./main_chart";
import NavChart from "./nav_chart";
import NavChartControls from "./nav_chart_controls";

function loadChartApp(options) {
  const { data, appContainer } = options;
  const title = options.title || "Chart";
  const lines = data.names;
  const start = options.start || 0.55;
  const end = options.end || 0.9;
  let nightmodeIsOn = false;

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
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.checked = "true";
    const text = document.createTextNode(id);
    const label = document.createElement("label");
    label.htmlFor = id;
    const span = document.createElement("span");
    const i = document.createElement("i");
    i.innerHTML = id;
    label.appendChild(span);
    label.appendChild(text);
    container.appendChild(checkbox);
    container.appendChild(label);
    selectedCharts.push(id);
    return container;
  }

  container.appendChild(checkboxDiv);

  //  Adding nightmode switch
  const nightmodeDiv = document.createElement("div");
  nightmodeDiv.className = "nightmode_switch";
  const nightmodeButton = document.createElement("button");
  nightmodeButton.className = "nightmode_button";
  nightmodeButton.innerHTML = "Switch to Night Mode";
  nightmodeButton.addEventListener("click", onNightmodeButtonClick);
  nightmodeDiv.appendChild(nightmodeButton);
  container.appendChild(nightmodeDiv);

  //    Creating instances of charts elements
  const mainChart = new MainChart({
    name: "main_chart",
    container: mainChartContainer,
    appContainer: container,
    data,
    start,
    end,
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
    start,
    end,
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

    mainChart.updateSelectedCharts(checked, id);
    navChart.updateSelectedCharts(checked, id);
  }

  setup();

  function onNightmodeButtonClick(e) {
    e.preventDefault();
    nightmodeIsOn = !nightmodeIsOn;
    const buttonText = nightmodeIsOn ? "Switch to Day Mode" : "Switch to Night Mode";
    const borderColor = nightmodeIsOn ? "#344658" : "#e6ecf0";
    const bgColor = nightmodeIsOn ? "#242F3E" : "#FFFFFF";
    const color = nightmodeIsOn ? "#FFFFFF" : "#222222";
    nightmodeButton.innerHTML = buttonText;
    document.body.style.backgroundColor = bgColor;
    document.body.style.color = color;
    checkboxDiv.style.borderColor = borderColor;
    mainChart.switchNightMode(nightmodeIsOn);
    navChartControls.switchNightMode(nightmodeIsOn);
  }

  appContainer.appendChild(container);

  window.addEventListener("resize", onResize);
}

export default loadChartApp;
