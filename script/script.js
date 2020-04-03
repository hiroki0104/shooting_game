;(() => {
  const CANVAS_WIDTH = 640
  const CANVAS_HEIGHT = 480

  let util, canvas, ctx, image, startTime
  //  自機の現在地
  let [viperX, viperY] = [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2]
  window.addEventListener('load', () => {
    util = new Canvas2DUtility(document.getElementById('main_canvas'))
    canvas = util.canvas
    ctx = util.context

    util.imageLoader('./img/viper.png', loadedImage => {
      image = loadedImage
      initialize()
      eventSetting()
      startTime = Date.now()
      render()
    })
  })

  function initialize() {
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
  }

  function eventSetting() {
    window.addEventListener('keydown', event => {
      switch (event.key) {
        case 'ArrowLeft':
          viperX -= 10
          break
        case 'ArrowRight':
          viperX += 10
          break
        case 'ArrowUp':
          viperY -= 10
          break
        case 'ArrowDown':
          viperY += 10
          break
      }
    })
  }

  function render() {
    util.drawRact(0, 0, canvas.width, canvas.height, '#eeeeee')
    // ミリ秒を秒に換算する
    let nowTime = (Date.now() - startTime) / 1000
    // let s = Math.sin(nowTime)
    // -1.0 ~ 1.0 を百倍
    // let x = s * 100.0
    ctx.drawImage(image, viperX, viperY)
    requestAnimationFrame(render)
  }

  function generateRandomInt(range) {
    let random = Math.random()
    return Math.floor(random * range)
  }
})()
