import MainChart from "./main_chart";

const checkboxes = document.querySelectorAll("input[type=checkbox]");

checkboxes.forEach(function(el) {
  el.addEventListener("change", onCheckboxChange);
});

let showJoined = checkboxes[0].checked;
let showLeft = checkboxes[1].checked;

const mainChart = new MainChart();

function onCheckboxChange(e) {
  if (e.target.name === "joined_checkbox") {
    showJoined = e.target.checked;
  } else {
    showLeft = e.target.checked;
  }

  mainChart.update({ showJoined, showLeft });
}

window.addEventListener("load", () => mainChart.setup({ showJoined, showLeft }));
window.addEventListener("resize", mainChart.resize);
