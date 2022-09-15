<script setup lang='ts'>
import { ElMessage } from 'element-plus';

</script>
<template>
<div class="cubeCon">
  <div class="cube cube1"></div>
  <div class="cube cube2"></div>
  <div class="cube cube3"></div>
  <div class="cube cube4"></div>
  <div class="cube cube5"></div>
  <div class="cube cube6"></div>
  <div class="cube cube7"></div>
  <div class="cube cube8"></div>
  <div class="cube cube9"></div>
</div>

</template>
<style scoped lang='scss'>
.cubeCon {
  width: 80px;
  height: 80px;
  position: absolute;
  top: 35%;
}

.cubeCon .cube {
  width: 33%;
  height: 33%;
  background-color: #fff;
  float: left;
  -webkit-animation: cubeGridScaleDelay 1.3s infinite ease-in-out;
  animation: cubeGridScaleDelay 1.3s infinite ease-in-out;
}
.cubeCon .cube1 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
.cubeCon .cube2 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
.cubeCon .cube3 {
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}
.cubeCon .cube4 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
.cubeCon .cube5 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
.cubeCon .cube6 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
.cubeCon .cube7 {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
}
.cubeCon .cube8 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
.cubeCon .cube9 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}

@-webkit-keyframes cubeGridScaleDelay {
  0%,
  70%,
  100% {
    -webkit-transform: scale3D(1, 1, 1);
    transform: scale3D(1, 1, 1);
  }
  35% {
    -webkit-transform: scale3D(0, 0, 1);
    transform: scale3D(0, 0, 1);
  }
}

@keyframes cubeGridScaleDelay {
  0%,
  70%,
  100% {
    -webkit-transform: scale3D(1, 1, 1);
    transform: scale3D(1, 1, 1);
  }
  35% {
    -webkit-transform: scale3D(0, 0, 1);
    transform: scale3D(0, 0, 1);
  }
}

</style>
<style>

</style>