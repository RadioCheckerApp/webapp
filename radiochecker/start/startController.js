angular.module('RadioCheckerApp')

    .controller('StartController', ['$scope', '$location', function ($scope, $location) {

        $scope.openTopTracksView = function () {
            $location.path("/toptracks");
        };

        $scope.openTrackSearchView = function () {
            $location.path("/search");
        }

    }]);