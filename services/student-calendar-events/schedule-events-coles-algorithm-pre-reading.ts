import { int } from '@desmart/js-utils'
import { Moment } from 'moment'
import { buildTheSchedule } from './helpers/build-the-schedule'

export type EventScheduleTask = {
  label: string,
  type: string,
  date: Moment,
}

export type EventScheduleWorkDay = {
  thisDate: Moment,
  dayOfWeek: number,
  tasks: EventScheduleTask[],
  onBreak: boolean,
}

type Config = {
  startDate: Moment,
  endDate: Moment,
  numTasks: number,
  numTests: number,
  prioridays: any,
  isPreReading?: boolean,
}

const getDayOffBoundary = (isPreReading = false) => isPreReading ? 10 : 7
const getPriorityBoundary = (isPreReading = false) => isPreReading ? 7 : 5
const getPrioridaysBoundary = (isPreReading = false) => isPreReading ? 8 : 6

const fillCalendarWithTasks = (numTasks: number, prioridays: number[], daysCount: number[], numTests: number, schedule, debug = false, isPreReading = false): EventScheduleWorkDay[] => {
  let remainingTasks = numTasks
  let remainingDays = 0

  let residual = 0
  let taskDensity = []

  for (let i = 0; i <= 7; i++) {
    if (prioridays[i] > 0 && prioridays[i] < getPrioridaysBoundary(isPreReading)) {
      remainingDays += daysCount[i]
    }
    taskDensity[i] = 0
  }

  const priorities = [0, 0, 0, 0, 0, 0, 0, 0]

  for (let i = 0; i < 7; i++) {
    priorities[prioridays[i]] = i + 1
  }

  if (debug) {
    console.log({ priorities, schedule })
  }

  for (let i = 0; i < getPriorityBoundary(isPreReading); i++) {
    const priority = priorities[i + 1]

    if (priority > 0) {
      // daysCount[priority] can get out of bounds and we get undefined
      // const daysCountPriority = daysCount[priority] || 1
      const daysCountPriority = daysCount[priority]
      taskDensity[priority] = Math.floor(remainingTasks / remainingDays)
      residual = (remainingTasks - taskDensity[priority] * remainingDays) / daysCountPriority

      if (residual < 1) {
        taskDensity[priority] += residual
      } else {
        taskDensity[priority] += 1
      }

      remainingTasks -= taskDensity[priority] * daysCountPriority
      remainingDays -= daysCountPriority
    }
  }

  if (debug) {
    console.log({ taskDensity })
  }

  if (!isPreReading) {
    if (numTests / daysCount[priorities[6] - 1] >= 1) {
      taskDensity[priorities[6]] = 1
    } else {
      taskDensity[priorities[6]] = numTests / daysCount[priorities[6] - 1]
    }
  }

  // Adjust taskDensity (VBA is using such precision by default)
  taskDensity = taskDensity.map(density => Number(density.toFixed(1)))

  if (debug) {
    console.log({ taskDensity })
  }

  const floatingDensity = []

  for (let i = 0; i < 7; i++) {
    floatingDensity[i] = 0
  }

  let testNumber = 1
  let taskNumber = 1

  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].onBreak === false) {
      const dayOfWeekIndex = schedule[i].dayOfWeek - 1

      floatingDensity[dayOfWeekIndex] += taskDensity[dayOfWeekIndex + 1]

      if (floatingDensity[dayOfWeekIndex] > 0) {
        const taskAmount = Math.ceil(floatingDensity[dayOfWeekIndex])

        for (let j = 0; j < taskAmount; j++) {
          if (schedule[i].dayOfWeek === priorities[6] && testNumber <= numTests && !isPreReading) {
            schedule[i].tasks.push({ label: `Test ${testNumber}`, type: 'exam', date: schedule[i].thisDate })
            testNumber += 1
          } else {
            if (taskNumber <= numTasks) {
              schedule[i].tasks.push({ label: `Task ${taskNumber}`, type: 'task', date: schedule[i].thisDate })
              taskNumber += 1
            }
          }
        }

        floatingDensity[dayOfWeekIndex] -= Math.ceil(floatingDensity[dayOfWeekIndex])
      }
    } else {
      schedule[i].onBreak = true
    }
  }

  return schedule
}

export const scheduleCalendarEventsPreReading = (config: Config, debug = false) => {
  const schedule = buildTheSchedule(config.startDate, config.endDate)
  const { prioridays, numTasks, numTests } = config
  const daysCount = [0, 0, 0, 0, 0, 0, 0]
  let numDays = 0

  if (debug) {
    console.log({ prioridays, numTasks, numTests, config })
  }

  for (let i = 0; i < schedule.length; i++) {
    daysCount[schedule[i].dayOfWeek - 1] += 1
    numDays += 1

    if (prioridays[schedule[i].dayOfWeek - 1] > 0 && prioridays[schedule[i].dayOfWeek - 1] < getDayOffBoundary(config.isPreReading)) {
      schedule[i].onBreak = false
    } else {
      schedule[i].onBreak = true
    }
  }

  if (debug) {
    console.log({ numDays })
  }

  if (numDays > 60 && !config.isPreReading) {
    let numBreaks = Math.floor(numDays / 70) + 1

    if (Math.floor(numDays / 7) - numBreaks - numTasks > 0) {
      numBreaks += (Math.floor(numDays / 7) - numBreaks - numTasks)
    }

    let startBreak = 0

    for (let i = 1; i <= numBreaks; i++) {
      startBreak = Math.floor(numDays * i / numBreaks) - 6

      while (schedule[startBreak].dayOfWeek !== 1) {
        startBreak += 1
      }

      do {
        if (!schedule[startBreak]) {
          break
        }

        schedule[startBreak].onBreak = true
        daysCount[schedule[startBreak].dayOfWeek] -= 1
        startBreak += 1
      } while (startBreak <= schedule.length && schedule[startBreak - 1].dayOfWeek !== 7)
    }
  }

  return fillCalendarWithTasks(numTasks, prioridays, daysCount, numTests, schedule, debug, config.isPreReading)
}
