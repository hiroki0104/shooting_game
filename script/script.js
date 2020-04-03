;(() => {
  const CANVAS_WIDTH = 640
  const CANVAS_HEIGHT = 480

  let util, canvas, ctx, image

  window.addEventListener('load', () => {
    util = new Canvas2DUtility(document.getElementById('main_canvas'))
    canvas = util.canvas
    ctx = util.context

    util.imageLoader('./img/viper.png', loadedImage => {
      image = loadedImage
      initialize()
      render()
    })
  })

  function initialize() {
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
  }

  function render() {
    util.drawRact(0, 0, canvas.width, canvas.height, '#eeeeee')
    ctx.drawImage(image, 100, 100)
  }

  function generateRandomInt(range) {
    let random = Math.random()
    return Math.floor(random * range)
  }
})()
