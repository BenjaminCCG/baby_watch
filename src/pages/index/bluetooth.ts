import { ref } from "vue";
import type { BluetoothDeviceInfo } from "./type";
import { temperatureMapping, activityMapping } from "./mapping";
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

  function parseBroadcastData(data: ArrayBuffer) {
    // Assuming data is an ArrayBuffer with byteLength either 48 or 25
    const view = new DataView(data);

    // Parse UUID
    const uuid = String.fromCharCode.apply(
      null,
      new Uint8Array(data.slice(0, 5)) as any
    );
    const tagType = view.getUint8(5);

    // Parse Reserved field (8 bytes, ignore for now)
    // const reserved = new Uint8Array(data.slice(6, 14));

    // Parse Tag ID
    const tagID = view.getUint16(14, true);

    // Parse Major field
    const major = view.getUint16(16, true);

    // Parse Minor field
    const minor = view.getUint16(18, true);
    const temperatureIndex = (minor >> 10) & 0x3f; // Get the high 6 bits
    const activityIndex = minor & 0x03; // Get the low 2 bits

    // Temperature mapping

    const temperature = temperatureMapping[temperatureIndex];

    const activity = activityMapping[activityIndex];

    return {
      uuid,
      tagType,
      tagID,
      major,
      minor,
      temperature,
      activity,
    };
  }

  const connect = (data: BluetoothDeviceInfo) => {
    deviceId.value = data.deviceId;
    const val = parseBroadcastData(data.advertisData as ArrayBuffer);
    console.log(val, "parseBroadcastData");

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
