
var React = require('react'),
    _ = require('lodash'),
    d3 = require('d3'),
    Chartjs = require('Chart.js'),
    drawers = require('./drawers.jsx'),
    Controls = require('./controls.jsx'),
    meta = require('./meta.jsx');

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
        var options = {};
        var data = {
          "labels": [],
          "datasets": []
        };
        var maxLaps = 0;
        this.filteredData.forEach(function (driver) {
          console.log(driver.laps.length + " > " + maxLaps);
          if (driver.laps.length > maxLaps) {
            for (var i = maxLaps; i < driver.laps.length; i++) {
              data.labels.push(i+1);
            }
            maxLaps = driver.laps.length;
          }
          var lineData = {
            label: driver.name,
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: []
          };
          driver.laps.forEach(function (lap) {
            lineData.data.push(lap.laptime);
          });
          data.datasets.push(lineData);
        });
        console.log(data);
        console.log(React);
        this.ctx = React.findDOMNode(this.refs.driverChart).getContext("2d");
        this.myLineChart = new Chart(ctx).Line(this.filteredData, options);
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
                    <div className="col-md-12" ref="chart-mount-point">
                      <canvas id="lap-times-canvas" ref="driverChart"
                        width="400" height="400" />
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
