const $ = require('jquery')
const IScroll = require('iscroll')
const { ipcRenderer } = require('electron')
const Store = require('electron-store')

const store = new Store()

let isFirstRender = true
let lastData = store.get('lastData', null)
let targetUsername = store.get('targetUsername', null)
let token = store.get('token', null)
let iscrollInstance = null

const showLoading = () => {
  $('body').addClass('f-is-loading')
}

const showSetToken = () => {
  $('body').addClass('f-setting-token')
  $('.J_token_input').val('') 
}

const showSetTargetUsername = () => {
  $('body').addClass('f-setting-user')

  if (targetUsername) {
    $('.J_username_input').val(targetUsername) 
  }
}

const hideAll = () => {
  $('body').attr('class', '')
}

const listen = () => {
  $('.J_refresh').on('click', () => {
    launch()
  })
  
  $('.J_setting').on('click', () => {
    showSetTargetUsername()
  })
  
  $('.J_cancel').on('click', () => {
    hideAll()
  })

  $('.J_token_form').on('submit', (e) => {
    e.preventDefault()
    token = $('.J_token_input').val()
    store.set('token', token)
    hideAll()
    launch()
  })

  $('.J_user_form').on('submit', (e) => {
    e.preventDefault()
    const inputUsername = $('.J_username_input').val().trim()

    if (inputUsername === targetUsername) {
      return
    }

    targetUsername = inputUsername
    store.set('targetUsername', targetUsername)
    hideAll()
    launch()
  })

  $('.J_logout').on('click', () => {
    ipcRenderer.send('exit')
  })

  $('body').on('click', '.J_openURL', function(e) {
    e.preventDefault()
    ipcRenderer.send('openURL', $(this).attr('data-href'))
  })

  ipcRenderer.on('windowDidShow', () => {
    hideAll()
    launch()
  })

  ipcRenderer.on('request-success', (e, json) => {
    renderPage(json)
    store.set('lastData', JSON.stringify(json))
  })

  ipcRenderer.on('request-401', (e, json) => {
    token = null
    store.set('token', null)
    hideAll()
    showSetToken()
  })

  ipcRenderer.on('request-failed', (e, json) => {
    hideAll()
  })
}

const padStart = (n) => ('0' + n).slice(-2)

const convertDate = (ts) => {
  const day = new Date(ts)
  return `${day.getFullYear()}-${padStart(day.getMonth() + 1)}-${padStart(day.getDate())}`;
}

const renderUser = ({ login, name, bio, url, status, avatarUrl, createdAt }) => {
  $('.J_userHeader').attr('src', avatarUrl)
  $('.J_userHeader').attr('data-href', url)
  $('.J_username').text(login)
  $('.J_nickname').text(name)
  $('.J_nickname').attr('data-href', url)
  $('.J_profile_bio').text(bio)
  if (status) {
    $('.J_focus').html(status.emojiHTML)
  }
  $('.J_last_update').text(convertDate(createdAt))
  $('.J_github').attr('data-href', url)
}

const renderContributions = ({ contributions }) => {
  if (iscrollInstance) {
    iscrollInstance.destroy()
  }

  const data = contributions.contributionCalendar.weeks
    .map(({ contributionDays }) => contributionDays)

  const contributionGraphTemplate = data.map(weekData => {
    return `
      <div class="group">
        ${weekData.map(({ color, contributionCount: count }) => `<div class="rect" ${count > 0 ? 'data-hover="1"' : ''} style="background-color: ${color}"></div>`).join('')}
      </div>
    `
  }).join('')

  const today = data.slice(-1)[0].slice(-1)[0]

  $('.J_daily').html(contributionGraphTemplate)
  $('.J_today_color').css('backgroundColor', today.color)
  $('.J_today').text(today.contributionCount)

  iscrollInstance = new IScroll('#J_IScroll', {
    scrollX: true,
    scrollY: false,
    startX: -539
  })

  $('.J_today').addClass('f-startAni')
    
  setTimeout(() => {
    $('.J_today').removeClass('f-startAni')
  }, 5000)
}

const renderEvents = ({ events }) => {
  const { commitContributionsByRepository } = events
  const totalCount = commitContributionsByRepository.reduce((prev, { contributions: { totalCount: count } }) => prev + count, 0)

  const eventsTemplate = commitContributionsByRepository.map(({ repository: { name, url, owner: { login } }, contributions: { totalCount: count } }) => `
    <div class="u-item">
      <div class="u-left">
        <span class="name J_openURL" data-href="${url}">${login}/${name}</span>
      </div>
      <div class="u-right">
        <span class="bar J_bar f-short" style="width: ${~~(count / totalCount * 92)}px; background-color: ${ count / totalCount > 0.5 ? '#7bc96f' : '#C6E48B' }"></span>
      </div>
    </div>
  `).join('')

  $('.J_recentList').html(eventsTemplate)

  setTimeout(() => {
    $('.J_bar').removeClass('f-short')
  }, 1000)
}

const renderPage = ({ data }) => {
  const { user } = data
  hideAll()

  if (user === null) {
    showSetTargetUsername()
    return
  }

  renderUser(user)
  renderContributions(user)
  renderEvents(user)
}

const firstRender = () => {
  isFirstRender = false

  if (lastData) {
    renderPage(JSON.parse(lastData))
    setTimeout(() => {
      $('.J_main').removeClass('hidden')
    }, 500)
    return
  }

  $('.J_main').removeClass('hidden')
}

const launch = () => {
  hideAll()

  if (isFirstRender) {
    firstRender()
  }
  if (!token) {
    showSetToken()
    return
  }
  if (!targetUsername) {
    showSetTargetUsername()
    return
  }

  showLoading()
  ipcRenderer.send('request', { targetUsername, token })
}

listen()
