
var React = require('react'),
    _ = require('lodash'),
    d3 = require('d3'),
    Chart = require('Chart.js'),
    drawers = require('./drawers.jsx'),
    Controls = require('./controls.jsx'),
    meta = require('./meta.jsx');

var lineDataTemplate = [{
  label: "My First dataset",
  fillColor: "rgba(220,220,220,0.2)",
  strokeColor: "rgba(220,220,220,1)",
  pointColor: "rgba(220,220,220,1)",
  pointStrokeColor: "#fff",
  pointHighlightFill: "#fff",
  pointHighlightStroke: "rgba(220,220,220,1)",
  data: []
},{
  label: "My Second dataset",
  fillColor: "rgba(151,187,205,0.2)",
  strokeColor: "rgba(151,187,205,1)",
  pointColor: "rgba(151,187,205,1)",
  pointStrokeColor: "#fff",
  pointHighlightFill: "#fff",
  pointHighlightStroke: "rgba(151,187,205,1)",
  data: []
}];

var LapTimes = React.createClass({
    loadRawData: function () {
        var dateFormat = d3.time.format("%m/%d/%Y");
        d3.json(this.props.url)
          .get(function (error, rows) {
              if (error) {
                console.error(error);
                console.error(error.stack);
              }else{
                  this.setState({rawData: rows});
              }
          }.bind(this));
    },

    componentWillMount: function () {
        this.loadRawData();
    },

    componentDidMount: function () {
      this.showChart();
    },

    componentDidUpdate: function () {
      this.showChart();
    },

    showChart: function () {
      if (!this.myLineChart && this.filteredData) {
        var options = {
          scaleOverride: true,
          scaleSteps: null,
          // Number - The value jump in the hard coded scale
          scaleStepWidth: null,
          // Number - The scale starting value
          scaleStartValue: 0,
          // String - Colour of the scale line
          scaleLineColor: "rgba(0,0,0,.1)",
          // Number - Pixel width of the scale line
          scaleLineWidth: 1,
          // Boolean - Whether to show labels on the scale
          scaleShowLabels: true,
          // Interpolated JS string - can access value
          scaleLabel: "<%=parseFloat(value).toFixed(0)%>",
          // Boolean - Whether the scale should stick to integers, not floats even if drawing space is there
          scaleIntegersOnly: true,
          // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
          scaleBeginAtZero: false,
          // String - Scale label font declaration for the scale label
          scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          // Number - Scale label font size in pixels
          scaleFontSize: 12,
          // String - Scale label font weight style
          scaleFontStyle: "normal",
          // String - Scale label font colour
          scaleFontColor: "#666",
          datasetFill: false,
          legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
        };
        var data = {
          "labels": [],
          "datasets": []
        };
        var maxLaps = 0;
        var minTime = 120;
        var maxTime = 0;
        this.filteredData.forEach(function (driver, index) {
          if (driver.laps.length > maxLaps) {
            for (var i = maxLaps; i < driver.laps.length; i++) {
              data.labels.push((i+1)+"");
            }
            maxLaps = driver.laps.length;
          }
          var lineData = lineDataTemplate[index%2];
          lineData.label = driver.name;
          driver.laps.forEach(function (lap) {
            var elements = lap.laptime.split(":");
            var hours = 0;
            var minutes = 0;
            var seconds = 0;
            var milliseconds = 0;
            switch (elements.length) {
              case 2:
                minutes = parseInt(elements[0]);
                var secondsAndMillisecs = elements[1].split(".");
                seconds = parseInt(secondsAndMillisecs[0]);
                milliseconds = parseInt(secondsAndMillisecs[1]);
                break;
              case 3:
                break;
              default:
            }
            var totalSecs = 3600*hours + 60*minutes + seconds + milliseconds/1000;
            lineData.data.push(totalSecs);
            if (totalSecs > 0 && totalSecs < minTime) {
              minTime = totalSecs;
            }
            if (totalSecs > maxTime) {
              maxTime = totalSecs;
            }
          });
          data.datasets.push(lineData);
        });
        options.scaleStartValue = minTime - 10;
        options.scaleSteps = 12;
        options.scaleStepWidth = (maxTime - minTime) / 10;
        console.log(options);
        this.ctx = React.findDOMNode(this.refs.driverChart).getContext("2d");
        var chart = new Chart(this.ctx);
        this.myLineChart = chart.Line(data, options);
        var legend = this.myLineChart.generateLegend();
        React.findDOMNode(this.refs.chartMountPoint).childNodes.append(legend);
      }
    },

    getInitialState: function () {
        return {
          rawData: [],
          dataFilter: function () { return true; }
        };
    },

    updateDataFilter: function (filter) {
        this.setState({dataFilter: filter});
    },

    render: function () {
        if (!this.state.rawData.length) {
          this.filteredData = null;
            return (
                <h2>Loading Lap Times</h2>
            );
        }

        this.filteredData = this.state.rawData.filter(this.state.dataFilter);

        return (
            <div>
                <div className="row">
                    <div className="col-md-12" ref="chartMountPoint">
                      <canvas id="lap-times-canvas" ref="driverChart"
                        width="800" height="400" />
                    </div>
                </div>
            </div>
        );

        return (
            <div>
                <meta.Title data={filteredData} />
                <meta.Description data={filteredData} allData={this.state.rawData} />
                <div className="row">
                    <div className="col-md-12" ref="chart-mount-point">

                    </div>
                </div>
                <Controls data={this.state.rawData} updateDataFilter={this.updateDataFilter} />
            </div>
        );
    }

});

React.render(
    <LapTimes url="data/lap-times.json" />,
    document.querySelectorAll('.lap-times')[0]
);
