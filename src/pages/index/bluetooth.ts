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
        // console.log(res, 'res');
        uni.startBluetoothDevicesDiscovery({
          success(result) {
            console.log(result, "startBluetoothDevicesDiscovery");
            uni.onBluetoothDeviceFound(
              (res: UniApp.OnBluetoothDeviceFoundResult) => {
                console.log(res, "onBluetoothDeviceFound");
                deviceList.value.push(res.devices[0]);
                return res.devices[0]
              }
            );

            getDeviceList()
          },
        });
      },
      fail(result) {
        console.log(result);
      },
    });
  };
  function parseAdvertiseData(receivedData: ArrayBuffer) {
    var dataView = new DataView(receivedData);

    // 解析UUID
    var uuid = "";
    for (var i = 0; i < 5; i++) {
      uuid += String.fromCharCode(dataView.getUint8(i));
    }

    // 解析标签类型
    var tagType = dataView.getUint8(5);

    // 解析保留字段
    var reserved = [];
    for (var i = 6; i < 14; i++) {
      reserved.push(dataView.getUint8(i));
    }

    // 解析标签ID
    var tagId = dataView.getUint16(14, true); // 第二个参数为little-endian格式

    // 解析Major
    var major = dataView.getUint16(16, true); // 第二个参数为little-endian格式

    // 解析Minor
    var minor = dataView.getUint16(18, true); // 第二个参数为little-endian格式

    // 解析温度和活动量
    var temperature = (minor >> 6) & 0x1F;
    var activity = minor & 0x03;

    // 映射温度值
    var temperatureMapping = [
      "小于36.1", "36.1", "36.2", "36.3", "36.4", "36.5", "36.6", "36.7", "36.8", "36.9",
      "37.0", "37.1", "37.2", "37.3", "37.4", "37.5", "37.6", "37.8", "37.9", "38.0",
      "38.1", "38.2", "38.3", "38.4", "38.5", "38.6", "38.7", "38.8", "38.9", "39",
      "39.1", "39.2", "39.3", "39.4", "39.5", "39.6", "39.7", "39.8", "39.9", "40",
      "40.1", "40.2", "40.3", "40.4", "40.5", "40.6", "40.7", "40.8", "40.9", "41",
      "41.1", "41.2", "41.3", "41.4", "41.5", "41.6", "41.7", "41.8", "41.9", "42",
      "42.1", "42.2", "42.3", "42.4"
    ];

    var temperatureMappingObject = temperatureMapping.reduce(function (acc, value, index) {
      acc[index] = value;
      return acc;
    }, {});
    var temperatureValue = temperatureMappingObject[temperature];

    // 显示解析结果
    console.log("UUID:", uuid);
    console.log("Tag Type:", tagType);
    console.log("Reserved:", reserved);
    console.log("Tag ID:", tagId);
    console.log("Major:", major);
    console.log("Minor:", minor);
    console.log("Temperature:", temperatureValue);
    console.log("Activity:", getActivityDescription(activity));

    // 辅助函数，根据活动量返回描述
    function getActivityDescription(activity) {
      switch (activity) {
        case 0:
          return "安静";
        case 1:
          return "正常躁动";
        case 2:
          return "躁动";
        case 3:
          return "非常躁动";
        default:
          return "未知活动量";
      }
    }
  }
  const deviceId = ref("");
  const connect = (data: BluetoothDeviceInfo) => {
    console.log(data, "data");
    deviceId.value = data.deviceId;

    uni.createBLEConnection({
      deviceId: data.deviceId,
      success(result) {
        console.log(result, "createBLEConnection 连接成功");
      },
      fail(result) {
        console.log(result, "createBLEConnection 连接失败");
      },
    })
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

    uni.startBeaconDiscovery({
      uuids: [data.deviceId],
      // uuids: data.advertisServiceUUIDs,
      success(result) {
        console.log(result, "连接成功");
        uni.onBeaconUpdate((data) => {
          console.log(data, "触发Beacons更新1111");

          uni.getBeacons({
            success(result) {
              console.log(result, "getBeacons 成功3333");
            },
            fail(result) {
              console.log(result, "getBeacons 失败3333");
            },
          });
        });
      },
      fail(result) {
        console.log(result, "连接失败");
      },
    });
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
      }
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
    onBeaconUpdate,
    stopIBeaconDiscovery,
    getDeviceList
  };
}
