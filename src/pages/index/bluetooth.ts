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

  // 解析广播包数据
  function parseAdvertisementData(advertisementData: ArrayBuffer) {
    // 根据广播包数据长度选择不同的解析方式
    if (advertisementData.byteLength === 48) {
      return parseType1Data(advertisementData);
    } else if (advertisementData.byteLength === 25) {
      return parseType2Data(advertisementData);
    } else {
      return null; // 无法解析的数据格式
    }
  }

  // 解析类型1的广播包数据
  function parseType1Data(advertisementData: ArrayBuffer) {
    const int8Array = new Int8Array(advertisementData);

    // 提取UUID
    const uuid = String.fromCharCode(...int8Array.subarray(0, 5));

    // 提取标签类型
    const tagType = int8Array[5];

    // 提取标签ID
    const tagId = int8Array.subarray(16, 18);

    // 提取Major和Minor
    const major = int8Array.subarray(6, 8);
    const minor = int8Array.subarray(8, 10);

    // 解析Minor中的温度和活动量
    const temperature = temperatureMapping[(minor[0] << 8) | minor[1]];
    const activity = activityMapping[minor[1] & 0x03];
    console.log(
      (minor[0] << 8) | minor[1],
      minor[1] & 0x03,
      "------------------------------48"
    );

    return {
      uuid,
      tagType,
      tagId,
      major,
      minor,
      temperature,
      activity,
    };
  }

  // 解析类型2的广播包数据
  function parseType2Data(advertisementData: ArrayBuffer) {
    const int8Array = new Int8Array(advertisementData);

    // 提取UUID
    const uuid = String.fromCharCode(...int8Array.subarray(0, 5));

    // 提取标签类型
    const tagType = int8Array[5];

    // 提取标签ID
    const tagId = int8Array.subarray(16, 18);

    // 提取Major和Minor
    const major = int8Array.subarray(6, 8);
    const minor = int8Array.subarray(8, 10);

    // 解析Minor中的温度和活动量
    const temperature = temperatureMapping[(minor[0] << 8) | minor[1]];
    const activity = activityMapping[minor[1] & 0x03];
    console.log(
      (minor[0] << 8) | minor[1],
      minor[1] & 0x03,
      "------------------------------25"
    );
    return {
      uuid,
      tagType,
      tagId,
      major,
      minor,
      temperature,
      activity,
    };
  }

  const connect = (data: BluetoothDeviceInfo) => {
    console.log("🚀 ~ file: bluetooth.ts:89 ~ connect ~ data:", data);
    deviceId.value = data.deviceId;
    const val = parseAdvertisementData(data.advertisData as ArrayBuffer);
    console.log(val, "parseAdvertisementData");

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
