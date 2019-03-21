import { months, chartFontSize, weekdays } from "./constants";
import Chart from "./chart";

class MainChart extends Chart {
  constructor(options) {
    super(options);
    this.hoverItem = null;
    this.dateItemsToShow = 6;
    this.nthDate = 1;
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

    //  Start drawing from Y and X Axis

    this.drawMainAxis();

    // error
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

    //  Start drawing charts and hover grid/points
    this.sCharts.map(line => {
      this.coords[line] = this.calcChartData(this.data.columns[line], start, end);
      this.hoverItem !== null && this.drawHoverGrid(this.coords[line][this.hoverItem].x);
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
      // requestAnimationFrame(() => this.update(this.start, this.end));
    }
    //  End of dates animation
  };

  onMove = e => {
    // e.preventDefault();
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
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.chart.startX, this.chart.startY);
    this.ctx.lineTo(this.chart.endX, this.chart.startY);
    this.ctx.strokeStyle = this.colors.axisLinesColor;
    this.ctx.stroke();
  }

  drawDatesLine(dates, alpha) {
    this.ctx.save();
    const fontSize = Math.round(chartFontSize * +this.pixelRatio);
    this.ctx.font = `300 ${fontSize}px ${this.colors.axisFontsList}`;
    this.ctx.fillStyle = this.colors.axisFontColor(alpha);
    let currentId = this.firstItemId - 1;
    this.coords[this.sCharts[0]].map((value, i) => {
      currentId++;
      if (!dates[currentId]) return;
      const x = Math.round(this.startX - 35 + (i - 1 + this.startFraction) * this.spaceBetween);
      //  For output dates only in chart zone
      // if (x < this.startX - 35) return;
      this.ctx.fillText(dates[currentId], x, this.chart.startY + fontSize * 1.5);
    });
    this.ctx.restore();
  }

  drawYAxis(anim) {
    let startY, maxValueY, alpha;
    const fontSize = Math.round(chartFontSize * +this.pixelRatio);
    this.ctx.lineWidth = 1;
    this.ctx.font = `300 ${fontSize}px ${this.colors.axisFontsList}`;
    this.ctx.strokeStyle = this.colors.axisLinesColor;

    if (this.an.animChart < 100) {
      const direction = this.newMaxValueY > this.maxValueY ? 1 : -1;
      if (anim === "fadeOut") {
        startY =
          this.chart.startY + direction * (1 - this.an.animChart / 100) * this.chart.height * 0.5;
        maxValueY = this.prevAxisValue;
        alpha = this.an.animChart / 100;
      }
      if (anim === "fadeIn") {
        startY =
          this.chart.startY - direction * (this.an.animChart / 100) * this.chart.height * 0.5;
        alpha = 1 - this.an.animChart / 100;
        maxValueY = this.newAxisValue;
      }
    } else {
      startY = this.chart.startY;
      maxValueY = this.maxValueY;
      alpha = 1;
    }

    this.ctx.fillStyle = this.colors.axisFontColor(alpha);

    for (let i = 1; i <= 5; i++) {
      const height = startY - (i * this.chart.height) / 5;
      const currentValue = (maxValueY * i) / 5;
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
    this.tooltip = document.createElement("div");
    this.tooltip.className = "tooltip";
    this.tooltipDate = document.createElement("div");
    this.tooltipDate.className = "tooltip-date";
    this.tooltipInfo = document.createElement("div");
    this.tooltipInfo.className = "tooltip-info";
    this.tooltip.appendChild(this.tooltipDate);
    this.tooltip.appendChild(this.tooltipInfo);
    this.tooltip.style.backgroundColor = this.colors.tooltipBgColor;
    this.tooltip.style.color = this.colors.tooltipColor;
    this.tooltip.style.display = "none";
    this.tooltip.style.mozBoxShadow = this.colors.tooltipShadow;
    this.tooltip.style.webkitBoxShadow = this.colors.tooltipShadow;
    this.tooltip.style.boxShadow = this.colors.tooltipShadow;
    this.container.appendChild(this.tooltip);
  }

  showTooltip() {
    const hoverItem = this.hoverItem + this.firstItemId;
    const x = Math.round(
      this.startX -
        60 +
        ((this.hoverItem - 1 + this.startFraction) * this.spaceBetween) / this.pixelRatio
    );
    const date = new Date(this.data.columns.x[hoverItem]);
    const label = weekdays[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate();
    this.tooltipDate.innerHTML = label;
    this.tooltipInfo.innerHTML = "";
    this.sCharts.map(line => {
      const number = this.data.columns[line][hoverItem];
      const label = this.data.names[line];
      const color = this.data.colors[line];
      const infoDiv = document.createElement("div");
      infoDiv.style.color = color;
      const numDiv = document.createElement("div");
      numDiv.className = "num";
      numDiv.innerHTML = number;
      const labelDiv = document.createElement("div");
      labelDiv.className = "label";
      labelDiv.innerHTML = label;
      infoDiv.appendChild(numDiv);
      infoDiv.appendChild(labelDiv);
      this.tooltipInfo.appendChild(infoDiv);
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

    dates.map((value, i) => {
      const dateValue = new Date(value);
      result[i] = months[dateValue.getMonth()] + " " + dateValue.getDate();
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

    let datesShown = Math.ceil(Object.keys(dates).length * range);
    while (datesShown >= this.dateItemsToShow + 1 || datesShown < this.dateItemsToShow - 2) {
      if (datesShown >= this.dateItemsToShow + 1) this.nthDate += 1;
      if (datesShown < this.dateItemsToShow - 2) this.nthDate -= 1;

      this.newDates = this.makeDatesObject(this.allDates, this.nthDate);
      datesShown = Math.ceil(Object.keys(this.newDates).length * range);
    }

    if (!this.dates) this.dates = this.newDates;
  }
}

export default MainChart;
