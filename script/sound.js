class Sound {
  constructor() {
    this.ctx = new AudioContext()
    this.source = null
  }

  load(audioPath, callback) {
    fetch(audioPath)
      .then(response => response.arrayBuffer())
      .then(buffer => this.ctx.decodeAudioData(buffer))
      .then(decodeAudio => (this.source = decodeAudio))
      .catch(() => callback('error!'))
  }

  play() {
    // ノードを生成する
    let node = new AudioBufferSourceNode(this.ctx, { buffer: this.source })
    // ノードを接続する
    node.connect(this.ctx.destination)
    // ノードの再生が完了した後の解放処理を設定しておく
    node.addEventListener('ended', () => {
      node.stop()
      node.disconnect()
      node = null
    })
    node.start()
  }
}
