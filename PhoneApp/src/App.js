import React, { Component } from 'react'
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Modal,
  ActivityIndicator,
  Image,
  Linking,
  TextInput
} from 'react-native'

import QRCodeScanner from 'react-native-qrcode-scanner';
import Toast from '@remobile/react-native-toast'
import BluetoothSerial from 'react-native-bluetooth-serial'
import { Buffer } from 'buffer'
global.Buffer = Buffer
const iconv = require('iconv-lite')

const Button = ({ title, onPress, style, textStyle }) =>
  <TouchableOpacity style={[ styles.button, style ]} onPress={onPress}>
    <Text style={[ styles.buttonText, textStyle ]}>{title.toUpperCase()}</Text>
  </TouchableOpacity>


const DeviceList = ({ pairedDevices, unpairedDevices, connectedId, showConnectedIcon, onDevicePress }) =>
  <ScrollView style={styles.container}>
    <View style={styles.listContainer}>
      {pairedDevices.map((device, i) => {
        return (
          <TouchableHighlight
            underlayColor='#DDDDDD'
            key={`${device.id}_${i}`}
            style={styles.listItem} onPress={() => onDevicePress(device)}>
            <View style={{ flexDirection: 'row' }}>
              
              <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold' }}>{device.name}</Text>
                {/*<Text>{`<${device.id}>`}</Text>*/}
                {showConnectedIcon
                ? (
                  <View>
                    {connectedId === device.id
                    ? (
                      <Text>   CONNECTED</Text>
                    ) : (
                      <Text>   PAIRED</Text>
                    )}
                  </View>
                ) : null}
                {connectedId === device.id
                  ? (
                    <View style={{ flexDirection: 'row', height: 48 }}>

                    </View>
                  ) : null
                }
              </View>
            </View>
          </TouchableHighlight>
        )
      })}
    </View>
    <View style={styles.listContainer}>
      {unpairedDevices.map((device, i) => {
        return (
          <TouchableHighlight
            underlayColor='#DDDDDD'
            key={`${device.id}_${i}`}
            style={styles.listItem} onPress={() => onDevicePress(device)}>
            <View style={{ flexDirection: 'row' }}>
              {showConnectedIcon
              ? (
                <View style={{ width: 48, height: 48, opacity: 0.4 }}>
                  {connectedId === device.id
                  ? (
                    <Image style={{ resizeMode: 'contain', width: 24, height: 24, flex: 1 }} source={require('./images/ic_done_black_24dp.png')} />
                  ) : null}
                </View>
              ) : null}
              <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold' }}>{device.name}</Text>
                <Text>{   `<${device.id}>`}</Text>
              </View>
            </View>
          </TouchableHighlight>
        )
      })}
    </View>
  </ScrollView>

