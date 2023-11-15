import { ref } from "vue";
import type { BluetoothDeviceInfo } from "./type";

export function useBlueTooth() {

  const deviceList = ref<BluetoothDeviceInfo[]>([])

  const initBlue = () => {
    uni.openBluetoothAdapter({
      success(result) {
        console.log(result, '初始化成功');

      },
      fail(result) {
        console.log(result, '初始化失败');
      }
    })
  }

  const discovery = () => {
    uni.openBluetoothAdapter({
      success: () => {
        // console.log(res, 'res');
        uni.startBluetoothDevicesDiscovery({
          success(result) {
            console.log(result, 'startBluetoothDevicesDiscovery');
            uni.onBluetoothDeviceFound((res: UniApp.OnBluetoothDeviceFoundResult) => {
              console.log(res, 'onBluetoothDeviceFound');
              deviceList.value.push(res.devices[0])
            })
          },
        })

      },
      fail(result) {
        console.log(result);
      },
    })
  }

  const deviceId = ref('')
  const connect = (data: BluetoothDeviceInfo) => {
    console.log(data, 'data');
    deviceId.value = data.deviceId;
    uni.startBeaconDiscovery({
      uuids: data.advertisServiceUUIDs,
      success(result) {
        console.log(result, '连接成功');
        uni.onBeaconUpdate(data => {
          console.log(data, '触发Beacons更新1111');

        })

        uni.getBeacons({
          success(result) {
            console.log(result, 'getBeacons 成功3333');
          },
          fail(result) {
            console.log(result, 'getBeacons 失败3333');
          },
        })
      },
      fail(result) {
        console.log(result, '连接失败');
      },
    })
    // uni.createBLEConnection({
    //   deviceId: deviceId.value,
    //   success(result) {
    //     console.log(result, '连接成功');
    //   },
    //   fail(result) {
    //     console.log(result, '连接失败');
    //   },
    // })
  }

  const stopDiscovery = () => {
    uni.stopBluetoothDevicesDiscovery({
      success(result) {
        console.log(result, '停止扫描成功');
      },
      fail(result) {
        console.log(result, '停止扫描失败');
      },
    })
  }


  const getServices = () => {
    uni.getBLEDeviceServices({
      deviceId: deviceId.value,
      success(res) {
        console.log(res, '获取蓝牙服务成功')
      },
      fail(err) {
        console.error(err, '获取蓝牙服务失败')
      }
    })
  }


  const getBeacons = () => {
    uni.onBeaconUpdate((res) => {
      console.log(res, '触发Beacons更新2222')

      uni.getBeacons({
        success(res) {
          console.log(res, '获取Beacons成功111')
        },
        fail(err) {
          console.error(err, '获取Beacons失败111')
        }
      })
    })

    uni.getBeacons({
      success(res) {
        console.log(res, '获取Beacons成功222')
      },
      fail(err) {
        console.error(err, '获取Beacons失败222')
      }
    })

  }


  const onBeaconServiceChange = () => {
    uni.onBeaconServiceChange(res => {
      console.log(res, 'onBeaconServiceChange')
    })
  }


  const onBeaconUpdate = () => {
    uni.onBeaconUpdate(res => {
      console.log(res, 'onBeaconUpdate')
    })
  }
  return {
    deviceList,
    initBlue,
    discovery,
    connect,
    stopDiscovery,
    getServices,
    getBeacons,
    onBeaconServiceChange,
    onBeaconUpdate
  }
}