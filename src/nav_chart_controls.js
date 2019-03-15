import Chart from "./chart";

class NavChartControls extends Chart {
  constructor(options) {
    super(options);
    this.controlledChart = options.controlledChart;
    this.startBarPos = 0.6;
    this.endBarPos = 0.9;

    this.clickedOnStartBar = false;
    this.clickedOnEndBar = false;
    this.clickedOnCenterBar = false;
  }

  update = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawNavOverlay();
    this.controlledChart.onNavChange(this.startBarPos, 1);
  };

  drawNavOverlay() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const startPos = this.startBarPos * (this.chart.width / 2);
    const endPos = this.endBarPos * (this.chart.width / 2);
    this.drawBoundingArea(startPos, endPos);
    this.drawSlider(startPos, endPos);
  }

  drawSlider(start, end) {
    this.ctx.fillStyle = "rgba(193, 214, 229, 0.7)";
    const startPos = Math.round(start);
    const endPos = Math.round(end);
    //  Left Bar
    this.ctx.fillRect(startPos, 0, 6, this.chart.startY / 2);

    //  Right Bar
    this.ctx.fillRect(endPos, 0, 6, this.chart.startY / 2);

    //  Top and Bottom lines
    this.ctx.fillRect(startPos + 6, 0, endPos - startPos - 6, 2);
    this.ctx.fillRect(startPos + 6, this.chart.startY / 2, endPos - startPos - 6, -2);
  }

  drawBoundingArea(start, end) {
    this.ctx.fillStyle = "rgba(221, 234, 243, 0.7)";
    //  Left Area
    this.ctx.fillRect(
      this.chart.startX / 2 - 1,
      0,
      Math.round(start) - this.chart.startX / 2 + 1,
      this.chart.startY / 2
    );

    //  Right Area
    this.ctx.fillRect(
      Math.round(end) + 6,
      0,
      this.chart.endX / 2 - Math.round(end),
      this.chart.startY / 2
    );
  }

  isOnStartBar(x) {
    const startPos = this.startBarPos * this.chart.width;
    this.hoverStartBar = true;
    return x > startPos - 7 && x < startPos + 14;
  }

  isOnEndBar(x) {
    const endPos = this.endBarPos * this.chart.width;
    this.hoverEndBar = true;
    return x > endPos - 7 && x < endPos + 14;
  }

  onMouseMove = e => {
    const { x, y } = e;
    const { chart } = this;
    const rect = this.canvas.getBoundingClientRect();
    const xPos = (x - Math.round(rect.left)) * this.pixelRatio;
    const yPos = (y - Math.round(rect.top)) * this.pixelRatio;
    if (yPos < chart.startY && yPos > chart.endY && xPos > chart.startX && xPos < chart.endX) {
      document.body.style.cursor =
        this.isOnStartBar(xPos) || this.isOnEndBar(xPos) ? "col-resize" : "auto";
    }

    if (this.clickedOnStartBar) {
      const startPos = (xPos - this.chart.startX) / (chart.width + 2);
      // console.log(e);
      console.log(startPos);
      // console.log(xPos);
      this.startBarPos = startPos;
      requestAnimationFrame(() => this.update());
    }
  };

  onMouseDown = e => {
    console.log(e.x);
    const { x, y } = e;
    const { chart } = this;
    const rect = this.canvas.getBoundingClientRect();
    const xPos = (x - Math.round(rect.left)) * this.pixelRatio;
    const yPos = (y - Math.round(rect.top)) * this.pixelRatio;

    if (this.isOnStartBar(xPos)) {
      this.clickedOnStartBar = true;
      console.log("drag");
      // drawNavOverlay()
    }
  };

  onMouseUp = e => {
    this.clickedOnStartBar = false;
  };
}

export default NavChartControls;