class SkolegasAccessControl extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEnabled: false,
      discovering: false,
      devices: [],
      unpairedDevices: [],
      connected: false,
      section: 0
    }
  }

  componentWillMount () {
    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ])
    .then((values) => {
      const [ isEnabled, devices ] = values
      this.setState({ isEnabled, devices })
    })

    BluetoothSerial.on('bluetoothEnabled', () => Toast.showShortBottom('Bluetooth enabled'))
    BluetoothSerial.on('bluetoothDisabled', () => Toast.showShortBottom('Bluetooth disabled'))
    BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`))
    BluetoothSerial.on('connectionLost', () => {
      if (this.state.device) {
        Toast.showShortBottom(`Connection to device ${this.state.device.name} has been lost`)
      }
      this.setState({ connected: false })
    })

    // BluetoothSerial.on('data', (data) => { 
    //   console.log('here 1', data); 
    //   Toast.showShortBottom(data);
    // });

    BluetoothSerial.withDelimiter('\n').then((res)=>{
      // console.log("delimiter setup",res);
      BluetoothSerial.on('read', (data)=>{
        tData = data.data.split('\n')[0];
        console.log('here 2', tData);
        Toast.showShortBottom(tData);
      })
    })

  }



  /**
   * [android]
   * request enable of bluetooth from user
   */
  requestEnable () {
    BluetoothSerial.requestEnable()
    .then((res) => this.setState({ isEnabled: true }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * [android]
   * enable bluetooth on device
   */
  enable () {
    BluetoothSerial.enable()
    .then((res) => this.setState({ isEnabled: true }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * [android]
   * disable bluetooth on device
   */
  disable () {
    BluetoothSerial.disable()
    .then((res) => this.setState({ isEnabled: false }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * [android]
   * toggle bluetooth
   */
  toggleBluetooth (value) {
    if (value === true) {
      this.enable()
    } else {
      this.disable()
    }
  }

  /**
   * [android]
   * Discover unpaired devices, works only in android
   */
  discoverUnpaired () {
    if (this.state.discovering) {
      return false
    } else {
      this.setState({ discovering: true })
      BluetoothSerial.discoverUnpairedDevices()
      .then((unpairedDevices) => {
        console.log("devices", unpairedDevices);
        this.setState({ unpairedDevices, discovering: false })
      })
      .catch((err) => Toast.showShortBottom(err.message))
    }
  }

  /**
   * [android]
   * Discover unpaired devices, works only in android
   */
  cancelDiscovery () {
    if (this.state.discovering) {
      BluetoothSerial.cancelDiscovery()
      .then(() => {
        this.setState({ discovering: false })
      })
      .catch((err) => Toast.showShortBottom(err.message))
    }
  }

  /**
   * [android]
   * Pair device
   */
  pairDevice (device) {
    BluetoothSerial.pairDevice(device.id)
    .then((paired) => {
      if (paired) {
        Toast.showShortBottom(`Device ${device.name} paired successfully`)
        const devices = this.state.devices
        devices.push(device)
        this.setState({ devices, unpairedDevices: this.state.unpairedDevices.filter((d) => d.id !== device.id) })
      } else {
        Toast.showShortBottom(`Device ${device.name} pairing failed`)
      }
    })
    .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * Connect to bluetooth device by id
   * @param  {Object} device
   */
  connect (device) {
    this.setState({ connecting: true })
    BluetoothSerial.connect(device.id)
    .then((res) => {
      Toast.showShortBottom(`Connected to device ${device.name}`)
      this.setState({ device, connected: true, connecting: false })
    })
    .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * Disconnect from bluetooth device
   */
  disconnect () {
    this.write("disconnect")
    BluetoothSerial.disconnect()
    .then(() => this.setState({ connected: false, device: null }))
    .catch((err) => Toast.showShortBottom(err.message))  
  }

  /**
   * Toggle connection when we have active device
   * @param  {Boolean} value
   */
  toggleConnect (value) {
    if (value === true && this.state.device) {
      this.connect(this.state.device)
    } else {
      this.disconnect()
    }
  }

  /**
   * Write message to device
   * @param  {String} message
   */
  write (message) {
    if (!this.state.connected) {
      Toast.showShortBottom('You must connect to device first')
      return
    }

    BluetoothSerial.write(message)
    .then((res) => {
      // Toast.showShortBottom('Successfuly wrote to device')
      this.setState({ connected: true })
    })
    .catch((err) => Toast.showShortBottom(err.message))
  }

  onDevicePress (device) {
    if (this.state.section === 0) {
      this.connect(device)
    } else {
      this.pairDevice(device)
    }
  }

  writePackets (message, packetSize = 64) {
    const toWrite = iconv.encode(message, 'cp852')
    const writePromises = []
    const packetCount = Math.ceil(toWrite.length / packetSize)

    for (var i = 0; i < packetCount; i++) {
      const packet = new Buffer(packetSize)
      packet.fill(' ')
      toWrite.copy(packet, 0, i * packetSize, (i + 1) * packetSize)
      writePromises.push(BluetoothSerial.write(packet))
    }

    Promise.all(writePromises)
    .then((result) => {
    })
  }

  onSuccess(e) {
    Linking
      .openURL(e.data)
      .catch(err => console.error('An error occured', err));
  }

  render () {
    const activeTabStyle = { borderBottomWidth: 6, borderColor: '#009688' }
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <Text style={styles.heading}>Skolegas Access Control</Text>
          { /* Platform.OS === 'android'
          ? (
            <View style={styles.enableInfoWrapper}>
              <Text style={{ fontSize: 12, color: '#FFFFFF' }}>
                {this.state.isEnabled ? 'disable' : 'enable'}
              </Text>
              <Switch
                onValueChange={this.toggleBluetooth.bind(this)}
                value={this.state.isEnabled} />
            </View>
          ) : null*/ }
        </View>

        {Platform.OS === 'android'
        ? (
          <View style={[styles.topBar, { justifyContent: 'center', paddingHorizontal: 0 }]}>
            <TouchableOpacity style={[styles.tab, this.state.section === 0 && activeTabStyle]} onPress={() => this.setState({ section: 0 })}>
              <Text style={{ fontSize: 14, color: '#000' }}>DOOR FUNCTIONS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, this.state.section === 2 && activeTabStyle]} onPress={() => this.setState({ section: 2 })}>
              <Text style={{ fontSize: 14, color: '#000' }}>INTERCOM</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        { this.state.section === 2
        ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <QRCodeScanner
              onRead={this.onSuccess.bind(this)}
              bottomContent={(
                <Text style={styles.bottomText}>Please scan the QR-Code attached to the Intercom</Text>
                /*<TouchableOpacity style={styles.buttonTouchable}>
                  <Text style={styles.buttonText}>OK. Got it!</Text>
                </TouchableOpacity>*/
              )}
            />
          </View>
        ) : null

        }

        { this.state.section === 0 && this.state.isEnabled
        ? (
            <DeviceList
              showConnectedIcon={this.state.section === 0}
              connectedId={this.state.device && this.state.device.id}
              pairedDevices={this.state.devices}
              unpairedDevices={this.state.unpairedDevices}
              // devices={this.state.section === 0 ? this.state.devices : this.state.unpairedDevices}
              onDevicePress={(device) => this.onDevicePress(device)} />
        ) : (
          null
        )}

        { this.state.section === 0 && !this.state.isEnabled
        ? (
            <ScrollView style={styles.container}>
              <Text style={styles.centerText}> Please enable Bluetooth to proceed </Text>
            </ScrollView>
        ) : (
          null
        )}

        { this.state.section === 0 && this.state.isEnabled
        ? (
          <View>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              onChangeText={(userId) => this.setState({userId})}
              value={this.state.userId}
              defaultValue="User ID"
            />
          </View>
        ) : null
        }
        

        { this.state.section === 0
        ? (
          <View style={{ alignSelf: 'flex-end', height: 52 }}>
            <ScrollView
              horizontal
              contentContainerStyle={styles.fixedFooter}>
              {Platform.OS === 'android' && this.state.isEnabled && this.state.connected
              ? (
                <Button
                  title="Disconnect"
                  onPress={() => this.disconnect() } />
              ) : null}
              {Platform.OS === 'android' && this.state.isEnabled && !this.state.connected
              ? (
                <Button
                  title={this.state.discovering ? '... Discovering' : 'Discover devices'}
                  onPress={this.discoverUnpaired.bind(this)} />
              ) : null}
              {Platform.OS === 'android' && this.state.isEnabled && this.state.connected
              ? (
                <Button
                  title="Sair"
                  onPress={() => this.write("0"+this.state.userId) } />
              ) : null}
              {Platform.OS === 'android' && this.state.isEnabled && this.state.connected
              ? (
                <Button
                  title="Entrar"
                  onPress={() => this.write("1"+this.state.userId) } />
              ) : null}
              {Platform.OS === 'android' && !this.state.isEnabled && !this.state.connected
              ? (
                <Button
                  title='Enable Bluetooth'
                  onPress={() => this.requestEnable()} />
              ) : (
                <Button
                  title='Disable Bluetooth'
                  onPress={() => this.disable()} />
              )}
            </ScrollView>
          </View>
        ) : null
        }

        {this.state.discovering && this.state.section === 1
        ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator
              style={{ marginBottom: 15 }}
              size={60} />
            <Button
              textStyle={{ color: '#FFFFFF' }}
              style={styles.buttonRaised}
              title='Cancel Discovery'
              onPress={() => this.cancelDiscovery()} />
          </View>
        ) : null}
        
        {/*<View style={styles.container}>
          <View style={styles.list}>
          </View>
          <View style={styles.bottomBar}>
            <Text style={styles.buttons} onPress={() => this.write("test") }>Send Message</Text>
            <Text style={styles.buttons} onPress={() => this.disconnect() }>Disconnect</Text>
          </View>
        </View>*/}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: '#F5FCFF'
  },
  topBar: { 
    height: 56, 
    paddingHorizontal: 16,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' ,
    elevation: 6,
    backgroundColor: '#f4ce42'
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
    color: '#000'
  },
  enableInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tab: { 
    alignItems: 'center', 
    flex: 0.5, 
    height: 56, 
    justifyContent: 'center', 
    borderBottomWidth: 6, 
    borderColor: 'transparent' 
  },
  connectionInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25
  },
  connectionInfo: {
    fontWeight: 'bold',
    alignSelf: 'center',
    fontSize: 18,
    marginVertical: 10,
    color: '#238923'
  },
  listContainer: {
    borderColor: '#ccc',
    borderTopWidth: 0.5
  },
  listItem: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderColor: '#ccc',
    borderBottomWidth: 0.5,
    justifyContent: 'center'
  },
  fixedFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },
  button: {
    height: 36,
    margin: 5,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#7B1FA2',
    fontWeight: 'bold',
    fontSize: 14
  },
  buttonRaised: {
    backgroundColor: '#7B1FA2',
    borderRadius: 2,
    elevation: 2
  },
  buttonTouchable: {
    padding: 16,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  list: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex:1,
  },
  bottomBar: {
    flexDirection: 'row',
    height: 30,
    backgroundColor:'green',
  },
  bottomText: {
    lineHeight: 30,
    fontWeight: '500'
  },
  buttons:{
    flex:1,
    textAlign:'center',
    color: 'white'
  }
})

export default SkolegasAccessControl

