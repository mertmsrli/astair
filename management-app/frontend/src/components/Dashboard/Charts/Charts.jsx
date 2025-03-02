import React, { Component } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  CardTitle,
  Col,
  Row
} from "reactstrap";
import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import { getStyle, hexToRgba } from "@coreui/coreui/dist/js/coreui-utilities";

import axios from "axios";

const urlArr = Array.from(
  Array(parseInt(process.env.REACT_APP_LENGTH)).keys()
).map(x => (x + 1).toString());
const urlServer = process.env.REACT_APP_ASTAIR_MANAGEMENT_BACKEND;

const brandPrimary = getStyle("--primary");
const brandDanger = getStyle("--danger");
const brandSuccess = getStyle("--success");

var loadValue = 0;
var loadValue2 = 0;

let mainChart = {
  labels: [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  responsive: true,
  datasets: [
    {
      label: "INDOOR",
      type: "line",
      backgroundColor: hexToRgba("#f9690e", 10),
      borderColor: "#f9690e",
      pointHoverBackgroundColor: "#fff",
      borderWidth: 4,
      yAxisID: "y-axis-0",
      data: []
    },
    {
      label: "PEOPLE",
      type: "bar",
      backgroundColor: hexToRgba("#663399", 10),
      borderColor: "#663399",
      pointHoverBackgroundColor: "#fff",
      borderWidth: 2,
      yAxisID: "y-axis-1",
      data: []
    }
    /*  {
        label: 'OUTDOOR',
        type: 'line',
        // backgroundColor: hexToRgba(brandPrimary, 10),
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: brandPrimary,
        pointHoverBackgroundColor: '#fff',
        borderWidth: 4,
        yAxisID: 'y-axis-0',
        data: [],
      },  */
  ]
};

const mainChartOpts = {
  animation: false,
  tooltips: {
    enabled: false,
    custom: CustomTooltips,
    intersect: true,
    mode: "index",
    position: "nearest",
    callbacks: {
      labelColor: function(tooltipItem, chart) {
        return {
          backgroundColor:
            chart.data.datasets[tooltipItem.datasetIndex].borderColor
        };
      }
    }
  },
  maintainAspectRatio: false,
  legend: {
    labels: {
      fontSize: 20,
      boxWidth: 20
    }
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          drawOnChartArea: false
        }
      }
    ],
    yAxes: [
      {
        type: "linear",
        position: "left",
        ticks: {
          min: 0,
          max: 90
        },
        id: "y-axis-0"
      },
      {
        type: "linear",
        position: "right",
        ticks: {
          min: 0,
          max: 90,
          id: "y-axis-1"
        }
      }
    ]
  },
  elements: {
    point: {
      radius: 2,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3
    }
  }
};

let barChart = {
  labels: ["Cold", "Nice", "Hot"],
  responsive: true,
  datasets: [
    {
      label: "Slack",
      borderColor: "rgba(255,99,132,1)",
      borderWidth: 1,
      backgroundColor: [brandPrimary, brandSuccess, brandDanger],
      hoverBackgroundColor: [brandPrimary, brandSuccess, brandDanger],
      hoverBorderColor: "rgba(255,99,132,1)",
      data: []
    }
  ]
};

const barChartOpts = {
  animation: false,
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  legend: {
    labels: {
      fontSize: 30,
      boxWidth: 30
    }
  },
  maintainAspectRatio: false
};

