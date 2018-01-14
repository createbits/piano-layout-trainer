import { range, sample } from 'lodash'
import { note, scale, rootNoteLetters } from 'playnote'
import { formatLetter } from 'playnote/lib/NoteTransformer'

const mapSingleNoteToAnswer = note => ({
  value: [note],
  label: formatLetter(note).replace('_', ' '),
  intervals: [1],
})

export const generateBeginnerNoteSets = ({ length, mode, letters }) => {
  const answers = letters.map(d => note(d, 4)).map(mapSingleNoteToAnswer)

  return {
    sets: range(length).map(() => ({
      baseNoteLetter: 'c',
      mode,
      answers,
    })),
  }
}

export const generateInKeyWithConstantNoteGameSets = ({ length, baseNoteLetter, mode, intervals }) => {
  const scaleBase = scale(baseNoteLetter, mode).base(4)
  const singleNoteAnswers = scaleBase.notes([1, 2, 3, 4, 5, 6, 7, 8])
    .map(mapSingleNoteToAnswer)

  let answers = singleNoteAnswers

  if (intervals) {
    answers = range(8)
      .map((num, i) => scaleBase.notes(intervals.map(intvNum => (intvNum + i))))
      .map((notes, i) => ({
        value: notes,
        label: singleNoteAnswers[i].label,
      }))
  }

  return {
    sets: range(length).map(() => ({
      baseNoteLetter,
      mode,
      answers,
      intervals,
    })),
  }
}

export const generateAllNotesWithConstantModeNoteSets = ({ length, mode }) => {
  return {
    sets: range(length)
      .map(() => sample(rootNoteLetters))
      .map((baseNoteLetter) => ({
        baseNoteLetter,
        mode,
        answers: scale(baseNoteLetter, mode)
          .base(4)
          .notes([1, 2, 3, 4, 5, 6, 7, 8])
          .map(mapSingleNoteToAnswer),
      })),
  }
}
