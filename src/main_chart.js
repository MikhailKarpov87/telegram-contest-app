import {
  axisFontColor,
  axisLinesColor,
  joinedColor,
  leftColor,
  data,
  months,
  chartFontSize,
  bgColorDay,
  bgColorNight,
  hoverLineColor
} from "./constants";

import { maxBy, findClosestItem, getItemsPositions, getYAxisMaxValue } from "./helpers";

class MainChart {
  setup = ({ showJoined, showLeft }) => {
    this.chart = {};
    this.dpi = window.devicePixelRatio;
    this.canvas = document.createElement("canvas");
    this.canvas.id = "main_chart";
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    document.getElementById("app").appendChild(this.canvas);
    this.canvas.style = `
            width: 100%;
            height: 100%;
        `;
    this.ctx = this.canvas.getContext("2d");

    this.resize();
    this.fix_dpi();
    this.update({ showJoined, showLeft });
  };

  fix_dpi = () => {
    const canvas = document.getElementById("main_chart");
    const style = {
      height() {
        return +getComputedStyle(canvas)
          .getPropertyValue("height")
          .slice(0, -2);
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

  update = ({ showJoined, showLeft }) => {
    this.maxJoinedNum = showJoined ? maxBy(data, "joined").joined : 0;
    this.maxLeftNum = showLeft ? maxBy(data, "left").left : 0;
    this.maxNum = Math.max(this.maxJoinedNum, this.maxLeftNum);
    if (this.maxNum === 0) return;

    this.maxValueY = getYAxisMaxValue(this.maxNum);
    this.itemsNum = data.length;
    this.currentItemsPositions = getItemsPositions();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGridLines();
    this.drawDatesLegend(data);
    showJoined && this.drawChart(data, "joined", joinedColor);
    showLeft && this.drawChart(data, "left", leftColor);

    this.drawAxis(data);
    this.hoverItem && this.drawHoverGrid();
  };

  resize() {
    const { innerWidth, innerHeight } = window;

    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight * this.dpi;
    this.chart.startX = Math.round(0.05 * innerWidth);
    this.chart.endX = Math.round(0.95 * innerWidth);
    this.chart.endY = Math.round(0.05 * innerHeight);
    this.chart.startY = Math.round(0.95 * innerHeight);
    this.chart.width = innerWidth;
    this.chart.height = innerHeight;
  }

  onMouseMove = e => {
    const { x, y } = e;
    const { chart } = this;
    const rect = this.canvas.getBoundingClientRect();
    const xPos = x - Math.round(rect.left);
    const yPos = y - Math.round(rect.top);

    if (yPos < chart.startY && yPos > chart.endY && xPos > chart.startX && xPos < chart.endX) {
      this.hoverItem = findClosestItem(xPos, this.currentItemsPositions);
      requestAnimationFrame(this.update);
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

    data.map((value, i) => {
      const pos = this.chart.startX + (i * this.chart.width) / this.itemsNum;
      const date = new Date(value.date);
      const label = months[date.getMonth()] + " " + date.getDate();
      this.ctx.fillText(label, pos, this.chart.startY + this.chart.height * 0.03);
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
      const y = chart.height - ((value[type] / this.maxValueY) * chart.height + chart.endY);
      const x = chart.startX + (i / itemsNum) * chart.width;
      i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
      hoverItem && hoverItem === i && this.drawHoverPoint(x, y, color);
    });

    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  drawHoverPoint(x, y, originalColor) {
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.strokeStyle = bgColorDay;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2, false);
    ctx.moveTo(x, y);
    ctx.strokeStyle = originalColor;
  }

  drawHoverGrid() {
    const x = chart.startX + (hoverItem / itemsNum) * chart.width;
    ctx.lineWidth = 1;
    ctx.strokeStyle = hoverLineColor;
    ctx.beginPath();
    ctx.moveTo(x, chart.startY);
    ctx.lineTo(x, chart.endY);

    ctx.stroke();
  }
}

export default MainChart;
