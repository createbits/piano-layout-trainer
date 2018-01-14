import { play, intervals, note } from 'playnote'

export const playChord = ({ baseNoteLetter, intervals: chordIntervals }) => {
  const baseNote = note(baseNoteLetter, 5)
  play([baseNote, ...intervals(baseNote, chordIntervals)], 500, 1500)
}
