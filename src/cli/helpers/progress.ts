// eslint-disable-next-line
import cliSpinners from 'cli-spinners'

const dots = cliSpinners.material
let indice = 0
let message = ''
let last = Date.now()

export const updateMessage = m => {
  message = m
}

function printProgress(progress) {
  process.stdout.clearLine(-1)
  process.stdout.cursorTo(0)
  process.stdout.write(progress)
}

export const tickProgress = () => {
  const now = Date.now()
  if (now - last > dots.interval) {
    printProgress(`${dots.frames[indice]} ${message}`)
    indice = (indice + 1) % dots.frames.length
    last = now
  }
}
