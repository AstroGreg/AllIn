import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Colors from '../constants/Colors';
import SplashScreen from '../screens/splashScreen/SplashScreen';
import LoginScreen from '../screens/authFlow/loginScreen/LoginScreen';
import SignupScreen from '../screens/authFlow/signupScreen/SignupScreen';
import LanguageScreen from '../screens/authFlow/languageScreen/LanguageScreen';
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
import EditBioScreens from '../screens/profile/profileScreens/EditBioScreens';
import MediaScreens from '../screens/profile/profileScreens/MediaScreens';
import PhotosScreen from '../screens/photos/PhotosScreen';
import VideoScreen from '../screens/videos/VideoScreen';
import UploadedImagesScreen from '../screens/upload/uploadScreens/UploadedImagesScreen';
import CreateEvent from '../screens/upload/uploadScreens/CreateEvent';
import SelectCategory from '../screens/upload/uploadScreens/SelectCategory';
import Videography from '../screens/search/searchScreens/Videography';
import VideosForEvent from '../screens/search/searchScreens/VideosForEvent';
import AllPhotosOfEvents from '../screens/search/searchScreens/AllPhotosOfEvents';
import AllVideosOfEvents from '../screens/search/searchScreens/AllVideosOfEvents';
import Location from '../screens/menu/menuScreens/Location';
import UserProfileScreen from '../screens/userProfile/UserProfileScreen';

const Stack = createNativeStackNavigator();
const RootStackNavigation = () => {

    return (
        <Stack.Navigator
            initialRouteName={'SplashScreen'}
            screenOptions={{
                headerShown: false,
                statusBarBackgroundColor: Colors.whiteColor,
                statusBarStyle: 'dark',
                presentation: 'card',
                animationTypeForReplace: 'push',
            }}>
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
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
            <Stack.Screen name="CreateEvent" component={CreateEvent} />
            <Stack.Screen name="SelectCategory" component={SelectCategory} />
            <Stack.Screen name="Videography" component={Videography} />
            <Stack.Screen name="VideosForEvent" component={VideosForEvent} />
            <Stack.Screen name="AllPhotosOfEvents" component={AllPhotosOfEvents} />
            <Stack.Screen name="AllVideosOfEvents" component={AllVideosOfEvents} />
            <Stack.Screen name="Location" component={Location} />
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />

        </Stack.Navigator>
    )
}

export default RootStackNavigation