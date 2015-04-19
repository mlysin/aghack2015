var pistachioStages = [
  {
    "stage": "Bloom (kc=0.07)",
    "kc": 0.07
  },
  {
    "stage": "Leaf-out (kc=0.44)",
    "kc": 0.44
  },
  {
    "stage": "Shell Expansion (kc=0.44)",
    "kc": 0.44
  },
  {
    "stage": "Shell Expansion (kc=0.68)",
    "kc": 0.68
  },
  {
    "stage": "Shell Hardening (kc=0.93)",
    "kc": 0.93
  },
  {
    "stage": "Shell Hardening  (kc=1.10)",
    "kc": 1.1
  },
  {
    "stage": "Nut Fill (kc=1.19)",
    "kc": 1.19
  },
  {
    "stage": "Nut Fill Shell Split (kc=1.19)",
    "kc": 1.19
  },
  {
    "stage": "Shell Splits (kc=0.99)",
    "kc": 0.99
  },
  {
    "stage": "Hull Slip (kc=0.99)",
    "kc": 0.99
  },
  {
    "stage": "Harvest (kc=0.87)",
    "kc": 0.87
  },
  {
    "stage": "Harvest (kc=0.67)",
    "kc": 0.67
  },
  {
    "stage": "Harvest (kc=0.07)",
    "kc": 0.07
  },
  {
    "stage": "Post-harvest (kc=0.01)",
    "kc": 0.01
  },
  {
    "stage": "Dormancy (kc=0.01)",
    "kc": 0.01
  }
]

var almondStages = [
    {stage: "Inner Shell Hardening (kc=0.32)", kc: 0.32},
    {stage: "Embryo Enlargement", kc: 0.65},
    {stage: "Hull Split 33%", kc: 1.03},
    {stage: "Hull Split 66%", kc: 1.03},
    {stage: "Hull Split 100%", kc: 1.03},
    {stage: "Late", kc: 1.15},
    {stage: "Post-harvest", kc: .01},
    {stage: "Dormancy", kc: .01}
];

function getCropStages(crop) {
    if (crop == "Almonds") {
        return almondStages;
    } else {
        return pistachioStages;
    }
}

function getKc(crop, stage) {
    var cropStages = getCropStages(crop);
    var stageObj = cropStages.find(function (x) {
        return x.stage == stage;
    });
    return stageObj.kc;
}

var ExampleApplication = React.createClass({
    getInitialState: function () {
        return {
            eto: null,
            stations: []
        }
    },
    render: function() {
        console.log(this.state.stations);
        return (
            <div>
                The ETO was {this.state.eto}
            </div>
        );
    },
    componentDidMount: function () {
        this._getETO(2);
        getStations(function (stations) {
            if(this.isMounted()) {
                this.setState({stations: stations});
            }
        }.bind(this));
    },
    _getETO: function (station) {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        var startDate = yesterday.getFullYear() + "-" + yesterday.getMonth() + "-" + yesterday.getDay();
        $.ajax({
            url: 'http://et.water.ca.gov/api/data',
            data: {
                appKey: 'e8235990-5a60-4f7d-a1a7-d0012716e258',
                startDate: startDate,
                endDate: startDate,
                targets: station,
                dataItems: 'day-eto'
            },
            success: function (response) {
                if (this.isMounted()) {
                    this.setState({
                        eto: response.Data.Providers[0].Records[0].DayEto.Value
                    });
                }
            }.bind(this)
        });
    }
});

var Map = React.createClass({
    render: function () {
        var url = "https://www.google.com/maps/embed/v1/view?key=AIzaSyA8hwDuDCkVqQYanytN0MxWK4vyR0rJ3jY&center=" + this.props.latitude + "," + this.props.longitude + "&zoom=10&maptype=satellite";
        return (
            <div>
                <iframe width="100%" height="300" src={url}></iframe>
            </div>
        );
    }
})

