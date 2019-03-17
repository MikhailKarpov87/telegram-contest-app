import Chart from "./chart";
import { navOverlayColor } from "./constants";

class NavChartControls extends Chart {
  constructor(options) {
    super(options);
    this.controlledChart = options.controlledChart;
    this.startBarPos = 0.6;
    this.endBarPos = 0.9;
    this.barWidth = 6;
    this.mouse = {
      x: undefined,
      y: undefined,
      hover: null,
      click: null
    };
    this.minBarSize = 0.1;
    this.clickedOnStartBar = false;
    this.clickedOnEndBar = false;
    this.clickedOnCenterBar = false;
    this.pixelRatio = 1;
  }

  update = () => {
    this.rect = this.canvas.getBoundingClientRect();
    this.startX = this.chart.startX;
    this.startY = this.chart.startY;
    this.endX = this.chart.endX;
    this.endY = this.chart.endY;
    this.startPos = this.startBarPos * this.chart.width;
    this.endPos = this.endBarPos * this.chart.width;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawNavOverlay();
    this.controlledChart.onNavChange(this.startBarPos, this.endBarPos);
  };

  drawNavOverlay() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const startPos = this.startBarPos * this.chart.width + this.startX;
    const endPos = this.endBarPos * this.chart.width + this.chart.startX;
    this.drawBoundingArea(Math.round(startPos), Math.round(endPos));
    this.drawSlider(Math.round(startPos), Math.round(endPos));
  }

  drawSlider(start, end) {
    this.ctx.fillStyle = "rgba(193, 214, 229, 0.7)";

    //  Left Bar
    this.ctx.fillRect(start, 0, this.barWidth, this.startY);

    //  Right Bar
    this.ctx.fillRect(end - 2, 0, this.barWidth, this.startY);

    //  Top and Bottom lines
    this.ctx.fillRect(start + this.barWidth, 0, end - start - this.barWidth - 2, 2);
    this.ctx.fillRect(start + this.barWidth, this.startY, end - start - this.barWidth - 2, -2);
  }

  drawBoundingArea(start, end) {
    this.ctx.fillStyle = navOverlayColor;
    //  Left Area
    this.ctx.fillRect(this.startX - 1, 0, start - this.startX + 1, this.startY);

    //  Right Area
    this.ctx.fillRect(end + 2, 0, this.endX - end, this.startY);
  }

  isHoverSlider(x) {
    //  Outside of Slider
    if (this.mouse.y < 0 && this.mouse.y > this.startY) {
      if (this.mouse.hover) document.body.style.cursor = "auto";
      this.mouse.hover = null;
      return false;
    }

    // StartBar
    if (x > this.startPos - 7 && x < this.startPos + this.barWidth + 10) {
      this.mouse.hover = "startBarPos";
      document.body.style.cursor = "col-resize";
      return true;
    }

    //  EndBar
    if (x > this.endPos - 7 && x < this.endPos + this.barWidth + 10) {
      this.mouse.hover = "endBarPos";
      document.body.style.cursor = "col-resize";
      return true;
    }

    //  CenterBar
    if (x >= this.startPos + this.barWidth + 10 && x <= this.endPos - 7) {
      this.mouse.hover = "centerBarPos";

      document.body.style.cursor = "all-scroll";
      return true;
    }

    document.body.style.cursor = "auto";
    this.mouse.hover = false;
    return false;
  }

  onMove = e => {
    this.mouse.x = e.x - this.rect.left - this.chart.startX;
    this.mouse.y = e.y + this.rect.top + this.endY - this.chart.startY;
    this.isHoverSlider(this.mouse.x);

    if (this.mouse.click) {
      const clickXPos = this.mouse.x / this.chart.width;

      switch (this.mouse.click) {
        case "startBarPos":
          if (clickXPos < 0 || clickXPos > 1 || clickXPos > this.endBarPos - this.minBarSize) {
            return;
          }
          this.startBarPos = clickXPos;
          requestAnimationFrame(() => this.update());
          break;
        case "endBarPos":
          if (clickXPos < 0 || clickXPos > 1 || clickXPos < this.startBarPos + this.minBarSize) {
            return;
          }
          this.endBarPos = clickXPos;
          requestAnimationFrame(() => this.update());
          break;
        case "centerBarPos":
          const deltaX = this.centerClickOffsetX - clickXPos;
          if (this.startBarPos - deltaX < 0 || this.endBarPos - deltaX > 1) {
            return;
          }
          this.startBarPos -= deltaX;
          this.endBarPos -= deltaX;
          this.centerClickOffsetX = clickXPos;
          requestAnimationFrame(() => this.update());
          break;
      }
    }
  };

  onDown = () => {
    if (this.mouse.hover) {
      this.mouse.click = this.mouse.hover;

      if (this.mouse.hover === "centerBarPos")
        this.centerClickOffsetX = this.mouse.x / this.chart.width;
    }
  };

  onUp = () => {
    this.mouse.click = false;
  };

  onLeave = () => {
    document.body.style.cursor = "auto";
    this.mouse.click = false;
    this.mouse.hover = false;
  };
}

export default NavChartControls;
