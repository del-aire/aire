#ifndef DHT
#define DHT

static const int DHT_OK             = +0;
static const int DHT_ERROR_TIMEOUT  = -1;
static const int DHT_ERROR_CHECKSUM = -2;

struct DhtRecord {
    int sensorCondition;

    float mHumidity;
    float mTemperature;
};

/**
 * #.waitForPinChange
 *
 * @param oldValue         -> Either HIGH or LOW
 * @param gpioPin          -> Used by the Raspberry Pi
 * @param maxNr            -> Maximum number of Iteration(s)
 *
 * @return DHT_OK or DHT_ERROR_TIMEOUT
 */
int waitForPinChange(const int oldValue, const unsigned int gpioPin, unsigned int maxNr = 20000);

/**
 * #.readDht
 *
 * @param sensorType       -> 11 or 22
 * @param gpioPin          -> Valid Gpio Pin for the Raspberry Pi
 *
 * @return DhtRecord
 */
DhtRecord* readDht(const unsigned int sensorType, const unsigned int gpioPin);

#endif