import Chart from "./chart";

import { getYAxisMaxValue } from "./helpers";

class NavChart extends Chart {
  constructor(options) {
    super(options);
    this.lineWidth = 3;
    this.start = 0;
    this.end = 1;
    this.diff = 0;
  }

  update = (start, end) => {
    console.log(this);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //  Get charts data
    this.maxNum = this.getMaxValue(this.data, 0, this.data.columns.x.length - 1);
    this.newMaxValueY = this.getYAxisMaxValue(this.maxNum);
    if (!this.maxValueY) this.maxValueY = this.newMaxValueY;

    //  Animating charts
    if (Math.round(this.newMaxValueY) !== Math.round(this.maxValueY)) {
      if (this.animate.animChart === 100) {
        this.diff = this.newMaxValueY - this.maxValueY;
        this.startValue = this.maxValueY;
      }

      this.maxValueY = Math.round(
        this.startValue + (this.diff * (100 - this.animate.animChart)) / 100
      );
      requestAnimationFrame(() => this.update(0, 1));
      this.animate.animChart -= 4;
    }

    //  Animating charts fade in/out
    if (this.animate.animFadeChart < 100) {
      this.animate.animFadeChart -= 4;

      if (this.animate.animFadeChart <= 0) {
        this.animate.fadeOutChart &&
          this.selectedCharts.includes(this.animate.fadeOutChart) &&
          this.selectedCharts.splice(this.selectedCharts.indexOf(this.animate.fadeOutChart), 1);

        this.animate.animFadeChart = 100;
        this.animate.fadeInChart = null;
        this.animate.fadeOutChart = null;
      }
    }

    if (this.animate.animChart <= 0) {
      this.animate.animChart = 100;
      this.maxValueY = this.newMaxValueY;
    }

    this.selectedCharts.map(line => {
      this.coords = this.calcChartData(this.data.columns[line], this.start, this.end);
      this.drawChart(this.coords, line, this.data.colors[line]);
    });
    // console.log("nav:" + this.animate.animFadeChart);
    if (this.animate.animFadeChart < 100 || this.animate.animChart < 100) {
      requestAnimationFrame(() => this.update(this.start, this.end));
    }
  };
}

export default NavChart;
