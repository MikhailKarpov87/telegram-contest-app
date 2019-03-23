import MainChart from "./main_chart";
import NavChart from "./nav_chart";
import NavChartControls from "./nav_chart_controls";

class createChartApp {
  constructor(options) {
    const { data, appContainer } = options;
    const title = options.title || "Chart";
    const lines = data.names;
    const start = options.start || 0.55;
    const end = options.end || 0.9;
    let nightmodeIsOn = false;

    const container = dce("div");
    container.id = title;

    const appTitle = dce("h2");
    appTitle.innerHTML = title;

    const mainChartContainer = dce("div");
    mainChartContainer.id = "main_chart_container";

    const navChartContainer = dce("div");
    navChartContainer.id = "nav_chart_container";

    ac(container, appTitle);
    ac(container, mainChartContainer);
    ac(container, navChartContainer);

    //  Adding checkboxes
    const checkboxDiv = dce("div");
    checkboxDiv.id = "controls";
    checkboxDiv.style.borderColor = "#e6ecf0";
    let selectedCharts = [];

    for (let name in lines) {
      const checkbox = createCheckbox(name);
      ac(checkboxDiv, checkbox);
    }

    function createCheckbox(id) {
      const container = dce("div");
      const checkbox = dce("input");
      checkbox.addEventListener("change", onCheckboxChange);
      checkbox.type = "checkbox";
      checkbox.id = id;
      checkbox.checked = "true";
      const text = document.createTextNode(data.names[id]);
      const label = dce("label");
      label.htmlFor = id;
      const span = dce("span");
      span.style.borderColor = data.colors[id];
      const i = dce("i");
      i.innerHTML = id;
      ac(label, span);
      ac(label, text);
      ac(container, checkbox);
      ac(container, label);
      selectedCharts.push(id);
      return container;
    }

    ac(container, checkboxDiv);

    //  Adding nightmode switch
    const nightmodeDiv = dce("div");
    const nightmodeButton = dce("button");
    nightmodeDiv.className = "nightmode_switch";
    nightmodeButton.className = "nightmode_button";
    nightmodeButton.innerHTML = "Switch to Night Mode";
    nightmodeButton.addEventListener("click", onNightmodeButtonClick);
    ac(nightmodeDiv, nightmodeButton);
    ac(container, nightmodeDiv);

    //    Creating instances of charts elements
    const mainChart = new MainChart({
      name: "main_chart",
      container: mainChartContainer,
      appContainer: container,
      title,
      data,
      start,
      end,
      selectedCharts,
      ratio: 0.65
    });

    const navChart = new NavChart({
      name: "nav_chart",
      container: navChartContainer,
      appContainer: container,
      title,
      data,
      selectedCharts,
      ratio: 0.15
    });

    const navChartControls = new NavChartControls({
      name: "nav_chart_controls",
      container: navChartContainer,
      appContainer: container,
      title,
      data: [],
      selectedCharts,
      start,
      end,
      ratio: 0.15,
      controlledChart: mainChart
    });

    function setup() {
      mainChart.setup(checkboxDiv);
      navChart.setup(checkboxDiv);
      navChartControls.setup(checkboxDiv);
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

    ac(appContainer, container);

    setup();

    window.addEventListener("resize", onResize);
  }
}

const dce = elem => document.createElement(elem);
const ac = (container, elem) => container.appendChild(elem);

export default createChartApp;
