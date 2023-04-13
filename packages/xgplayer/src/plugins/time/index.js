import Plugin, { Util, Events, POSITIONS } from '../../plugin'
import './index.scss'

class Time extends Plugin {
  static get pluginName () {
    return 'time'
  }

  static get defaultConfig () {
    return {
      position: POSITIONS.CONTROLS_LEFT,
      index: 2,
      disable: false
    }
  }

  constructor (args) {
    super(args)
    this.isActiving = false
  }

  get duration () {
    return this.playerConfig.customDuration || this.player.duration
  }

  get currentTime () {
    return this.player.currentTime || 0
  }

  get timeOffset () {
    return this.playerConfig.timeOffset || 0
  }

  afterCreate () {
    const constrolsMode = this.player.controls.config.mode
    this.mode = constrolsMode === 'flex' ? 'flex' : 'normal'
    if (this.config.disable) {
      return
    }
    if (this.mode === 'flex') {
      this.createCenterTime()
      this.hide()
    }
    this.durationDom = this.find('.time-duration')
    this.timeDom = this.find('.time-current')
    this.on(Events.DURATION_CHANGE, () => {
      this.onTimeUpdate()
    })
    this.on(Events.TIME_UPDATE, () => {
      this.onTimeUpdate()
    })

    this.on(Events.ENDED, () => {
      // 因为customDuration存在，最终播放currentTime可能和显示的duration不统一，所以在ended的时候修正
      this.onTimeUpdate(true)
    })

    this.on(Events.EMPTIED, () => {
      this.onReset()
    })
  }

  show () {
    if (this.mode === 'flex') {
      return
    }
    super.show()
  }

  onTimeUpdate (isEnded) {
    const { player, config, duration } = this
    if (config.disable || this.isActiving || !player.hasStart) {
      return
    }
    let current = player.currentTime + this.timeOffset
    current = Util.adjustTimeByDuration(current, duration, isEnded)
    if (this.mode === 'flex') {
      this.centerCurDom.innerHTML = Util.format(current)
      if (duration !== Infinity && duration > 0) {
        this.centerDurDom.innerHTML = Util.format(duration)
      }
    } else {
      this.timeDom.innerHTML = Util.format(current)
      if (duration !== Infinity && duration > 0) {
        this.durationDom.innerHTML = Util.format(duration)
      }
    }
  }

  onReset () {
    if (this.mode === 'flex') {
      this.centerCurDom.innerHTML = Util.format(0)
      this.centerDurDom.innerHTML = Util.format(0)
    } else {
      this.timeDom.innerHTML = Util.format(0)
      this.durationDom.innerHTML = Util.format(0)
    }
  }

  createCenterTime () {
    const { player } = this
    if (!player.controls || !player.controls.center) {
      return
    }
    const center = player.controls.center
    this.centerCurDom = Util.createDom('xg-icon', '00:00', {}, 'xgplayer-time left')
    this.centerDurDom = Util.createDom('xg-icon', '00:00', {}, 'xgplayer-time right')
    center.children.length > 0 ? center.insertBefore(this.centerCurDom, center.children[0]) : center.appendChild(this.centerCurDom)
    center.appendChild(this.centerDurDom)
  }

  afterPlayerInit () {
    const { config } = this
    if (this.duration === Infinity || this.playerConfig.isLive) {
      Util.hide(this.durationDom)
      Util.hide(this.timeDom)
      Util.hide(this.find('.time-separator'))
      Util.show(this.find('.time-live-tag'))
    } else {
      Util.hide(this.find('.time-live-tag'))
    }
    if (config.hide) {
      this.hide()
      return
    }
    this.show()
  }

  changeLiveState (isLive) {
    if (isLive) {
      Util.hide(this.durationDom)
      Util.hide(this.timeDom)
      Util.hide(this.find('.time-separator'))
      Util.show(this.find('.time-live-tag'))
    } else {
      Util.hide(this.find('.time-live-tag'))
      Util.show(this.find('.time-separator'))
      Util.show(this.durationDom)
      Util.show(this.timeDom)
    }
  }

  updateTime (time) {
    this.isActiving = true
    if ((!time && time !== 0) || time > this.duration) {
      return
    }
    if (this.mode === 'flex') {
      this.centerCurDom.innerHTML = Util.format(time)
      return
    }
    this.timeDom.innerHTML = Util.format(time)
  }

  resetActive () {
    const { player } = this
    const updateState = () => {
      this.isActiving = false
    }
    this.off(Events.SEEKED, updateState)
    if (player.isSeeking) {
      this.once(Events.SEEKED, updateState)
    } else {
      this.isActiving = false
    }
  }

  destroy () {
    const { center } = this.player.controls
    this.centerCurDom && center.removeChild(this.centerCurDom)
    this.centerCurDom = null
    this.centerDurDom && center.removeChild(this.centerDurDom)
    this.centerDurDom = null
  }

  render () {
    if (this.config.disable) {
      return
    }
    return `<xg-icon class="xgplayer-time">
    <span class="time-current">00:00</span>
    <span class="time-separator">/</span>
    <span class="time-duration">00:00</span>
    <span class="time-live-tag">${this.i18n.LIVE_TIP}</span>
    </xg-icon>`
  }
}
export default Time