var StationSelection = React.createClass({
    render: function () {
        return (
            <select value={this.props.selected} onChange={this.handleStationSelected}>
                {this.props.stations.map(function (station) {
                    return <option key={station.number} value={station.number}>{station.name}</option>
                })}
            </select>
        )
    },
    handleStationSelected: function (event) {
        event.preventDefault();
        this.props.onChange(event.target.value);
    }
});

var CropSelection = React.createClass({
    render: function () {
        return (
            <select value={this.props.value} onChange={this.handleChange}>
                <option value="Almonds">Almonds</option>
                <option value="Pistachios">Pistachios</option>
            </select>
        )
    },
    handleChange: function (event) {
        event.preventDefault();
        this.props.onChange(event.target.value);
    }
});

var StageSelection = React.createClass({
    render: function () {
        return (
            <select value={this.props.value} onChange={this.handleChange}>
                {this.props.options.map(function (option) {
                    return <option key={option.stage} value={option.stage}>{option.stage}</option>
                })}
            </select>
        )
    },
    handleChange: function (event) {
        event.preventDefault();
        this.props.onChange(event.target.value);
    }
});

var DistributionUniformitySelection = React.createClass({
    render: function () {
        return (
            <select value={this.props.selected} onChange={this.handleChange}>
                <option value="0.95">Good Condition (DU=0.95)</option>
                <option value="0.80">Okay Condition (DU=0.80)</option>
                <option value="0.65">Poor Condition (DU=0.65)</option>
            </select>
        )
    },
    handleChange: function (event) {
        event.preventDefault();
        this.props.onChange(event.target.value);
    }
});

