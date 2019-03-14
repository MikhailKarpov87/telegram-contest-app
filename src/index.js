import MainChart from "./main_chart";
import NavChart from "./nav_chart";
import NavCharControls from "./nav_chart_controls";
import { loadData } from "./helpers";
import NavChartControls from "./nav_chart_controls";

loadData("http://192.168.1.116:3000/chart_data.json").then(data => initApp(data));

function initApp(data) {
  // console.log(data);

  let selectedLines = [];
  const lines = data.names;
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

  const mainChart = new MainChart({ name: "main_chart", data, selectedLines, ratio: 0.5 });

  const navChart = new NavChart({ name: "nav_chart", data, selectedLines, ratio: 0.15 });

  const navChartControls = new NavChartControls({ ratio: 0.15 });

  function setup() {
    mainChart.setup();
    navChart.setup();
  }

  function onResize() {
    mainChart.resize();
    navChart.resize();
    navChartControls.resize();
  }

  function onCheckboxChange(e) {
    console.log("2");
    const { checked, name } = e.target;
    checked && !selectedLines.includes(name) && selectedLines.push(name);
    !checked &&
      selectedLines.includes(name) &&
      selectedLines.splice(selectedLines.indexOf(name), 1);
    mainChart.update(data, selectedLines);
    navChart.update(data, selectedLines);
  }

  window.addEventListener("load", setup);
  window.addEventListener("resize", onResize);
}
