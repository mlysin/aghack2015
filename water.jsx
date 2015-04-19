function getStations (success) {
    debugger;
    $.ajax({
        url: 'http://et.water.ca.gov/api/station',
        data: {
            appKey: 'e8235990-5a60-4f7d-a1a7-d0012716e258',
        },
        success: function (response) {
            var stations = response.Stations.map(function (rawStation) {
                return {
                    name: rawStation.Name,
                    number: rawStation.StationNbr,
                    latitude: rawStation.HmsLatitude.split('/')[1].replace(/ /g, ''),
                    longitude: rawStation.HmsLongitude.split('/')[1].replace(/ /g, '')
                }
            });
            success(stations);
        }.bind(this)
    });
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
                <MapComponent latitude={something} longitude={something else}/>
                this.props.latitude, this.props.longitude
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
