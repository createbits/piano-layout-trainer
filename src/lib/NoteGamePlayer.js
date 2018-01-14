import { sample, drop, take, range, isEqual } from 'lodash'
import { playSequence, scale } from 'playnote'

export const generateScaleNotes = (scale, intervals) => range(8)
  .map((n, index) => scale
    .base(4)
    .notes(intervals.map((intervalNum) => index + intervalNum)))

export const scaleFromSet = set => scale(set.baseNoteLetter, set.mode)

export const playRandomNoteSequence = async (twoFiveOneSequence, answers) => {
  const answer = sample(answers)

  await playNoteSequence(answer.value, twoFiveOneSequence)

  return answer.value
}

export const playNoteSequence = (notes, twoFiveOneSequence) => playSequence([
  ...twoFiveOneSequence,
  { notes, length: 1000, offset: 1000 },
])

export const playResolveToTonic = async (roundAnswerNotes, scale, intervals) => {
  const scaleNotes = generateScaleNotes(scale, intervals)
  const toneIndex = scaleNotes
    .map((notes, index) => isEqual(notes, roundAnswerNotes))
    .indexOf(true)

  let resolvingTones = [roundAnswerNotes]

  if (toneIndex > 0) {
    resolvingTones = toneIndex >= 4
      ? drop(scaleNotes, toneIndex)
      : take(scaleNotes, (toneIndex + 1)).reverse()
  }

  return await playSequence(resolvingTones.map((notes, i) => ({
    notes,
    length: (i === 0 || (resolvingTones.length - 1) === i) ? 800 : 400,
  })))
}

export const generateTwoFiveSequence = scale => [
  { notes: scale.base(4).notes([2, 4, 6]), length: 800 },
  { notes: scale.base(4).notes([5, 7, 9]), length: 800 },
  { notes: scale.base(4).notes([1, 3, 5]), length: 1600 },
]
