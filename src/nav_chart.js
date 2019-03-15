import Chart from "./chart";

import { findClosestItem, getItemsPositions, getYAxisMaxValue } from "./helpers";

class NavChart extends Chart {
  constructor(options) {
    super(options);
    this.lineWidth = 3;
  }

  update = (newData, selectedLines) => {
    //  Here probably should go some func to compare newData and this.data
    //  For animation, etc.
    this.data = newData;
    const { data, chart } = this;
    this.maxNum = Math.max(...this.selectedLines.map(line => Math.max(...data.columns[line])));
    if (this.maxNum === 0) return;

    this.maxValueY = getYAxisMaxValue(this.maxNum);
    this.itemsNum = data.columns.x.length;
    this.currentItemsPositions = getItemsPositions(chart.startX, chart.width, this.itemsNum);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.selectedLines.map(line => {
      this.coords = this.calcCoordinates(data.columns[line], this.start, this.end);
      this.drawChart(this.coords, line, data.colors[line]);
    });
  };
}

export default NavChart;
