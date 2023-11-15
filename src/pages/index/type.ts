export interface BluetoothDeviceInfo {
  /**
   * 蓝牙设备名称，某些设备可能没有
   */
  name: string;
  /**
   * 用于区分设备的 id
   */
  deviceId: string;
  /**
   * 当前蓝牙设备的信号强度
   */
  RSSI: number;
  /**
   * 当前蓝牙设备的广播数据段中的ManufacturerData数据段 （注意：vConsole 无法打印出 ArrayBuffer 类型数据）
   */
  advertisData: any[];
  /**
   * 当前蓝牙设备的广播数据段中的ServiceUUIDs数据段
   */
  advertisServiceUUIDs: any[];
  /**
   * 当前蓝牙设备的广播数据段中的LocalName数据段
   */
  localName: string;
  /**
   * 当前蓝牙设备的广播数据段中的ServiceData数据段
   */
  serviceData: any[];
}