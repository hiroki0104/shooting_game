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
  constructor(ctx, x, y, life, image) {
    this.ctx = ctx
    this.position = new Position(x, y)
    this.life = life
    this.image = image
  }
  draw() {
    this.ctx.drawImage(this.image, this.position.x, this.position.y)
  }
}

// 自機のクラス
class Viper extends Character {
  constructor(ctx, x, y, image) {
    super(ctx, x, y, 0, image)

    this.isComing = false
    this.comingStart = null
    this.comingEndPosition = null
  }

  setComing(startX, startY, endX, endY) {
    this.isComing = true
    this.comingStart = Date.now()
    this.position.set(startX, startY)
    this.comingEndPosition = new Position(endX, endY)
  }
}
