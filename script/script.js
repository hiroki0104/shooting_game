;(() => {
  const CANVAS_WIDTH = 640
  const CANVAS_HEIGHT = 480

  let util, canvas, ctx, image, startTime
  //  自機の現在地
  let [viperX, viperY] = [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2]
  let isComing = false
  let comingStart
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
    isComing = true
    comingStart = Date.now() // 登場開始時のタイムスタンプの取得
    viperY = CANVAS_HEIGHT
  }

  function eventSetting() {
    window.addEventListener('keydown', event => {
      if (isComing === true) {
        return
      }
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
    ctx.globalAlpah = 1.0
    util.drawRact(0, 0, canvas.width, canvas.height, '#eeeeee')
    // ミリ秒を秒に換算する
    let nowTime = (Date.now() - startTime) / 1000
    // let s = Math.sin(nowTime)
    // -1.0 ~ 1.0 を百倍
    // let x = s * 100.0
    if (isComing === true) {
      let justTime = Date.now()
      let comingTime = (justTime - comingStart) / 1000
      viperY = CANVAS_HEIGHT - comingTime * 50
      if (viperY <= CANVAS_HEIGHT - 100) {
        isComing = false
        viperY = CANVAS_HEIGHT - 100
      }
      if (justTime % 100 < 50) {
        ctx.globalAlpah = 0.5
      }
    }
    ctx.drawImage(image, viperX, viperY)
    // requestAnimationFrame(render)
  }

  function generateRandomInt(range) {
    let random = Math.random()
    return Math.floor(random * range)
  }
})()
