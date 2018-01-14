<template>
  <div style="max-width: 1100px; margin: 0 auto">
    <button v-if="!hasStarted" @click.prevent="startGame">Start game</button>

    <div v-if="hasStarted">
      <div v-html="`You pressed: <b>${(keyPressed || '').toUpperCase()}</b>`" class="h1 b center"></div>

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
    </div>

    <div class="mt4">
      <button v-if="hasStarted" @click.prevent="stopGame">Stop game</button>
    </div>
  </div>
</template>
<script>
  import Mousetrap from 'mousetrap'
  import { noteCollection, startPianoGame, stopPianoGame } from '../lib/PianoGame'

  const numberToNoteMap = {
    0: 'c',
    1: 'd',
    2: 'e',
    3: 'f',
    4: 'g',
    5: 'a',
    6: 'b',
  }

  export default {
    data() {
      return {
        size: 1,
        tileCount: 14,
        noteBeingPlayed: null,
        keyPressed: null,
        hasStarted: false,
      }
    },
    methods: {
      startGame () {
        if (this.hasStarted) return null

        Mousetrap.bind(noteCollection, (pressed) => {
          this.keyPressed = pressed.key
          console.log(this.keyPressed)
        })

        startPianoGame((noteBeingPlayed) => {
          this.noteBeingPlayed = noteBeingPlayed
          this.keyPressed = null
        })

        this.hasStarted = true
      },
      stopGame () {
        this.keyPressed = null
        this.hasStarted = false

        stopPianoGame()
      },
      convertNToIndex (n) {
        return (n - 1) % 7
      },
      shouldRenderBlackTitle (n) {
        return [1, 2, 4, 5, 6].includes(this.convertNToIndex(n))
      },
      isCorrectTile (type, n) {
        if (!this.keyPressed || !this.isActiveTile(type, n)) return false

        if (type === 'white') {
          return this.keyPressed === numberToNoteMap[this.convertNToIndex(n)]
        }
      },
      isWrongTile (type, n) {
        if (!this.keyPressed || this.isActiveTile(type, n)) return false

        if (type === 'white') return this.keyPressed === numberToNoteMap[this.convertNToIndex(n)]
      },
      isActiveTile (type, n) {
        if (!this.noteBeingPlayed) return false

        if (type === 'white' && !this.noteBeingPlayed.accent) {
          return numberToNoteMap[this.convertNToIndex(n)] === this.noteBeingPlayed.note
        }

        return false
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
