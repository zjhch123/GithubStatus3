const fetch = require('node-fetch')
const cheerio = require('cheerio')
const cache = require('./cache')

const convertUser = ($) => {
  const login = $('.p-nickname').eq(0).text()
  const $organizations = $('.avatar-group-item[data-hovercard-type="organization"]')
  const organizations = []

  for (let i = 0; i < $organizations.length; i += 1) {
    const $organization = $organizations.eq(i)
    organizations.push({
      avatar: $organization.find('img.avatar').attr('src'),
      href: `https://github.com${$organization.attr('href')}`
    })
  }

  return {
    login,
    name: $('.p-name').eq(0).text(),
    bio: $('.user-profile-bio').eq(0).text(),
    url: `https://github.com/${login}`,
    status: {
      emojiHTML: $('.user-status-container').find('g-emoji').html()
    },
    avatarUrl: $('.u-photo').eq(0).find('img.avatar').attr('src'),
    organizations: {
      nodes: organizations
    }
  }
}

const convertContributions = ($) => {
  const $calendar = $('.calendar-graph')

  const $weeks = $calendar.find('svg > g').find('g')
  const weeks = []

  for (let i = 0; i < $weeks.length; i += 1) {
    const $week = $weeks.eq(i)
    const $days = $week.find('rect')
    const week = {
      contributionDays: []
    }

    for (let j = 0; j < $days.length; j += 1) {
      const $day = $days.eq(j)
      week.contributionDays.push({
        color: $day.attr('fill'),
        contributionCount: ~~($day.attr('data-count')),
        date: $day.attr('data-date'),
      })
    }

    weeks.push(week)
  }

  return {
    contributionCalendar: {
      weeks,
    }
  }
}

const convertEvents = ($) => {
  const $container = $('.profile-rollup-wrapper.Details').eq(0)
  const $items = $container.find('li')
  const repositories = []

  for (let i = 0; i < $items.length; i += 1) {
    const $item = $items.eq(i)
    repositories.push({
      repository: {
        name: $item.find('a').eq(0).text(),
        url: `https://github.com${$item.find('a').eq(0).attr('href')}`,
      },
      contributions: {
        totalCount: ~~($item.find('a').eq(1).text().trim().split(' ')[0])
      }
    })
  }

  return {
    commitContributionsByRepository: repositories
  }
}

const convertData = (htmlData) => {
  const $ = cheerio.load(htmlData)

  const user = convertUser($)
  const contributions = convertContributions($)
  const events = convertEvents($)

  return {
    data: {
      user: {
        ...user,
        contributions: {
          ...contributions,
        },
        events: {
          ...events,
        },
      }
    }
  }
}

module.exports = function request ({ targetUsername }) {
  const cachedData = cache.get(targetUsername)

  if (!!cachedData) {
    return Promise.resolve(cachedData)
  }

  return fetch(`https://github.com/${targetUsername}`, {
    method: 'get',
    headers: {
      "Host":"github.com",
      "Connection":"keep-alive",
      "Pragma":"no-cache",
      "Cache-Control":"no-cache",
      "Upgrade-Insecure-Requests":"1",
      "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
      "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      "Accept-Encoding":"gzip, deflate, br",
      "Accept-Language":"zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7,ja;q=0.6,la;q=0.5",
      "Cookie":"tz=Asia%2FShanghai",
    }
  }).then((data) => {
    if (data.status === 404) {
      throw new Error('404')
    }

    return data.text()
  }).then(data => cache.set(targetUsername, convertData(data)))
}