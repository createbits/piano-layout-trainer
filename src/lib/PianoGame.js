import { play, note, intervals } from 'playnote'
import { sample, startCase } from 'lodash'

export const noteCollection = [
  'c',
  'c#',

  'd♭',
  'd',
  'd#',

  'e♭',
  'e',

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
]

const chordIntervals = [
  { type: 'minor', distance: 2 },
  { type: 'major', distance: 2 },
  { type: 'minor', distance: 3 },
  { type: 'major', distance: 3 },
  { type: 'perfect', distance: 4 },
  { type: 'tritone' },
  { type: 'perfect', distance: 5 },
  { type: 'minor', distance: 6 },
  { type: 'major', distance: 6 },
  { type: 'minor', distance: 7 },
  { type: 'major', distance: 7 },
]

const hardIntervals = [
  { type: 'minor', distance: 3 },
  { type: 'major', distance: 3 },
  { type: 'minor', distance: 7 },
  { type: 'major', distance: 7 },
]

let isPlaying

const playGame = (mode, cb, streak = 0) => {
  let noteToPlay = sample(noteCollection)
  let description = `Play the following note: ${noteToPlay.toUpperCase()}`
  let noteToHighlight = noteToPlay

  if (mode) {
    let intervalToUse

    if (mode === 'extreme') {
      intervalToUse = sample(chordIntervals)
    } else if (mode === 'hard') {
      intervalToUse = sample(hardIntervals)
    } else {
      throw new Error('Invalid mode')
    }

    noteToPlay = intervals(
      // TODO: fix in library with replace logic
      note(noteToPlay.replace('#', 'Sharp').replace('♭', 'Flat'), 4),
      [intervalToUse],
    )[0].split('_')[0].replace('Sharp', '#').replace('Flat', '♭')
    description = `Play the ${startCase(intervalToUse.type)} ${(intervalToUse.distance || '')}`
  }

  try {
    play(note(noteToPlay, 4), 200, 200)

    cb({ note: noteToPlay, noteToHighlight }, description, (streakCount) => {
      streak = streakCount
    })
  } catch (e) {
    ['Had error', e].forEach(console.log)
  }

  const intervalMs = 3000 - ((streak > 20 ? 20 : streak) * 90)

  setTimeout(() => {
    if (isPlaying) playGame(mode, cb, streak)
  }, intervalMs)
}

export const startPianoGame = (mode, cb) => {
  isPlaying = true
  playGame(mode, cb)
}

export const stopPianoGame = () => {
  isPlaying = false
}
