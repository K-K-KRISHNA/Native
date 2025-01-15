import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import ImagePicker from './src/components/ImagePicker';

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <SafeAreaView>
      <ImagePicker />
    </SafeAreaView>
  );
};

export default App;
