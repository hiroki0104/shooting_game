// 座標を管理するためのクラス
class Position {
  static calcLength(x, y) {
    return Math.sqrt(x * x + y * y)
  }

  static calcNormal(x, y) {
    let len = Position.calcLength(x, y)
    return new Position(x / len, y / len)
  }

  constructor(x, y) {
    this.x = null
    this.y = null
    this.set(x, y)
  }
  set(x, y) {
    if (x != null) {
      this.x = x
    }
    if (y != null) {
      this.y = y
    }
  }

  // targetとの距離を図る
  distance(target) {
    let x = this.x - target.x
    let y = this.y - target.y
    return Math.sqrt(x * x + y * y)
  }
}

// キャラクター管理のための基幹クラス
class Character {
  constructor(ctx, x, y, w, h, life, imagePath) {
    this.ctx = ctx
    this.position = new Position(x, y)
    this.vector = new Position(0.0, -1.0)
    this.angle = (270 * Math.PI) / 180
    this.width = w
    this.height = h
    this.life = life
    this.ready = false
    this.image = new Image()
    this.image.addEventListener('load', () => {
      this.ready = true
    })
    this.image.src = imagePath
  }
  // x方向の移動量、y方向の移動量
  setVector(x, y) {
    this.vector.set(x, y)
  }
  // 自身の回転量を設定する
  setVectorFromAngle(angle) {
    this.angle = angle
    let sin = Math.sin(angle)
    let cos = Math.cos(angle)

    this.vector.set(cos, sin)
  }
  // キャラクターの描画
  draw() {
    let offSetX = this.width / 2
    let offSetY = this.height / 2
    this.ctx.drawImage(
      this.image,
      this.position.x - offSetX,
      this.position.y - offSetY,
      this.width,
      this.height
    )
  }

  // 自身の回転量から座標系を回転させる
  rotationDraw() {
    this.ctx.save()
    this.ctx.translate(this.position.x, this.position.y)
    // 270度の位置を基準にする
    this.ctx.rotate(this.angle - Math.PI * 1.5)
    let offSetX = this.width / 2
    let offSetY = this.height / 2
    this.ctx.drawImage(this.image, -offSetX, -offSetY, this.width, this.height)
    this.ctx.restore()
  }
}

// 自機のクラス
class Viper extends Character {
  constructor(ctx, x, y, w, h, image) {
    super(ctx, x, y, w, h, 1, image)

    this.speed = 3
    this.shotCheckCounter = 0
    this.shotInterval = 10
    this.isComing = false
    this.comingStart = null
    this.comingStartPosition = null
    this.comingEndPosition = null
    this.shotArray = null //　Shotクラスのインスタンスの配列を格納する
    this.singleShotArray = null
  }

  setComing(startX, startY, endX, endY) {
    this.life = 1
    this.isComing = true
    this.comingStart = Date.now()
    this.position.set(startX, startY)
    this.comingStartPosition = new Position(startX, startY)
    this.comingEndPosition = new Position(endX, endY)
  }

  setShotArray(shotArray, singleShotArray) {
    this.shotArray = shotArray
    this.singleShotArray = singleShotArray
  }

  update() {
    if (this.life <= 0) {
      return
    }
    let justTime = Date.now()
    if (this.isComing === true) {
      let comingTime = (justTime - this.comingStart) / 1000
      let y = this.comingStartPosition.y - comingTime * 50
      if (y <= this.comingEndPosition.y) {
        this.isComing = false
        y = this.comingEndPosition.y
      }
      this.position.set(this.position.x, y)
      if (justTime % 100 < 50) {
        this.ctx.globalAlpha = 0.5
      }
    } else {
      if (window.isKeyDown.key_ArrowLeft === true) {
        this.position.x -= this.speed
      }
      if (window.isKeyDown.key_ArrowRight === true) {
        this.position.x += this.speed
      }
      if (window.isKeyDown.key_ArrowUp === true) {
        this.position.y -= this.speed
      }
      if (window.isKeyDown.key_ArrowDown === true) {
        this.position.y += this.speed
      }

      // 画面外に出ていないか確認修正する
      let canvasWidth = this.ctx.canvas.width
      let canvasHeight = this.ctx.canvas.height
      //   最大値と最小値の計算を行い、画面幅より外に出ていたら修正する
      let tx = Math.min(Math.max(this.position.x, 0), canvasWidth)
      let ty = Math.min(Math.max(this.position.y, 0), canvasHeight)
      this.position.set(tx, ty)

      //   Zキーでショットの生成
      if (window.isKeyDown.key_z === true) {
        if (this.shotCheckCounter >= 0) {
          for (let i = 0; i < this.shotArray.length; i++) {
            if (this.shotArray[i].life <= 0) {
              this.shotArray[i].set(this.position.x, this.position.y)
              this.shotArray[i].setPower(2)
              this.shotCheckCounter = -this.shotInterval
              break
            }
          }

          for (let j = 0; j < this.singleShotArray.length; j += 2) {
            if (
              this.singleShotArray[j].life <= 0 &&
              this.singleShotArray[j + 1].life <= 0
            ) {
              // 真上の方向（２７０度）から左右に１０度傾いたラジアン
              let radCW = (280 * Math.PI) / 180
              let radCCW = (260 * Math.PI) / 180

              this.singleShotArray[j].set(this.position.x, this.position.y)
              this.singleShotArray[j].setVectorFromAngle(radCW)
              this.singleShotArray[j + 1].set(this.position.x, this.position.y)
              this.singleShotArray[j + 1].setVectorFromAngle(radCCW)
              this.shotCheckCounter = -this.shotInterval
              break
            }
          }
        }
      }

      ++this.shotCheckCounter
    }

    this.draw()
    this.ctx.globalAlpah = 1.0
  }
}

