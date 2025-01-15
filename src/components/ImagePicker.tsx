import React, {useCallback, useState} from 'react';
import {
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImageLibrary from 'react-native-image-picker';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

const ImagePicker = () => {
  const [pickerResponse, setPickerResponse] = useState<string>('');

  const onImageGalleryClick = useCallback(() => {
    console.log('entered');

    ImageLibrary.launchImageLibrary(
      {
        selectionLimit: 1,
        mediaType: 'photo',
        includeBase64: true,
      },
      res => {
        if (res.didCancel) {
          console.log('User cancelled');
        } else if (res.errorCode) {
          console.log('ImagePickerError: ', res.errorMessage);
        } else {
          console.log(res, 'result');
          setPickerResponse(String(res.assets ? res.assets[0].uri : ''));
        }
      },
    );
  }, []);

  const onCameraClick = useCallback(async () => {
    if (!(await hasCameraPermission())) return;
    ImageLibrary.launchCamera(
      {
        mediaType: 'photo',
        includeBase64: true,
      },
      res => {
        if (res.didCancel) {
          console.log('User cancelled');
        } else if (res.errorCode) {
          console.log('ImagePickerError: ', res.errorMessage);
        } else {
          console.log(res, 'result');
          setPickerResponse(String(res.assets ? res.assets[0].uri : ''));
        }
      },
    );
  }, []);

  const hasCameraPermission = async () => {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA;
    const result = await check(permission);
    switch (result) {
      case 'unavailable':
        Alert.alert('Sorry', 'This Feature is no available');
        return false;
      case 'blocked':
        Alert.alert('Sorry', 'This Feature is no available');
        return false;
      case 'denied':
        const isGranted = await request(permission);
        return isGranted === 'granted';
      default:
        return true;
    }
  };

  return (
    <View
      style={{
        width: responsiveWidth(100),
        height: responsiveHeight(100),
      }}>
      <View style={{flex: 1, justifyContent: 'space-around'}}>
        <TouchableOpacity
          onPress={onCameraClick}
          style={{backgroundColor: 'red', width: 100}}>
          <Text>Access Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onImageGalleryClick}
          style={{backgroundColor: 'green', width: 100}}>
          <Text>Access Gallery</Text>
          {pickerResponse && (
            <Image source={{uri: pickerResponse}} width={100} height={100} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImagePicker;
