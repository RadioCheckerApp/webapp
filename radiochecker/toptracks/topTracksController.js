angular.module('RadioCheckerApp')

    .controller('TopTracksController', ['$scope', '$routeParams', '$location', '$http', '$filter', '$timeout',
        function ($scope, $routeParams, $location, $http, $filter, $timeout) {

            $scope.ctrl = {
                customDate: false,
                inputSubmitted: false,
                requestFinished: false,
                isWeekView: false,
                connError: false,
            };

            $scope.input = {
                date: new Date(),
                radiostationSelected: { name: 'Sender auswählen ...', value: '' },
                radiostationSelectedSave: null,
                error: {
                    radiostation: true,
                    date: false,
                },
            };

            $scope.data = {
                radiostations: [],
                weekNo: null,
                beginDate: null,
                endDate: null,
                tracks: {
                    first: [],
                    second: [],
                    third: [],
                },
            };

            $scope.setRadiostation = function (i) {
                $scope.input.radiostationSelected = $scope.data.radiostations[i];
                $scope.input.error.radiostation = false;
            };

            $scope.setDate = function (d) {
                var today = new Date();
                $scope.ctrl.customDate = false;
                switch (d) {
                    case 0:
                        $scope.input.date = today;
                        break;
                    case 1:
                        today.setDate(today.getDate() - 1);
                        $scope.input.date = today;
                        break;
                    case 2:
                        today.setDate(today.getDate() - 2);
                        $scope.input.date = today;
                        break;
                    case 3:
                        today.setDate(today.getDate() - 7);
                        $scope.input.date = today;
                        break;
                    case 4:
                        $scope.ctrl.customDate = true;
                        break;
                    default:
                        $scope.input.date = today;
                }
            };

            $scope.loadTopTracksDay = function () {
                if (!inputValid()) return;

                resetData();
                $scope.ctrl.isWeekView = false;

                $http.get(
                    "https://pul5mro035.execute-api.eu-central-1.amazonaws.com/dev/stations/" +
                    $scope.input.radiostationSelected.value +
                    "/tracks" +
                    "?date=" + $filter('date')($scope.input.date, "yyyy-MM-dd"), {
                    headers: {'X-API-KEY': 'bGF04eKSab35BrrNSvo9p9knzOE6dVZX6TsAQ79K', 'Content-Type': 'application/json'}
                })
                    .then(function(response) {
                        if (!response.data.success) throw "Request failed: " + response.data.message;
                        $scope.data.beginDate = new Date(response.data.data.date);
                        var rank = 0, cnt = 0;
                        angular.forEach(response.data.data.tracks, function (countedTrack) {
                            if (rank === 0) {
                                cnt = countedTrack.times_played;
                                rank++;
                            }
                            if (countedTrack.times_played < cnt) {
                                rank++;
                                cnt = countedTrack.times_played;
                            }
                            switch (rank) {
                                case 1: $scope.data.tracks.first.push(countedTrack); break;
                                case 2: $scope.data.tracks.second.push(countedTrack); break;
                                case 3: $scope.data.tracks.third.push(countedTrack); break;
                            }
                        });
                        $timeout(function() { $scope.ctrl.requestFinished = true; }, 2000);
                    })
                    .catch(function (data) {
                        console.log(data);
                        $scope.ctrl.connError = true;
                    });
            };

            $scope.loadTopTracksWeek = function () {
                if (!inputValid()) return;

                resetData();
                $scope.ctrl.isWeekView = true;

                $http.get(
                    "https://pul5mro035.execute-api.eu-central-1.amazonaws.com/dev/stations/" +
                    $scope.input.radiostationSelected.value +
                    "/tracks" +
                    "?week=" + $filter('date')($scope.input.date, "yyyy-MM-dd"),
                    {
                        headers: {'X-API-KEY': 'bGF04eKSab35BrrNSvo9p9knzOE6dVZX6TsAQ79K', 'Content-Type': 'application/json'}
                    })
                    .then(function(response) {
                        if (!response.data.success) throw "Request failed: " + response.data.message;
                        $scope.data.weekNo = response.data.weekNo;
                        $scope.data.beginDate = new Date(response.data.data.start_date);
                        $scope.data.endDate = new Date(response.data.data.end_date);
                        var rank = 0, cnt = 0;
                        angular.forEach(response.data.data.tracks, function (countedTrack) {
                            if (rank === 0) {
                                cnt = countedTrack.times_played;
                                rank++;
                            }
                            if (countedTrack.times_played < cnt) {
                                rank++;
                                cnt = countedTrack.times_played;
                            }
                            switch (rank) {
                                case 1: $scope.data.tracks.first.push(countedTrack); break;
                                case 2: $scope.data.tracks.second.push(countedTrack); break;
                                case 3: $scope.data.tracks.third.push(countedTrack); break;
                            }
                        });
                        $timeout(function() { $scope.ctrl.requestFinished = true; }, 2000);
                    })
                    .catch(function (data) {
                        console.log(data);
                        $scope.ctrl.connError = true;
                    });
            };

            $scope.checkDate = function () {
                if ($scope.input.date == null || $scope.input.date === "") {
                    $scope.input.date = new Date();
                } else {
                    $scope.input.date = new Date($scope.input.date);
                }
            };

            var resetData = function () {
                $scope.ctrl.inputSubmitted = true;
                $scope.ctrl.requestFinished = false;

                $scope.input.radiostationSelectedSave = $scope.input.radiostationSelected;
                $scope.data.weekNo = null;
                $scope.data.beginDate = null;
                $scope.data.endDate = null;
                $scope.data.tracks.first = [];
                $scope.data.tracks.second = [];
                $scope.data.tracks.third = [];
            };

            var inputValid = function () {
                if ($scope.input.radiostationSelected.value === '') {
                    $scope.input.error.radiostation = true;
                } else if ($scope.input.date == null || $scope.input.date === '') {
                    $scope.input.error.date = true
                }
                return !$scope.input.error.radiostation && !$scope.input.error.date;
            };

            var onLoad = function () {
                $http.get("https://pul5mro035.execute-api.eu-central-1.amazonaws.com/dev/stations", {
                    headers: {'X-API-KEY': 'bGF04eKSab35BrrNSvo9p9knzOE6dVZX6TsAQ79K', 'Content-Type': 'application/json'}
                })
                    .then(function(response) {
                        if (!response.data.success) throw "Request failed: " + response.data.message;
                        angular.forEach(response.data.data.stations, function (station) {
                            $scope.data.radiostations.push({
                                name: station.name,
                                value: station.stationId
                            })
                        })
                    })
                    .catch(function (data) {
                        console.log(data);
                        $scope.ctrl.connError = true;
                    });
            };
            
            var init = function () {
                document.title = "Meistgespielte Songs \u2014 RadioChecker.com"
                document.head.querySelector("[name=description]").content = "Du wolltest schon immer wissen," +
                    "welche Songs auf deinem Lieblingsradiosender am meisten gespielt werden? Hier erfährst du es!";
            };

            init();
            onLoad();
    }]);
