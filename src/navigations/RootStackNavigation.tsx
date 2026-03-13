import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SplashScreen from '../screens/splashScreen/SplashScreen';
import LoginScreen from '../screens/authFlow/loginScreen/LoginScreen';
import LanguageScreen from '../screens/authFlow/languageScreen/LanguageScreen';
import SelectLanguageScreen from '../screens/authFlow/selectLanguageScreen/SelectLanguageScreen';
import CreateProfileScreen from '../screens/authFlow/createProfileScreen/CreateProfileScreen';
import SelectEventScreen from '../screens/authFlow/selectEventScreen/SelectEventScreen';
import CompleteAthleteDetailsScreen from '../screens/authFlow/completeAthleteDetails/CompleteAthleteDetailsScreen';
import CompleteSupportDetailsScreen from '../screens/authFlow/completeSupportDetails/CompleteSupportDetailsScreen';
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
import ChooseEventScreen from '../screens/chooseCompetition/ChooseCompetitionScreen';
import CongratulationsScreen from '../screens/congratulations/CongratulationsScreen';
import Language from '../screens/menu/menuScreens/Language';
import DeleteAndPause from '../screens/menu/menuScreens/DeleteAndPause';
import PaymentMethod from '../screens/menu/menuScreens/PaymentMethod';
import AddNewCard from '../screens/menu/menuScreens/AddNewCard';
import ProfileSettings from '../screens/menu/menuScreens/ProfileSettings';
import AthleteDetailsHub from '../screens/menu/menuScreens/AthleteDetailsHub';
import FacialRecognitionSettings from '../screens/menu/menuScreens/FacialRecognitionSettings';
import EditProfile from '../screens/menu/menuScreens/EditProfile';
import EditBioScreens from '../screens/viewUserProfile/profileScreens/EditBioScreens';
import MediaScreens from '../screens/viewUserProfile/profileScreens/MediaScreens';
import PhotosScreen from '../screens/photos/PhotosScreen';
import VideoScreen from '../screens/videos/VideoScreen';
import UploadedImagesScreen from '../screens/upload/uploadScreens/UploadedImagesScreen';
import CreateCompetition from '../screens/upload/uploadScreens/CreateCompetition';
import SelectCategory from '../screens/upload/uploadScreens/SelectCategory';
import Videography from '../screens/search/searchScreens/Videography';
import VideosForEvent from '../screens/search/searchScreens/VideosForCompetition';
import AllPhotosOfEvents from '../screens/search/searchScreens/AllPhotosOfCompetitions';
import AllVideosOfEvents from '../screens/search/searchScreens/AllVideosOfCompetitions';
import FrontFaceCaptureScreen from '../screens/search/searchScreens/FrontFaceCaptureScreen';
import SearchFaceCaptureScreen from '../screens/search/searchScreens/SearchFaceCaptureScreen';
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
import ChestNumberSettings from '../screens/menu/menuScreens/ChestNumberSettings';
import TrackFieldSettings from '../screens/menu/menuScreens/TrackFieldSettings';
import RoadTrailSettings from '../screens/menu/menuScreens/RoadTrailSettings';
import NameSettings from '../screens/menu/menuScreens/NameSettings';
import ManageProfiles from '../screens/menu/menuScreens/ManageProfiles';
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
import FaceVerificationScreen from '../screens/faceVerification/FaceVerificationScreen';
import CreateGroupProfileScreen from '../screens/createGroupProfile/CreateGroupProfileScreen';
import CreatePhotographerProfileScreen from '../screens/createPhotographerProfile/CreatePhotographerProfileScreen';
import SelectCompetitionScreen from '../screens/upload/SelectCompetitionScreen';
import UploadCompetitionDetailsScreen from '../screens/upload/CompetitionDetailsScreen';
import UploadDetailsScreen from '../screens/upload/UploadDetailsScreen';
import UploadSummaryScreen from '../screens/upload/UploadSummaryScreen';
import UploadProgressScreen from '../screens/upload/UploadProgressScreen';
import EventSummaryScreen from '../screens/competitionSummary/CompetitionSummaryScreen';
import ContextSearchLoadingScreen from '../screens/search/searchScreens/ContextSearchLoadingScreen';
import AISearchResultsScreen from '../screens/search/searchScreens/AISearchResultsScreen';
import CombinedSearchScreen from '../screens/search/searchScreens/CombinedSearchScreen';
import SearchScreen from '../screens/search/SearchScreen';
import FullPageImageViewerScreen from '../screens/fullPageImageViewer/FullPageImageViewerScreen';
import GroupInviteLinkScreen from '../screens/groupInviteLink/GroupInviteLinkScreen';
import E2ERegressionScenarioScreen from '../screens/e2e/E2ERegressionScenarioScreen';
import HomeScreen from '../screens/home/HomeScreen';
import HubScreen from '../screens/hub/HubScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import MenuScreen from '../screens/menu/MenuScreen';
import GroupProfileScreen from '../screens/groupProfile/GroupProfileScreen';
import GroupManageScreen from '../screens/groupManage/GroupManageScreen';
import GroupCollectionsManageScreen from '../screens/groupCollectionsManage/GroupCollectionsManageScreen';
import ProfileBlogEditorScreen from '../screens/profileBlog/ProfileBlogEditorScreen';
import ProfileTimelineEditScreen from '../screens/profileTimeline/ProfileTimelineEditScreen';

