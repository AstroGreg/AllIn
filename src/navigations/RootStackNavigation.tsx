import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import SplashScreen from '../screens/splashScreen/SplashScreen';
import LoginScreen from '../screens/authFlow/loginScreen/LoginScreen';
import SignupScreen from '../screens/authFlow/signupScreen/SignupScreen';
import LanguageScreen from '../screens/authFlow/languageScreen/LanguageScreen';
import SelectLanguageScreen from '../screens/authFlow/selectLanguageScreen/SelectLanguageScreen';
import CreateProfileScreen from '../screens/authFlow/createProfileScreen/CreateProfileScreen';
import SelectEventScreen from '../screens/authFlow/selectEventScreen/SelectEventScreen';
import CompleteAthleteDetailsScreen from '../screens/authFlow/completeAthleteDetails/CompleteAthleteDetailsScreen';
import BottomTabBar from './BottomTabBar';
import AddTalentScreen from '../screens/authFlow/setUpTalent/AddTalentScreen';
import SelecteTalent from '../screens/authFlow/setUpTalent/performer/SelecteTalent';
import ChestDetails from '../screens/authFlow/setUpTalent/performer/ChestDetails';
import SelectEvents from '../screens/authFlow/setUpTalent/performer/SelectEvents';
import ViewSelectedTalent from '../screens/authFlow/setUpTalent/performer/ViewSelectedTalent';
import TalenetForPhotograph from '../screens/authFlow/setUpTalent/creater/TalenetForPhotograph';
import PhotographyName from '../screens/authFlow/setUpTalent/creater/PhotographyName';
import ViewPhotographProfile from '../screens/authFlow/setUpTalent/creater/ViewPhotographProfile';
import EventsScreen from '../screens/Events/EventsScreen';
import ParticipantScreen from '../screens/participant/ParticipantScreen';
import ChooseEventScreen from '../screens/chooseEvent/ChooseEventScreen';
import CongratulationsScreen from '../screens/congratulations/CongratulationsScreen';
import DownloadsScreens from '../screens/downloads/DownloadsScreens';
import Language from '../screens/menu/menuScreens/Language';
import DeleteAndPause from '../screens/menu/menuScreens/DeleteAndPause';
import PaymentMethod from '../screens/menu/menuScreens/PaymentMethod';
import AddNewCard from '../screens/menu/menuScreens/AddNewCard';
import ProfileSettings from '../screens/menu/menuScreens/ProfileSettings';
import EditProfile from '../screens/menu/menuScreens/EditProfile';
import EditBioScreens from '../screens/viewUserProfile/profileScreens/EditBioScreens';
import MediaScreens from '../screens/viewUserProfile/profileScreens/MediaScreens';
import PhotosScreen from '../screens/photos/PhotosScreen';
import VideoScreen from '../screens/videos/VideoScreen';
import UploadedImagesScreen from '../screens/upload/uploadScreens/UploadedImagesScreen';
import CreateCompetition from '../screens/upload/uploadScreens/CreateCompetition';
import SelectCategory from '../screens/upload/uploadScreens/SelectCategory';
import Videography from '../screens/search/searchScreens/Videography';
import VideosForEvent from '../screens/search/searchScreens/VideosForEvent';
import AllPhotosOfEvents from '../screens/search/searchScreens/AllPhotosOfEvents';
import AllVideosOfEvents from '../screens/search/searchScreens/AllVideosOfEvents';
import FrontFaceCaptureScreen from '../screens/search/searchScreens/FrontFaceCaptureScreen';
import LeftSideCaptureScreen from '../screens/search/searchScreens/LeftSideCaptureScreen';
import RightSideCaptureScreen from '../screens/search/searchScreens/RightSideCaptureScreen';
import NameThisFaceScreen from '../screens/search/searchScreens/NameThisFaceScreen';
import CompetitionDetailsScreen from '../screens/search/searchScreens/CompetitionDetailsScreen';
import Location from '../screens/menu/menuScreens/Location';
import Help from '../screens/menu/menuScreens/Help';
import TermsOfService from '../screens/menu/menuScreens/TermsOfService';
import Subscription from '../screens/menu/menuScreens/Subscription';
import ChangePassword from '../screens/menu/menuScreens/ChangePassword';
import ChangeUsername from '../screens/menu/menuScreens/ChangeUsername';
import ChangeNationality from '../screens/menu/menuScreens/ChangeNationality';
import DateOfBirth from '../screens/menu/menuScreens/DateOfBirth';
import UserProfileScreen from '../screens/userProfile/UserProfileScreen';
import ViewUserProfileScreen from '../screens/viewUserProfile/ViewUserProfileScreen';
import ViewUserCollectionsPhotosScreen from '../screens/viewUserCollectionsPhotos/ViewUserCollectionsPhotosScreen';
import ViewUserCollectionsVideosScreen from '../screens/viewUserCollectionsVideos/ViewUserCollectionsVideosScreen';
import ViewUserPostsViewAllScreen from '../screens/viewUserPostsViewAll/ViewUserPostsViewAllScreen';
import ViewUserBlogDetailsScreen from '../screens/viewUserBlogDetails/ViewUserBlogDetailsScreen';
import EditPhotoCollectionsScreen from '../screens/editPhotoCollections/EditPhotoCollectionsScreen';
import EditVideoCollectionsScreen from '../screens/editVideoCollections/EditVideoCollectionsScreen';
import PhotoDetailScreen from '../screens/photoDetail/PhotoDetailScreen';
import VideoPlayingScreen from '../screens/videoPlaying/VideoPlayingScreen';
import CreateNewPostScreen from '../screens/createNewPost/CreateNewPostScreen';
import AdvertisementScreen from '../screens/advertisement/AdvertisementScreen';
import CategorySelectionScreen from '../screens/categorySelection/CategorySelectionScreen';
import DocumentUploadScreen from '../screens/documentUpload/DocumentUploadScreen';
import FaceVerificationScreen from '../screens/faceVerification/FaceVerificationScreen';
import CreateGroupProfileScreen from '../screens/createGroupProfile/CreateGroupProfileScreen';
import CreatePhotographerProfileScreen from '../screens/createPhotographerProfile/CreatePhotographerProfileScreen';

