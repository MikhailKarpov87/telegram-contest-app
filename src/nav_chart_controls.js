import { findClosestItem, getItemsPositions, getYAxisMaxValue } from "./helpers";

class NavChartControls {
  constructor(options) {
    this.chart = {};
    this.ratio = options.ratio;
    this.pixelRatio = window.devicePixelRatio || 1;
    this.container = document.getElementById("nav_chart_container");
    this.canvas = document.createElement("canvas");
    this.canvas.id = "nav_chart_controls";
    console.log("test");
    this.container.appendChild(this.canvas);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.ctx = this.canvas.getContext("2d");
    // this.ctx.translate(0.5, 0.5);
    this.resize();
  }

  resize = () => {
    const { innerWidth, innerHeight } = window;

    const width =
      innerHeight < innerWidth ? Math.round(1.0 * innerWidth) : Math.round(1.0 * innerHeight);
    const height = Math.round(this.ratio * width);
    this.canvas.width = width * this.pixelRatio;
    this.canvas.height = height * this.pixelRatio;

    this.chart.startX = Math.round(0.05 * this.canvas.width);
    this.chart.endX = Math.round(0.95 * this.canvas.width);
    this.chart.endY = Math.round(0.1 * this.canvas.height);
    this.chart.startY = Math.round(0.85 * this.canvas.height);
    this.chart.width = this.chart.endX - this.chart.startX;
    this.chart.height = this.chart.startY - this.chart.endY;

    requestAnimationFrame(this.update);
  };

  update = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawNavOverlay();
  };

  drawNavOverlay(start, end) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(221, 234, 243, 0.7)";
    this.ctx.fillRect(
      this.chart.startX / 2 - 1,
      0,
      this.chart.width / 2 - 1,
      this.chart.height / 2
    );
  }

  drawSlider(start, end) {
    this.ctx.fillStyle = "rgba(221, 234, 243, 1)";
    this.ctx.fillRect(0, 0, this.chart.width, this.canvas.height);
  }

  onMouseMove = e => {
    const { x, y } = e;
    const { chart } = this;
    const rect = this.canvas.getBoundingClientRect();
    const xPos = (x - Math.round(rect.left)) * this.pixelRatio;
    const yPos = (y - Math.round(rect.top)) * this.pixelRatio;
    if (yPos < chart.startY && yPos > chart.endY && xPos > chart.startX && xPos < chart.endX) {
      requestAnimationFrame(() => this.update());
    }
  };
}

export default NavChartControls;
