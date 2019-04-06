import '@css/base.css';
import '@css/style.scss';
import cheerio from 'cheerio'
import event from '@js/eventemit'

// import testData from '@assets/testData.html'

// 这是为了更新html之后页面能自动刷新而写的。不要删
if (process.env.NODE_ENV !== 'production') {
  require('./index.html')
}

function render({headerUrl, username, nickname, profileBio, lastUpdate, todayCommit, todayColor, dailyGraph}) {
  document.querySelector('.J_userHeader').setAttribute('src', headerUrl)
  document.querySelector('.J_username').innerHTML = username
  document.querySelector('.J_nickname').innerHTML = nickname
  document.querySelector('.J_profile_bio').innerHTML = profileBio
  document.querySelector('.J_last_update').innerHTML = lastUpdate
  document.querySelector('.J_today').innerHTML = todayCommit
  document.querySelector('.J_today_color').style.background = todayColor
  document.querySelector('.J_daily').innerHTML = dailyGraph
  document.querySelector('.J_daily svg').setAttribute('viewBox', '12 0 634 82')
}

event.on('getData', (data) => {
  const $ = cheerio.load(data)
  const headerUrl = $('.u-photo .avatar').attr('src')
  const username = $('.p-name').html()
  const nickname = $('.p-nickname').html()

  const profileBio = $('.js-user-profile-bio').text()

  const today = $('rect').last()
  const todayCommit = today.attr('data-count')
  const todayColor = today.attr('fill')

  const dailyGraph = $('.js-calendar-graph').html()

  const rects = $('rect')

  let lastUpdate = 'Not update yet'

  for (let i = rects.length - 1; i >= 0; i--) {
    const $rect = rects.eq(i)
    if ($rect.attr('data-count') != 0) {
      lastUpdate = $rect.attr('data-date')
      break
    }
  }

  render({ headerUrl, username, nickname, profileBio, lastUpdate, todayCommit, todayColor, dailyGraph })
})

document.body.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})

// event.emit('getData', testData)