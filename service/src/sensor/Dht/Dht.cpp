#include <stdint.h>
#include <stdio.h>
#include <wiringPi.h>
#include "Dht.h"
#include "../Process.h"
#include "../Time.h"
#include "../WiringPiSetup.h"

int waitForPinChange(const int oldValue, const unsigned int gpioPin, unsigned int maxNr) {
    while ((--maxNr > 0) && (digitalRead(gpioPin) == oldValue)) {}

    return maxNr > 0 ? DHT_OK : DHT_ERROR_TIMEOUT;
}

DhtRecord* readDht(const unsigned int sensorType, const unsigned int gpioPin) {
    setupWiringPiIfRequired();

    /**
     * Used on whenFailed; and whenSucceeded; to store Sensor information
     * that can be returned.
     */
    DhtRecord *dhtRecord = new DhtRecord();

    printf("[ DEBUG ] Sensor Type: %d \n", sensorType);
    printf("[ DEBUG ] Gpio Pin: %d \n", gpioPin);

    defMaxPriority();

    /**
     * Initialize the `sensorBuffer` to store Data from the Sensor, define
     * the `bitIndex` and set the `sensorCondition` to "OK";
     */
    uint8_t sensorBuffer[5] = {0, 0, 0, 0, 0};
    uint8_t bitIndex = 7;

    int sensorCondition = DHT_OK;

    /**
     * Send out a Start Signal to the Dht Sensor. After we send the Signal,
     * we'll need to wait for at least 18 Milliseconds to ensure the Dht Sensor
     * can detect the Signal.
     *
     * We will wait for 20 Milliseconds.
     */
    pinMode(gpioPin, OUTPUT);
    digitalWrite(gpioPin, LOW);
    delay(20);

    /**
     * Wait for the Response. The documentation has specified this on 20 -
     * 40 µs.
     *
     * We will wait for 40 Microseconds.
     */
    digitalWrite(gpioPin, HIGH);
    delayMicroseconds(40);
    pinMode(gpioPin, INPUT);

    for(unsigned int idxNr = 0; idxNr < 1024; idxNr++) {}

    /**
     * Ok or Timeout.
     *
     * The Response signal should be Low for 80 µs.
     */
    if ((sensorCondition = waitForPinChange(LOW, gpioPin)) == DHT_ERROR_TIMEOUT) goto whenFailed;

    /**
     * Ok or Timeout.
     *
     * And then High for 80 µs.
     */
    if ((sensorCondition = waitForPinChange(HIGH, gpioPin)) == DHT_ERROR_TIMEOUT) goto whenFailed;

    for (uint16_t idxNr = 0, maxNr = sizeof(sensorBuffer) * 8; idxNr < maxNr; idxNr++) {
        if ((sensorCondition = waitForPinChange(LOW, gpioPin)) == DHT_ERROR_TIMEOUT) goto whenFailed;

        unsigned long highStart = micros();

        if ((sensorCondition = waitForPinChange(HIGH, gpioPin)) == DHT_ERROR_TIMEOUT) goto whenFailed;

        /**
         * 26 - 28 µs Voltage Length = 0
         * 50 µs = 1
         */
        if ((micros() - highStart) > 40) {
            sensorBuffer[idxNr / 8] |= (1 << bitIndex);
        }

        bitIndex = (bitIndex > 0) ? bitIndex - 1 : 7;
    }

    printf("[ DEBUG ] Sensor Type: %d \n", sensorType);

    printf("[ DEBUG ] Sensor Buffer 0: %d \n", sensorBuffer[0]);
    printf("[ DEBUG ] Sensor Buffer 1: %d \n", sensorBuffer[1]);
    printf("[ DEBUG ] Sensor Buffer 2: %d \n", sensorBuffer[2]);
    printf("[ DEBUG ] Sensor Buffer 3: %d \n", sensorBuffer[3]);
    printf("[ DEBUG ] Sensor Buffer 4: %d \n", sensorBuffer[4]);

    /**
     * sensorBuffer
     *
     *   0: Humidity Integer
     *   1: Humidity Fraction
     *
     *   2: Temperature Integer
     *   3: Temperature Fraction
     *
     *   4: Checksum
     *
     * Both the Humidity and Temperature fraction are NOT used if
     * the `sensorType` is equal to 11.
     */
    if (sensorBuffer[4] == ((sensorBuffer[0] + sensorBuffer[1] + sensorBuffer[2] + sensorBuffer[3]) & 0xFF)) {
        goto whenSucceeded;
    }
    else {
        sensorCondition = DHT_ERROR_CHECKSUM;

        goto whenFailed;
    }

    /**
     * An error occurred while reading the Dht11 or Dht22.
     *
     * DHT_ERROR_TIMEOUT
     * DHT_ERROR_CHECKSUM
     */
    whenFailed:
    defDefPriority();

    dhtRecord->sensorCondition = sensorCondition;

    dhtRecord->mHumidity = -1.0;
    dhtRecord->mTemperature = -1.0;

    printf("[ DEBUG ] Error: %d. \n", sensorCondition);

    return dhtRecord;

    /**
     * Everything went fine! Go back to default Priority and
     * return the Humidity and Temperature.
     */
    whenSucceeded:
    defDefPriority();

    dhtRecord->sensorCondition = sensorCondition;

    if(sensorType == 11) {
        dhtRecord->mHumidity    = sensorBuffer[0];
        dhtRecord->mTemperature = sensorBuffer[2];
    }
    else {
        dhtRecord->mHumidity    = ((sensorBuffer[0] * 256) + sensorBuffer[1]) * 0.1;
        dhtRecord->mTemperature = (((sensorBuffer[2] & 0x7F) * 256) + sensorBuffer[3]) * 0.1;

        if(sensorBuffer[2] & 0x80) dhtRecord->mTemperature = dhtRecord->mTemperature * -1;
    }

    printf("[ DEBUG ] All Ok. \n");

    return dhtRecord;
}