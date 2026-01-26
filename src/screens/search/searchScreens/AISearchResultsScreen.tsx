import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {ArrowLeft2, Notification, ArrowRight} from 'iconsax-react-nativejs';
import Icons from '../../../constants/Icons';
import {createStyles} from './AISearchResultsScreenStyles';

interface PhotoResult {
  id: number;
  image: string;
  price: string;
  resolution: string;
}

interface PhotoGroup {
  id: number;
  photos: PhotoResult[];
}

const AISearchResultsScreen = ({navigation, route}: any) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const matchedCount = route?.params?.matchedCount || 5;

  // Mock data for photo results
  const photoGroups: PhotoGroup[] = [
    {
      id: 1,
      photos: [
        {
          id: 1,
          image:
            'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
          price: '€0,10',
          resolution: '3840x2160',
        },
        {
          id: 2,
          image:
            'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400',
          price: '€0,15',
          resolution: '3840x2160',
        },
      ],
    },
    {
      id: 2,
      photos: [
        {
          id: 3,
          image:
            'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
          price: '€0,10',
          resolution: '3840x2160',
        },
        {
          id: 4,
          image:
            'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400',
          price: '€0,15',
          resolution: '3840x2160',
        },
      ],
    },
    {
      id: 3,
      photos: [
        {
          id: 5,
          image:
            'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
          price: '€0,10',
          resolution: '3840x2160',
        },
        {
          id: 6,
          image:
            'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400',
          price: '€0,15',
          resolution: '3840x2160',
        },
      ],
    },
  ];

  const renderPhotoCard = (photo: PhotoResult) => (
    <View key={photo.id} style={styles.photoCard}>
      <FastImage
        source={{uri: photo.image}}
        style={styles.photoImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <SizeBox height={10} />
      <View style={styles.photoInfo}>
        <View style={styles.photoLeftInfo}>
          <Text style={styles.priceText}>{photo.price}</Text>
          <SizeBox height={10} />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PhotoDetailScreen', {photoId: photo.id})
            }>
            <LinearGradient
              colors={['#155DFC', '#7F22FE']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View</Text>
              <ArrowRight size={13} color="#FFFFFF" variant="Linear" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.photoRightInfo}>
          <Text style={styles.resolutionText}>{photo.resolution}</Text>
          <SizeBox height={10} />
          <TouchableOpacity style={styles.downloadButton}>
            <Icons.DownloadBlue width={16} height={16} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderPhotoGroup = (group: PhotoGroup) => (
    <View key={group.id} style={styles.photoGroupWrapper}>
      <LinearGradient
        colors={['#155DFC', '#7F22FE']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.photoGroupGradientBorder}
      />
      <View style={styles.photoGroupCard}>
        <View style={styles.photoGroupRow}>
          {group.photos.map(renderPhotoCard)}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <SizeBox height={insets.top} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('NotificationsScreen')}>
          <Notification
            size={24}
            color={colors.primaryColor}
            variant="Linear"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SizeBox height={16} />

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Searched results</Text>
          <View style={styles.resultsBadge}>
            <MaskedView
              maskElement={
                <Text style={styles.resultsBadgeText}>
                  {matchedCount} Results
                </Text>
              }>
              <LinearGradient
                colors={['#155DFC', '#7F22FE']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                <Text style={styles.resultsBadgeTextHidden}>
                  {matchedCount} Results
                </Text>
              </LinearGradient>
            </MaskedView>
          </View>
        </View>

        <SizeBox height={24} />

        {/* Photo Groups */}
        {photoGroups.map(renderPhotoGroup)}

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>
    </View>
  );
};

export default AISearchResultsScreen;