class Charts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      radioSelected: 1,
      interval1: null,
      interval2: null
    };

    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
  }

  onRadioBtnClick(radioSelected) {
    this.setState({
      radioSelected: radioSelected
    });
  }

  getcompVisionControllerData = async () => {
    return axios
      .get(urlServer + "/get-all")
      .then(res => {
        var people = res.data[res.data.length - 1].occupancy;

        this.setPeople(people);
        this.drawPeopleChart(res);
      })
      .catch(error => {
        console.log(error);
      });
  };

  getSlackData = async () => {
    return axios
      .get(urlServer + "/slack/get-poll-result-hot-cold-nice")
      .then(res => {
        var cold = res.data.cold;
        var nice = res.data.nice;
        var hot = res.data.hot;

        this.setSlack(cold, nice, hot);
        this.drawSlackChart(res);
      });
  };

  getSensorAverageData = () => {
    return axios.get(urlServer + "/sensor/get-ave-degree").then(res => {
      this.props.setAvgTemp(res.data);
      this.drawTempChart(res);
      //  this.drawOutdoorChart()
    });
  };

  getSensorData = async () => {
    await Promise.all(
      urlArr.map(url =>
        axios(urlServer + "/sensor/get-zone/" + url).then(res => {
          this.props.sensorTemp[url] =
            res.data[res.data.length - 1].sensor_degree;
          this.props.sensorHum[url] =
            res.data[res.data.length - 1].sensor_humidity;
        })
      )
    );
  };

  drawSlackChart = res => {
    for (var i = 0; i < 3; i++) barChart.datasets[0].data.shift();

    barChart.datasets[0].data.push(this.props.cold);
    barChart.datasets[0].data.push(this.props.nice);
    barChart.datasets[0].data.push(this.props.hot);
  };

  drawTempChart = res => {
    if (loadValue === 0) {
      for (var i = mainChart.datasets[0].data.length; i < 20; i++) {
        this.setState({ avgsensor: res.data });
        mainChart.datasets[0].data.push(this.state.avgsensor);
        mainChartOpts.scales.yAxes[0].ticks.min = parseInt(
          Math.min.apply(Math, mainChart.datasets[0].data) - 10
        );
        mainChartOpts.scales.yAxes[0].ticks.max = parseInt(
          Math.max.apply(Math, mainChart.datasets[0].data) + 20
        );
      }
      loadValue = 1;
    }

    mainChart.datasets[0].data.push(this.state.avgsensor);

    while (mainChart.datasets[0].data.length > 20) {
      mainChart.datasets[0].data.shift();
    }
    mainChartOpts.scales.yAxes[0].ticks.min = parseInt(
      Math.min.apply(Math, mainChart.datasets[0].data) - 10
    );
    mainChartOpts.scales.yAxes[0].ticks.max = parseInt(
      Math.max.apply(Math, mainChart.datasets[0].data) + 20
    );
  };

  drawPeopleChart = res => {
    // this.props.people = res.data[res.data.length - 1].occupancy

    if (loadValue2 === 0) {
      for (var i = res.data.length - 20; i < res.data.length; i++) {
        // this.props.people=res.data[i].occupancy
        mainChart.datasets[1].data.push(this.props.people);

        mainChartOpts.scales.yAxes[1].ticks.min = parseInt(
          Math.min.apply(Math, mainChart.datasets[1].data) - 20
        );
        mainChartOpts.scales.yAxes[1].ticks.max = parseInt(
          Math.max.apply(Math, mainChart.datasets[1].data) + 10
        );
      }
      loadValue2 = 1;
    }

    mainChart.datasets[1].data.push(this.props.people);
    if (mainChart.datasets[1].data.length > 20) {
      mainChart.datasets[1].data.shift();
    }

    mainChartOpts.scales.yAxes[1].ticks.min = parseInt(
      Math.min.apply(Math, mainChart.datasets[1].data) - 20
    );
    mainChartOpts.scales.yAxes[1].ticks.max = parseInt(
      Math.max.apply(Math, mainChart.datasets[1].data) + 10
    );
  };

  drawOutdoorChart = () => {
    for (var i = mainChart.datasets[2].data.length; i < 20; i++) {
      mainChart.datasets[2].data.push(this.props.temp);
    }

    mainChart.datasets[2].data.push(this.props.temp);

    while (mainChart.datasets[2].data.length > 20) {
      mainChart.datasets[2].data.shift();
    }
  };

  getChart = () => {
    if (this.state.radioSelected === 1) {
      return (
        <div className="chart-wrapper" style={{ height: "400px" }}>
          <Bar data={mainChart} options={mainChartOpts} height={400} redraw />
        </div>
      );
    } else if (this.state.radioSelected === 2) {
      return (
        <div className="chart-wrapper" style={{ height: "400px" }}>
          <Doughnut
            data={barChart}
            options={barChartOpts}
            height={400}
            redraw
          />
        </div>
      );
    }
  };

  trigger() {
    const interval1 = setInterval(() => {
      this.getSensorData().then(data => {});
      this.getSensorAverageData().then(data => {});
      this.getSlackData().then(data => {});
    }, 5000);
    const interval2 = setInterval(() => {
      this.getcompVisionControllerData().then(data => {});
    }, 2000);

    this.setState(prevState => ({
      ...prevState,
      interval1,
      interval2
    }));
  }

  componentDidMount() {
    this.trigger();
  }

  setSlack = (cold, nice, hot) => {
    this.props.setSlack(cold, nice, hot);
  };

  setPeople = people => {
    this.props.setPeople(people);
  };

  componentWillUnmount() {
    clearInterval(this.state.interval1);
    clearInterval(this.state.interval2);
  }

  render() {
    return (
      <Row>
        <Col>
          <Card style={{ background: "transparent" }}>
            <CardBody style={{ background: "transparent" }}>
              <Row>
                <Col sm="5">
                  <CardTitle className="mb-0">
                    AVG. TEMPERATURES-PEOPLE COUNT
                  </CardTitle>
                </Col>
                <Col>
                  <ButtonToolbar
                    className="float-right"
                    aria-label="Toolbar with button groups"
                  >
                    <ButtonGroup className="mr-3" aria-label="First group">
                      <Button
                        color="outline-secondary"
                        onClick={() => this.onRadioBtnClick(1)}
                        active={this.state.radioSelected === 1}
                      >
                        INDOOR
                      </Button>
                      <Button
                        color="outline-secondary"
                        onClick={() => this.onRadioBtnClick(2)}
                        active={this.state.radioSelected === 2}
                      >
                        SLACK
                      </Button>
                    </ButtonGroup>
                  </ButtonToolbar>
                </Col>
              </Row>
              {this.getChart()}
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
}
export default Charts;
