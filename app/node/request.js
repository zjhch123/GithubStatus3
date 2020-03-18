const fetch = require('node-fetch')

const body = (user) => {
  const now = new Date()

  const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  return {
    query: `{
      user(login: "${user}") {
        login
        name
        bio
        url
        status {
          emojiHTML
          message
        }
        createdAt
        avatarUrl
        events: contributionsCollection(from: "${month}") {
          commitContributionsByRepository(maxRepositories: 5) {
            repository {
              owner {
                login
              }
              name
              url
            }
            contributions {
              totalCount
            }
          }
        }
        contributions: contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                color
                contributionCount
                date
              }
            }
          }
        }
      }
    }`
  }
}

module.exports = function request({ targetUsername, token }) {
  return fetch('https://api.github.com/graphql', {
    method: 'post',
    headers: {
      Authorization: `bearer ${token}`,
      Cookie: 'tz=Asia%2FShanghai',
    },
    body: JSON.stringify(body(targetUsername))
  })
}