// 敵キャラクターのクラス
class Enemy extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath)
    this.speed = 3
    this.type = 'default'
    this.frame = 0
    this.shotArray = null
  }

  set(x, y, life = 1, type = 'default') {
    this.position.set(x, y)
    this.life = life
    this.type = type
    this.frame = 0
  }

  setShotArray(shotArray) {
    this.shotArray = shotArray
  }

  setAttackTarget(target) {
    this.attackTarget = target
  }

  update() {
    if (this.life <= 0) {
      return
    }

    switch (this.type) {
      case 'wave':
        // 配置後のフレームが６０で割り切れるときにショットを放つ
        if (this.frame % 60 === 0) {
          let tx = this.attackTarget.position.x - this.position.x
          let ty = this.attackTarget.position.y - this.position.y
          // ベクトルを単位化する
          let tv = Position.calcNormal(tx, ty)
          // 自機キャラクターに向かうショット
          this.fire(tv.x, tv.y, 4.0)
        }
        // x座礁はサイン波で、ｙ座標は一定量で変化する
        this.position.x += Math.sin(this.frame / 10)
        this.position.y += 2.0
        // 画面外（画面下端）へ移動していたらライフを０
        if (this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0
        }
        break

      case 'large':
        if (this.frame % 50 === 0) {
          for (let i = 0; i < 360; i += 45) {
            // 45度間隔のラジアン
            let r = (i * Math.PI) / 180
            // ラジアンからサインとコサインを求める
            let s = Math.sin(r)
            let c = Math.cos(r)
            this.fire(c, s, 3.0)
          }
        }
        this.position.x += Math.sin((this.frame + 90) / 50) * 2.0
        this.position.y += 1.0
        if (this.position.y - this.height > this.ctx.canvas.hegiht) {
          this.life = 0
        }
        break

      case 'default':
      default:
        if (this.frame === 100) {
          this.fire()
        }
        this.position.x += this.vector.x * this.speed
        this.position.y += this.vector.y * this.speed
        if (this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0
        }
        break
    }
    this.draw()
    ++this.frame
  }

  fire(x = 0.0, y = 1.0, speed = 5.0) {
    for (let i = 0; i < this.shotArray.length; ++i) {
      if (this.shotArray[i].life <= 0) {
        this.shotArray[i].set(this.position.x, this.position.y)
        this.shotArray[i].setSpeed(speed)
        this.shotArray[i].setVector(x, y)
        break
      }
    }
  }
}

