import maxBy from "lodash/maxBy";
import {
  axisFontColor,
  axisLinesColor,
  joinedColor,
  leftColor,
  data,
  months,
  chartFontSize
} from "./constants";

let canvas,
  ctx,
  chart,
  maxJoinedNum,
  maxLeftNum,
  maxNum,
  maxValueY,
  totalValues,
  showJoined,
  showLeft;
let dpi = window.devicePixelRatio;

function fix_dpi() {
  //create a style object that returns width and height
  let style = {
    height() {
      return +getComputedStyle(canvas)
        .getPropertyValue("height")
        .slice(0, -2);
    },
    width() {
      return +getComputedStyle(canvas)
        .getPropertyValue("width")
        .slice(0, -2);
    }
  };
  //set the correct attributes for a crystal clear image!
  canvas.setAttribute("width", style.width() * dpi);
  canvas.setAttribute("height", style.height() * dpi);
  ctx.scale(dpi, dpi);
}

const checkboxes = document.querySelectorAll("input[type=checkbox]");
checkboxes.forEach(function(el) {
  el.addEventListener("change", onCheckboxChange);
});
showJoined = checkboxes[0].checked;
showLeft = checkboxes[1].checked;

function onCheckboxChange(e) {
  if (e.target.name === "joined_checkbox") {
    showJoined = e.target.checked;
  } else {
    showLeft = e.target.checked;
  }

  update();
}

function setup() {
  chart = {};
  createCanvas();
  fix_dpi();

  maxJoinedNum = showJoined ? maxBy(data, "joined").joined : 0;
  maxLeftNum = showLeft ? maxBy(data, "left").left : 0;
  maxNum = Math.max(maxJoinedNum, maxLeftNum);

  maxValueY = getYAxisMaxValue(maxNum);
  totalValues = data.length;

  drawGridLines();
  drawDatesLegend(data);
  showJoined && drawChart(data, joinedColor);
  showLeft && drawChart(data, joinedColor);
  drawAxis(data);
}

function update() {
  maxJoinedNum = showJoined ? maxBy(data, "joined").joined : 0;
  maxLeftNum = showLeft ? maxBy(data, "left").left : 0;
  maxNum = Math.max(maxJoinedNum, maxLeftNum);
  if (maxNum === 0) return;
  maxValueY = getYAxisMaxValue(maxNum);
  totalValues = data.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGridLines();
  drawDatesLegend(data);
  showJoined && drawChart(data, "joined", joinedColor);
  showLeft && drawChart(data, "left", leftColor);
  drawAxis(data);
}

function createCanvas() {
  canvas = document.createElement("canvas");
  canvas.id = "main_chart";
  document.getElementById("app").appendChild(canvas);
  canvas.style = `
            width: 100%;
            height: 50%;
        `;
  ctx = canvas.getContext("2d");
  resize();
}

function resize() {
  const { innerWidth, innerHeight } = window;
  console.log(innerWidth + ";" + innerHeight + ";" + dpi);
  canvas.width = innerWidth;
  canvas.height = innerHeight * dpi;
  chart.minW = 0.05 * innerWidth;
  chart.maxW = 0.95 * innerWidth;
  chart.minH = 0.05 * innerHeight;
  chart.maxH = 0.95 * innerHeight;
  chart.width = innerWidth;
  chart.height = innerHeight;
  fix_dpi();
  requestAnimationFrame(update);
}

function getYAxisMaxValue(max) {
  const divider = Math.max(10, 10 ** (max.toString().length - 1));
  const closestMax = Math.ceil(max / divider) * divider;
  const maxValue = Math.max(closestMax, Math.round(max / divider) * divider);
  return maxValue;
}

function drawAxis() {
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chart.minW, chart.maxH);
  ctx.lineTo(chart.maxW, chart.maxH);
  ctx.strokeStyle = axisLinesColor;
  ctx.stroke();
}

function drawDatesLegend(data) {
  ctx.font = `${chart.height * chartFontSize}px -apple-system`;
  ctx.fillStyle = axisFontColor;

  data.map((value, i) => {
    const pos = chart.minW + (i * chart.width) / totalValues;
    console.log(value.date);
    const date = new Date(value.date);
    const label = months[date.getMonth()] + " " + date.getDate();
    ctx.fillText(label, pos, chart.maxH + chart.height * 0.03);
  });
}

function drawGridLines() {
  ctx.font = `${chart.height * chartFontSize}px -apple-system`;
  ctx.strokeStyle = axisLinesColor;
  ctx.fillStyle = axisFontColor;

  for (let i = 1; i <= 5; i++) {
    const height = chart.maxH - (i * chart.height) / 5;
    const currentValue = (maxValueY * i) / 5;
    ctx.fillText(currentValue, chart.minW, height - chart.height * 0.02);
    ctx.beginPath();
    ctx.moveTo(chart.minW, height);
    ctx.lineTo(chart.maxW, height);
    ctx.stroke();
  }

  ctx.fillText(0, chart.minW, chart.maxH - chart.height * 0.02);
}

function drawChart(data, type, color) {
  ctx.beginPath();
  ctx.moveTo(chart.minW, chart.maxH);
  data.map((value, i) => {
    const y = chart.height - ((value[type] / maxValueY) * chart.height + chart.minH);
    const x = chart.minW + (i / totalValues) * chart.width;
    console.log(value[type] + "|" + x + "|" + y);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

window.addEventListener("load", setup);
window.addEventListener("resize", resize);
