import dispatchEmailNotification from './driver/email-notification'

const driverFactory = {
  email: dispatchEmailNotification
}

export default name => driverFactory[name]