const Stack = createNativeStackNavigator();
const RootStackNavigation = () => {
    const { colors, isDark } = useTheme();

    return (
        <Stack.Navigator
            initialRouteName={'SplashScreen'}
            screenOptions={{
                headerShown: false,
                statusBarBackgroundColor: colors.backgroundColor,
                statusBarStyle: isDark ? 'light' : 'dark',
                presentation: 'card',
                animationTypeForReplace: 'push',
            }}>
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="AdvertisementScreen" component={AdvertisementScreen} />
            <Stack.Screen name="CategorySelectionScreen" component={CategorySelectionScreen} />
            <Stack.Screen name="DocumentUploadScreen" component={DocumentUploadScreen} />
            <Stack.Screen name="FaceVerificationScreen" component={FaceVerificationScreen} />
            <Stack.Screen name="SelectLanguageScreen" component={SelectLanguageScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="CreateProfileScreen" component={CreateProfileScreen} />
            <Stack.Screen name="SelectEventScreen" component={SelectEventScreen} />
            <Stack.Screen name="CompleteAthleteDetailsScreen" component={CompleteAthleteDetailsScreen} />
            <Stack.Screen name="CreateGroupProfileScreen" component={CreateGroupProfileScreen} />
            <Stack.Screen name="CreatePhotographerProfileScreen" component={CreatePhotographerProfileScreen} />
            <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
            <Stack.Screen name="AddTalentScreen" component={AddTalentScreen} />
            <Stack.Screen name="SelecteTalent" component={SelecteTalent} />
            <Stack.Screen name="ChestDetails" component={ChestDetails} />
            <Stack.Screen name="SelectEvents" component={SelectEvents} />
            <Stack.Screen name="ViewSelectedTalent" component={ViewSelectedTalent} />
            <Stack.Screen name="TalenetForPhotograph" component={TalenetForPhotograph} />
            <Stack.Screen name="PhotographyName" component={PhotographyName} />
            <Stack.Screen name="ViewPhotographProfile" component={ViewPhotographProfile} />
            <Stack.Screen name="BottomTabBar" component={BottomTabBar} />
            <Stack.Screen name="EventsScreen" component={EventsScreen} />
            <Stack.Screen name="ParticipantScreen" component={ParticipantScreen} />
            <Stack.Screen name="ChooseEventScreen" component={ChooseEventScreen} />
            <Stack.Screen name="CongratulationsScreen" component={CongratulationsScreen} />
            <Stack.Screen name="DownloadsScreens" component={DownloadsScreens} />
            <Stack.Screen name="Language" component={Language} />
            <Stack.Screen name="DeleteAndPause" component={DeleteAndPause} />
            <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
            <Stack.Screen name="AddNewCard" component={AddNewCard} />
            <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="EditBioScreens" component={EditBioScreens} />
            <Stack.Screen name="MediaScreens" component={MediaScreens} />
            <Stack.Screen name="PhotosScreen" component={PhotosScreen} />
            <Stack.Screen name="VideoScreen" component={VideoScreen} />
            <Stack.Screen name="UploadedImagesScreen" component={UploadedImagesScreen} />
            <Stack.Screen name="CreateCompetition" component={CreateCompetition} />
            <Stack.Screen name="SelectCategory" component={SelectCategory} />
            <Stack.Screen name="Videography" component={Videography} />
            <Stack.Screen name="VideosForEvent" component={VideosForEvent} />
            <Stack.Screen name="AllPhotosOfEvents" component={AllPhotosOfEvents} />
            <Stack.Screen name="AllVideosOfEvents" component={AllVideosOfEvents} />
            <Stack.Screen name="FrontFaceCaptureScreen" component={FrontFaceCaptureScreen} />
            <Stack.Screen name="LeftSideCaptureScreen" component={LeftSideCaptureScreen} />
            <Stack.Screen name="RightSideCaptureScreen" component={RightSideCaptureScreen} />
            <Stack.Screen name="NameThisFaceScreen" component={NameThisFaceScreen} />
            <Stack.Screen name="CompetitionDetailsScreen" component={CompetitionDetailsScreen} />
            <Stack.Screen name="Location" component={Location} />
            <Stack.Screen name="Help" component={Help} />
            <Stack.Screen name="TermsOfService" component={TermsOfService} />
            <Stack.Screen name="Subscription" component={Subscription} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen name="ChangeUsername" component={ChangeUsername} />
            <Stack.Screen name="ChangeNationality" component={ChangeNationality} />
            <Stack.Screen name="DateOfBirth" component={DateOfBirth} />
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
            <Stack.Screen name="ViewUserProfileScreen" component={ViewUserProfileScreen} />
            <Stack.Screen name="ViewUserCollectionsPhotosScreen" component={ViewUserCollectionsPhotosScreen} />
            <Stack.Screen name="ViewUserCollectionsVideosScreen" component={ViewUserCollectionsVideosScreen} />
            <Stack.Screen name="ViewUserPostsViewAllScreen" component={ViewUserPostsViewAllScreen} />
            <Stack.Screen name="ViewUserBlogDetailsScreen" component={ViewUserBlogDetailsScreen} />
            <Stack.Screen name="EditPhotoCollectionsScreen" component={EditPhotoCollectionsScreen} />
            <Stack.Screen name="EditVideoCollectionsScreen" component={EditVideoCollectionsScreen} />
            <Stack.Screen name="PhotoDetailScreen" component={PhotoDetailScreen} />
            <Stack.Screen name="VideoPlayingScreen" component={VideoPlayingScreen} />
            <Stack.Screen name="CreateNewPostScreen" component={CreateNewPostScreen} />

        </Stack.Navigator>
    )
}

export default RootStackNavigation