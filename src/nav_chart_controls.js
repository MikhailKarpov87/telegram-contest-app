import Chart from "./chart";

class NavChartControls extends Chart {
  constructor(options) {
    super(options);
    this.controlledChart = options.controlledChart;
    this.startBarPos = options.start;
    this.endBarPos = options.end;
    this.barWidth = 6;
    //  Mouse/pointer data
    this.m = {
      x: undefined,
      y: undefined,
      hover: null,
      click: null
    };
    this.multiTouch = false;
    this.minBarSize = 0.1;
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
    this.drawOverlay(Math.round(startPos), Math.round(endPos));
    this.drawSlider(Math.round(startPos), Math.round(endPos));
  }

  drawSlider(start, end) {
    this.ctx.fillStyle = this.colors.sliderColor;

    //  Left Bar
    this.ctx.fillRect(start, 0, this.barWidth, this.startY);

    //  Right Bar
    this.ctx.fillRect(end - 2, 0, this.barWidth, this.startY);

    //  Top and Bottom lines
    this.ctx.fillRect(start + this.barWidth, 0, end - start - this.barWidth - 2, 2);
    this.ctx.fillRect(start + this.barWidth, this.startY, end - start - this.barWidth - 2, -2);
  }

  drawOverlay(start, end) {
    this.ctx.fillStyle = this.colors.navOverlayColor;
    //  Left Area
    this.ctx.fillRect(this.startX - 1, 0, start - this.startX + 1, this.startY);

    //  Right Area
    this.ctx.fillRect(end + 2, 0, this.endX - end, this.startY);
  }

  isHover(x) {
    //  Outside of Chart
    if (this.m.y < 0 && this.m.y > this.startY) {
      if (this.m.hover) document.body.style.cursor = "auto";
      this.m.hover = null;
      return false;
    }

    // On Chart zone
    if (x > 0 && x < this.startPos - 7 && x > this.endPos + this.barWidth + 10 && x < this.endX) {
      this.m.hover = "outOfSlidebar";
      document.body.style.cursor = "col-resize";
      return true;
    }

    // StartBar
    if (x > this.startPos - 7 && x < this.startPos + this.barWidth + 10) {
      this.m.hover = "startBarPos";
      document.body.style.cursor = "col-resize";
      return true;
    }

    //  EndBar
    if (x > this.endPos - 7 && x < this.endPos + this.barWidth + 10) {
      this.m.hover = "endBarPos";
      document.body.style.cursor = "col-resize";
      return true;
    }

    //  CenterBar
    if (x >= this.startPos + this.barWidth + 10 && x <= this.endPos - 7) {
      this.m.hover = "centerBarPos";
      document.body.style.cursor = "all-scroll";
      return true;
    }

    document.body.style.cursor = "auto";
    this.m.hover = false;
    return false;
  }

  handleMultiTouch = e => {
    const leftTouchPos =
      e.touches[0].pageX < e.touches[1].pageX
        ? (e.touches[0].pageX - this.rect.left - this.chart.startX) / this.chart.width
        : (e.touches[1].pageX - this.rect.left - this.chart.startX) / this.chart.width;

    const rightTouchPos =
      e.touches[0].pageX < e.touches[1].pageX
        ? (e.touches[1].pageX - this.rect.left - this.chart.startX) / this.chart.width
        : (e.touches[0].pageX - this.rect.left - this.chart.startX) / this.chart.width;

    if (leftTouchPos < 0 || leftTouchPos > 1 || leftTouchPos > this.endBarPos - this.minBarSize) {
      return;
    }
    if (
      rightTouchPos < 0 ||
      rightTouchPos > 1 ||
      rightTouchPos < this.startBarPos + this.minBarSize
    ) {
      return;
    }
    this.startBarPos = leftTouchPos;
    this.endBarPos = rightTouchPos;
    requestAnimationFrame(() => this.update());
  };

  onMove = e => {
    e.preventDefault();

    if (this.multiTouch) this.handleMultiTouch(e);

    const x = e.touches ? e.touches[0].pageX : e.x;
    const y = e.touches ? e.touches[0].pageY : e.y;
    this.m.x = x - this.chart.startX;
    this.m.y = y + this.rect.top + this.endY - this.chart.startY;
    this.isHover(this.m.x);

    if (this.m.click) {
      const clickXPos = this.m.x / this.chart.width;

      switch (this.m.click) {
        case "startBarPos":
          if (clickXPos < 0 || clickXPos > 1 || clickXPos > this.endBarPos - this.minBarSize) {
            return;
          }
          if (clickXPos < 0.01) this.startBarPos = 0;
          this.startBarPos = clickXPos;
          break;
        case "endBarPos":
          if (clickXPos < 0 || clickXPos > 1 || clickXPos < this.startBarPos + this.minBarSize) {
            return;
          }
          if (clickXPos > 0.99) this.endBarPos = 1;
          this.endBarPos = clickXPos;
          break;
        case "centerBarPos":
          const deltaX = this.centerClickOffsetX - clickXPos;
          if (this.startBarPos - deltaX < 0 || this.endBarPos - deltaX > 1) {
            return;
          }
          this.startBarPos -= deltaX;
          this.endBarPos -= deltaX;
          this.centerClickOffsetX = clickXPos;
          break;
      }
      requestAnimationFrame(() => this.update());
    }
  };

  onDown = e => {
    e.preventDefault();

    //  Multi-touch event
    if (e.touches && e.touches.length === 2) {
      this.multiTouch = true;
      return;
    }

    const x = e.touches ? e.touches[0].pageX : e.x;
    this.m.x = x - this.rect.left - this.chart.startX;

    this.isHover(this.m.x);

    if (this.m.hover) {
      this.m.click = this.m.hover;
      if (this.m.hover === "centerBarPos") this.centerClickOffsetX = this.m.x / this.chart.width;
    }
  };

  onUp = e => {
    e.preventDefault();
    this.m.click = false;
    this.multiTouch = false;
  };

  onLeave = () => {
    document.body.style.cursor = "auto";
    this.m.click = false;
    this.m.hover = false;
  };
}

export default NavChartControls;
