import '@css/base.css';
import '@css/style.scss';
import cheerio from 'cheerio'
import event from '@js/eventemit'

if (process.env.NODE_ENV !== 'production') {
  require('./index.html')
  const data = require('@assets/testData.html')
  setTimeout(() => {
    event.emit('getData', data)
  }, 100)
}

function render({headerUrl, username, nickname, profileBio, lastUpdate, todayCommit, todayColor, dailyGraph}) {
  document.querySelector('.J_userHeader').setAttribute('src', headerUrl)
  document.querySelector('.J_username').innerText = username
  document.querySelector('.J_nickname').innerText = nickname
  document.querySelector('.J_profile_bio').innerText = profileBio
  document.querySelector('.J_last_update').innerText = lastUpdate
  document.querySelector('.J_today').innerText = todayCommit
  document.querySelector('.J_today_color').style.background = todayColor
  document.querySelector('.J_daily').innerHTML = dailyGraph
}

function getLastUpdate($) {
  const rects = $('rect')

  let lastUpdate = 'Not update yet'

  for (let i = rects.length - 1; i >= 0; i--) {
    const $rect = rects.eq(i)
    if ($rect.attr('data-count') != 0) {
      lastUpdate = $rect.attr('data-date')
      break
    }
  }

  return lastUpdate
}

function getDailyGraph($) {
  const graphSvg = $('.js-calendar-graph-svg > g').find('g')
  let tpl = ``
  for (let i = 0; i < graphSvg.length; i++) {
    const $c = graphSvg.eq(i)
    const $rects = $c.find('rect')
    let _tpl = ``
    for (let j = 0; j < $rects.length; j++) {
      const $rect = $rects.eq(j)
      const count = $rect.attr('data-count')
      _tpl += `<div class="rect" ${count > 0 ? 'data-hover="1"' : ''} style="background-color: ${$rect.attr('fill')}"></div>`
    }
    tpl += `<div class="group">${_tpl}</div>`
  }
  return tpl
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

  const dailyGraph = getDailyGraph($)

  const lastUpdate = getLastUpdate($)

  render({ headerUrl, username, nickname, profileBio, lastUpdate, todayCommit, todayColor, dailyGraph })
})

document.body.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})