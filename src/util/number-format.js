const numberFormat = (x) => {
  if(!x) return ""
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = numberFormat
