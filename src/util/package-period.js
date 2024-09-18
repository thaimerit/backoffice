function getPackagePeriod(period) {
  let periods = {
      'morning': 'ช่วงเช้า',
      'evening': 'ช่วงบ่าย',
  }

  return periods[period]
}


module.exports = {
  getPackagePeriod
}
