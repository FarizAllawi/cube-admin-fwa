
const workingDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const getDay = (date) => {
    return workingDays[date.getDay()]
}

export const formatDate = (date) => {
    return `${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()}`
}
