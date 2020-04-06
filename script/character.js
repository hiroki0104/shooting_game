// 座標を管理するためのクラス
class Position {
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
    super(ctx, x, y, w, h, 0, image)

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
        this.ctx.globalAlpah = 0.5
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
  }

  set(x, y, life = 1) {
    this.position.set(x, y)
    this.life = life
  }

  update() {
    if (this.life <= 0) {
      return
    }
    if (this.position.y - this.height > this.ctx.canvas.height) {
      this.life = 0
    }
    this.position.x += this.vector.x * this.speed
    this.position.y += this.vector.y * this.speed

    this.draw()
  }
}

class Shot extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath)
    this.speed = 7
    // 進行方向のベクトル
    this.vector = new Position(0.0, -1.0)
  }

  set(x, y) {
    this.position.set(x, y)
    this.life = 1
  }

  // setVector(x, y) {
  //   this.vector.set(x, y)
  // }

  update() {
    if (this.life <= 0) {
      return
    }
    if (this.position.y + this.height < 0) {
      this.life = 0
    }
    this.position.x += this.vector.x * this.speed
    this.position.y += this.vector.y * this.speed
    this.rotationDraw()
  }
}
