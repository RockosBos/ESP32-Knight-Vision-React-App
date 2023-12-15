/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
	Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { Buffer } from 'buffer';
import {BleManager} from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import AxisPad from 'react-native-axis-pad';

let devices;
const buffer = Buffer.from([0, 0]);
const manager = new BleManager();
const value = "0";
let refreshing = false;


function App() {

	const [xValue, setXValue] = useState(0);
	const [yValue, setYValue] = useState(0);
	const [device, setDevice] = useState();
	const [serviceUUID, setServiceUUID] = useState("");
	const [charUUID, setCharUUID] = useState("");

	useEffect(() => {
		writeData();
	}, [xValue]);

	function scanDevices(){

		let serviceUUID = "", charUUID = "";
		console.log("Scanning Devices");
		manager.startDeviceScan(null, null, (error, device) => {
			if(device?.name == "MyESP32"){
				console.log("ESP Device Found");
				manager.stopDeviceScan();
				setDevice(device);
			}
		});
	}

	function updateValues(){
		if(device){
			device.connect()
			.then(device => {
				console.log("Device Connected");
				return device.discoverAllServicesAndCharacteristics()
			})
			.then(device => {
				console.log("Retrieving Device Info...");
				device.services().then(services => {
				const chars = [];

				console.log("Checking Services");
				services.forEach((service, i) => {
					if(i === services.length - 1){
						setServiceUUID(service.uuid);
						console.log("Checking Characteristics");
						service.characteristics().then(c => {
							chars.push(c);
							c.forEach((char, i) => {
								if(i === c.length - 1){
									setCharUUID(char.uuid);
								}
							})
						}).then(() => {
							console.log("Retrieved Id's!");
							console.log("ServiceID: " + serviceUUID + " | CharacteristicID: " + charUUID);
						});
					}

				})
			})
		}).catch(error => {
			// Handle errors
		})
		}
	}

	function writeData(){
		if(device){
			manager.writeCharacteristicWithoutResponseForDevice(device.id, serviceUUID, charUUID, base64.encode(xValue.toString()),
			).then(characteristic => {
				refreshing = false;
				console.log('Value changed to :', base64.decode(characteristic.value));
			});
		}
	}

  return (
    <SafeAreaView>

		<Button
			title="Connect"
			onPress={() => {
				scanDevices(); //usual call like vanilla javascript, but uses this operator
			}}                                 
        />
		<Button
			title="Update"
			onPress={() => {
				updateValues(); //usual call like vanilla javascript, but uses this operator
			}}                                 
        />
		<AxisPad
			style={styles.joystick}
			resetOnRelease={true}
			autoCenter={false}
			onValue={({ x, y }) => {
				// values are between -1 and 1
				setXValue(x);
				console.log(xValue);
				//setYValue(y);
			}}>
		</AxisPad>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  joystick: {
    alignItems: 'center',
    flex: 1
  },
});

export default App;