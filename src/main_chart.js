import {
  axisFontColor,
  axisLinesColor,
  months,
  chartFontSize,
  bgColorDay,
  bgColorNight,
  hoverLineColor,
  weekdays
} from "./constants";
import Chart from "./chart";

import { findClosestItem, getItemsPositions, getYAxisMaxValue } from "./helpers";

class MainChart extends Chart {
  constructor(options) {
    super(options);
    this.start = 0;
    this.end = 1;
    this.hoverItem = null;
  }

  onNavChange = (start, end) => {
    this.hoverItem = null;
    const getData = (start, end) => {
      const data = this.data;
      if (start > 0 || end < 1) {
        if (start > 0.9) start = 0.9;
        if (end < 0.1) end = 0.1;
        const itemsNum = data.columns.x.length;
        const spaceBetween = 1 / itemsNum;
        const firstItemId = Math.floor(start / spaceBetween);
        const itemPosition = (1 / itemsNum) * firstItemId;
        this.deltaFirstX = 1 - (start - itemPosition) / spaceBetween;

        let newColumns = {};
        for (let column in data.columns) {
          if (column === "x") newColumns[column] = data.columns[column];
          newColumns[column] = data.columns[column].slice(firstItemId);
          const deltaY = newColumns[column][1] - newColumns[column][0];
          newColumns[column][0] = newColumns[column][1] - this.deltaFirstX * deltaY;
        }
        return { ...data, columns: newColumns };
      } else {
        return this;
      }
    };

    const data = getData(start, end);

    requestAnimationFrame(() => this.update(this.data, start, end));
  };

  update = (data, start, end) => {
    this.start = start;
    this.end = end;
    //  Here probably should go some func to compare newData and this.data
    //  For animation, etc.
    // this.data = data;

    const { chart } = this;

    this.maxNum = Math.max(...this.selectedLines.map(line => Math.max(...data.columns[line])));
    if (this.maxNum === 0) return;

    this.maxValueY = getYAxisMaxValue(this.maxNum);
    this.itemsNum = data.columns.x.length;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawAxis();
    this.drawGridLines();
    this.drawDatesLegend(data.columns.x);

    this.hoverItem && this.drawHoverGrid();

    this.selectedLines.map(line => {
      this.coords[line] = this.calcCoordinates(data.columns[line], start, end);
      this.hoverItem !== null && this.drawHoverGrid(this.coords[line][this.hoverItem].x);
      this.drawChart(this.coords[line], line, data.colors[line]);
      if (this.hoverItem !== null) {
        this.drawHoverPoint(this.coords[line][this.hoverItem], this.data.colors[line]);
        this.showTooltip();
      }
    });
  };

  onMouseMove = e => {
    const { x, y } = e;
    const { chart } = this;
    const rect = this.canvas.getBoundingClientRect();
    const xPos = (x - Math.round(rect.left)) * this.pixelRatio;
    const yPos = (y - Math.round(rect.top)) * this.pixelRatio;
    // console.log("mouse: " + xPos + "|" + yPos);
    // console.log(chart);

    if (
      this.selectedLines.length &&
      yPos < chart.startY &&
      yPos > chart.endY &&
      xPos > chart.startX &&
      xPos < chart.endX
    ) {
      this.hoverItem = findClosestItem(xPos, this.coords[this.selectedLines[0]]);
      requestAnimationFrame(() => this.update(this.data, this.selectedLines, this.start, this.end));
    }
  };

  drawAxis() {
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.chart.startX, this.chart.startY);
    this.ctx.lineTo(this.chart.endX, this.chart.startY);
    this.ctx.strokeStyle = axisLinesColor;
    this.ctx.stroke();
  }

  drawDatesLegend(data) {
    const fontSize = Math.round(chartFontSize * +this.pixelRatio);
    this.ctx.font = `300 ${fontSize}px BlinkMacSystemFont`;
    this.ctx.fillStyle = axisFontColor;

    //  Calculate -nth number for drawing only up to 6 dates
    const nthDate = data.length > 6 ? Math.round(data.length / 6) : 1;

    data.map((value, i) => {
      //Draw only -nth dates
      if (!(i % nthDate)) {
        const pos = this.chart.startX + (i * this.chart.width) / this.itemsNum;
        const date = new Date(value);
        const label = months[date.getMonth()] + " " + date.getDate();
        this.ctx.fillText(label, pos, this.chart.startY + this.chart.height * 0.06);
      }
    });
  }

  drawGridLines() {
    const fontSize = Math.round(chartFontSize * +this.pixelRatio);
    this.ctx.font = `300 ${fontSize}px BlinkMacSystemFont`;
    this.ctx.strokeStyle = axisLinesColor;
    this.ctx.fillStyle = axisFontColor;

    for (let i = 1; i <= 5; i++) {
      const height = this.chart.startY - (i * this.chart.height) / 5;
      const currentValue = (this.maxValueY * i) / 5;
      this.ctx.fillText(currentValue, this.chart.startX, height - 0.5 * fontSize);
      this.ctx.beginPath();
      this.ctx.moveTo(this.chart.startX, height);
      this.ctx.lineTo(this.chart.endX, height);
      this.ctx.stroke();
    }

    this.ctx.fillText(0, this.chart.startX, this.chart.startY - 0.5 * fontSize);
  }

  drawHoverPoint(coords, color) {
    const { ctx } = this;
    const { x, y } = coords;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.moveTo(x, y);
    ctx.arc(x, y, 6, 0, Math.PI * 2, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.fillStyle = bgColorDay;
    ctx.arc(x, y, 4, 0, Math.PI * 2, false);
    ctx.fill();
  }

  drawHoverGrid(x) {
    const { ctx, chart } = this;
    ctx.lineWidth = 1;
    ctx.strokeStyle = hoverLineColor;
    ctx.beginPath();
    ctx.moveTo(x, chart.startY);
    ctx.lineTo(x, chart.endY);

    ctx.stroke();
  }

  showTooltip() {
    const { ctx, chart, hoverItem } = this;
    const x = chart.startX + (hoverItem / this.itemsNum) * chart.width;
    const tooltip = document.getElementById("tooltip");
    const tooltipDate = document.getElementsByClassName("tooltip-date")[0];
    const tooltipInfo = document.getElementsByClassName("tooltip-info")[0];
    const date = new Date(this.data.columns.x[hoverItem]);
    const label = weekdays[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate();
    tooltipDate.innerHTML = label;
    tooltipInfo.innerHTML = "";

    this.selectedLines.map(line => {
      const number = this.data.columns[line][hoverItem];
      const label = this.data.names[line];
      const color = this.data.colors[line];
      const infoDiv = document.createElement("div");
      infoDiv.style = `
      color: ${color};
    `;
      const numDiv = document.createElement("div");
      numDiv.className = "num";
      numDiv.innerHTML = number;
      const labelDiv = document.createElement("div");
      labelDiv.className = "label";
      labelDiv.innerHTML = label;
      infoDiv.appendChild(numDiv);
      infoDiv.appendChild(labelDiv);
      tooltipInfo.appendChild(infoDiv);
    });
  }
}

export default MainChart;
