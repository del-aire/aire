#include <wiringPi.h>
#include "WiringPiSetup.h"

static bool _isInitialized = false;

/**
 * Setup the Wiring Pi Library for usage in combination with
 * each Sensor.
 */
void setupWiringPiIfRequired() {
    if(WIRING_PI_SETUP::_isInitialized == false) {
        wiringPiSetupGpio();

        WIRING_PI_SETUP::_isInitialized = true;
    }
}
