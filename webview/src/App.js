import '@css/base.css';
import '@css/style.scss';
import cheerio from 'cheerio'
import IScroll from 'iscroll'
import event from '@js/eventemit'
import jsbridge from '@js/jsbridge'

if (process.env.NODE_ENV !== 'production') {
  require('./index.html')
  const data = require('@assets/testData.html')
  setTimeout(() => {
    event.emit('render', data)
  }, 100)
}

const App = (() => {
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

  function renderDOM({ headerUrl, username, nickname, statusEmoji, profileBio, lastUpdate, todayCommit, todayColor, dailyGraph }) {
    document.querySelector('.J_userHeader').setAttribute('src', headerUrl)
    document.querySelector('.J_username').innerText = username
    document.querySelector('.J_nickname').innerText = nickname
    document.querySelector('.J_profile_bio').innerText = profileBio
    document.querySelector('.J_last_update').innerText = lastUpdate
    document.querySelector('.J_today').innerText = todayCommit
    document.querySelector('.J_today_color').style.background = todayColor
    document.querySelector('.J_daily').innerHTML = dailyGraph
    
    if (statusEmoji.trim() === '' || statusEmoji === null || typeof statusEmoji === 'undefined') {
      document.querySelector('.J_focus').style.display = 'none'
    } else {
      document.querySelector('.J_focus').innerText = statusEmoji
    }

    new IScroll('#J_IScroll', {
      scrollX: true,
      scrollY: false,
      startX: -548
    })
  }

  function render(data) {
    const $ = cheerio.load(data)

    const headerUrl = $('.u-photo .avatar').attr('src')
    const username = $('.p-name').html()
    const nickname = $('.p-nickname').html()

    const statusEmoji = $('.user-status-emoji-container .g-emoji').eq(0).text()

    const profileBio = $('.js-user-profile-bio').text()

    const today = $('rect').last()
    const todayCommit = today.attr('data-count')
    const todayColor = today.attr('fill')

    const dailyGraph = getDailyGraph($)

    const lastUpdate = getLastUpdate($)

    renderDOM({ headerUrl, username, nickname, statusEmoji, profileBio, lastUpdate, todayCommit, todayColor, dailyGraph })
  }

  function listen() {
    document.body.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })

    document.querySelector('.J_setting').addEventListener('submit', (e) => {
      e.preventDefault()
      const username = document.querySelector('.J_username_input').value
      jsbridge.setUserName(username)
      document.body.classList.remove('f-setting')
    })

    document.querySelector('.J_cancel').addEventListener('click', () => {
      document.body.classList.remove('f-setting')
    })

    document.querySelectorAll('.J_openURL').forEach((dom) => {
      dom.addEventListener('click', () => {
        const username = document.querySelector('.J_nickname').innerText
        jsbridge.openURL(`https://github.com/${username}`)
      })
    })

    event.on('render', (data) => {
      App.render(data)
    })

    event.on('setting', (_) => {
      document.body.classList.add('f-setting')
      document.querySelector('.J_username_input').value = document.querySelector('.J_nickname').innerText
    })
  }

  return {
    render,
    listen
  }
})()

App.listen()