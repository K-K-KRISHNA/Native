import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import SampleFlatlist from './src/components/SampleFlatlist';

const App = () => {
  useEffect(()=>{
    SplashScreen.hide();
  },[]);
  return (
    <SafeAreaView>
    <SampleFlatlist/>
    </SafeAreaView>
  )
}

export default App
