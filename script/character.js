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
  constructor(ctx, x, y, w, h, life, image) {
    this.ctx = ctx
    this.position = this.setPosition(x, y)
    this.width = w
    this.height = h
    this.life = life
    this.image = image
  }
  setPosition(x, y) {
    return new Position(x, y)
  }
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
}

// 自機のクラス
class Viper extends Character {
  constructor(ctx, x, y, w, h, image) {
    super(ctx, x, y, w, h, 0, image)

    this.speed = 3
    this.isComing = false
    this.comingStart = null
    this.comingStartPosition = null
    this.comingEndPosition = null
  }

  setComing(startX, startY, endX, endY) {
    this.isComing = true
    this.comingStart = Date.now()
    this.position.set(startX, startY)
    this.comingStartPosition = new Position(startX, startY)
    this.comingEndPosition = new Position(endX, endY)
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

      let canvasWidth = this.ctx.canvas.width
      let canvasHeight = this.ctx.canvas.height
      //   最大値と最小値の計算を行い、画面幅より外に出ていたら修正する
      let tx = Math.min(Math.max(this.position.x, 0), canvasWidth)
      let ty = Math.min(Math.max(this.position.y, 0), canvasHeight)
      this.position.set(tx, ty)
    }

    this.draw()
    this.ctx.globalAlpah = 1.0
  }
}
