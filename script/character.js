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
    this.position = this.setPosition(x, y)
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

  setShotArray(shotArray,singleShotArray) {
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

          for(let j = 0; j < this.singleShotArray.length; j += 2){
             if(this.singleShotArray[j].life <= 0 && this.singleShotArray[j + 1].life <= 0){
                 this.singleShotArray[j].set(this.position.x, this.position.y)
                 this.singleShotArray[j].setVector(0.2,-0.9)
                 this.singleShotArray[j + 1].set(this.position.x, this.position.y)
                 this.singleShotArray[j + 1].setVector(-0.2,-0.9)
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

  setVector(x, y) {
    this.vector.set(x, y)
  }

  update() {
    if (this.life <= 0) {
      return
    }
    if (this.position.y + this.height < 0) {
      this.life = 0
    }
    this.position.x += this.vector.x * this.speed
    this.position.y += this.vector.y * this.speed
    this.draw()
  }
}
