import Chart from "./chart";

class NavChartControls extends Chart {
  constructor(options) {
    super(options);
    this.controlledChart = options.controlledChart;
    this.startBarPos = 0.6;
    this.endBarPos = 0.9;
    this.mouse = {
      x: undefined,
      y: undefined,
      hover: null,
      click: null
    };

    this.clickedOnStartBar = false;
    this.clickedOnEndBar = false;
    this.clickedOnCenterBar = false;
  }

  update = () => {
    this.rect = this.canvas.getBoundingClientRect();
    this.startX = this.chart.startX / this.pixelRatio;
    this.startY = this.chart.startY / this.pixelRatio;
    this.endX = this.chart.endX / this.pixelRatio;
    this.endY = this.chart.endY / this.pixelRatio;
    this.startPos = this.startBarPos * this.chart.width;
    this.endPos = this.endBarPos * this.chart.width;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawNavOverlay();
    this.controlledChart.onNavChange(this.startBarPos, this.endBarPos);
  };

  drawNavOverlay() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const startPos = (this.startBarPos * this.chart.width) / this.pixelRatio + this.startX;
    const endPos =
      (this.endBarPos * this.chart.width) / this.pixelRatio + this.chart.startX / this.pixelRatio;
    this.drawBoundingArea(Math.round(startPos), Math.round(endPos));
    this.drawSlider(Math.round(startPos), Math.round(endPos));
  }

  drawSlider(start, end) {
    this.ctx.fillStyle = "rgba(193, 214, 229, 0.7)";

    //  Left Bar
    this.ctx.fillRect(start, 0, 6, this.startY);

    //  Right Bar
    this.ctx.fillRect(end, 0, 6, this.startY);

    //  Top and Bottom lines
    this.ctx.fillRect(start + 6, 0, end - start - 6, 2);
    this.ctx.fillRect(start + 6, this.chart.startY / this.pixelRatio, end - start - 6, -2);
  }

  drawBoundingArea(start, end) {
    this.ctx.fillStyle = "rgba(221, 234, 243, 0.7)";
    //  Left Area
    this.ctx.fillRect(this.startX - 1, 0, start - this.startX + 1, this.startY);

    //  Right Area
    this.ctx.fillRect(end + 6, 0, this.endX - end, this.startY);
  }

  isHoverSlider(x) {
    //  outside of Slider
    if (this.mouse.y < 0 && this.mouse.y > this.startY * this.pixelRatio) {
      console.log("outside");
      if (this.mouse.hover) document.body.style.cursor = "auto";
      this.mouse.hover = null;
      return false;
    }

    // StartBar
    if (x > this.startPos - 7 && x < this.startPos + 14) {
      this.mouse.hover = "startBarPos";
      document.body.style.cursor = "col-resize";
      return true;
    }

    //  EndBar
    if (x > this.endPos - 7 && x < this.endPos + 14) {
      this.mouse.hover = "endBarPos";
      document.body.style.cursor = "col-resize";
      return true;
    }

    //  CenterBar
    if (x >= this.startPos + 14 && x <= this.endPos - 7) {
      this.mouse.hover = "centerBarPos";
      document.body.style.cursor = "all-scroll";
      return true;
    }

    document.body.style.cursor = "auto";
    this.mouse.hover = false;
    return false;
  }

  onMove = e => {
    this.mouse.x = (e.x - this.rect.left) * this.pixelRatio - this.chart.startX;
    this.mouse.y = (e.y + this.rect.top + this.endY) * this.pixelRatio - this.chart.startY;
    this.isHoverSlider(this.mouse.x);

    if (this.mouse.click) {
      const clickXPos = this.mouse.x / this.chart.width;
      console.log(clickXPos);
      if (this.mouse.click === "centerBarPos") {
        this.centerBarClick = clickXPos;
        const rangeToStart = clickXPos - this.startBarPos;
        this.centerBarPos = this.startBarPos + rangeToStart;
        const rangeToEnd = this.endBarPos - clickXPos;

        // this.startBarPos = this.mouse
      }
      this[this.mouse.click] = clickXPos;
      requestAnimationFrame(() => this.update());
    }
  };

  onDown = e => {
    if (this.mouse.hover) {
      this.mouse.click = this.mouse.hover;
      this.mouse.clickPosX = this.mouse.hover;
    }
  };

  onUp = e => {
    this.mouse.click = false;
  };

  onLeave = e => {
    document.body.style.cursor = "auto";
    this.mouse.click = false;
    this.mouse.hover = false;
  };
}

export default NavChartControls;
