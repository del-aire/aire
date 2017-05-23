#ifndef PROCESS_UTIL
#define PROCESS_UTIL

/**
 * #.defMaxPriority
 *
 * Bump the Priority for the current Process by defined the Scheduler Priority
 * and using a First In First Out mechanism.
 *
 * @return {int} 0: Ok, -1: Error
 */
int defMaxPriority();

/**
 * #.defDefPriority
 *
 * Go back to using the default Scheduler for any Linux Program.
 *
 * @return {int} 0: Ok, -1: Error
 */
int defDefPriority();

#endif