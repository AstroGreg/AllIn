import { Image, View } from 'react-native';
import Styles from './SplashStyles';
import Images from '../../constants/Images';
import { useEffect } from 'react';

const SplashScreen = ({ navigation }: any) => {

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.navigate('SelectLanguageScreen');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={Styles.mainContainer}>
            <Image
                source={Images.logo}
                style={{ width: 150, height: 163 }}
            />
        </View>
    );
};

export default SplashScreen;
