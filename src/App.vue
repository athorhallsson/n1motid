<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /* color: #2c3e50; */
  color: white;
  height: 100vh;
  padding: 0;
  margin: 0;
}

body {
  /* background-color:rgb(249, 249, 249); */
  height: 100vh;
  background-color: rgb(40, 50, 45);
  padding: 0;
  margin: 0;
}

</style>
