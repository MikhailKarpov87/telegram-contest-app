import { months, chartFontSize, weekdays } from "./constants";
import Chart from "./chart";

class MainChart extends Chart {
  constructor(options) {
    super(options);
    this.hoverItem = null;
    this.datesNum = 6;
    this.newDates = {};
    this.prevDates = {};
    this.nthDate = 0;
    this.allDates = this.createDatesObject(options.data.columns.x);
    this.itemsNum = this.allDates.length;
    this.updateDatesObject(this.start, this.end, this.allDates);
    this.createTooltip();
  }

  update = (start, end) => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const range = (end - start).toFixed(5);
    this.start = start;
    this.end = end;

    if (!this.dates) this.dates = this.updateDatesObject(start, end, this.allDates);

    //  If range was updated - recalculate dates
    if (range !== this.range) {
      this.updateDatesObject(start, end, this.dates);
      this.range = range;
    }

    //  Check for animating dates
    const datesNum = Object.keys(this.dates).length;
    if (datesNum !== Object.keys(this.newDates).length && !this.prevDates) {
      this.prevDates = this.dates;
      this.dates = this.newDates;
    }

    this.calcAnimations();

    this.drawMainAxis();

    // error message
    if (!this.sCharts.length) {
      this.hideTooltip();
      this.drawErrorMessage();
      return;
    }

    if (this.an.animChart < 100) {
      this.drawYAxis("fadeOut");
      this.drawYAxis("fadeIn");
    } else {
      this.drawYAxis();
    }

    //  Draw hover grid line
    this.hoverItem !== null &&
      this.sCharts.length &&
      this.drawHoverGrid(this.coords[this.sCharts[0]][this.hoverItem].x);

    //  Start drawing charts and hover grid/points
    this.sCharts.map(line => {
      this.coords[line] = this.calcChartData(this.data.columns[line], start, end);

      this.drawChart(this.coords[line], line, this.data.colors[line]);

      if (this.hoverItem !== null) {
        this.drawHoverPoint(this.coords[line][this.hoverItem], this.data.colors[line]);
        this.showTooltip();
      } else {
        this.hideTooltip();
      }
    });
    //  End drawing chart

    //  Draw dates in regular way if no animation are going
    !this.prevDates && this.drawDatesLine(this.dates, 1);

    //  Dates animation
    if (this.prevDates) {
      this.animation =
        Object.keys(this.prevDates).length > Object.keys(this.dates).length ? "fadeOut" : "fadeIn";
      if (this.animation === "fadeOut") {
        this.drawDatesLine(this.dates, 1);
        this.drawDatesLine(this.prevDates, this.an.animDates);
      }
      if (this.animation === "fadeIn") {
        this.drawDatesLine(this.dates, 1 - this.an.animDates);
        this.drawDatesLine(this.prevDates, 1);
      }
      this.an.animDates = (this.an.animDates - 0.02).toFixed(3);
      requestAnimationFrame(() => this.update(this.start, this.end));

      if (this.an.animDates <= 0) {
        this.an.animDates = 1;
        this.prevDates = null;
        this.animation = null;
      }
    }

