import MainChart from "./main_chart";
import NavChart from "./nav_chart";
import { loadData } from "./helpers";

loadData("http://localhost:3000/chart_data.json").then(data => initApp(data));

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

  const mainChart = new MainChart(data, selectedLines);

  const navChart = new NavChart(data, selectedLines);

  function setup() {
    mainChart.setup();
    // navChart.setup();
  }

  function onCheckboxChange(e) {
    const { checked, name } = e.target;
    checked && !selectedLines.includes(name) && selectedLines.push(name);
    !checked &&
      selectedLines.includes(name) &&
      selectedLines.splice(selectedLines.indexOf(name), 1);
    mainChart.update(data, selectedLines);
  }

  window.addEventListener("load", setup);
  window.addEventListener("resize", mainChart.resize);
}
