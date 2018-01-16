<template>
  <div class="font-muli" style="max-width: 1100px; margin: 0 auto">
    <button v-if="!hasStarted" @click.prevent="startGame">Start game</button>

    <div v-if="hasStarted">
      <div v-html="`You pressed: <b>${currentNotePressed.toUpperCase()}</b>`" class="h1 center"></div>
      <div v-html="`Streak: <b>${streakCount}</b>`" class="h2 mv1 center"></div>

      <!-- white tiles -->
      <div class="relative">
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

      <div class="mt3 f5">
        <ul>
          <li>Press letter for note</li>
          <li>Press shift for sharp</li>
          <li>Press ctrl for flat</li>
        </ul>
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
    keyPressed: '',
    isSharp: false,
    isFlat: false,
    hasStarted: false,
  }

  export default {
    data() {
      return clone(initData)
    },
    computed: {
      currentNotePressed () {
        return `${this.keyPressed.toLowerCase()}${(this.isSharp ? '#' : '')}${(this.isFlat ? '♭' : '')}`
      },
      hasMatchedNote () {
        const notes = Object.values(tileNoteMap).find(
          notes => notes.includes(this.currentNotePressed),
        )

        return (notes || []).includes((this.noteBeingPlayed || {}).note)
      },
    },
    methods: {
      startGame () {
        if (this.hasStarted) return null

        Mousetrap.bind([
          ...noteCollection,
          ...noteCollection.map(n => `shift+${n}`),
          ...noteCollection.map(n => `ctrl+${n}`),
        ], (pressed) => {
          this.keyPressed = pressed.key
          this.isSharp = pressed.shiftKey
          this.isFlat = pressed.ctrlKey

          if (this.hasMatchedNote) {
            this.streakCount += 1
          } else {
            this.streakCount = 0
          }
        })

        startPianoGame((noteBeingPlayed) => {
          if (!this.hasMatchedNote) this.streakCount = 0

          this.noteBeingPlayed = noteBeingPlayed
          this.keyPressed = initData.keyPressed
          this.isSharp = initData.isSharp
          this.isFlat = initData.isFlat
        })

        this.hasStarted = true
      },
      stopGame () {
        this.keyPressed = null
        this.hasStarted = false

        stopPianoGame()
      },
      shouldRenderBlackTitle (n) {
        return [1, 2, 4, 5, 6].includes(convertNToIndex(n))
      },
      isCorrectTile (type, n) {
        if (!this.keyPressed || !this.isActiveTile(type, n)) return false

        return isSameTileAsPressed(this.currentNotePressed, type, n)
      },
      isWrongTile (type, n) {
        if (!this.keyPressed || this.isActiveTile(type, n)) return false

        return isSameTileAsPressed(this.currentNotePressed, type, n)
      },
      isActiveTile (type, n) {
        if (!this.noteBeingPlayed) return false

        return isSameTileAsPressed(this.noteBeingPlayed.note, type, n)
      },
      getTileBackgroundClass (type, n) {
        const isActive = this.isActiveTile(type, n)

        if (this.isCorrectTile(type, n)) return 'green-bg'
        if (this.isWrongTile(type, n)) return 'red-bg'
        if (isActive) return 'yellow-bg'
        if (!isActive && type === 'black') return 'black-bg'
      }
    },
  }
</script>
