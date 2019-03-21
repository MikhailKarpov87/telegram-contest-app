import { chartFontSize, colors } from "./constants";

class Chart {
  constructor(options) {
    this.chart = {};
    this.coords = {};
    this.ratio = options.ratio;
    this.data = options.data;
    this.name = options.name;
    this.lineWidth = 4;
    this.start = options.start;
    this.end = options.end;
    this.diff = 0;
    this.colors = colors.dayMode;
    this.range = (this.end - this.start).toFixed(5);
    this.sCharts = options.selectedCharts;
    this.pixelRatio = window.devicePixelRatio || 1;
    this.container = options.container;
    this.an = {
      animDates: 1,
      animChart: 100,
      animFadeChart: 100,
      fadeInChart: null,
      fadeOutChart: null
    };
  }

  setup = controlsDiv => {
    this.canvas = document.createElement("canvas");

    this.canvas.id = this.name;
    this.canvas.addEventListener("mousemove", this.onMove);
    this.canvas.addEventListener("touchmove", this.onMove);

    if ((this.name = "nav_chart_controls")) {
      this.canvas.addEventListener("scroll", this.onScroll);
      this.canvas.addEventListener("mousedown", this.onDown);
      this.canvas.addEventListener("touchstart", this.onDown);
      this.canvas.addEventListener("mouseup", this.onUp);
      this.canvas.addEventListener("touchend", this.onUp);
      this.canvas.addEventListener("mouseleave", this.onLeave);
    }

    if ((this.name = "main_chart")) {
      this.canvas.addEventListener("mouseleave", this.onLeave);
    }

    this.ctx = this.canvas.getContext("2d");

    this.container.appendChild(this.canvas);
    this.controlsDiv = controlsDiv;
    this.resize();
  };

  resize = () => {
    // console.log(this.controlsDiv.clientHeight);
    const { innerWidth, innerHeight } = window;

    const width = Math.round(1.0 * innerWidth);
    let height = Math.round(1.0 * (innerHeight - this.controlsDiv.clientHeight - 50) * this.ratio);
    // alert(height);

    //  Min height for main_chart and nav_chart
    if (this.canvas.id === "main_chart" && height < 200)
      height = Math.round(0.9 * innerHeight * this.ratio);
    if (this.canvas.id !== "main_chart" && height < 80)
      height = Math.round(0.9 * innerHeight * this.ratio);

    this.container.style.width = width + "px";
    this.container.style.height = height + "px";

    this.canvas.width = width * this.pixelRatio;
    this.canvas.height = height * this.pixelRatio;

    this.chart.startX = Math.round(0.05 * this.canvas.width);
    this.chart.endX = Math.round(0.95 * this.canvas.width);
    this.chart.endY = Math.round(0.13 * this.canvas.height);
    this.chart.startY = Math.round(0.83 * this.canvas.height);
    this.chart.width = this.chart.endX - this.chart.startX;
    this.chart.height = this.chart.startY - this.chart.endY;
    this.update(this.start, this.end);
  };

  calcAnimations() {
    //  Get charts data
    this.maxNum = this.getMaxValue(this.data, this.firstItemId, this.lastItemId);
    this.newMaxValueY = this.getYAxisMaxValue(this.maxNum);
    if (!this.maxValueY) this.maxValueY = this.newMaxValueY;

    //  Animating charts
    if (Math.round(this.newMaxValueY) !== Math.round(this.maxValueY)) {
      if (this.an.animChart === 100) {
        this.diff = this.newMaxValueY - this.maxValueY;
        this.startValue = this.maxValueY;
        this.prevAxisValue = this.maxValueY;
        this.newAxisValue = this.newMaxValueY;
      }

      this.maxValueY = Math.round(this.startValue + (this.diff * (100 - this.an.animChart)) / 100);
      this.an.animChart -= 5;
    }
    //  End animating charts

    //  Animating charts fade in/out
    if (this.an.animFadeChart < 100) {
      this.an.animFadeChart -= 5;

      if (this.an.animFadeChart <= 0) {
        this.an.fadeOutChart &&
          this.sCharts.includes(this.an.fadeOutChart) &&
          this.sCharts.splice(this.sCharts.indexOf(this.an.fadeOutChart), 1);

        this.an.animFadeChart = 100;
        this.an.fadeInChart = null;
        this.an.fadeOutChart = null;
      }
    }

    if (this.an.animChart <= 0) {
      this.an.animChart = 100;
      this.maxValueY = this.newMaxValueY;
    }
  }

  drawErrorMessage() {
    this.ctx.save();
    const fontSize = Math.round(chartFontSize * +this.pixelRatio) * 2;
    this.ctx.font = `300 ${fontSize}px ${this.colors.axisFontsList}`;
    this.ctx.fillStyle = this.colors.axisFontColor(1);
    this.ctx.textAlign = "center";
    const x = Math.round(this.chart.startX + this.chart.width / 2);
    const y = Math.round(this.chart.height / 2);
    this.ctx.fillText("No charts selected :(", x, y);
    this.ctx.restore();
  }

