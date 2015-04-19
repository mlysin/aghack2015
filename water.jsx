function getStations (success) {
    debugger;

}

function getEto (station, success) {

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
                <iframe 
                    width="100%"
                    height="300"
                    src={url}></iframe>
                
                Here&rsquo;s where the map goes... Latitude is {this.props.latitude} longitude is 
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
})

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
            station: null,
        };
    },
    render: function () {
        return (
            <div>
                <h1>WaterLog</h1>
                <Map latitude="30" longitude="30"/>
                <h2>What&rsquo;s Your ET rate</h2><br/>
                <form className="form-horizontal" name="noname">
                    <fieldset style={{textAlign:'center'}}>
                    <legend>Step 1: Master Inputs</legend>
                    <div className="master-info">
                        <div className="col-md-4">
                            <label>Select CMIS Station</label>
                            <StationSelection stations={this.state.stations}
                                              selected={this.props.station}
                                              onChange={this.handleStationSelectionChanged} />
                        </div>
                        <div className="col-md-4">
                            <label>Select Distribution Uniformity</label>
                            <DistributionUniformitySelection value={this.state.distributionUniformity}
                                                             onChange={this.handleDistributionUniformityChanged} />
                        </div>
                        <div className="col-md-4">
                            <input type="text" className="form-control" id="ECa" name="ECa" placeholder="Extract Threshold"/>
                        </div>
                        <div className="col-md-4">
                            <input type="text" className="form-control" id="ECw" name="ECw" placeholder="Water Threshold"/>
                        </div>
                    </div>
                    </fieldset>

                    <fieldset style={{textAlign:'center'}}>
                    <legend>Step 2: Irrigation Set 1</legend>
                    <div className="Irrigation Set 1">
                        <div className="col-md-4">
                            <label>Select Crop</label>
                            <select id = "crop">
                                <option value = "1">Pistachio</option>
                                <option value = "2">Almond</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label>Select Stage</label>
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

                <form>
                   <fieldset>
                      <legend>Selecting elements</legend>
                      <p>
                         <label>Select list</label>
                         <select id = "crop">
                           <option value = "1">Pistachio</option>
                           <option value = "2">Almond</option>
                         </select>
                      </p>
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
    handleDistributionUniformityChanged: function(newDistributionUniformity) {
        debugger;
        this.setState({distributionUniformity: newDistributionUniformity});
        debugger;
    },
    handleStationSelectionChanged: function (newSelectedStation) {
        this.setState({selectedStation: newSelectedStation});
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
