;(() => {
  // どこからでも参照できるようにwindowオブジェクトのカスタムプロパティとして設定する
  window.isKeyDown = {}
  window.gameScore = 0

  const CANVAS_WIDTH = 640
  const CANVAS_WWIDTH_HALF = CANVAS_WIDTH / 2
  const CANVAS_HEIGHT = 480
  const SHOT_MAX_COUNT = 10
  const ENEMY_SMALL_MAX_COUNT = 20
  const ENEMY_LARGE_MAX_COUNT = 5
  const ENEMY_SHOT_MAX_COUNT = 50
  const HOMING_MAX_COUNT = 50
  const EXPLOSION_MAX_COUNT = 10
  const BACKGROUND_STAR_MAX_COUNT = 100
  const BACKGROUND_STAR_MAX_SIZE = 3
  const BACKGROUND_STAR_MAX_SPEED = 4
  let util, canvas, ctx, image, startTime, viper, scene, sound, boss
  let restart = false

  let enemyArray = []
  let enemyShotArray = []
  let homingArray = []
  let shotArray = []
  let singleShotArray = []
  let explosionArray = []
  let backgroundStarArray = []
  window.addEventListener('load', () => {
    util = new Canvas2DUtility(document.getElementById('main_canvas'))
    canvas = util.canvas
    ctx = util.context
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    let button = document.getElementById('start_button')
    button.addEventListener('click', () => {
      button.disabled = true
      sound = new Sound()
      // 音声データの読み込み準備
      sound.load('./../sound/explosion.mp3', error => {
        if (error != null) {
          alert('ファイルの読み込みエラーです')
          return
        }
      })
      initialize()
      loadCheck()
    })
  })

  function initialize() {
    // シーンの初期化
    scene = new SceneManager()

    for (let i = 0; i < EXPLOSION_MAX_COUNT; ++i) {
      explosionArray[i] = new Explosion(ctx, 50.0, 15, 30.0, 0.25)
      // 爆発エフェクト時に効果音を再生
      explosionArray[i].setSound(sound)
    }
    viper = new Viper(ctx, 0, 0, 64, 64, './../img/viper.png')
    viper.setComing(
      CANVAS_WWIDTH_HALF, // 登場演出時の開始X座標
      CANVAS_HEIGHT + 50, // 登場演出時の開始Y座標
      CANVAS_WWIDTH_HALF,
      CANVAS_HEIGHT - 100
    )

    // 敵キャラクターの生成&&敵ショットの生成
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
    for (ec = 0; ec < ENEMY_SMALL_MAX_COUNT; ++ec) {
      enemyArray[ec] = new Enemy(ctx, 0, 0, 48, 48, './../img/enemy_small.png')
      enemyArray[ec].setShotArray(enemyShotArray)
      enemyArray[ec].setAttackTarget(viper)
    }
    for (ec = 0; ec < ENEMY_LARGE_MAX_COUNT; ++ec) {
      enemyArray[ENEMY_SMALL_MAX_COUNT + ec] = new Enemy(
        ctx,
        0,
        0,
        64,
        64,
        './../img/enemy_large.png'
      )
      enemyArray[ENEMY_SMALL_MAX_COUNT + ec].setShotArray(enemyShotArray)
      enemyArray[ENEMY_SMALL_MAX_COUNT + ec].setAttackTarget(viper)
    }

    // ホーミングショットの生成
    for (ec = 0; ec < HOMING_MAX_COUNT; ++ec) {
      homingArray[ec] = new Homing(
        ctx,
        0,
        0,
        32,
        32,
        './../img/homing_shot.png'
      )
      homingArray[ec].setTargets([viper])
      homingArray[ec].setExplosions(explosionArray)
    }

    // ボスキャラクターの生成
    boss = new Boss(ctx, 0, 0, 128, 128, './../img/boss.png')
    boss.setShotArray(enemyShotArray)
    boss.setHomingArray(homingArray)
    boss.setAttackTarget(viper)

    // 自機キャラクターのショットの生成
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

    // 爆発エフェクトを行うためにショットに設定する
    for (mc = 0; mc < SHOT_MAX_COUNT; ++mc) {
      shotArray[mc].setTargets(enemyArray)
      singleShotArray[mc * 2].setTargets(enemyArray)
      singleShotArray[mc * 2 + 1].setTargets(enemyArray)
      shotArray[mc].setExplosions(explosionArray)
      singleShotArray[mc * 2].setExplosions(explosionArray)
      singleShotArray[mc * 2 + 1].setExplosions(explosionArray)
    }

    // 流れる星を初期化する
    for (mc = 0; mc < BACKGROUND_STAR_MAX_COUNT; ++mc) {
      // 星の速度と大きさはランダムと最大値によって決まるようにする
      let size = 1 + Math.random() * (BACKGROUND_STAR_MAX_SIZE - 1)
      let speed = 1 + Math.random() * (BACKGROUND_STAR_MAX_SPEED - 1)
      // 星のインスタンスを生成する
      backgroundStarArray[mc] = new BackgroundStar(ctx, size, speed)
      // 星の初期位置もランダムに決まるようにする
      let x = Math.random() * CANVAS_WIDTH
      let y = Math.random() * CANVAS_HEIGHT
      backgroundStarArray[mc].set(x, y)
    }
  }

  // インスタンスの準備が完了しているかどうか確認する
  function loadCheck() {
    let ready = true
    ready = ready && viper.ready

    enemyArray.map(v => (ready = ready && v.ready))
    enemyShotArray.map(v => (ready = ready && v.ready))
    homingArray.map(v => (ready = ready && v.ready))
    shotArray.map(v => (ready = ready && v.ready))
    singleShotArray.map(v => (ready = ready && v.ready))
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

  //  シーンを設定する
  function sceneSetting() {
    scene.add('intro', time => {
      if (time > 3.0) {
        scene.use('invade_default_type')
      }
    })
    scene.add('invade_default_type', time => {
      if (scene.frame % 30 === 0) {
        for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i]

            if (scene.frame % 60 === 0) {
              e.set(-e.width, 30, 2, 'defalut')
              e.setVectorFromAngle(degreesToRadians(30))
            } else {
              e.set(CANVAS_WIDTH + e.width, 30, 2, 'default')
              e.setVectorFromAngle(degreesToRadians(150))
            }
            break
          }
        }
      }
      if (scene.frame === 270) {
        scene.use('blank')
      }

      if (viper.life <= 0) {
        scene.use('gameover')
      }
    })

    scene.add('blank', time => {
      if (scene.frame === 150) {
        scene.use('invade_wave_move_type')
      }
      if (viper.life <= 0) {
        scene.use('gameover')
      }
    })

    // waveタイプの敵を配置する
    scene.add('invade_wave_move_type', time => {
      if (scene.frame % 50 === 0) {
        for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i]
            if (scene.frame <= 200) {
              e.set(CANVAS_WIDTH * 0.2, -e.height, 2, 'wave')
            } else {
              e.set(CANVAS_WIDTH * 0.8, -e.height, 2, 'wave')
            }
            break
          }
        }
      }

      if (scene.frame === 450) {
        scene.use('invade_large_type')
      }

      if (viper.life <= 0) {
        scene.use('gameover')
      }
    })

    // largeタイプの敵を配置する
    scene.add('invade_large_type', time => {
      if (scene.frame === 100) {
        let i = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT
        for (let j = ENEMY_SMALL_MAX_COUNT; j < i; ++j) {
          if (enemyArray[j].life <= 0) {
            let e = enemyArray[j]
            e.set(CANVAS_WWIDTH_HALF, -e.height, 50, 'large')
            break
          }
        }
      }

      if (scene.frame === 500) {
        scene.use('invade_boss')
      }
      if (viper.life <= 0) {
        scene.use('gameover')
      }
    })

    scene.add('invade_boss', time => {
      if (scene.frame === 0) {
        boss.set(CANVAS_WIDTH / 2, -boss.height, 250)
        boss.setMode('invade')
      }

      if (viper.life <= 0) {
        scene.use('gameover')
        boss.setMode('escape')
      }

      if (boss.life <= 0) {
        scene.use('intro')
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
    util.drawRact(0, 0, canvas.width, canvas.height, '#111122')
    // ミリ秒を秒に換算する
    // let nowTime = (Date.now() - startTime) / 1000
    // let s = Math.sin(nowTime)
    // -1.0 ~ 1.0 を百倍
    // let x = s * 100.0
    ctx.font = 'bold 24px monospace'
    util.drawText(zeroPadding(gameScore, 5), 30, 50, '#ffffff')
    scene.update()
    backgroundStarArray.map(v => v.update())
    viper.update()
    boss.update()
    enemyArray.map(v => v.update())
    shotArray.map(v => v.update())
    singleShotArray.map(v => v.update())
    enemyShotArray.map(v => v.update())
    homingArray.map(v => v.update())
    explosionArray.map(v => v.update())
    requestAnimationFrame(render)
  }

  // 度数法の角度からラジアンを生成する
  function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180
  }

  function generateRandomInt(range) {
    let random = Math.random()
    return Math.floor(random * range)
  }

  function zeroPadding(number, count) {
    let zeroArray = new Array(count)
    let zeroString = zeroArray.join('0') + number
    return zeroString.slice(-count)
  }
})()
