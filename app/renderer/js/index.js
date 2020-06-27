const $ = require('jquery')
const IScroll = require('iscroll')
const { ipcRenderer } = require('electron')
const Store = require('electron-store')

const store = new Store()

let isFirstRender = true
let lastData = store.get('lastData', null)
let targetUsername = store.get('targetUsername', null)
let iscrollInstance = null

const showLoading = () => {
  $('body').addClass('f-is-loading')
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

const showHTML = () => {
  $('html').css('display', 'block')
}

const hideHTML = () => {
  $('html').css('display', 'none')
}

const listen = () => {
  $(window).on('load', () => {
    launch()
  })
  
  $('.J_refresh').on('click', () => {
    launch()
  })
  
  $('.J_setting').on('click', () => {
    showSetTargetUsername()
  })
  
  $('.J_cancel').on('click', () => {
    hideAll()
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
    showHTML()
    hideAll()
    launch()
  })

  ipcRenderer.on('windowWillHide', () => {
    hideHTML()
  })

  ipcRenderer.on('request-success', (e, json) => {
    renderPage(json)
    store.set('lastData', JSON.stringify(json))
  })

  ipcRenderer.on('request-404', (e, json) => {
    hideAll()
    showSetTargetUsername()
  })

  ipcRenderer.on('request-failed', (e, json) => {
    hideAll()
  })
}

const renderUser = ({ login, name, bio, url, status, avatarUrl, organizations }) => {
  $('.J_userHeader').attr('src', avatarUrl)
  $('.J_userHeader').attr('data-href', url)
  $('.J_username').text(login)
  $('.J_nickname').text(name)
  $('.J_nickname').attr('data-href', url)
  $('.J_profile_bio').text(bio)
  if (status && status.emojiHTML) {
    $('.J_focus').html(status.emojiHTML).show()
  } else {
    $('.J_focus').hide()
  }
  $('.J_github').attr('data-href', url)
  if (organizations) {
    $('.J_organizations').html(organizations.nodes.map(({ avatar, href }) => `
      <div data-href="${href}" class="J_openURL u-org"><img src="${avatar}"></div>
    `).slice(0, 8).join(''))
  }
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

  const eventsTemplate = commitContributionsByRepository.map(({ repository: { name, url }, contributions: { totalCount, width, color } }) => `
    <div class="u-item">
      <div class="u-left">
        <span class="name J_openURL" data-href="${url}">${name}</span>
      </div>
      <div class="u-right" data-count="${totalCount}">
        <span class="bar J_bar f-short" style="width: ${width}; background-color: ${color}"></span>
      </div>
    </div>
  `).slice(0, 5).join('')

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
  if (!targetUsername) {
    showSetTargetUsername()
    return
  }

  showLoading()
  ipcRenderer.send('request', { targetUsername })
}

listen()
