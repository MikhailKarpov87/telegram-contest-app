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
    this.selectedCharts = options.selectedCharts;
    this.pixelRatio = window.devicePixelRatio || 1;
    this.container = options.container;
  }

  setup = () => {
    this.canvas = document.createElement("canvas");
    this.canvas.id = this.name;
    this.canvas.addEventListener("mousemove", this.onMove);

    if ((this.name = "nav_chart_controls")) {
      this.canvas.addEventListener("mousedown", this.onDown);
      this.canvas.addEventListener("mouseup", this.onUp);
      this.canvas.addEventListener("mouseleave", this.onLeave);
    }

    if ((this.name = "main_chart")) {
      this.canvas.addEventListener("mouseleave", this.onLeave);
    }

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
    this.update(this.start, this.end);
  };

  updateSelectedCharts(selectedCharts) {
    this.selectedCharts = selectedCharts;
    this.update(this.start, this.end);
  }

  calcChartData(data, start, end) {
    const { chart } = this;
    let result = [];
    const rangeToStart = this.spaceBetween / this.chart.width;
    console.log(rangeToStart);
    this.startX = start > rangeToStart ? 0 : this.chart.startX - chart.startX * start;
    this.endX = end > 0.99 ? chart.endX : this.canvas.width;

    //  Calculating data for first line
    this.firstItemId = Math.floor(start * data.length);
    const initialItemFraction = 1 / data.length;
    this.startFraction = 1 - (start - initialItemFraction * this.firstItemId) / initialItemFraction;
    const firstValue = data[this.firstItemId];
    const secondValue = data[this.firstItemId + 1];
    const startValue = firstValue + (secondValue - firstValue) * (1 - this.startFraction);

    // Calculating data for last line
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

  onMove = () => {};
  onDown = () => {};
  onUp = () => {};
  onLeave = () => {};
}

export default Chart;
