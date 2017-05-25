(function () {
    var reportModule = angular.module('AirQualityMonitor');

    reportModule.controller('ReportController', ['$scope', '$http', function ($scope, $http) {
        var timeoutMilliseconds = 1000;

        /**
         * @type {Number}
         */
        $scope.updatedAt = null;

        /**
         * @type {Boolean}
         */
        $scope.heartBeat = false;

        /**
         * @type {Boolean}
         */
        $scope.rollingFile = false;

        /**
         * @type {Array.<*>}
         */
        $scope.sensorBuffer = [];

        /**
         * @type {Boolean}
         */
        $scope.isPaused = false;

        /**
         * A reference to our timeout Function.
         *
         * @type {Number}
         */
        var timeoutRef = null;

        angular.element(function () {
            var timeoutFn = function () {
                if ($scope.isPaused) return timeoutRef = setTimeout(timeoutFn, timeoutMilliseconds);

                $http.get('/api/sensorBuffer').then(
                    function onFulfilled(httpResponse) {
                        $scope.sensorBuffer = httpResponse.data.sensorBuffer.map(function (aRecord) {
                            /**
                             * @type {Number}
                             */
                            aRecord.dhtHumidity = aRecord.dhtHumidity.toFixed(2);
                            /**
                             * @type {Number}
                             */
                            aRecord.dhtTemperature = aRecord.dhtTemperature.toFixed(2);

                            /**
                             * @type {Number}
                             */
                            aRecord.gpggaLatitude = aRecord.gpggaLatitude.toFixed(4);
                            /**
                             * @type {Number}
                             */
                            aRecord.gpggaLongitude = aRecord.gpggaLongitude.toFixed(4);

                            return aRecord
                        }).reverse();

                        /**
                         * Re-execute the `#.timeoutFn` to retrieve data from our
                         * application.
                         *
                         * @type {*}
                         */
                        timeoutRef = setTimeout(timeoutFn, timeoutMilliseconds);

                        $scope.updatedAt = Date.now(), $scope.heartBeat = httpResponse.data.heartBeat, $scope.rollingFile = httpResponse.data.rollingFile;
                    },
                    function onRejected(withError) {
                        /**
                         * Our request to the app returned an `#.withError`; Try
                         * again.
                         *
                         * @type {*}
                         */
                        timeoutRef = setTimeout(timeoutFn, timeoutMilliseconds);

                        $scope.heartBeat = false;
                    }
                )
            }

            timeoutFn();
        });
    }]);
})();