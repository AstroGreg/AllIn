import { Image, Dimensions, View } from 'react-native';
import Styles from './SplashStyles';
import Images from '../../constants/Images';
import { useEffect } from 'react';

const SplashScreen = ({ navigation }: any) => {
    const { width, height } = Dimensions.get('window');

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.navigate('LoginScreen');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={Styles.mainContainer}>
            <Image
                source={Images.logo}
                style={{ height: height * 0.3, width: width * 0.6 }}
            />
        </View>
    );
};

export default SplashScreen;
