<template>
  <div class="font-muli" style="max-width: 1100px; margin: 0 auto">
    <button v-if="!hasStarted" @click.prevent="startGame()">Play easy mode</button>
    <button v-if="!hasStarted" @click.prevent="startGame('hard')">Play hard mode</button>
    <button v-if="!hasStarted" @click.prevent="startGame('extreme')">Play extreme mode</button>

    <div v-if="hasStarted">

      <div class="center">
        <div v-text="currentDescription" style="min-height: 80px; font-size: 3rem" class="bold my2"></div>
        <div v-html="`Streak: <b>${streakCount}</b>`" class="h3 mt1"></div>
        <div v-html="`You pressed: <b>${currentNotePressed.toUpperCase()}</b>`" style="min-height: 35px" class="h3"></div>

        <div class="relative mx-auto" style="width: 590px">
          <!-- white tiles -->
          <div v-for="n in tileCount"
               :class="['inline-block border border-black mt4', getTileBackgroundClass('white', n)]"
               :style="`width: ${40 * size}px; height: ${120 * size}px;`">
          </div>
          <!-- black tiles -->
          <div class="absolute" style="top: 0; left: 0">
            <div v-for="n in tileCount"
                 :class="['inline-block mt4 relative']"
                 :style="`width: ${41 * size}px; height: ${100 * size}px; left: -10px; top: 0`">
              <div v-if="shouldRenderBlackTitle(n)"
                   :class="['col-9', getTileBackgroundClass('black', n)]"
                   :style="`height: ${80 * size}px`"></div>
            </div>
          </div>
        </div>

        <div v-html="`Your best Streak: <b>${bestStreakCount}</b>`" class="h3 mt1"></div>
      </div>
    </div>

    <div class="mt4">
      <button v-if="hasStarted" @click.prevent="stopGame">Stop game</button>
    </div>
  </div>
</template>
<script>
  import { clone } from 'lodash'
  import Mousetrap from 'mousetrap'
  import WebMidi from 'webmidi'
  import { noteCollection, startPianoGame, stopPianoGame } from '../lib/PianoGame'

  const tileNoteMap = {
    white_0: ['c', 'b#'],
    white_1: ['d'],
    white_2: ['e', 'f♭'],
    white_3: ['f', 'e#'],
    white_4: ['g'],
    white_5: ['a'],
    white_6: ['b', 'c♭'],
    black_1: ['c#', 'd♭'],
    black_2: ['d#', 'e♭'],
    black_4: ['f#', 'g♭'],
    black_5: ['g#', 'a♭'],
    black_6: ['a#', 'b♭'],
  }

  const convertNToIndex = n => ((n - 1) % 7)
  const isSameTileAsPressed = (noteToCompare, type, n) =>
    tileNoteMap[`${type}_${convertNToIndex(n)}`].includes(noteToCompare)

  const initData = {
    size: 1,
    tileCount: 14,
    streakCount: 0,
    noteBeingPlayed: null,
    hasStarted: false,
    currentDescription: '',
    gameMode: false,
    currentNotePressed: '',
    bestStreakCount: 0,
  }

  export default {
    data() {
      return clone(initData)
    },
    computed: {
      hasMatchedNote () {
        const notes = Object.values(tileNoteMap).find(
          notes => notes.includes(this.currentNotePressed),
        )

        return (notes || []).includes((this.noteBeingPlayed || {}).note)
      },
    },
    methods: {
      pressNote (note) {
        this.currentNotePressed = note.toLowerCase()

        if (this.hasMatchedNote) {
          this.streakCount += 1
        } else {
          this.resetStreak()
        }
      },
      resetStreak () {
        if (this.streakCount > this.bestStreakCount) {
          this.bestStreakCount = this.streakCount
        }

        this.streakCount = 0
      },
      startGame (gameMode = false) {
        if (this.hasStarted) return null

        Mousetrap.bind([
          ...noteCollection,
          ...noteCollection.map(n => `shift+${n}`),
          ...noteCollection.map(n => `ctrl+${n}`),
        ], (pressed) => {
          this.pressNote(
            `${pressed.key}${(pressed.shiftKey ? '#' : '')}${(pressed.ctrlKey ? '♭' : '')}`,
          )
        })

        WebMidi.enable(err => {
          if (err) console.log('WebMidi not enabled.')

          WebMidi.inputs.forEach(input => input.addListener(
            'noteon',
            'all',
            e => this.pressNote(e.note.name),
          ))
        })

        this.gameMode = gameMode
        this.bestStreakCount = 0

        startPianoGame(gameMode, (noteBeingPlayed, description, setStreak) => {
          if (!this.hasMatchedNote) this.resetStreak()

          this.noteBeingPlayed = noteBeingPlayed
          this.currentDescription = description
          this.currentNotePressed = initData.currentNotePressed
          setStreak(this.streakCount)
        })

        this.hasStarted = true
      },
      stopGame () {
        this.currentNotePressed = initData.currentNotePressed
        this.hasStarted = false
        this.currentDescription = ''

        stopPianoGame()
      },
      shouldRenderBlackTitle (n) {
        return [1, 2, 4, 5, 6].includes(convertNToIndex(n))
      },
      isCorrectTile (type, n) {
        if (!this.currentNotePressed || !this.isActiveTile(type, n)) return false

        return isSameTileAsPressed(this.currentNotePressed, type, n)
      },
      isWrongTile (type, n) {
        if (!this.currentNotePressed || this.isActiveTile(type, n)) return false

        return isSameTileAsPressed(this.currentNotePressed, type, n)
      },
      isActiveTile (type, n) {
        if (!this.noteBeingPlayed) return false

        return isSameTileAsPressed(this.noteBeingPlayed.note, type, n)
      },
      isHighlightedTile (type, n) {
        if (!this.noteBeingPlayed || !this.gameMode) return false

        return isSameTileAsPressed(this.noteBeingPlayed.noteToHighlight, type, n)
      },
      getTileBackgroundClass (type, n) {
        if (this.isCorrectTile(type, n)) return 'green-bg'
        if (this.isWrongTile(type, n)) return 'red-bg'
        if (this.isHighlightedTile(type, n)) return 'yellow-bg'
        if (type === 'black') return 'black-bg'
      }
    },
  }
</script>