class Shot extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath)
    this.speed = 7
    this.power = 1
    this.targetArray = []
    this.explosionArray = []
    // 進行方向のベクトル
    this.vector = new Position(0.0, -1.0)
  }

  set(x, y) {
    this.position.set(x, y)
    this.life = 1
  }

  setPower(power) {
    if (power != null && power > 0) {
      this.power = power
    }
  }

  setTargets(targets) {
    if (
      targets != null &&
      Array.isArray(targets) === true &&
      targets.length > 0
    ) {
      this.targetArray = targets
    }
  }

  setExplosions(targets) {
    if (
      targets != null &&
      Array.isArray(targets) === true &&
      targets.length > 0
    ) {
      this.explosionArray = targets
    }
  }

  setSpeed(speed) {
    if (speed != null && speed > 0) {
      this.speed = speed
    }
  }
  // setVector(x, y) {
  //   this.vector.set(x, y)z
  // }

  update() {
    if (this.life <= 0) {
      return
    }
    if (
      this.position.y + this.height < 0 ||
      this.position.y - this.height > this.ctx.canvas.height ||
      this.position.x + this.width < 0 ||
      this.position.x - this.width > this.ctx.canvas.width
    ) {
      this.life = 0
    }
    this.position.x += this.vector.x * this.speed
    this.position.y += this.vector.y * this.speed

    // ショットと対象との衝突判定をおこなう
    this.targetArray.map(v => {
      if (this.life <= 0 || v.life <= 0) {
        return
      }
      let dist = this.position.distance(v.position)
      if (dist <= (this.width + v.width) / 4) {
        if (v instanceof Viper === true) {
          if (v.isComing === true) {
            return
          }
        }
        v.life -= this.power
        if (v.life <= 0) {
          for (let i = 0; i < this.explosionArray.length; ++i) {
            // 爆発エフェクトの生成
            if (this.explosionArray[i].life !== true) {
              this.explosionArray[i].set(v.position.x, v.position.y)
              break
            }
          }

          if (v instanceof Enemy === true) {
            // 敵によってスコアを変化させる
            let score = 100
            if (v.type === 'large') {
              score = 1000
            }
            gameScore = Math.min(gameScore + score, 99999)
          }
        }
        this.life = 0
      }
    })

    this.rotationDraw()
  }
}

class Explosion {
  constructor(ctx, radius, count, size, timeRange, color = '#ff1166') {
    this.ctx = ctx
    // 爆発の生存状態を表す
    this.life = false
    this.color = color
    this.position = null
    // 爆発の広がりの半径
    this.radius = radius
    this.count = count
    this.startTime = 0
    this.timeRange = timeRange
    this.fireBaseSize = size
    // 火花の1つ当たりの大きさを格納する
    this.fireSize = []
    // 火花の位置を格納する
    this.firePosition = []
    // 火花の進行方向を格納する
    this.fireVector = []
  }

  set(x, y) {
    for (let i = 0; i < this.count; ++i) {
      this.firePosition[i] = new Position(x, y)
      let r = Math.random() * Math.PI * 2.0
      let s = Math.sin(r)
      let c = Math.cos(r)
      // 進行方向ベクトルの長さをランダムに短くし移動量をランダム化する
      let mr = Math.random()
      this.fireVector[i] = new Position(mr * s, mr * c)
      // 火花の大きさをランダム化する
      this.fireSize[i] = (Math.random() * 0.5 + 0.5) * this.fireBaseSize
    }

    this.life = true
    this.startTime = Date.now()
  }

  update() {
    if (this.life !== true) {
      return
    }
    this.ctx.fillStyle = this.color
    this.ctx.globalAlpha = 0.5
    let time = (Date.now() - this.startTime) / 1000
    // 爆発終了までの時間で正規化して進捗度合いを算出する
    let ease = simpleEaseIn(1.0 - Math.min(time / this.timeRange, 1.0))
    let progress = 1.0 - ease

    for (let i = 0; i < this.firePosition.length; ++i) {
      // 火花が広がる距離
      let d = this.radius * progress
      let x = this.firePosition[i].x + this.fireVector[i].x * d
      let y = this.firePosition[i].y + this.fireVector[i].y * d
      // 進捗を描かれる大きさにも反映させる
      let s = 1.0 - progress
      this.ctx.fillRect(
        x - (this.fireSize[i] * s) / 2,
        y - (this.fireSize[i] * s) / 2,
        this.fireSize[i] * s,
        this.fireSize[i] * s
      )
    }

    if (progress >= 1.0) {
      this.life = false
    }
  }
}

class BackgroundStar {
  constructor(ctx, size, speed, color = '#ffffff') {
    this.ctx = ctx
    this.size = size
    this.speed = speed
    this.color = color
    this.position = null
  }

  set(x, y) {
    this.position = new Position(x, y)
  }

  update() {
    // 星の色を設定する
    this.ctx.fillStyle = this.color
    // 星の現在位置を速度に応じて動かす
    this.position.y += this.speed
    // 星の矩形を描画する
    this.ctx.fillRect(
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    )
    // もし画面下端よりも外に出てしまっていたら上端側に戻す
    if (this.position.y + this.size > this.ctx.canvas.height) {
      this.position.y = -this.size
    }
  }
}

// はじめゆっくり、あとで急に
function simpleEaseIn(t) {
  return t * t * t * t
}
