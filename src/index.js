import maxBy from "lodash/maxBy";
import minBy from "lodash/minBy";

let canvas;
let ctx;
let chart;

const data = [
  { date: "21-12-2018", joined: 134, left: 13 },
  { date: "22-12-2018", joined: 45, left: 32 },
  { date: "23-12-2018", joined: 12, left: 123 },
  { date: "24-12-2018", joined: 110, left: 41 },
  { date: "25-12-2018", joined: 230, left: 10 },
  { date: "26-12-2018", joined: 134, left: 45 },
  { date: "27-12-2018", joined: 87, left: 12 },
  { date: "28-12-2018", joined: 12, left: 76 }
];

const data2 = [
  { date: "21-12-2018", joined: 134, left: 13 },
  { date: "22-12-2018", joined: 45, left: 32 },
  { date: "23-12-2018", joined: 12, left: 123 },
  { date: "24-12-2018", joined: 110, left: 41 },
  { date: "25-12-2018", joined: 337, left: 10 },
  { date: "26-12-2018", joined: 134, left: 45 },
  { date: "27-12-2018", joined: 87, left: 12 },
  { date: "28-12-2018", joined: 12, left: 76 }
];

function setup() {
  chart = {};
  createCanvas();

  drawGridLines();
  drawChart();
  drawAxis(data);
}

function createCanvas() {
  canvas = document.createElement("canvas");
  document.getElementById("app").appendChild(canvas);
  canvas.style = `
            width: 95%;
        `;
  ctx = canvas.getContext("2d");
  ctx.translate(0.5, 0.5);
  resize();
}

function resize() {
  const { innerWidth, innerHeight } = window;

  canvas.width = innerWidth;
  canvas.height = innerHeight;
  chart.minW = 0.05 * innerWidth;
  chart.maxW = 0.95 * innerWidth;
  chart.minH = 0.05 * innerHeight;
  chart.maxH = 0.95 * innerHeight;
  chart.width = innerWidth * 0.9;
  chart.height = innerHeight * 0.9;
}

function getYAxisMaxValue(max) {
  const divider = Math.max(10, 10 ** (max.toString().length - 1));
  const closestMax = Math.ceil(max / divider) * divider;
  const maxValue = Math.max(closestMax, Math.round(max / divider) * divider);

  // console.log(max + " = divider:" + divider + ", " + maxValue);
  return maxValue;
}

function drawAxis() {
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chart.minW, chart.maxH);
  ctx.lineTo(chart.maxW, chart.maxH);
  ctx.strokeStyle = "#ECF0F3";
  ctx.stroke();
}

function drawLegend() {}

function drawGridLines() {
  const maxNum = maxBy(data, "joined").joined;
  const maxValueY = getYAxisMaxValue(maxNum);
  console.log(maxNum);
  ctx.font = "20px";
  ctx.strokeStyle = "#ECF0F3";
  ctx.fillStyle = "#96A2AA";

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

function drawChart() {
  ctx.beginPath();
  ctx.moveTo(chart.minW, chart.maxH);
  ctx.lineTo(canvas.width * 0.2, canvas.height * 0.3);
  ctx.lineTo(canvas.width * 0.3, canvas.height * 0.6);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#3CC23F";
  ctx.lineWidth = 4;
  ctx.stroke();
}

window.addEventListener("load", setup);
// window.addEventListener("resize", resize);
