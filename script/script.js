;(() => {
  // どこからでも参照できるようにwindowオブジェクトのカスタムプロパティとして設定する
  window.isKeyDown = {}
  window.gameScore = 0

  const CANVAS_WIDTH = 640
  const CANVAS_WWIDTH_HALF = CANVAS_WIDTH / 2
  const CANVAS_HEIGHT = 480
  const SHOT_MAX_COUNT = 10
  const ENEMY_MAX_COUNT = 10
  const ENEMY_SHOT_MAX_COUNT = 50
  const EXPLOSION_MAX_COUNT = 10
  let util, canvas, ctx, image, startTime, viper, scene
  let restart = false

  let enemyArray = []
  let enemyShotArray = []
  let shotArray = []
  let singleShotArray = []
  let explosionArray = []
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

    // シーンの初期化
    scene = new SceneManager()

    for (let i = 0; i < EXPLOSION_MAX_COUNT; ++i) {
      explosionArray[i] = new Explosion(ctx, 50.0, 15, 30.0, 0.25)
    }
    viper = new Viper(ctx, 0, 0, 64, 64, './../img/viper.png')
    viper.setComing(
      CANVAS_WWIDTH_HALF, // 登場演出時の開始X座標
      CANVAS_HEIGHT + 50, // 登場演出時の開始Y座標
      CANVAS_WWIDTH_HALF,
      CANVAS_HEIGHT - 100
    )

    let ec
    for (ec = 0; ec < ENEMY_SHOT_MAX_COUNT; ++ec) {
      enemyShotArray[ec] = new Shot(
        ctx,
        0,
        0,
        32,
        32,
        './../img/enemy_shot.png'
      )
      enemyShotArray[ec].setTargets([viper])
      enemyShotArray[ec].setExplosions(explosionArray)
    }
    for (ec = 0; ec < ENEMY_MAX_COUNT; ++ec) {
      enemyArray[ec] = new Enemy(ctx, 0, 0, 48, 48, './../img/enemy_small.png')
      enemyArray[ec].setShotArray(enemyShotArray)
    }

    let mc
    for (mc = 0; mc < SHOT_MAX_COUNT; ++mc) {
      shotArray[mc] = new Shot(ctx, 0, 0, 32, 32, './../img/viper_shot.png')
      singleShotArray[mc * 2] = new Shot(
        ctx,
        0,
        0,
        32,
        32,
        './../img/viper_single_shot.png'
      )
      singleShotArray[mc * 2 + 1] = new Shot(
        ctx,
        0,
        0,
        32,
        32,
        './../img/viper_single_shot.png'
      )
    }
    // 登場シーンからスタートするための設定

    viper.setShotArray(shotArray, singleShotArray)

    for (mc = 0; mc < SHOT_MAX_COUNT; ++mc) {
      shotArray[mc].setTargets(enemyArray)
      singleShotArray[mc * 2].setTargets(enemyArray)
      singleShotArray[mc * 2 + 1].setTargets(enemyArray)
      shotArray[mc].setExplosions(explosionArray)
      singleShotArray[mc * 2].setExplosions(explosionArray)
      singleShotArray[mc * 2 + 1].setExplosions(explosionArray)
    }
  }

  // インスタンスの準備が完了しているかどうか確認する
  function loadCheck() {
    let ready = true
    ready = ready && viper.ready

    enemyArray.map(v => {
      ready = ready && v.ready
    })
    enemyShotArray.map(v => {
      ready = ready && v.ready
    })
    shotArray.map(v => {
      ready = ready && v.ready
    })
    singleShotArray.map(v => {
      ready = ready && v.ready
    })
    if (ready === true) {
      eventSetting()
      sceneSetting()
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
      if (event.key === 'Enter') {
        if (viper.life <= 0) {
          restart = true
        }
      }
    })
    window.addEventListener('keyup', event => {
      isKeyDown[`key_${event.key}`] = false
    })
  }

  function sceneSetting() {
    scene.add('intro', time => {
      if (time > 2.0) {
        scene.use('invade')
      }
    })
    scene.add('invade', time => {
      if (scene.frame === 0) {
        for (let i = 0; i < ENEMY_MAX_COUNT; ++i) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i]
            e.set(CANVAS_WWIDTH_HALF, -e.height, 2, 'default')
            e.setVector(0.0, 1.0)
            break
          }
        }
      }
      if (scene.frame === 100) {
        scene.use('invade')
      }

      if (viper.life <= 0) {
        scene.use('gameover')
      }
    })

    scene.add('gameover', time => {
      let textWidth = CANVAS_WIDTH / 2
      let loopWidth = CANVAS_WIDTH + textWidth
      let x = CANVAS_WIDTH - ((scene.frame * 2) % loopWidth)

      ctx.font = 'bold 72px sans-serif'
      util.drawText('GAME OVER', x, CANVAS_HEIGHT / 2, '#ff0000', textWidth)

      if (restart === true) {
        restart = false
        gameScore = 0

        viper.setComing(
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT + 50,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT - 100
        )
        // シーンをイントロに設定
        scene.use('intro')
      }
    })

    scene.use('intro')
  }
  function render() {
    ctx.globalAlpha = 1.0
    util.drawRact(0, 0, canvas.width, canvas.height, '#eeeeee')
    // ミリ秒を秒に換算する
    let nowTime = (Date.now() - startTime) / 1000
    // let s = Math.sin(nowTime)
    // -1.0 ~ 1.0 を百倍
    // let x = s * 100.0
    ctx.font = 'bold 24px monospace'
    util.drawText(zeroPadding(gameScore, 5), 30, 50, '#111111')
    scene.update()
    viper.update()
    enemyArray.map(v => {
      v.update()
    })
    shotArray.map(v => {
      v.update()
    })
    singleShotArray.map(v => {
      v.update()
    })
    enemyShotArray.map(v => {
      v.update()
    })
    explosionArray.map(v => {
      v.update()
    })
    requestAnimationFrame(render)
  }

  function generateRandomInt(range) {
    let random = Math.random()
    return Math.floor(random * range)
  }

  function zeroPadding(number, count) {
    let zeroArray = new Array(count)
    let zeroString = zeroArray.join('0') + number
    console.log(zeroString)
    return zeroString.slice(-count)
  }
})()
