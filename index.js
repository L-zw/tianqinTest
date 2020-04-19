;((w) => {
  w.onload = () => {
    // 基于准备好的dom，初始化echarts实例
    var line = echarts.init(document.querySelector('.content_main .line'))
    var bar = echarts.init(document.querySelector('.content_main .bar'))
    var pie = echarts.init(document.querySelector('.content_main .pie'))

    var lineOption = {
      title: {
        text: '曲线图数据展示'
      },
      tooltip: {},
      legend: {
        data:[]
      },
      xAxis: {
        data: []
      },
      yAxis: {},
      series: [{
        name: '销量',
        type: 'line',
        data: [],
        color: ['#81ACF3'],
        smooth: true,
        areaStyle: {},
      }]
    }
    var barOption = {
      title: {
        text: '柱状图数据展示'
      },
      tooltip: {},
      legend: {
        data:[]
      },
      xAxis: {
        data: []
      },
      yAxis: {},
      series: [{
        name: '销量',
        type: 'bar',
        data: [],
        color: ['#4EAD16']
      }]
    }
    var pieOption = {
      title: {
        text: '饼状图数据展示'
      },
      series : [
        {
          name: '销量',
          type: 'pie',
          radius: '55%',
          data:[]
        }
      ]
    }

    line.setOption(lineOption)
    bar.setOption(barOption)
    pie.setOption(pieOption)

    axios.get('https://edu.telking.com/api/?type=week').then(response => {
      var obj = response.data.data

      var res = []
      for (var i = 0; i < obj.series.length; i++) {
        res.push({value: obj.series[i], name: obj.xAxis[i]})
      }

      bar.setOption({
        xAxis: {
          data: obj.xAxis
        },
        series: [{
          data: obj.series
        }]
      })
      pie.setOption({
        series: [{
          data: res
        }]
      })
    })
    axios.get('https://edu.telking.com/api/?type=month').then(response => {
      var obj = response.data.data
      line.setOption({
        xAxis: {
          data: obj.xAxis
        },
        series: [{
          data: obj.series
        }]
      })
    })




    var ul = document.querySelector('.content_main .head .nav_bar ul')
    var block = document.querySelector('.content_main .head .nav_bar .under_block')
    var currentWidth = block.clientWidth + 'px' // 下滑块当前的宽度，点击时更新
    var currentLeft = block.offsetLeft + 'px' // 下滑块当前的位置，点击时更新

    // 导航条 点击效果
    ul.addEventListener('click', e => {
      e = e || window.event
      if (e.target.nodeName.toLowerCase() === 'li') {
        currentWidth = block.style.width = e.target.clientWidth + 'px'
        currentLeft = block.style.left = e.target.offsetLeft + 'px'
      }
    }, false)

    // 导航条 悬浮鼠标效果 移入
    ul.addEventListener('mouseover', e => { // mouseover、mouseout 有冒泡，此处需要冒泡
      e = e || window.event
      if (e.target.nodeName.toLowerCase() === 'li') {
        block.style.width = e.target.clientWidth + 'px'
        block.style.left = e.target.offsetLeft + 'px'
      }
    }, false)

    // 导航条 悬浮鼠标效果 移出
    ul.addEventListener('mouseout', () => {
      block.style.width = currentWidth
      block.style.left = currentLeft
    }, false)




    var $carousel = $('.content_main .carousel')
    var $imgList = $('.content_main .carousel .img_list')
    var $points = $('.content_main .carousel .point_list div')
    var $prev = $('.content_main .carousel .icon-prev')
    var $next = $('.content_main .carousel .icon-next')
    var PAGE_WIDTH = 560 // 一页的宽度
    var TIME = 400 // 翻一页的持续时间
    var ITEM_TIME = 20 // 单元移动的间隔时间
    var pointsCount = $points.length
    var index = 0 // 当前页下标
    var isMove = false // 当前是否在翻页

    /**
     * 平滑翻页
     * @param next
     * true: 下一页
     * false: 上一页
     * 数值: 指定下标页
     */
    nextPage = next => {
      if (isMove) { // 正在翻页，阻止快速点击左右键/导航点 导致的定时器叠加
        return
      }
      isMove = true

      var distance = 0 // 自动/手动翻页 要移动的偏移量
      if (typeof next === 'boolean') {
        distance = next ? -PAGE_WIDTH : PAGE_WIDTH
      } else {
        distance = -PAGE_WIDTH * (next - index)
      }

      var itemDistance = distance / (TIME / ITEM_TIME) // 计算单元移动的偏移量
      var currentLeft = $imgList.position().left // 当前的 left
      var targetLeft = currentLeft + distance // 目标处的 left

      var itemInterval = setInterval(() => {
        currentLeft += itemDistance
        if (currentLeft === targetLeft) {
          clearInterval(itemInterval)

          isMove = false

          // 到达最右边的图片（1.jpg），跳转到最左边的第2张图片（1.jpg）
          if(currentLeft === -PAGE_WIDTH * (pointsCount + 1)) {
            currentLeft = -PAGE_WIDTH
          } else if(currentLeft === 0){
            // 到达最左边的图片（5.jpg），跳转到最右边的第2张图片（5.jpg）
            currentLeft = -PAGE_WIDTH * pointsCount
          }
        }

        $imgList.css('left', currentLeft)
      }, ITEM_TIME)

      updatePoints(next)
    }

    /**
     * 更新圆点
     * @param next
     */
    updatePoints = next => {
      if (typeof next === 'boolean') {
        if (next) {
          targetIndex = index + 1
          if(targetIndex === pointsCount) {
            targetIndex = 0
          }
        } else {
          targetIndex = index - 1
          if(targetIndex === -1) {
            targetIndex = pointsCount - 1
          }
        }
      } else {
        targetIndex = next
      }

      $points[index].className = ''
      $points[targetIndex].className = 'active'
      index = targetIndex
    }

    // 自动轮播
    var intervalId = setInterval(() => {
      nextPage(true)
    }, 2000)

    // 移入-停止，移出-轮播
    $carousel.hover(() => {
      clearInterval(intervalId)
    }, () => {
      intervalId = setInterval(() => {
        nextPage(true)
      }, 2000)
    })

    // 点击左右按键
    $next.click(() => {
      nextPage(true)
    })
    $prev.click(() => {
      nextPage(false)
    })

    // 点击导航点
    $points.click(function () {
      var targetIndex = $(this).index()
      if(targetIndex !== index) {
        nextPage(targetIndex)
      }
    })
  }
})(window)