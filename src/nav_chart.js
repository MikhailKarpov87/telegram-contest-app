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

import { findClosestItem, getItemsPositions, getYAxisMaxValue } from "./helpers";

class NavChart {
  constructor(data, selectedLines) {
    this.data = data;
    this.selectedLines = selectedLines;
  }

  setup = () => {
    this.chart = {};
    this.canvas = {};
    this.ratio = 0.5;
    this.dpi = window.devicePixelRatio;
    this.canvas = document.createElement("canvas");
    this.canvas.id = "nav_chart";
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    document.getElementById("nav_chart_container").appendChild(this.canvas);
    this.canvas.style = `
            width: 100%;
            height: 100%;
        `;
    this.ctx = this.canvas.getContext("2d");

    this.resize();
    this.fix_dpi();
    this.update(this.data, this.selectedLines);
  };

  fix_dpi = () => {
    const canvas = document.getElementById("main_chart");
    const style = {
      height() {
        return (
          +getComputedStyle(canvas)
            .getPropertyValue("width")
            .slice(0, -2) * this.ratio
        );
      },
      width() {
        return +getComputedStyle(canvas)
          .getPropertyValue("width")
          .slice(0, -2);
      }
    };

    this.canvas.setAttribute("width", style.width() * this.dpi);
    this.canvas.setAttribute("height", style.height() * this.dpi);

    this.ctx.scale(this.dpi, this.dpi);
  };

  update = (newData, selectedLines) => {
    //  Here probably should go some func to compare newData and this.data
    this.data = newData;
    const { data, chart } = this;
    this.maxNum = Math.max(...this.selectedLines.map(line => Math.max(...data.columns[line])));
    if (this.maxNum === 0) return;

    this.maxValueY = getYAxisMaxValue(this.maxNum);
    this.itemsNum = data.columns.x.length;
    this.currentItemsPositions = getItemsPositions(chart.startX, chart.width, this.itemsNum);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.selectedLines.map(line => this.drawChart(data.columns[line], line, data.colors[line]));
  };

  resize() {
    const { innerWidth, innerHeight } = window;

    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight * this.dpi * this.ratio;
    this.chart.startX = Math.round(0.05 * this.canvas.width);
    this.chart.endX = Math.round(0.95 * this.canvas.width);
    this.chart.endY = Math.round(0.05 * this.canvas.height);
    this.chart.startY = Math.round(0.95 * this.canvas.height);
    this.chart.width = innerWidth;
    this.chart.height = innerWidth * this.ratio;
  }

  onMouseMove = e => {
    const { x, y } = e;
    const { chart } = this;
    const rect = this.canvas.getBoundingClientRect();
    const xPos = x - Math.round(rect.left);
    const yPos = y - Math.round(rect.top);

    if (yPos < chart.startY && yPos > chart.endY && xPos > chart.startX && xPos < chart.endX) {
      this.hoverItem = findClosestItem(xPos, this.currentItemsPositions);

      requestAnimationFrame(() => this.update(this.data, this.selectedLines));
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
    this.ctx.font = `${this.chart.height * chartFontSize}px -apple-system`;
    this.ctx.fillStyle = axisFontColor;

    //  Calculate -nth number for drawing only up to 6 dates
    const nthDate = data.length > 6 ? Math.round(data.length / 6) : 1;

    data.map((value, i) => {
      //Draw only -nth dates
      if (!(i % nthDate)) {
        const pos = this.chart.startX + (i * this.chart.width) / this.itemsNum;
        const date = new Date(value);
        const label = months[date.getMonth()] + " " + date.getDate();
        this.ctx.fillText(label, pos, this.chart.startY + this.chart.height * 0.03);
      }
    });
  }

  drawGridLines() {
    this.ctx.font = `${this.chart.height * chartFontSize}px -apple-system`;
    this.ctx.strokeStyle = axisLinesColor;
    this.ctx.fillStyle = axisFontColor;

    for (let i = 1; i <= 5; i++) {
      const height = this.chart.startY - (i * this.chart.height) / 5;
      const currentValue = (this.maxValueY * i) / 5;
      this.ctx.fillText(currentValue, this.chart.startX, height - this.chart.height * 0.02);
      this.ctx.beginPath();
      this.ctx.moveTo(this.chart.startX, height);
      this.ctx.lineTo(this.chart.endX, height);
      this.ctx.stroke();
    }

    this.ctx.fillText(0, this.chart.startX, this.chart.startY - this.chart.height * 0.02);
  }

  drawChart(data, type, color) {
    const { chart, itemsNum, hoverItem } = this;
    this.ctx.beginPath();
    this.ctx.moveTo(chart.startX, chart.startY);
    data.map((value, i) => {
      const y = Math.round(chart.height - ((value / this.maxValueY) * chart.height + chart.endY));
      const x = Math.round(chart.startX + (i / itemsNum) * chart.width);
      i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
    });

    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  drawHoverPoints() {
    const { ctx, hoverItem, itemsNum, chart } = this;

    this.selectedLines.map(line => {
      const value = this.data.columns[line][hoverItem];
      const y = Math.round(chart.height - ((value / this.maxValueY) * chart.height + chart.endY));
      const x = Math.round(chart.startX + (hoverItem / itemsNum) * chart.width);

      ctx.beginPath();
      ctx.strokeStyle = this.data.colors[line];
      ctx.lineWidth = 3;
      ctx.moveTo(x, y);
      ctx.arc(x, y, 5, 0, Math.PI * 2, false);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.fillStyle = bgColorDay;
      ctx.arc(x, y, 3, 0, Math.PI * 2, false);
      ctx.fill();
    });
  }

  drawHoverGrid() {
    const { ctx, chart } = this;
    const x = chart.startX + (this.hoverItem / this.itemsNum) * chart.width;
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
      numDiv.innerHTML = number;
      const labelDiv = document.createElement("div");
      labelDiv.innerHTML = label;
      infoDiv.appendChild(numDiv);
      infoDiv.appendChild(labelDiv);
      tooltipInfo.appendChild(infoDiv);
    });

    //   <div>
    //   <div class="num">145</div>
    //   <div class="label">Joined</div>
    // </div>
  }
}

export default NavChart;
