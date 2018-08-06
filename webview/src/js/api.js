import event from './eventemit'
export default {
  getData: (username) => {
    fetch(`/api/${username}`)
      .then(res => res.text())
      .then(res => event.emit('getData', res))
  }
}