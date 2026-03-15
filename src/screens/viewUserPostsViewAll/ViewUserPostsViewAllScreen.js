import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { createStyles } from './ViewUserPostsViewAllScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const ViewUserPostsViewAllScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const posts = [
        {
            id: 1,
            type: 'single',
            title: 'IFAM Outdoor Oordegem',
            date: '09/08/2025',
            description: "Elias took part in the 800m and achieved a time close to his best 1'50\"99. For Lode it was a disappointing first half of his match DNF in the 5000m",
            image: Images.photo1,
        },
        {
            id: 2,
            type: 'single',
            title: 'BK 10000m AC Duffel',
            date: '09/06/2025',
            description: "This race meant everything to me. Running the European Championships on home soil, with my family and friends lining",
            image: Images.photo3,
        },
        {
            id: 3,
            type: 'grid',
            title: 'BK AC Brussels 02',
            date: '03/08/2025',
            description: "Kobe won silver in the 5000m and Elias ran a silver medal in the 1500m a very creditable fifth place.",
            images: [Images.photo4, Images.photo5, Images.photo6, Images.photo7],
        },
        {
            id: 4,
            type: 'single',
            title: 'BK 10000m AC Duffel',
            date: '09/06/2025',
            description: "This race meant everything to me. Running the European Championships on home soil, with my family and friends lining",
            image: Images.photo3,
        },
        {
            id: 5,
            type: 'grid',
            title: 'BK AC Brussels 02',
            date: '03/08/2025',
            description: "Kobe won silver in the 5000m and Elias ran a silver medal in the 1500m a very creditable fifth place.",
            images: [Images.photo4, Images.photo5, Images.photo6, Images.photo7],
        },
        {
            id: 6,
            type: 'single',
            title: 'BK 10000m AC Duffel',
            date: '09/06/2025',
            description: "This race meant everything to me. Running the European Championships on home soil, with my family and friends lining",
            image: Images.photo1,
        },
    ];
    const renderPostCard = (post) => (_jsxs(View, Object.assign({ style: Styles.postCard }, { children: [_jsxs(View, { children: [post.type === 'single' ? (_jsx(View, Object.assign({ style: Styles.postImageContainer }, { children: _jsx(FastImage, { source: post.image, style: Styles.postImage, resizeMode: "cover" }) }))) : (_jsxs(View, Object.assign({ style: Styles.postGridContainer }, { children: [_jsxs(View, Object.assign({ style: Styles.postGridRow }, { children: [_jsx(FastImage, { source: post.images[0], style: [Styles.postGridImage, Styles.postGridImageTopLeft], resizeMode: "cover" }), _jsx(FastImage, { source: post.images[1], style: [Styles.postGridImage, Styles.postGridImageTopRight], resizeMode: "cover" })] })), _jsxs(View, Object.assign({ style: Styles.postGridRow }, { children: [_jsx(FastImage, { source: post.images[2], style: Styles.postGridImage, resizeMode: "cover" }), _jsx(FastImage, { source: post.images[3], style: Styles.postGridImage, resizeMode: "cover" })] }))] }))), _jsxs(View, Object.assign({ style: Styles.postInfoBar }, { children: [_jsx(Text, Object.assign({ style: Styles.postTitle }, { children: post.title })), _jsx(Text, Object.assign({ style: Styles.postDate }, { children: post.date }))] }))] }), _jsx(Text, Object.assign({ style: Styles.postDescription }, { children: post.description })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.shareButton }, { children: [_jsx(Text, Object.assign({ style: Styles.shareButtonText }, { children: t('Share') })), _jsx(Image, { source: Icons.ShareBlue, style: { width: 18, height: 18, tintColor: '#FFFFFF' } })] }))] }), post.id));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Posts') })), _jsx(View, { style: [Styles.headerButton, { opacity: 0 }] })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsx(View, Object.assign({ style: Styles.sectionHeader }, { children: _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Posts') })) })), _jsx(SizeBox, { height: 24 }), _jsx(View, Object.assign({ style: Styles.postsContainer }, { children: posts.map(renderPostCard) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default ViewUserPostsViewAllScreen;