  calcChartData(data, start, end) {
    const { chart } = this;
    let result = [];
    const rangeToStart = this.spaceBetween / this.chart.width;
    // startX = start > rangeToStart ? 0 : chart.startX * start;
    // kinda working:
    // this.startX =
    //   start > rangeToStart ? 0 : this.chart.startX - (chart.width + this.chart.startX) * start;
    // this.endX = end > 0.99 ? chart.endX : this.canvas.width;
    this.startX = this.chart.startX;
    this.endX = this.chart.endX;

    //  Calculating data for start line
    this.firstItemId = Math.floor(start * data.length);
    const initialItemFraction = 1 / data.length;
    this.startFraction = 1 - (start - initialItemFraction * this.firstItemId) / initialItemFraction;
    const firstValue = data[this.firstItemId];
    const secondValue = data[this.firstItemId + 1];
    const startValue = firstValue + (secondValue - firstValue) * (1 - this.startFraction);

    // Calculating data for end line
    this.lastItemId = Math.ceil(end * data.length);
    const endFraction = 1 - (initialItemFraction * this.lastItemId - end) / initialItemFraction;

    //  Slicing array
    const slicedData = data.slice(this.firstItemId, this.lastItemId);

    // Calculating value for last item
    const arraySize = slicedData.length - 1;
    const endValue =
      slicedData[arraySize] +
      (slicedData[arraySize - 1] - slicedData[arraySize]) * (1 - endFraction);

    this.spaceBetween =
      (this.endX - this.startX) / (slicedData.length - 3 + this.startFraction + endFraction);

    const y0 = Math.round(chart.startY - (startValue / this.maxValueY) * chart.height);
    const x0 = Math.round(this.startX);

    const yLast = Math.round(chart.startY - (endValue / this.maxValueY) * chart.height);
    const xLast = Math.round(this.endX);

    slicedData.map((value, i) => {
      const y = Math.round(chart.startY - (value / this.maxValueY) * chart.height);
      const x = Math.round(this.startX + (i - 1 + this.startFraction) * this.spaceBetween);
      result.push({ x, y });
    });

    result[0] = { x: x0, y: y0 };
    result[arraySize] = { x: xLast, y: yLast };

    return result;
  }

  drawChart(data, type, color) {
    const { chart } = this;
    this.ctx.save();
    if (type === this.an.fadeOutChart && this.an.animFadeChart) {
      this.ctx.globalAlpha = (this.an.animFadeChart / 100).toFixed(3);
    }

    if (type === this.an.fadeInChart && this.an.animFadeChart) {
      this.ctx.globalAlpha = 1 - (this.an.animFadeChart / 100).toFixed(3);
    }

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
    this.ctx.restore();
  }

  updateSelectedCharts(checked, id) {
    this.an.fadeInChart = null;
    this.an.fadeOutChart = null;
    this.hoverItem = null;
    if (checked && !this.sCharts.includes(id)) {
      this.an.fadeInChart = id;
      this.an.animFadeChart -= 1;
      this.sCharts.push(this.an.fadeInChart);
    }
    if (!checked && this.sCharts.includes(id)) {
      this.an.fadeOutChart = id;
      this.an.animFadeChart -= 1;
    }

    requestAnimationFrame(() => this.update(this.start, this.end));
  }

  getMaxValue(data, start, end) {
    let selectedCharts = [...this.sCharts];

    this.an.fadeOutChart &&
      selectedCharts.includes(this.an.fadeOutChart) &&
      selectedCharts.splice(selectedCharts.indexOf(this.an.fadeOutChart), 1);

    this.an.fadeInChart &&
      !selectedCharts.includes(this.an.fadeInChart) &&
      selectedCharts.push(this.an.fadeInChart);

    return Math.max(
      ...selectedCharts.map(line => Math.max(...data.columns[line].slice(start, end)))
    );
  }

  getYAxisMaxValue(max) {
    const divider = Math.max(10, 10 ** (max.toString().length - 1));
    const closestMax = Math.ceil(max / divider) * divider;
    const maxValue = Math.max(closestMax, Math.round(max / divider) * divider);
    return maxValue;
  }

  findClosestItem(x, coords) {
    return coords
      .map(value => Math.abs(value.x - x))
      .reduce((min, x, i, arr) => (x < arr[min] ? i : min), 0);
  }

  switchNightMode(nightmodeIsOn) {
    this.colors = nightmodeIsOn ? colors.nightMode : colors.dayMode;

    if (this.tooltip) {
      this.tooltip.style.backgroundColor = this.colors.tooltipBgColor;
      this.tooltip.style.color = this.colors.tooltipColor;
      this.tooltip.style.mozBoxShadow = this.colors.tooltipShadow;
      this.tooltip.style.webkitBoxShadow = this.colors.tooltipShadow;
      this.tooltip.style.boxShadow = this.colors.tooltipShadow;
    }
    requestAnimationFrame(() => this.update(this.start, this.end));
  }

  onMove = () => {};
  onDown = () => {};
  onUp = () => {};
  onLeave = () => {};
}

export default Chart;
