import Chart from "./chart";

class NavChartControls extends Chart {
  constructor(options) {
    super(options);
    this.controlledChart = options.controlledChart;
  }

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
      this.chart.width / 2 + 2,
      this.chart.startY / 2
    );
  }

  onMouseMove = e => {
    const { x, y } = e;
    const { chart } = this;
    const rect = this.canvas.getBoundingClientRect();
    const xPos = (x - Math.round(rect.left)) * this.pixelRatio;
    const yPos = (y - Math.round(rect.top)) * this.pixelRatio;
    if (yPos < chart.startY && yPos > chart.endY && xPos > chart.startX && xPos < chart.endX) {
      // console.log(xPos - 1);
      // console.log(chart.startX + "|" + chart.width - chart.startX);
      const startPos = (xPos - 1) / chart.endX;
      // console.log(startPos);
      // newData, selectedLines, start, end

      requestAnimationFrame(() => this.controlledChart.onNavChange(startPos, 1));
    }
  };
}

export default NavChartControls;