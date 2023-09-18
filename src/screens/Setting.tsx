import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button} from 'react-native';
import {BarCodeScanner, BarCodeScannerResult} from 'expo-barcode-scanner';
import * as ImagePicker from 'expo-image-picker';
import {
  BarCodeScanningResult,
  Camera,
  CameraType,
  FlashMode,
} from 'expo-camera';
import {TouchableOpacity} from 'react-native';
import {Feather, Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useActivedColors} from '@/hooks';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ProjectsStackScreenProps} from '@/types';
import SafeView from '@/components/Layout/SafeView';
import {common} from '@/assets/styles';

const Setting = () => {
  const activedColors = useActivedColors();
  const navigation =
    useNavigation<ProjectsStackScreenProps<'JoinTask'>['navigation']>();
  const route = useRoute<ProjectsStackScreenProps<'JoinTask'>['route']>();

  const [data, setData] = useState('');
  const [type, setType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{textAlign: 'center'}}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const openImage = async () => {
    try {
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          quality: 1,
        });

        if (!result.canceled) {
          const uri = result.assets[0].uri;

          const results = await BarCodeScanner.scanFromURLAsync(uri);
          setData(results[0].data);
        }
      }
    } catch (error) {
      console.debug(error);
    }
  };

  function toggleCameraType() {
    setType(type == CameraType.back ? CameraType.front : CameraType.back);
  }

  const toggleFlash = () => {
    if (type == CameraType.back) {
      setFlashMode(
        flashMode == FlashMode.off ? FlashMode.torch : FlashMode.off,
      );
    } else {
      setFlashMode(FlashMode.off);
    }
  };

  const handleBarCodeScanned = ({data}: BarCodeScanningResult) => {
    setData(data);
  };

  return (
    <View style={{flex: 1, width: '100%'}}>
      <Camera
        style={styles.camera}
        type={type}
        flashMode={flashMode}
        ratio="16:9"
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
        onBarCodeScanned={handleBarCodeScanned}></Camera>
      <SafeView
        style={{
          paddingHorizontal: 16,
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
        }}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
          }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            style={[styles.button]}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleFlash}
            style={[styles.button]}>
            <Ionicons
              name={
                flashMode == FlashMode.off
                  ? 'ios-flash-off-outline'
                  : 'ios-flash'
              }
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignSelf: 'flex-end',
            marginBottom: 20,
          }}>
          <TouchableOpacity activeOpacity={0.8} onPress={openImage} style={{}}>
            <View style={[styles.button]}>
              <MaterialIcons name="photo-library" size={24} color="#fff" />
            </View>
            <Text style={[common.small, {color: '#fff', textAlign: 'center'}]}>
              Library
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={toggleCameraType}>
            <View style={[styles.button]}>
              <Ionicons
                name="md-camera-reverse-outline"
                size={24}
                color="#fff"
              />
            </View>
            <Text style={[common.small, {color: '#fff', textAlign: 'center'}]}>
              Reverse
            </Text>
          </TouchableOpacity>
        </View>
      </SafeView>
    </View>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: '#00000040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
