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
                            if (isNaN(aRecord.dhtHumidity) === false && isNaN(aRecord.dhtTemperature) === false) {
                                /**
                                 * @type {Number}
                                 */
                                aRecord.dhtHumidity = aRecord.dhtHumidity.toFixed(2);
                                /**
                                 * @type {Number}
                                 */
                                aRecord.dhtTemperature = aRecord.dhtTemperature.toFixed(2);
                            }

                            if (aRecord.gpggaLatitude && aRecord.gpggaLongitude) {
                                /**
                                 * @type {Number}
                                 */
                                aRecord.gpggaLatitude = aRecord.gpggaLatitude.toFixed(4);
                                /**
                                 * @type {Number}
                                 */
                                aRecord.gpggaLongitude = aRecord.gpggaLongitude.toFixed(4);

                                /**
                                 * @type {String}
                                 */
                                aRecord.gpggaLatitudeLongitude = aRecord.gpggaLatitude + '°, ' + aRecord.gpggaLongitude;
                            }
                            else {
                                aRecord.gpggaLatitudeLongitude = '-';
                            }

                            if (aRecord.gpggaTime && aRecord.gprmcDate) {
                                /**
                                 * @type {String}
                                 */
                                aRecord.gpggaGprmcTimeDate = aRecord.gpggaTime + ' ' + aRecord.gprmcDate
                            }
                            else {
                                aRecord.gpggaGprmcTimeDate = '-'
                            }

                            if (aRecord._createdAt) {
                                let dT = new Date(aRecord._createdAt)

                                /**
                                 * @type {String}
                                 */
                                aRecord._createdAt = ('0' + dT.getHours()).substr(-2) + ':' + ('0' + dT.getMinutes()).substr(-2) + ':' + ('0' + dT.getSeconds()).substr(-2) + ' ' + ('0' + dT.getDate()).substr(-2) + '-' + ('0' + (dT.getMonth() + 1)).substr(-2) + '-' + dT.getFullYear()
                            }

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