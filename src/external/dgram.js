// This file gets used instead of the NodeJS `dgram` module during rollup
// builds targeting browser environments. It simply returns "nothing".
const noop = undefined
export default noop
