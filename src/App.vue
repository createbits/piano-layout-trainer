<template>
  <div>
    <div v-if="!isLoaded">
      Loading...
    </div>
    <div v-if="isLoaded">
      <game-box></game-box>
    </div>
  </div>
</template>
<script>
  import GameBox from './components/Game.vue'

  export default {
    components: { GameBox },
    data() {
      return {
        isLoaded: false,
      }
    },
  }
</script>
