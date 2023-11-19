export default class BabyWristbandParser {
  static parse(arrayBuffer: ArrayBuffer): { temperature: number, activity: string } {
    const dataView = new DataView(arrayBuffer);

    // 解析UUID部分
    const uuid = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2),
      dataView.getUint8(3),
      dataView.getUint8(4)
    );

    // 解析标签类型
    const tagType = dataView.getUint8(5);

    // 解析保留字段
    const reserved = new Uint8Array(arrayBuffer.slice(6, 14));

    // 解析标签ID
    const tagId = dataView.getUint16(14, true); // 小端字节序

    // 解析Major
    const major = dataView.getUint16(16, true); // 小端字节序

    // 解析Minor
    const minor = dataView.getUint16(18, true); // 小端字节序

    // 解析温度和活动量
    const temperature = (minor >> 10) & 0x3F; // 取高6位
    const activity = minor & 0x03; // 取低2位

    // 根据活动量和温度的值，你可以根据提供的表格进行转换

    return {
      temperature: this.convertTemperature(temperature),
      activity: this.convertActivity(activity)
    };
  }

  private static convertTemperature(value: number): number {
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
  private static convertActivity(value: number): string {
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


}

