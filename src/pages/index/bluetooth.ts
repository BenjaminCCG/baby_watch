import { ref } from "vue";
import type { BluetoothDeviceInfo } from "./type";
export function useBlueTooth() {
  const deviceList = ref<BluetoothDeviceInfo[]>([]);

  const initBlue = () => {
    uni.openBluetoothAdapter({
      success(result) {
        console.log(result, "初始化成功");
      },
      fail(result) {
        console.log(result, "初始化失败");
      },
    });
  };

  const discovery = () => {
    uni.openBluetoothAdapter({
      success: () => {
        uni.startBluetoothDevicesDiscovery({
          allowDuplicatesKey: true,
          success(result) {
            console.log(result, "startBluetoothDevicesDiscovery");
            uni.onBluetoothDeviceFound(
              (res: UniApp.OnBluetoothDeviceFoundResult) => {
                console.log(res, "onBluetoothDeviceFound");
                if (res.devices[0].name === "J") {
                  deviceList.value.push(res.devices[0]);
                  return res.devices[0];
                }
              }
            );

            getDeviceList();
          },
        });
      },
      fail(result) {
        console.log(result);
      },
    });
  };
  const deviceId = ref("");

  function parseMinorData(arrayBuffer: ArrayBuffer) {
    const uuidBytes = new Uint8Array(arrayBuffer.slice(0, 16));

    const majorBytes = new Uint8Array(arrayBuffer.slice(16, 18));
    const minorBytes = new Uint8Array(arrayBuffer.slice(18, 20));

    const major = (majorBytes[0] << 8) | majorBytes[1];
    const minor = (minorBytes[0] << 8) | minorBytes[1];

    const temperature = (minor >> 6) & 0x1f; // 取Minor的高6位作为温度值
    const activity = minor & 0x03;

    // 解析温度
    let temperatureValue = 36.1 + temperature * 0.1;

    // 解析活动量
    let activityLevel;
    switch (activity) {
      case 0:
        activityLevel = "安静";
        break;
      case 1:
        activityLevel = "正常躁动";
        break;
      case 2:
        activityLevel = "躁动";
        break;
      case 3:
        activityLevel = "非常躁动";
        break;
      default:
        activityLevel = "未知";
    }
    return {
      temperatureValue,
      activityLevel,
    };
  }

  const connect = (data: BluetoothDeviceInfo) => {
    console.log(data, "data");
    deviceId.value = data.deviceId;

    const val = parseMinorData(data.advertisData as ArrayBuffer);
    console.log(val, "val22222222222");

    // uni.createBLEConnection({
    //   deviceId: data.deviceId,
    //   success(result) {
    //     console.log(result, "createBLEConnection 连接成功");
    //   },
    //   fail(result) {
    //     console.log(result, "createBLEConnection 连接失败");
    //   },
    // })
    // uni.getBLEDeviceServices({
    //   deviceId: deviceId.value,
    //   success(result) {
    //     console.log(result, "getBLEDeviceServices");
    //     uni.getBLEDeviceCharacteristics({
    //       deviceId: deviceId.value,
    //       serviceId: result.services[0].uuid,
    //       success(res) {
    //         console.log(res, "getBLEDeviceCharacteristics");
    //       },
    //       fail(result) {
    //         console.log(result, "getBLEDeviceCharacteristics 失败");
    //       },
    //     });
    //   },
    //   fail(result) {
    //     console.log(result, "getBLEDeviceServices 失败");
    //   },
    // });

    // uni.startBeaconDiscovery({
    //   uuids: [data.deviceId],
    //   // uuids: data.advertisServiceUUIDs,
    //   success(result) {
    //     console.log(result, "连接成功");
    //     uni.onBeaconUpdate((data) => {
    //       console.log(data, "触发Beacons更新1111");

    //       uni.getBeacons({
    //         success(result) {
    //           console.log(result, "getBeacons 成功3333");
    //         },
    //         fail(result) {
    //           console.log(result, "getBeacons 失败3333");
    //         },
    //       });
    //     });
    //   },
    //   fail(result) {
    //     console.log(result, "连接失败");
    //   },
    // });
    // uni.createBLEConnection({
    //   deviceId: deviceId.value,
    //   success(result) {
    //     console.log(result, '连接成功');
    //   },
    //   fail(result) {
    //     console.log(result, '连接失败');
    //   },
    // })
  };

  const stopDiscovery = () => {
    uni.stopBluetoothDevicesDiscovery({
      success(result) {
        console.log(result, "停止扫描成功");
      },
      fail(result) {
        console.log(result, "停止扫描失败");
      },
    });
  };

  const getServices = () => {
    uni.getBLEDeviceServices({
      deviceId: deviceId.value,
      success(res) {
        console.log(res, "获取蓝牙服务成功");
      },
      fail(err) {
        console.error(err, "获取蓝牙服务失败");
      },
    });
  };

  const getBeacons = () => {
    uni.onBeaconUpdate((res) => {
      console.log(res, "触发Beacons更新2222");

      uni.getBeacons({
        success(res) {
          console.log(res, "获取Beacons成功111");
        },
        fail(err) {
          console.error(err, "获取Beacons失败111");
        },
      });
    });

    uni.getBeacons({
      success(res) {
        console.log(res, "获取Beacons成功222");
      },
      fail(err) {
        console.error(err, "获取Beacons失败222");
      },
    });
  };

  const onBeaconServiceChange = () => {
    uni.onBeaconServiceChange((res) => {
      console.log(res, "onBeaconServiceChange");
    });
  };

  const onBeaconUpdate = () => {
    uni.onBeaconUpdate((res) => {
      console.log(res, "onBeaconUpdate");
    });
  };

  const stopIBeaconDiscovery = () => {
    uni.stopBeaconDiscovery({
      success(res) {
        console.log(res, "停止扫描IBeacon成功");
      },
    });
  };

  const getDeviceList = () => {
    uni.getBluetoothDevices({
      success(result) {
        console.log(result, "getBluetoothDevices 成功");
      },
      fail(result) {
        console.log(result, "getBluetoothDevices 失败");
      },
    });
  };
  return {
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
    getDeviceList,
  };
}
