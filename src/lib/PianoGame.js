import { play, note } from 'playnote'
import { sample } from 'lodash'

export const noteCollection = [
  'c♭',
  'c',
  'c#',

  'd♭',
  'd',
  'd#',

  'e♭',
  'e',
  'e#',

  'f♭',
  'f',
  'f#',

  'g♭',
  'g',
  'g#',

  'a♭',
  'a',
  'a#',

  'b♭',
  'b',
  'b#',
]

let handle

export const startPianoGame = (cb) => {
  handle = setInterval(() => {
    const noteToPlay = sample(noteCollection)
    play(note(noteToPlay, 4), 200, 1000)
    cb({ note: noteToPlay, accent: null })
  }, 3000)
}

export const stopPianoGame = () => {
  if (handle) clearInterval(handle)
}