const Stack = createNativeStackNavigator();
const RootStackNavigation = ({
    initialRouteName,
    initialRouteParams,
}: {
    initialRouteName?: string;
    initialRouteParams?: Record<string, any>;
}) => {
    const { colors, isDark } = useTheme();
    const resolvedInitialRouteName = typeof initialRouteName === 'string' && initialRouteName.trim().length > 0
        ? initialRouteName
        : 'SplashScreen';
    const getInitialParams = (screenName: string) =>
        resolvedInitialRouteName === screenName ? initialRouteParams : undefined;

    return (
        <Stack.Navigator
            initialRouteName={resolvedInitialRouteName}
            screenOptions={{
                headerShown: false,
                statusBarBackgroundColor: colors.backgroundColor,
                statusBarStyle: isDark ? 'light' : 'dark',
                presentation: 'card',
                animationTypeForReplace: 'push',
                gestureEnabled: true,
                fullScreenGestureEnabled: Platform.OS === 'ios',
            }}>
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="AdvertisementScreen" component={AdvertisementScreen} />
            <Stack.Screen
                name="CategorySelectionScreen"
                component={CategorySelectionScreen}
                initialParams={getInitialParams('CategorySelectionScreen')}
            />
            <Stack.Screen name="FaceVerificationScreen" component={FaceVerificationScreen} />
            <Stack.Screen name="SelectLanguageScreen" component={SelectLanguageScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen
                name="CreateProfileScreen"
                component={CreateProfileScreen}
                initialParams={getInitialParams('CreateProfileScreen')}
            />
            <Stack.Screen
                name="SelectEventScreen"
                component={SelectEventScreen}
                initialParams={getInitialParams('SelectEventScreen')}
            />
            <Stack.Screen
                name="CompleteAthleteDetailsScreen"
                component={CompleteAthleteDetailsScreen}
                initialParams={getInitialParams('CompleteAthleteDetailsScreen')}
            />
            <Stack.Screen name="CompleteSupportDetailsScreen" component={CompleteSupportDetailsScreen} />
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
            <Stack.Screen name="Language" component={Language} />
            <Stack.Screen name="DeleteAndPause" component={DeleteAndPause} />
            <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
            <Stack.Screen name="AddNewCard" component={AddNewCard} />
            <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
            <Stack.Screen name="AthleteDetailsHub" component={AthleteDetailsHub} />
            <Stack.Screen name="FacialRecognitionSettings" component={FacialRecognitionSettings} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen
                name="EditBioScreens"
                component={EditBioScreens}
                initialParams={getInitialParams('EditBioScreens')}
            />
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
            <Stack.Screen name="SearchFaceCaptureScreen" component={SearchFaceCaptureScreen} />
            <Stack.Screen name="LeftSideCaptureScreen" component={LeftSideCaptureScreen} />
            <Stack.Screen name="RightSideCaptureScreen" component={RightSideCaptureScreen} />
            <Stack.Screen name="NameThisFaceScreen" component={NameThisFaceScreen} />
            <Stack.Screen name="CompetitionDetailsScreen" component={CompetitionDetailsScreen} />
            <Stack.Screen name="EventSummaryScreen" component={EventSummaryScreen} />
            <Stack.Screen name="Location" component={Location} />
            <Stack.Screen name="Help" component={Help} />
            <Stack.Screen name="TermsOfService" component={TermsOfService} />
            <Stack.Screen name="Subscription" component={Subscription} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen name="ChangeUsername" component={ChangeUsername} />
            <Stack.Screen name="ChangeNationality" component={ChangeNationality} />
            <Stack.Screen name="DateOfBirth" component={DateOfBirth} />
            <Stack.Screen name="ChestNumberSettings" component={ChestNumberSettings} />
            <Stack.Screen name="TrackFieldSettings" component={TrackFieldSettings} />
            <Stack.Screen name="RoadTrailSettings" component={RoadTrailSettings} />
            <Stack.Screen name="NameSettings" component={NameSettings} />
            <Stack.Screen name="ManageProfiles" component={ManageProfiles} />
            <Stack.Screen
                name="UserProfileScreen"
                component={UserProfileScreen}
                initialParams={getInitialParams('UserProfileScreen')}
            />
            <Stack.Screen
                name="RootUploadSelectCompetitionScreen"
                component={SelectCompetitionScreen}
                initialParams={getInitialParams('RootUploadSelectCompetitionScreen')}
            />
            <Stack.Screen
                name="RootUploadCompetitionDetailsScreen"
                component={UploadCompetitionDetailsScreen}
                initialParams={getInitialParams('RootUploadCompetitionDetailsScreen')}
            />
            <Stack.Screen
                name="UploadDetailsScreen"
                component={UploadDetailsScreen}
                initialParams={getInitialParams('UploadDetailsScreen')}
            />
            <Stack.Screen
                name="UploadSummaryScreen"
                component={UploadSummaryScreen}
                initialParams={getInitialParams('UploadSummaryScreen')}
            />
            <Stack.Screen
                name="UploadProgressScreen"
                component={UploadProgressScreen}
                initialParams={getInitialParams('UploadProgressScreen')}
            />
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
            <Stack.Screen name="ContextSearchLoadingScreen" component={ContextSearchLoadingScreen} />
            <Stack.Screen name="AISearchResultsScreen" component={AISearchResultsScreen} />
            <Stack.Screen
                name="AISearchScreen"
                component={CombinedSearchScreen}
                initialParams={getInitialParams('AISearchScreen')}
            />
            <Stack.Screen
                name="SearchScreen"
                component={SearchScreen}
                initialParams={getInitialParams('SearchScreen')}
            />
            <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                initialParams={getInitialParams('HomeScreen')}
            />
            <Stack.Screen
                name="HubScreen"
                component={HubScreen}
                initialParams={getInitialParams('HubScreen')}
            />
            <Stack.Screen
                name="NotificationsScreen"
                component={NotificationsScreen}
                initialParams={getInitialParams('NotificationsScreen')}
            />
            <Stack.Screen
                name="MenuScreen"
                component={MenuScreen}
                initialParams={getInitialParams('MenuScreen')}
            />
            <Stack.Screen
                name="GroupProfileScreen"
                component={GroupProfileScreen}
                initialParams={getInitialParams('GroupProfileScreen')}
            />
            <Stack.Screen
                name="GroupManageScreen"
                component={GroupManageScreen}
                initialParams={getInitialParams('GroupManageScreen')}
            />
            <Stack.Screen
                name="GroupCollectionsManageScreen"
                component={GroupCollectionsManageScreen}
                initialParams={getInitialParams('GroupCollectionsManageScreen')}
            />
            <Stack.Screen
                name="ProfileBlogEditorScreen"
                component={ProfileBlogEditorScreen}
                initialParams={getInitialParams('ProfileBlogEditorScreen')}
            />
            <Stack.Screen
                name="ProfileTimelineEditScreen"
                component={ProfileTimelineEditScreen}
                initialParams={getInitialParams('ProfileTimelineEditScreen')}
            />
            <Stack.Screen
                name="FullPageImageViewerScreen"
                component={FullPageImageViewerScreen}
                options={{
                    presentation: 'fullScreenModal',
                    animation: 'fade',
                }}
            />
            <Stack.Screen name="GroupInviteLinkScreen" component={GroupInviteLinkScreen} />
            <Stack.Screen
                name="E2ERegressionScenarioScreen"
                component={E2ERegressionScenarioScreen}
                initialParams={getInitialParams('E2ERegressionScenarioScreen')}
            />

        </Stack.Navigator>
    )
}

export default RootStackNavigation
