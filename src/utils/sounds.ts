let audioContext: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08) {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

export function playHover() {
  playTone(800, 0.05, 'sine', 0.03)
}

export function playClick() {
  playTone(600, 0.08, 'sine', 0.05)
}

export function playEnterFocus() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.3)
  gain.gain.setValueAtTime(0.06, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.4)
}

export function playExitFocus() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(900, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.3)
  gain.gain.setValueAtTime(0.06, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.4)
}

export function playAlertBeep() {
  playTone(1000, 0.15, 'square', 0.08)
}
