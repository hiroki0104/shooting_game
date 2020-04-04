;(() => {
  const CANVAS_WIDTH = 640
  const CANVAS_WWIDTH_HALF = CANVAS_WIDTH / 2
  const CANVAS_HEIGHT = 480

  let util, canvas, ctx, image, startTime
  //  自機の現在地
  let viper
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

    // 登場シーンからスタートするための設定
    viper = new Viper(ctx, 0, 0, 64, 64, image)
    viper.setComing(
      CANVAS_WWIDTH_HALF, // 登場演出時の開始X座標
      CANVAS_HEIGHT + 50, // 登場演出時の開始Y座標
      CANVAS_WWIDTH_HALF,
      CANVAS_HEIGHT - 100
    )
  }

  function eventSetting() {
    window.addEventListener('keydown', event => {
      if (viper.isComing === true) {
        return
      }
      switch (event.key) {
        case 'ArrowLeft':
          viper.position.x -= 10
          break
        case 'ArrowRight':
          viper.position.x += 10
          break
        case 'ArrowUp':
          viper.position.y -= 10
          break
        case 'ArrowDown':
          viper.position.y += 10
          break
      }
    })
  }

  function render() {
    ctx.globalAlpah = 1.0
    util.drawRact(0, 0, canvas.width, canvas.height, '#eeeeee')
    // ミリ秒を秒に換算する
    let nowTime = (Date.now() - startTime) / 1000
    // let s = Math.sin(nowTime)
    // -1.0 ~ 1.0 を百倍
    // let x = s * 100.0
    viper.update()
    // requestAnimationFrame(render)
  }

  function generateRandomInt(range) {
    let random = Math.random()
    return Math.floor(random * range)
  }
})()
