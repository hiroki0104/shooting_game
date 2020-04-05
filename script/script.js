;(() => {
  // どこからでも参照できるようにwindowオブジェクトのカスタムプロパティとして設定する
  window.isKeyDown = {}
  const CANVAS_WIDTH = 640
  const CANVAS_WWIDTH_HALF = CANVAS_WIDTH / 2
  const CANVAS_HEIGHT = 480
  const SHOT_MAX_COUNT = 10

  let util, canvas, ctx, image, startTime, viper

  let shotArray = []

  window.addEventListener('load', () => {
    util = new Canvas2DUtility(document.getElementById('main_canvas'))
    canvas = util.canvas
    ctx = util.context

    initialize()
    loadCheck()
  })

  function initialize() {
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    // 登場シーンからスタートするための設定
    viper = new Viper(ctx, 0, 0, 64, 64, './../img/viper.png')
    viper.setComing(
      CANVAS_WWIDTH_HALF, // 登場演出時の開始X座標
      CANVAS_HEIGHT + 50, // 登場演出時の開始Y座標
      CANVAS_WWIDTH_HALF,
      CANVAS_HEIGHT - 100
    )

    for (let i = 0; i < SHOT_MAX_COUNT; ++i) {
      shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './../img/viper_shot.png')
    }
    viper.setShotArray(shotArray)
  }

  // インスタンスの準備が完了しているかどうか確認する
  function loadCheck() {
    let ready = true
    ready = ready && viper.ready
    shotArray.map(v => {
      ready = ready && v.ready
    })

    if (ready === true) {
      eventSetting()
      startTime = Date.now()
      render()
    } else {
      setTimeout(loadCheck, 100)
    }
  }

  //   キーのイベントを設定する
  function eventSetting() {
    window.addEventListener('keydown', event => {
      isKeyDown[`key_${event.key}`] = true
    })
    window.addEventListener('keyup', event => {
      isKeyDown[`key_${event.key}`] = false
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
    shotArray.map(v => {
      v.update()
    })
    requestAnimationFrame(render)
  }

  function generateRandomInt(range) {
    let random = Math.random()
    return Math.floor(random * range)
  }
})()
