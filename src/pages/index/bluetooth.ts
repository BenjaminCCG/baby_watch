import { ref } from "vue";
import type { BluetoothDeviceInfo } from "./type";
import BabyWristbandParser from './BabyWristbandParser.ts'
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
  const deviceId = ref("");

  // 定义UUID的字节数
  const UUID_BYTES = 16;

  // 定义广播包中各字段的偏移量
  const UUID_OFFSET = 2;
  const MAJOR_OFFSET = 18;
  const MINOR_OFFSET = 20;

  // 从advertisData解析出真实数据
  function parseBabyWristbandData(buffer: ArrayBuffer): { uuid: string, major: number, temperature: string, activityLevel: string, activityCount: number } {
    if (buffer.byteLength !== 48 && buffer.byteLength !== 25) {
      throw new Error('Invalid buffer length');
    }

    const dataView = new DataView(buffer);

    // UUID: 16 bytes, Major: 2 bytes, Minor: 2 bytes
    let uuid = '';
    for (let i = 0; i < 5; i++) {
      uuid += String.fromCharCode(dataView.getUint8(i)); // JSIOT
    }
    uuid += dataView.getUint8(5).toString(16); // 标签类型
    uuid += '0000000000000000'; // 保留
    uuid += dataView.getUint16(14).toString(16).padStart(4, '0'); // 标签ID

    const major = dataView.getUint16(16); // Major
    const minor = dataView.getUint16(18); // Minor

    // Minor processing
    const temperatureValue = (minor >> 2) & 0x3F; // 取高6位
    const activityLevelValue = minor & 0x03; // 取低2位
    console.log(temperatureValue, activityLevelValue, 'activityLevelValueactivityLevelValueactivityLevelValue');

    // Convert temperature value to actual temperature
    const temperature = temperatureValue < 1 ? '小于36.1' : (36.0 + (temperatureValue * 0.1)).toFixed(1);

    // Convert activity level value to actual activity level description
    let activityLevel = '';
    let activityCount = 0;
    switch (activityLevelValue) {
      case 0:
        activityLevel = '安静';
        activityCount = 20;
        break;
      case 1:
        activityLevel = '正常躁动';
        activityCount = 50;
        break;
      case 2:
        activityLevel = '躁动';
        activityCount = 80;
        break;
      case 3:
        activityLevel = '非常躁动';
        activityCount = 80; // 请注意，这里需要一个更具体的值或者一个范围
        break;
      default:
        activityLevel = '未知';
        activityCount = 0;
        break;
    }

    return {
      uuid,
      major,
      temperature,
      activityLevel,
      activityCount,
    };
  }

  function parseData(arraybuffer) {

    // 1. 使用DataView解析arraybuffer
    const dataView = new DataView(arraybuffer);

    // 2. 解析Minor字段
    const minor = dataView.getUint16(/* minor字段的偏移量 */);

    // 3. 从Minor高6位提取温度值
    const temperatureValue = minor >> 10;

    // 4. 根据温度值表获取实际温度


    // 5. 从Minor低2位提取活动量
    const activityLevelValue = minor & 0x03;

    // 6. 根据活动量表获取活动量描述
    const temperature = temperatureValue < 1 ? '小于36.1' : (36.0 + (temperatureValue * 0.1)).toFixed(1);

    console.log(temperature, activityLevelValue, 'activityLevelValueactivityLevelValueactivityLevelValue');

    // Convert activity level value to actual activity level description
    let activityLevel = '';
    let activityCount = 0;
    switch (activityLevelValue) {
      case 0:
        activityLevel = '安静';
        activityCount = 20;
        break;
      case 1:
        activityLevel = '正常躁动';
        activityCount = 50;
        break;
      case 2:
        activityLevel = '躁动';
        activityCount = 80;
        break;
      case 3:
        activityLevel = '非常躁动';
        activityCount = 80; // 请注意，这里需要一个更具体的值或者一个范围
        break;
      default:
        activityLevel = '未知';
        activityCount = 0;
        break;
    }

    return {
      temperature,
      activityLevel
    };

  }


  function parseMinorData(arraybuffer) {
    const dataView = new DataView(arraybuffer);

    // 获取Minor字段的偏移量
    const minorOffset = 18;

    // 从arraybuffer中提取Minor字段
    const minorValue = dataView.getUint16(minorOffset, true); // 以little-endian格式读取2字节无符号整数

    // 提取温度和活动量信息
    const temperature = minorValue >> 2; // 右移3位得到温度值
    const activityLevel = minorValue & 0b11; // 与运算获取活动量信息

    // console.log(temperature, activityLevel, '111111111111');

    return {
      temperature: convertTemperature(temperature),
      activityLevel: convertActivity(activityLevel)
    };

  }

  function convertTemperature(value: number): number {
    const temperatureTable = { "0": "小于36.1", "1": "36.1", "2": "36.2", "3": "36.3", "4": "36.4", "5": "36.5", "6": "36.6", "7": "36.7", "8": "36.8", "9": "36.9", "10": "37.0", "11": "37.1", "12": "37.2", "13": "37.3", "14": "37.4", "15": "37.5", "16": "37.6", "17": "37.8", "18": "37.9", "19": "38.0", "20": "38.1", "21": "38.2", "22": "38.3", "23": "38.4", "24": "38.5", "25": "38.6", "26": "38.7", "27": "38.8", "28": "38.9", "29": "39.0", "30": "39.1", "31": "39.2", "32": "39.3", "33": "39.4", "34": "39.5", "35": "39.6", "36": "39.7", "37": "39.8", "38": "39.9", "39": "40.0", "40": "40.1", "41": "40.2", "42": "40.3", "43": "40.4", "44": "40.5", "45": "40.6", "46": "40.7", "47": "40.8", "48": "40.9", "49": "41.0", "50": "41.1", "51": "41.2", "52": "41.3", "53": "41.4", "54": "41.5", "55": "41.6", "56": "41.7", "57": "41.8", "58": "41.9", "59": "42.0", "60": "42.1", "61": "42.2", "62": "42.3", "63": "42.4" }
    console.log(value, "temperatureTable");

    return temperatureTable[String(value)];
    // if (value < temperatureTable.length) {
    //   return temperatureTable[value];
    // } else {
    //   // 处理超出表格范围的情况，返回默认值或者抛出异常
    //   return 0; // 临时返回0，请根据实际情况修改
    // }
  }
  function convertActivity(value: number): string {
    console.log(value, 'convertActivity');

    switch (value) {
      case 0:
        return "安静";
      case 1:
        return "正常躁动";
      case 2:
        return "躁动";
      case 3:
        return "非常躁动";
      default:
        // 处理超出范围的情况，返回默认值或者抛出异常
        return "未知"; // 临时返回"未知"，请根据实际情况修改
    }
  }

  const connect = (data: BluetoothDeviceInfo) => {
    console.log(data, "data");
    deviceId.value = data.deviceId;

    const val = parseMinorData(data.advertisData)
    // const val = parseAdvertisData(data.advertisData);
    console.log(val, 'val22222222222');

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
