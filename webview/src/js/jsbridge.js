const setUserName = (username) => {
  try {
    window.webkit.messageHandlers.setUser.postMessage(username)
  } catch (_) { }
}

const openURL = (url) => {
  try {
    window.webkit.messageHandlers.openURL.postMessage(url)
  } catch (_) { }
}

export default {
  setUserName,
  openURL
}