import '@css/base.css';
import '@css/style.scss';
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import cheerio from 'cheerio'
import event from '@js/eventemit'

// 这是为了更新html之后页面能自动刷新而写的。不要删
if (process.env.NODE_ENV !== 'production') {
  require('./index.html')
}


const table1 = document.querySelector('.J_table1')
const table1Option = {
  grid: {
    left: '10%',
    top: '10%',
    bottom: '20%',
    right: '5%',
  },  
  xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['0', '1', '2', '3', '4', '5', '6']
  },
  yAxis: {
      type: 'value'
  },
  series: [{
      name: 'series',
      data: [0,0,0,0,0,0,0],
      type: 'line',
      itemStyle: {
        color: '#45b97c'
      },
      lineStyle: {
        color: '#45b97c'
      },
      areaStyle: {
        color: '#45b97c'
      }
  }]
};
const table1Instance = window.instance = echarts.init(table1)
table1Instance.setOption(table1Option)

function render({headerUrl, username, nickname, todayCommit, todayColor, commitDayPerYear, percent, week, weekCommit}) {
  document.querySelector('.J_userHeader').setAttribute('src', headerUrl)
  document.querySelector('.J_username').innerHTML = username
  document.querySelector('.J_nickname').innerHTML = nickname
  document.querySelector('.J_today').innerHTML = todayCommit
  document.querySelector('.J_today_color').style.background = todayColor
  document.querySelector('.J_commit_day_per_year').innerHTML = commitDayPerYear
  document.querySelector('.J_percent').style.width = `${percent}%`
  table1Instance.setOption({
    xAxis: {
      data: week
    },
    series: [{
      name: 'series',
      data: weekCommit
    }]
  })
}

event.on('getData', (data) => {
  const $ = cheerio.load(data)
  const headerUrl = $('.u-photo .avatar').attr('src')
  const username = $('.p-name').html()
  const nickname = $('.p-nickname').html()

  const today = $('rect').last()
  const todayCommit = today.attr('data-count')
  const todayColor = today.attr('fill')
  const commitDayPerYear = $('rect[data-count!=0]').length
  const percent = commitDayPerYear / 365 * 100

  const weekDOM = $('rect').slice(-7)
  const week = [].slice.call(weekDOM).map(item => $(item).attr('data-date')).map(item => item.split('-').slice(-2).join('-'))
  const weekCommit = [].slice.call(weekDOM).map(item => $(item).attr('data-count'))

  render({headerUrl, username, nickname, todayCommit, todayColor, commitDayPerYear, percent, week, weekCommit})
})

document.body.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})