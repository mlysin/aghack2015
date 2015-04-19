function getCropStages(crop) {
    if (crop == "Almonds") {
        return ["Babies", "Teenagers", "Adults", "Dead"]
    }
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
                debugger;
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
            <select value={this.props.selected} onChange={this.handleChange}>
                <option value="Almonds">Almonds</option>
                <option value="Pistachios">Pistachios</option>
            </select>
        )
    },
    handleChange: function (event) {
        debugger;
        event.preventDefault();
        this.props.onChange(event.target.value);
    }
});

var StageSelection = React.createClass({
    render: function () {
        debugger;
        return (
            <select value={this.props.value} onChange={this.handleChange}>
                {this.props.options.map(function (option) {
                    return <option key={option} value={option}>{option}</option>
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
            crop: "Almonds",
            stage: null,
            area: null
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
        return (
            <div>
                <h1>WaterLog</h1>
                <Map latitude={latitude} longitude={longitude} />
                <h2>Determine Your Evapotranspiration (ET) Rate</h2><br/>
                <form className="form-horizontal" name="noname">
                    <fieldset style={{textAlign:'center'}}>
                    <legend><h3>Step 1: Master Inputs</h3></legend>
                    <div className="master-info">
                        <div className="col-md-4">
                            <label>Select CMIS Station </label>
                            <StationSelection stations={this.state.stations}
                                              selected={this.state.station}
                                              onChange={this.handleStationSelectionChanged} />
                        </div>
                        <div className="col-md-4">
                            <label>Select Distribution Uniformity </label>
                            <DistributionUniformitySelection value={this.state.distributionUniformity}
                                                             onChange={this.handleDistributionUniformityChanged} />
                        </div>
                        <div className="col-md-4">
                            <label>Select Crop</label>
                            <CropSelection value={this.state.crop}
                                           onChange={this.handleCropChanged} />
                       </div>
                        <div className="col-md-4">
                            <label>Select Crop Stage</label>
                            <StageSelection value={this.state.stage}
                                            options={cropStages}
                                            onChange={this.handleStageChanged} />
                       </div>                       
                        <div className="col-md-4">
                            <input type="text"
                                   placeholder="Set Area (acres)"
                                   onChange={this.handleAreaChanged}>
                                {this.state.area}
                            </input>
                        </div>
                    </div>
                    </fieldset>

                    <fieldset style={{textAlign:'center'}}>
                    <legend><h3>Step 2: Irrigation Set 1</h3></legend>
                    <div className="Irrigation Set 1">
                        <div className="col-md-4">
                            <label>Select Crop </label>
                            <select id = "crop">
                                <option value = "1">Pistachio</option>
                                <option value = "2">Almond</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label>Select Stage </label>
                            <select id = "crop">
                                <option value = "1">Early</option>
                                <option value = "2">Medium</option>
                                <option value = "3">Late</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <input type="text" className="form-control" id="area" name="area" placeholder="Area"/>
                        </div>
                        <div className="col-md-4">
                            <input type="text" className="form-control" id="gpm" name="gpm" placeholder="GPM (meters)"/>
                        </div>
                    </div>
                    </fieldset>
                </form>

                <div className="form-group">
                    <div className="col-md-6">
                        <center><button type="submit" value="Submit" className="answer">Answer</button></center>
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
    handleAreaChanged: function(newArea) {
        this.setState({area: newArea});
    },
    handleDistributionUniformityChanged: function(newDistributionUniformity) {
        this.setState({distributionUniformity: newDistributionUniformity});
    },
    componentDidMount: function () {
        this.getCMISStations();
    },
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
