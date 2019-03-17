import { loadData } from "./helpers";
import loadChartApp from "./chart_app";

const appContainer = document.getElementById("app");

loadData("http://192.168.1.116:3000/chart_data.json").then(
  data => new loadChartApp({ title: "Chart1", data, appContainer })
);
