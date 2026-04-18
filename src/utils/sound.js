let audioContext = null

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

export const playNotificationSound = (type = 'newOrder') => {
  try {
    const ctx = getAudioContext()
    
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const sounds = {
      newOrder: () => {
        playBeep(ctx, 880, 0.3, 0)
        playBeep(ctx, 880, 0.3, 0.4)
        playBeep(ctx, 1100, 0.4, 0.8)
        playBeep(ctx, 880, 0.3, 1.3)
        playBeep(ctx, 1100, 0.5, 1.7)
      },
      success: () => {
        playBeep(ctx, 523, 0.2, 0)
        playBeep(ctx, 659, 0.2, 0.25)
        playBeep(ctx, 784, 0.3, 0.5)
      },
      warning: () => {
        playBeep(ctx, 440, 0.25, 0)
        playBeep(ctx, 440, 0.25, 0.3)
        playBeep(ctx, 440, 0.25, 0.6)
      },
      error: () => {
        playBeep(ctx, 200, 0.4, 0)
        playBeep(ctx, 150, 0.5, 0.45)
      }
    }

    if (sounds[type]) {
      sounds[type]()
    }
  } catch (error) {
    console.warn('播放提示音失败:', error)
  }
}

const playBeep = (ctx, frequency, duration, startTime) => {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime)

  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime)
  gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + startTime + 0.02)
  gainNode.gain.setValueAtTime(0.4, ctx.currentTime + startTime + duration - 0.03)
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration)

  oscillator.start(ctx.currentTime + startTime)
  oscillator.stop(ctx.currentTime + startTime + duration)
}

export const playCustomSound = (audioUrl) => {
  try {
    const audio = new Audio(audioUrl)
    audio.volume = 0.5
    audio.play().catch(err => {
      console.warn('播放自定义音频失败:', err)
    })
  } catch (error) {
    console.warn('播放自定义音频失败:', error)
  }
}
