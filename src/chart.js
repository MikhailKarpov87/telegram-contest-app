import { findClosestItem, getItemsPositions, getYAxisMaxValue } from "./helpers";
import { throws } from "assert";

class Chart {
  constructor(options) {
    this.chart = {};
    this.coords = {};
    this.ratio = options.ratio;
    this.data = options.data;
    this.name = options.name;
    this.lineWidth = 4;
    this.start = 0;
    this.end = 1;
    this.pixelRatio = window.devicePixelRatio || 1;
    this.selectedLines = options.selectedLines;
    if (document.getElementById(options.container)) {
      this.container = document.getElementById(options.container);
    } else {
      this.container = document.createElement("div");
      this.container.id = options.container;
      document.getElementById("app").appendChild(this.container);
    }
  }

  setup = () => {
    this.canvas = document.createElement("canvas");
    this.canvas.id = this.name;
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.translate(0.5, 0.5);
    this.container.appendChild(this.canvas);

    this.resize();
  };

  resize = () => {
    const { innerWidth, innerHeight } = window;

    const width =
      innerHeight < innerWidth ? Math.round(1.0 * innerWidth) : Math.round(1.0 * innerHeight);
    const height = Math.round(this.ratio * width);

    this.container.style.width = width + "px";
    this.container.style.height = height + "px";

    this.canvas.width = width * this.pixelRatio;
    this.canvas.height = height * this.pixelRatio;

    this.chart.startX = Math.round(0.05 * this.canvas.width);
    this.chart.endX = Math.round(0.95 * this.canvas.width);
    this.chart.endY = Math.round(0.1 * this.canvas.height);
    this.chart.startY = Math.round(0.85 * this.canvas.height);
    this.chart.width = this.chart.endX - this.chart.startX;
    this.chart.height = this.chart.startY - this.chart.endY;
    console.log(this.name + " :");
    console.log(this.chart);
    console.log(this.canvas);
    this.update(this.data, this.selectedLines, this.start, this.end);
  };

  calcCoordinates(data, start, end) {
    const { chart, itemsNum } = this;
    let result = [];
    const spaceBetween = chart.width / (itemsNum - 1);

    data.map((value, i) => {
      const y = Math.round(chart.startY - (value / this.maxValueY) * chart.height);
      const x = Math.round(chart.startX + i * spaceBetween);
      result.push({ x, y });
      // console.log(`x[${i}]: ${x}, y[${i}]: ${y}, value[${i}]: ${value}`);
    });
    return result;
  }

  drawChart(data, type, color) {
    const { chart } = this;

    this.ctx.beginPath();
    this.ctx.moveTo(chart.startX, chart.startY);

    data.map((value, i) => {
      const { x, y } = value;
      i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
    }, 0);

    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.stroke();
  }
}

export default Chart;
