angular.module('RadioCheckerApp')

    .controller('SearchController', ['$scope', '$routeParams', '$location', '$http', '$filter', '$timeout',
        function ($scope, $routeParams, $location, $http, $filter, $timeout) {

            $scope.ctrl = {
                customDate: false,
                inputSubmitted: false,
                requestFinished: false,
                isWeekView: false,
                connError: false
            };

            $scope.input = {
                date: new Date(),
                searchString: "",
                searchStringSaved: "",
                error: {
                    searchString: false,
                    date: false
                }
            };

            $scope.data = {
                radiostations: [],
                weekNo: null,
                beginDate: null,
                endDate: null,
                searchResult: []
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

            $scope.searchTrackDay = function () {
                if (!inputValid()) return;

                resetData();
                $scope.ctrl.isWeekView = false;

                searchstringSanitized = $scope.input.searchString.replace(/\s+/g, "+");

                $http.get(
                    "http://api.radiochecker.com:8080/search/day" +
                    "/" + $filter('date')($scope.input.date, "yyyy-MM-dd") +
                    "/" + searchstringSanitized)
                    .then(function(response) {
                        $scope.data.beginDate = new Date(response.data.date);
                        $scope.data.radiostations = response.data.stations;
                        $scope.data.searchResult = response.data.results;
                        $timeout(function() { $scope.ctrl.requestFinished = true; }, 3000);
                    })
                    .catch(function (data) {
                        console.log(data);
                        $scope.ctrl.connError = true;
                    });
            };

            $scope.searchTrackWeek = function () {
                if (!inputValid()) return;

                resetData();
                $scope.ctrl.isWeekView = true;

                searchstringSanitized = $scope.input.searchString.replace(/\s+/g, "+");

                // see https://github.com/angular/angular.js/issues/10450
                weekNoBugFix = $filter('date')(
                    new Date($scope.input.date.getFullYear(),
                        $scope.input.date.getMonth(),
                        $scope.input.date.getDate()
                    ), "ww", "UTC");

                $http.get(
                    "http://api.radiochecker.com:8080/search/week" +
                    "/" + $filter('date')($scope.input.date, "yyyy") +
                    "/" + weekNoBugFix +
                    "/" + searchstringSanitized)
                    .then(function(response) {
                        $scope.data.beginDate = new Date(response.data.beginDate);
                        $scope.data.endDate = new Date(response.data.endDate);
                        $scope.data.weekNo = response.data.weekNo;
                        $scope.data.radiostations = response.data.stations;
                        $scope.data.searchResult = response.data.results;
                        $timeout(function() { $scope.ctrl.requestFinished = true; }, 3000);
                    })
                    .catch(function (data) {
                        console.log(data);
                        $scope.ctrl.connError = true;
                    });
            };

            $scope.checkDate = function () {
                if ($scope.input.date == null || $scope.input.date == "") {
                    $scope.input.date = new Date();
                } else {
                    $scope.input.date = new Date($scope.input.date);
                }
            };

            $scope.checkInputLength = function () {
                return ($scope.model.searchResult != null) && ($scope.model.searchString.length > 1);
            };

            var resetData = function () {
                $scope.ctrl.inputSubmitted = true;
                $scope.ctrl.requestFinished = false;

                $scope.input.searchStringSaved = $scope.input.searchString;
                $scope.data.radiostations = [];
                $scope.data.weekNo = null;
                $scope.data.beginDate = null;
                $scope.data.endDate = null;
                $scope.data.searchResult = [];
            };

            var inputValid = function () {
                if (!$scope.input.searchString || $scope.input.searchString == "" ||
                    $scope.input.searchString.length < 2) {
                    $scope.input.error.searchString = true
                } else if ($scope.input.date == null || $scope.input.date == "") {
                    $scope.input.error.date = true
                }
                return !$scope.input.error.searchString && !$scope.input.error.date;
            };

            var init = function () {
                document.title = "Songsuche \u2014 RadioChecker.com"
                document.head.querySelector("[name=description]").content = "Du willst wissen, wie oft ein ganz " +
                    "bestimmter Song auf deinem Lieblingsradiosender gespielt wurde? Mit der RadioChecker.com " +
                    "Songsuche erfährst du es!";
            };

            init();
        }])

    .directive('noSpecialChars', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function (inputValue) {
                    if (inputValue == null) {
                        return '';
                    }
                    cleanInputValue = inputValue.replace(/[^\w\s]/gi, '');
                    if (cleanInputValue != inputValue) {
                        modelCtrl.$setViewValue(cleanInputValue);
                        modelCtrl.$render();
                    }
                    return cleanInputValue;
                })
            }
        }
    });
