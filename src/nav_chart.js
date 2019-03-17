import Chart from "./chart";

import { getYAxisMaxValue } from "./helpers";

class NavChart extends Chart {
  constructor(options) {
    super(options);
    this.lineWidth = 3;
  }

  update = (data, start, end) => {
    //  Here probably should go some func to compare newData and this.data
    //  For animation, etc.

    this.maxNum = Math.max(...this.selectedLines.map(line => Math.max(...data.columns[line])));
    if (this.maxNum === 0) return;

    this.maxValueY = getYAxisMaxValue(this.maxNum);
    this.itemsNum = data.columns.x.length;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.selectedLines.map(line => {
      this.coords = this.calcChartData(data.columns[line], this.start, this.end);
      this.drawChart(this.coords, line, data.colors[line]);
    });
  };
}

export default NavChart;
