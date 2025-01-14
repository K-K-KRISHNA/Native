import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
} from 'react-native-permissions';
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import FeatherIcons from 'react-native-vector-icons/Feather';
import RNFetchBlob from 'rn-fetch-blob';

type ApiResponse<BEData> = {
  data: BEData;
  status: 'INITIAL' | 'SUCCCESS' | 'FAIL' | 'LOADING';
  errorMessage: string;
};

type Product = {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
};

const SampleFlatlist = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [apiProducts, setApiProducts] = useState<ApiResponse<Product[]>>({
    data: [],
    status: 'INITIAL',
    errorMessage: '',
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const fetchMoreProducts = () => {
    const newPage = page + 1;
    if (newPage < 5) {
      setPage(newPage);
      fetchProducts(newPage);
    }
  };

  const fetchProducts = async (page = 1) => {
    setApiProducts(prev => ({
      ...prev,
      status: 'LOADING',
    }));
    try {
      const response = await fetch(
        `https://picsum.photos/v2/list?page=${page}&limit=10`,
      );
      const data = await response.json();
      setApiProducts({
        data: [...apiProducts.data, ...data],
        status: 'SUCCCESS',
        errorMessage: '',
      });
      if (page === 1) {
        setProducts([...data]);
      } else setProducts([...products, ...data]);
    } catch (errorMessage) {
      setApiProducts({
        data: [],
        status: 'FAIL',
        errorMessage: String(errorMessage),
      });
    }
  };

  const actualDownload = async (url: string, index: string) => {
    const havePermission = await checkPermission();
    console.log(havePermission, 'permission');
    if (!havePermission) return;
    const {dirs} = RNFetchBlob.fs;
    const dirToSave =
      Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
    const configfb = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: `image-${index}.jpg`,
        path: `${dirs.DownloadDir}/image-${index}.jpg`,
      },
      useDownloadManager: true,
      notification: true,
      mediaScannable: true,
      title: 'image-${index}.jpg',
      path: `${dirToSave}/image-${index}.jpg`,
    };
    const configOptions = Platform.select({
      ios: configfb,
      android: configfb,
    });

    RNFetchBlob.config(configOptions || {})
      .fetch('GET', url, {})
      .then(res => {
        if (Platform.OS === 'ios') {
          RNFetchBlob.fs.writeFile(configfb.path, res.data, 'base64');
          RNFetchBlob.ios.previewDocument(configfb.path);
        }
        if (Platform.OS === 'android') {
          console.log('file downloaded');
        }
      })
      .catch(e => {
        console.log('invoice Download==>', e);
      });
  };

  const checkPermission = async () => {
    const requiredPermission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY
        : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
    if (Platform.OS === 'android' && Platform.Version > 29) {
      return true;
    }
    const isGranted = await check(requiredPermission);
    switch (isGranted) {
      case 'unavailable':
        Alert.alert('Sorry', 'This is feature not available');
        return false;
      case 'blocked':
        Alert.alert('Oops!', 'We Need Write Storage Access Please Grant', [
          {
            text: 'Cancel',
          },
          {
            text: 'Open Settings',
            onPress: () => openSettings(),
          },
        ]);
        return false;
      case 'denied':
        const result = await request(requiredPermission);
        if (result === 'granted') {
          return true;
        }
        return false;
      default:
        return true;
    }
  };

  return (
    <View
      style={{
        width: responsiveScreenWidth(100),
        height: responsiveScreenHeight(100),
        justifyContent: 'center',
        alignItems: 'center',
        padding: responsiveScreenWidth(15),
      }}>
      {products.length === 0 && (
        <TouchableOpacity
          onPress={() =>
            products.length > 0 ? fetchMoreProducts() : fetchProducts()
          }
          style={{
            backgroundColor: 'red',
            padding: 5,
            width: 120,
            borderRadius: 10,
          }}>
          <Text
            style={{color: 'white', textAlign: 'center', fontWeight: '700'}}>
            {products.length > 0 ? 'Get More Products' : 'Get Products...'}
          </Text>
        </TouchableOpacity>
      )}
      <FlatList
        ListFooterComponent={
          apiProducts.status === 'LOADING' ? <ActivityIndicator /> : null
        }
        refreshing={isRefreshing}
        onRefresh={() => {
          fetchProducts(1);
          setPage(1);
        }}
        data={products}
        keyExtractor={item => item.id}
        onEndReachedThreshold={1}
        onEndReached={fetchMoreProducts}
        maxToRenderPerBatch={10}
        renderItem={({item}) => {
          return (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}>
              <Image
                source={{uri: item.download_url}}
                style={{width: '100%', height: 200}}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center',
                }}>
                <View style={{maxWidth: '50%'}}>
                  <Text>ID: {item.id}</Text>
                  <Text style={{width: '100%'}}>Author: {item.author}</Text>
                  <Text>dn: {`${item.width} X ${item.height}`}</Text>
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    actualDownload(item.download_url, item.id);
                  }}>
                  <FeatherIcons name="download" size={25} />
                  <Text style={{fontWeight: '700'}}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default SampleFlatlist;
