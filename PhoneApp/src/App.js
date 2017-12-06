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
  ActivityIndicator,
  Image,
  Linking,
  TextInput,
  AsyncStorage
} from 'react-native'

import QRCodeScanner from 'react-native-qrcode-scanner';
import Toast from '@remobile/react-native-toast'
import BluetoothSerial from 'react-native-bluetooth-serial'
import Modal from 'react-native-modal'
import { Buffer } from 'buffer'
global.Buffer = Buffer
const iconv = require('iconv-lite')

const Button = ({ title, onPress, style, textStyle }) =>
  <TouchableOpacity style={[ styles.button, style ]} onPress={onPress}>
    <Text style={[ styles.buttonText, textStyle ]}>{title.toUpperCase()}</Text>
  </TouchableOpacity>

const UserIDModal = ({isModalVisible, onUserIdSet, onCloseModal, currentUserId}) => 
  <View>
    <Modal isVisible={isModalVisible}>
      <View style={{ flex: 1, backgroundColor: "#fff", padding: 20, borderRadius: 10 }}>
        <View style={{alignItems: "center"}}>
          <Image style={{ resizeMode: 'contain', width: 100, height: 100, marginBottom: 20 }} source={require('./images/skolegas-small.png')} />
        </View>
        <Text style={{marginBottom: 20}}>Welcome to Skolegas' Access Control App!</Text>
        <Text style={{marginBottom: 20}}>To get started, please enter your User ID as previously registered in the system.</Text>
        <TextInput
              ref={input => { this.textInput = input }}
              style={{height: 40, borderWidth: 0}}
              onChangeText={(userId) => onUserIdSet(userId)}
              value={currentUserId}
              defaultValue="Enter User ID"
              keyboardType = "numeric"
              onFocus={() => this.textInput.clear() }
            />
        <Button
          title="Save"
          onPress={() => onCloseModal()}
         />
      </View>
    </Modal>
  </View>

const DeviceList = ({ pairedDevices, unpairedDevices, connectedId, showConnectedIcon, onDevicePress, onEnterPress, onLeavePress, timeoutSecs }) =>
  <ScrollView style={styles.container}>
    <View style={styles.listContainer}>
      {pairedDevices.map((device, i) => {
        return (
          <View style={styles.listItemWrapper} key={`${device.id}_${i}`}>
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
                </View>
              </View>
            </TouchableHighlight>
            {connectedId === device.id 
              ? (<View>
                  <Button
                      title="Enter Room"
                      onPress={() => onEnterPress()}
                   />
                  <Button
                      title="Leave Room"
                      onPress={() => onLeavePress()}
                   />
                   <Text style={{textAlign: 'right', marginRight: 20, paddingBottom: 10}}>Connection will timeout in: {timeoutSecs} seconds</Text>
                </View>)
              : null}
          </View>
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
      section: 0,
      userId: null,
      isModalVisible: false,
      timeoutSecs: 60,
      timeoutCounting: false
    }
  }

  componentWillMount () {
    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list(),
      AsyncStorage.getItem('userId')
    ])
    .then((values) => {
      const [ isEnabled, devices, userId ] = values
      this.setState({ isEnabled, devices, userId })
      if(!userId) {
        this.setState({isModalVisible: true})
      }
    })

    BluetoothSerial.on('bluetoothEnabled', () => Toast.showShortBottom('Bluetooth enabled'))
    BluetoothSerial.on('bluetoothDisabled', () => Toast.showShortBottom('Bluetooth disabled'))
    BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`))
    BluetoothSerial.on('connectionLost', () => {
      if (this.state.device) {
        Toast.showShortBottom(`Connection to device ${this.state.device.name} has been lost`)
      }
      this.setState({ connected: false, device: null })
    })

    // BluetoothSerial.on('data', (data) => { 
    //   console.log('here 1', data); 
    //   Toast.showShortBottom(data);
    // });

    BluetoothSerial.withDelimiter('\n').then((res)=>{
      // console.log("delimiter setup",res);
      BluetoothSerial.on('read', (data)=>{
        var tData = data.data.split('\n')[0].toString().trim("\0");
        if(tData[0] === "\0") {
          tData = tData.substring(1)
        }
        Toast.showShortBottom(tData);
      })
    })

  }

  showBottom(message) {
    Toast.showWithOptions(
      {
        message: message,
        duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
        position: "bottom",
        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
      }
    );
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
      this.resetTimeoutSecs();
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
      this.resetTimeoutSecs();
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

  resetTimeoutSecs() {
    this.setState({timeoutSecs: 60});
    if(!this.state.timeoutCounting) {
      setTimeout(() => this.countTimeoutSecs(), 1000);
      this.setState({timeoutCounting: true})
    }
  }

  countTimeoutSecs() {
    var timeoutSecs = this.state.timeoutSecs - 1;
    this.setState({timeoutSecs});
    if(timeoutSecs > 0) {
      setTimeout(() => this.countTimeoutSecs(), 1000);
    } else {
      this.setState({timeoutCounting: false})
    }

  }

  render () {
    const activeTabStyle = { borderBottomWidth: 6, borderColor: '#932933' }
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <Text style={styles.heading}>Skolegas Access Control</Text>
          <TouchableHighlight
            onPress={() => this.setState({isModalVisible: true})}
          >
            <Text >User ID: {this.state.userId} </Text>
          </TouchableHighlight>
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
              onDevicePress={(device) => this.onDevicePress(device)}
              onEnterPress={() => this.write("1"+this.state.userId)}
              onLeavePress={() => this.write("0"+this.state.userId)}
              timeoutSecs={this.state.timeoutSecs}
             />
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

        { /*this.state.section === 0 && this.state.isEnabled
        ? (
          <View>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              onChangeText={(userId) => this.setState({userId})}
              value={this.state.userId}
            />
          </View>
        ) : null */}
        

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
              {/*Platform.OS === 'android' && this.state.isEnabled && !this.state.connected
              ? (
                <Button
                  title={this.state.discovering ? '... Discovering' : 'Discover devices'}
                  onPress={this.discoverUnpaired.bind(this)} />
              ) : null*/}
              {!this.state.connected
                ? (Platform.OS === 'android' && !this.state.isEnabled
                  ? (
                    <Button
                      title='Enable Bluetooth'
                      onPress={() => this.requestEnable()} />
                  ) : (
                    <Button
                      title='Disable Bluetooth'
                      onPress={() => this.disable()} />
                  )
                ) : null
              }
              
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
        <UserIDModal 
          isModalVisible={this.state.isModalVisible} 
          onUserIdSet={(userId) => { 
            this.setState({userId});
            AsyncStorage.setItem('userId', userId) ;
          }}
          onCloseModal={() => this.setState({isModalVisible: false})}
          currentUserId={this.state.userId}
        />
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
    color: '#932933'
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
    justifyContent: 'center'
  },
  listItemWrapper: {
    borderColor: '#ccc',
    borderBottomWidth: 0.5,
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
    color: '#932933',
    fontWeight: 'bold',
    fontSize: 14
  },
  buttonRaised: {
    backgroundColor: '#932933',
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

