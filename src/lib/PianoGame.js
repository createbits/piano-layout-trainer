import { play, note } from 'playnote'
import { sample } from 'lodash'

export const noteCollection = ['c', 'd', 'e', 'f', 'g', 'a', 'b']

let handle

export const startPianoGame = (cb) => {
  handle = setInterval(() => {
    const noteToPlay = sample(noteCollection)
    play(note(noteToPlay, 4, 100))
    cb({ note: noteToPlay, accent: null })
  }, 2500)
}

export const stopPianoGame = () => {
  if (handle) clearInterval(handle)
}
