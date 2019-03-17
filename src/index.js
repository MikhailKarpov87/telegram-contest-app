import { loadData } from "./helpers";
import loadChartApp from "./chart_app";

const appContainer = document.getElementById("app");

//  loads JSON data(url, chart_id)
loadData("http://192.168.1.116:3000/chart_data.json", 0).then(
  data => new loadChartApp({ title: "Chart1", data, appContainer })
);
