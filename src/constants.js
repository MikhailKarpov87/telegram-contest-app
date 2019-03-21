// export const axisFontColor = "#96A2AA";

const axisFontsList = `-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial,
    sans-serif`;

export const colors = {
  dayMode: {
    axisFontColor: opacity => `rgba(150, 162, 170, ${opacity})`,
    axisFontsList,
    axisLinesColor: "#ECF0F3",
    hoverLineColor: "#DFE6EB",
    bgColor: "#FFFFFF",
    navOverlayColor: "rgba(242, 247, 249, 0.85)",
    sliderColor: "rgba(193, 214, 229, 0.7)",
    tooltipBgColor: "#FFFFFF",
    tooltipColor: "#222222",
    tooltipShadow: "0px 1px 3px 0px #b4b2b4"
  },
  nightMode: {
    axisFontColor: opacity => `rgba(84, 103, 120, ${opacity})`,
    axisFontsList,
    axisLinesColor: "#303e4f",
    hoverLineColor: "#3b4a5a",
    bgColor: "#242F3E",
    navOverlayColor: "rgba(31, 42, 56, 0.85)",
    sliderColor: "rgba(64, 86, 107, 0.7)",
    tooltipBgColor: "#253241",
    tooltipColor: "#FFFFFF",
    tooltipShadow: "0px 1px 3px 0px #1e2834"
  }
};

export const chartFontSize = 14;

export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
