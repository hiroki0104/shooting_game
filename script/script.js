;(() => {
  const CANVAS_WIDTH = 640
  const CANVAS_HEIGHT = 480

  let util, canvas, ctx, image, startTime

  window.addEventListener('load', () => {
    util = new Canvas2DUtility(document.getElementById('main_canvas'))
    canvas = util.canvas
    ctx = util.context

    util.imageLoader('./img/viper.png', loadedImage => {
      image = loadedImage
      initialize()
      startTime = Date.now()
      render()
    })
  })

  function initialize() {
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
  }

  function render() {
    util.drawRact(0, 0, canvas.width, canvas.height, '#eeeeee')
    // ミリ秒を秒に換算する
    let nowTime = (Date.now() - startTime) / 1000
    let s = Math.sin(nowTime)
    // -1.0 ~ 1.0 を百倍
    let x = s * 100.0
    ctx.drawImage(image, CANVAS_WIDTH / 2 + x, CANVAS_HEIGHT / 2)
    //  requestAnimationFrame(render)
  }

  function generateRandomInt(range) {
    let random = Math.random()
    return Math.floor(random * range)
  }
})()
