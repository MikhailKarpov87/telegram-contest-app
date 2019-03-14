import { findClosestItem, getItemsPositions, getYAxisMaxValue } from "./helpers";

class Chart {
  constructor(options) {
    this.chart = {};
    this.ratio = options.ratio;
    this.data = options.data;
    this.name = options.name;
    this.lineWidth = 4;
    this.pixelRatio = window.devicePixelRatio || 1;
    this.selectedLines = options.selectedLines;
    this.container = document.createElement("div");
    this.container.id = `${this.name}_container`;
    document.getElementById("app").appendChild(this.container);
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

    this.update(this.data, this.selectedLines);
  };

  update = (newData, selectedLines) => {
    //  Here2 probably should go some func to compare newData and this.data
    //  For animation, etc.
    this.data = newData;
    const { data, chart } = this;
    this.maxNum = Math.max(...this.selectedLines.map(line => Math.max(...data.columns[line])));
    if (this.maxNum === 0) return;

    this.maxValueY = getYAxisMaxValue(this.maxNum);
    this.itemsNum = data.columns.x.length;
    this.currentItemsPositions = getItemsPositions(chart.startX, chart.width, this.itemsNum);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawAxis();
    this.drawGridLines();
    this.drawDatesLegend(data.columns.x);
    this.hoverItem && this.drawHoverGrid();
    this.selectedLines.map(line => this.drawChart(data.columns[line], line, data.colors[line]));
    this.hoverItem && this.drawHoverPoints();
    this.hoverItem && this.showTooltip();
  };

  drawChart(data, type, color) {
    const { chart, itemsNum } = this;
    this.ctx.beginPath();
    this.ctx.moveTo(chart.startX, chart.startY);
    data.map((value, i) => {
      const y = Math.round(
        chart.height - ((value / this.maxValueY) * chart.height * 0.85 + chart.endY)
      );
      const x = Math.round(chart.startX + (i / itemsNum) * chart.width);
      i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
    });

    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.stroke();
  }
}

export default Chart;
