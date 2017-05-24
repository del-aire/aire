#include <sched.h>
#include <stdio.h>
#include <string.h>
#include "Process.h"

int defMaxPriority() {
    struct sched_param schedParam;

     memset(&schedParam, 0, sizeof(schedParam));

     /**
      * Set the Priority of the current Process to 99.
      *
      * @link https://linux.die.net/man/2/sched_get_priority_max
      */
     schedParam.sched_priority = sched_get_priority_max(SCHED_FIFO);

    /**
     * Use the FIFO Scheduler to make the Process more Real Time.
     *
     * @link https://linux.die.net/man/2/sched_setscheduler
     */
    return sched_setscheduler(0, SCHED_FIFO, &schedParam);
}

int defDefPriority() {
    struct sched_param schedParam;

    memset(&schedParam, 0, sizeof(schedParam));

    /**
     * Use the SCHED_OTHER as default Scheduler for any Process that
     * doesn't need to behave Real Time-ish.
     */
    schedParam.sched_priority = 0;

    return sched_setscheduler(0, SCHED_OTHER, &schedParam);
}