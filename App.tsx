import React, { useEffect } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

const App = () => {
  useEffect(()=>{
    SplashScreen.hide();
  },[]);
  return (
    <SafeAreaView>
    <View>
      <Text>App</Text>
    </View>
    </SafeAreaView>
  )
}

export default App