    if (this.an.animFadeChart < 100 || this.an.animChart < 100) {
      setTimeout(requestAnimationFrame(() => this.update(this.start, this.end)), 16);
    }
    //  End of dates animation
  };

  onMove = e => {
    const x = e.touches ? e.touches[0].pageX : e.x;
    const y = e.touches ? e.touches[0].pageY : e.y;

    const { chart } = this;
    const rect = this.canvas.getBoundingClientRect();
    const xPos = (x - Math.round(rect.left)) * this.pixelRatio;
    const yPos = (y - Math.round(rect.top)) * this.pixelRatio;

    if (
      this.sCharts.length &&
      yPos < chart.startY &&
      yPos > chart.endY &&
      xPos > chart.startX &&
      xPos < chart.endX
    ) {
      this.hoverItem = this.findClosestItem(xPos, this.coords[this.sCharts[0]]);

      requestAnimationFrame(() => this.update(this.start, this.end));
    }
  };

  drawMainAxis() {
    const { ctx, chart } = this;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(chart.startX, chart.startY);
    ctx.lineTo(chart.endX, chart.startY);
    ctx.strokeStyle = this.colors.axisLinesColor;
    ctx.stroke();
  }

  drawDatesLine(dates, alpha) {
    const { ctx, colors } = this;
    ctx.save();
    const fontSize = Math.round(chartFontSize * +this.pixelRatio);
    ctx.font = `300 ${fontSize}px ${colors.axisFontsList}`;
    ctx.fillStyle = colors.axisFontColor(alpha);
    let currentId = this.firstItemId - 1;
    this.coords[this.sCharts[0]].map((v, i) => {
      currentId++;
      if (!dates[currentId]) return;
      const x = Math.round(this.startX - 35 + (i - 1 + this.startFraction) * this.spaceBetween);
      ctx.fillText(dates[currentId], x, this.chart.startY + fontSize * 1.5);
    });
    ctx.restore();
  }

  drawYAxis(anim) {
    const { ctx, chart, colors, an } = this;
    let startY, maxValueY, alpha;
    const fontSize = Math.round(chartFontSize * +this.pixelRatio);
    ctx.lineWidth = 1;
    ctx.font = `300 ${fontSize}px ${colors.axisFontsList}`;
    ctx.strokeStyle = colors.axisLinesColor;

    if (an.animChart < 100) {
      const direction = this.newMaxValueY > this.maxValueY ? 1 : -1;
      if (anim === "fadeOut") {
        startY = chart.startY + direction * (1 - an.animChart / 100) * chart.height * 0.5;
        maxValueY = this.prevAxisValue;
        alpha = an.animChart / 100;
      }
      if (anim === "fadeIn") {
        startY = chart.startY - direction * (an.animChart / 100) * chart.height * 0.5;
        alpha = 1 - an.animChart / 100;
        maxValueY = this.newAxisValue;
      }
    } else {
      startY = chart.startY;
      maxValueY = this.maxValueY;
      alpha = 1;
    }

    ctx.fillStyle = colors.axisFontColor(alpha);

    for (let i = 1; i <= 5; i++) {
      const height = startY - (i * chart.height) / 5;
      const currentValue = (maxValueY * i) / 5;
      ctx.fillText(
        this.generateYAxisLabel(currentValue),
        this.chart.startX,
        height - 0.5 * fontSize
      );
      ctx.beginPath();
      ctx.moveTo(chart.startX, height);
      ctx.lineTo(chart.endX, height);
      ctx.stroke();
    }

    ctx.fillText(0, chart.startX, chart.startY - 0.5 * fontSize);
  }

  drawHoverPoint(coords, color) {
    const { ctx } = this;
    const { x, y } = coords;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.moveTo(x, y);
    ctx.arc(x, y, 8, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.fillStyle = this.colors.bgColor;
    ctx.arc(x, y, 6, 0, Math.PI * 2, false);
    ctx.fill();
  }

  drawHoverGrid(x) {
    const { ctx, chart } = this;
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.colors.hoverLineColor;
    ctx.beginPath();
    ctx.moveTo(x, chart.startY);
    ctx.lineTo(x, chart.endY);
    ctx.stroke();
  }

  createTooltip() {
    this.tooltip = dce("div");
    this.tooltipDate = dce("div");
    this.tooltipInfo = dce("div");
    this.tooltip.className = "tooltip";
    this.tooltipDate.className = "tooltip-date";
    this.tooltipInfo.className = "tooltip-info";
    ac(this.tooltip, this.tooltipDate);
    ac(this.tooltip, this.tooltipInfo);
    const { style } = this.tooltip;
    style.backgroundColor = this.colors.tooltipBgColor;
    style.color = this.colors.tooltipColor;
    style.display = "none";
    style.mozBoxShadow = this.colors.tooltipShadow;
    style.webkitBoxShadow = this.colors.tooltipShadow;
    style.boxShadow = this.colors.tooltipShadow;
    ac(this.container, this.tooltip);
  }

  showTooltip() {
    const hoverItem = this.hoverItem + this.firstItemId;
    const x = Math.round(
      this.startX -
        60 +
        ((this.hoverItem - 1 + this.startFraction) * this.spaceBetween) / this.pixelRatio
    );
    const label =
      weekdays[new Date(this.data.columns.x[hoverItem]).getDay()] + ", " + this.allDates[hoverItem];
    this.tooltipDate.innerHTML = label;
    this.tooltipInfo.innerHTML = "";
    this.sCharts.map(line => {
      const number = this.data.columns[line][hoverItem];
      const label = this.data.names[line];
      const color = this.data.colors[line];
      const infoDiv = dce("div");
      infoDiv.style.color = color;
      const numDiv = dce("div");
      numDiv.className = "num";
      numDiv.innerHTML = number;
      const labelDiv = dce("div");
      labelDiv.className = "label";
      labelDiv.innerHTML = label;
      ac(infoDiv, numDiv);
      ac(infoDiv, labelDiv);
      ac(this.tooltipInfo, infoDiv);
    });
    this.tooltip.style.display = "block";
    this.tooltip.style.left = `${x}px`;
  }

  hideTooltip() {
    this.tooltip.style.display = "none";
  }

  onNavChange = (start, end) => {
    this.hoverItem = null;
    requestAnimationFrame(() => this.update(start, end));
  };

  createDatesObject = dates => {
    let result = {};
    dates.map((val, i) => {
      const date = new Date(val);
      result[i] = months[date.getMonth()] + " " + date.getDate();
    });
    return result;
  };

  makeDatesObject(data, nth) {
    let result = {};

    for (let value in data) {
      if (+value % 2 ** nth) continue;
      result[value] = data[value];
    }
    return result;
  }

  updateDatesObject(start, end, dates) {
    const range = (end - start).toFixed(5);
    const { datesNum } = this;

    let datesShown = Math.ceil(Object.keys(dates).length * range);
    while (datesShown >= datesNum + 1 || datesShown < datesNum - 2) {
      if (datesShown >= datesNum + 1) this.nthDate += 1;
      if (datesShown < datesNum - 2) this.nthDate -= 1;

      this.newDates = this.makeDatesObject(this.allDates, this.nthDate);
      datesShown = Math.ceil(Object.keys(this.newDates).length * range);
    }

    if (!this.dates) this.dates = this.newDates;
  }

  generateYAxisLabel(num) {
    if (num >= 10 ** 6) return num / 10 ** 6 + "M";
    if (num >= 10 ** 3) return num / 10 ** 3 + "K";
    return num;
  }
}

const dce = elem => document.createElement(elem);
const ac = (container, elem) => container.appendChild(elem);

export default MainChart;
