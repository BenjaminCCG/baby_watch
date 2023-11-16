<template>
  <view>
    <scroll-view scroll-y class="box">
      <view
        class="item"
        v-for="(item, index) in deviceList"
        :key="index"
        @click="connect(item)"
      >
        <view>
          <text>id: {{ item.deviceId }}</text>
        </view>
        <view>
          <text>uuid: {{ item.advertisServiceUUIDs }}</text>
        </view>
        <view>
          <text>name: {{ item.name }}</text>
        </view>
      </view>
    </scroll-view>

    <button @click="initBlue">初始化蓝牙</button>

    <button @click="discovery">搜索附近蓝牙设备</button>

    <button @click="stopDiscovery">停止搜索附近蓝牙设备</button>

    <button @click="getServices">获取蓝牙服务</button>

    <button @click="getBeacons">获取Beacons服务</button>

    <button @click="onBeaconServiceChange">获取Beacons服务变化</button>

    <button @click="onBeaconUpdate">获取Beacons设备更新</button>

    <button @click="stopIBeaconDiscovery">停止搜索IBeacon</button>
  </view>
</template>

<script setup lang="ts">
import { useBlueTooth } from "./bluetooth";

const {
  deviceList,
  initBlue,
  discovery,
  connect,
  stopDiscovery,
  getServices,
  getBeacons,
  onBeaconServiceChange,
  onBeaconUpdate,
  stopIBeaconDiscovery,
} = useBlueTooth();
</script>

<style>
.box {
  width: 100%;
  height: 400rpx;
  box-sizing: border-box;
  margin-bottom: 20rpx;
  border: 2px solid dodgerblue;
}
.item {
  box-sizing: border-box;
  padding: 10rpx;
  border-bottom: 1px solid #ccc;
}
button {
  margin-bottom: 20rpx;
}
</style>
