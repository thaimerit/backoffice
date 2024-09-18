module.exports = {
  filterHtmlUtil: (html = "") => {
    return html ? html
      .replace(/font-family:[^;']*(;)?/g, "")
      .replace(/background-color:[^;']*(;)?/g, "")
      .replace(/font-size:[^;']*(;)?/g, "")
      .replace(/\n/g, "<br />") : ""
  },
  filterHtmlUtilHolystick: (html = "") => {
    return html ? html
      .replace(/font-family:[^;']*(;)?/g, "")
      .replace(/background-color:[^;']*(;)?/g, "")
      .replace(/font-size:[^;']*(;)?/g, "")
      .replace(/color:[^;']*(;)?/g, "")
      .replace(/\n/g, "<br />") : ""
  },
  stripHtml:(html) => {
     return html ? html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, " ").replace(/( +)/g, " ") : "";
  },
  substringText:(text, limit=200) => {
     return text.length > limit ? text.substring(0, limit)+"..." : text
  }
}
