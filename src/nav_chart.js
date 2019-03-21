import Chart from "./chart";

class NavChart extends Chart {
  constructor(options) {
    super(options);
    this.lineWidth = 3;
    this.start = 0;
    this.end = 1;
    this.diff = 0;
  }

  update = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.makeAnimations();

    this.sCharts.map(line => {
      this.coords = this.calcChartData(this.data.columns[line], this.start, this.end);
      this.drawChart(this.coords, line, this.data.colors[line]);
    });

    if (this.an.animFadeChart < 100 || this.an.animChart < 100) {
      requestAnimationFrame(() => this.update(this.start, this.end));
    }
  };
}

export default NavChart;