var PageLayout = React.createClass({
    getInitialState: function () {
        return {
            stations: [],

            distributionUniformity: "0.95",
            station: "2",
            crop: "Pistachios",
            stage: 'Bloom (kc=0.07)',
            gpm: null,
            area: null,
            eto: null,
        };
    },
    getStationFromStationNumber: function (stationNumber) {
        return this.state.stations.find(function(station) {
            return station.number === stationNumber;
        });
    },
    render: function () {
        var station = this.getStationFromStationNumber(this.state.station);
        var cropStages = getCropStages(this.state.crop);
        var latitude = station ? station.latitude : "30";
        var longitude = station ? station.longitude : "30";

        var theAnswer = null;
        if (this.state.eto && this.state.area && this.state.gpm) {
            debugger;
            var kc = getKc(this.state.crop, this.state.stage);
            var flowRate = this.calculateWateringHours(this.state.eto, kc, this.state.gpm, this.state.area);
            theAnswer = <div>Answer is {flowRate}</div>;
        }

        return (
            <div id="body">
                <center><h1>WaterLog</h1><h2>The Scientific Irrigation Scheduling System that Saves Millions</h2></center>
                <Map latitude={latitude} longitude={longitude} />
                
                <legend><h3>Do you want to save some money? Maybe some water, too?</h3></legend>

                <div className="table">
                    <div id="body-dropdowns">
                        <div className="row">
                            <div className="name"><h4>CMIS Station</h4></div>
                            <div className="dropdown"><StationSelection stations={this.state.stations}
                                                  selected={this.state.station}
                                                  onChange={this.handleStationSelectionChanged} /></div>
                        </div>
                        <div className="row">
                            <div className="name"><h4>Select Crop</h4></div>
                            <div className="dropdown"><CropSelection value={this.state.crop}
                                               onChange={this.handleCropChanged} /></div>
                        </div>
                        <div className="row">
                            <div className="name"><h4>Crop Stage</h4></div>
                            <div className="dropdown"><StageSelection value={this.state.stage}
                                                options={cropStages}
                                                onChange={this.handleStageChanged} /></div>
                        </div>
                        <div className="row">
                            <div className="name"><h4>Distribution Uniformity</h4></div>
                            <div className="dropdown"><DistributionUniformitySelection value={this.state.distributionUniformity}
                                                                 onChange={this.handleDistributionUniformityChanged} /></div>
                        </div>
                    </div>
                </div>

                <div className="table">
                    <div id="body-textentry">
                        <div className="row">
                            <div className="name"><h4>Set Area (acres)</h4></div>
                            <div className="textentry"><input type="text"
                                       placeholder="100"
                                       onChange={this.handleAreaChanged}>
                                    {this.state.area}
                                </input></div>
                        </div>
                        <div className="row">
                            <div className="name"><h4>Water (gallons)</h4></div>
                            <div className="textentry"><input type="text" onChange={this.handleGPMChange} className="form-control" id="gpm" name="gpm" placeholder="Gallons per Minute"/></div>
                        </div>
                        <div className="row">
                            <div className="name"><h4>Another thing</h4></div>
                            <div className="textentry"><input type="text" onChange={this.handleGPMChange} className="form-control" id="changethis" name="changethis" placeholder="changethis"/></div>
                        </div>
                        <div className="row">
                            <div className="name"><h4>And another thing</h4></div>
                            <div className="textentry"><input type="text" onChange={this.handleGPMChange} className="form-control" id="changethis" name="changethis" placeholder="changethis"/></div>
                        </div>
                    </div>
                </div>

                <div className="table">
                    <div className="row">
                        <div className="name"><button class="pure-button pure-button-primary" onClick={this.handleAnswerClick}>Calculate</button></div>
                        <div className="answer">{theAnswer}</div>
                    </div>
                </div>
            </div>
        );
    },
    handleStationSelectionChanged: function (newStation) {
        this.setState({station: newStation});
    },
    handleCropChanged: function (newCrop) {
        this.setState({crop: newCrop});
    },
    handleStageChanged: function (newStage) {
        this.setState({stage: newStage});
    },
    handleAreaChanged: function(event) {
        event.preventDefault();
        this.setState({area: event.target.value});
    },
    handleDistributionUniformityChanged: function(newDistributionUniformity) {
        this.setState({distributionUniformity: newDistributionUniformity});
    },
    handleGPMChange: function(event) {
        event.preventDefault();
        this.setState({gpm: event.target.value});
    },
    handleAnswerClick: function () {
        this.getETO(this.state.station);
        var eto = 1;
    },
    componentDidMount: function () {
        this.getCMISStations();
    },
    calculateWateringHours: function (eto, kc, gallonsPerMinute, acres) {
        var sqFt = 43560 * parseFloat(acres);
        var inchesPerHour = 96.3 * parseFloat(gallonsPerMinute) / sqFt;
        var etc = parseFloat(eto) * kc;
        var hours = etc / inchesPerHour;
        return hours;
    },
    getETO: function (station) {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        var startDate = yesterday.getFullYear() + "-" + yesterday.getMonth() + "-" + yesterday.getDay();
        $.ajax({
            url: 'http://et.water.ca.gov/api/data',
            data: {
                appKey: 'e8235990-5a60-4f7d-a1a7-d0012716e258',
                startDate: startDate,
                endDate: startDate,
                targets: station,
                dataItems: 'day-eto'
            },
            success: function (response) {
                if (this.isMounted()) {
                    this.setState({
                        eto: response.Data.Providers[0].Records[0].DayEto.Value
                    });
                }
            }.bind(this)
        });
    } ,   
    getCMISStations: function () {
        $.ajax({
            url: 'http://et.water.ca.gov/api/station',
            data: {
                appKey: 'e8235990-5a60-4f7d-a1a7-d0012716e258',
            },
            success: function (response) {
                var stations = response.Stations.map(function (rawStation) {
                    if (rawStation.IsActive == "False" || rawStation.IsEtoStation == "False") {
                        return null
                    }
                    return {
                        name: rawStation.Name,
                        number: rawStation.StationNbr,
                        latitude: rawStation.HmsLatitude.split('/')[1].replace(/ /g, ''),
                        longitude: rawStation.HmsLongitude.split('/')[1].replace(/ /g, '')
                    }
                }).filter(function (station) {
                    return station !== null;
                }).sort(function (a,b) {
                    if (a.name < b.name) {
                        return -1;
                    } else if (a.name > b.name) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                this.setState({stations: stations});
            }.bind(this)
        });
    }
});
