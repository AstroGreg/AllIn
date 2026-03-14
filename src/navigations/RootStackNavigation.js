import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import VideoDetailsScreen from '../screens/videoDetails/VideoDetailsScreen';
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
const RootStackNavigation = ({ initialRouteName, initialRouteParams, }) => {
    const { colors, isDark } = useTheme();
    const resolvedInitialRouteName = typeof initialRouteName === 'string' && initialRouteName.trim().length > 0
        ? initialRouteName
        : 'SplashScreen';
    const getInitialParams = (screenName) => resolvedInitialRouteName === screenName ? initialRouteParams : undefined;
    return (_jsxs(Stack.Navigator, Object.assign({ initialRouteName: resolvedInitialRouteName, screenOptions: {
            headerShown: false,
            statusBarBackgroundColor: colors.backgroundColor,
            statusBarStyle: isDark ? 'light' : 'dark',
            presentation: 'card',
            animationTypeForReplace: 'push',
            gestureEnabled: true,
            fullScreenGestureEnabled: Platform.OS === 'ios',
        } }, { children: [_jsx(Stack.Screen, { name: "SplashScreen", component: SplashScreen, options: {
                    statusBarStyle: 'light',
                    statusBarBackgroundColor: colors.primaryColor,
                } }), _jsx(Stack.Screen, { name: "AdvertisementScreen", component: AdvertisementScreen }), _jsx(Stack.Screen, { name: "CategorySelectionScreen", component: CategorySelectionScreen, initialParams: getInitialParams('CategorySelectionScreen') }), _jsx(Stack.Screen, { name: "FaceVerificationScreen", component: FaceVerificationScreen }), _jsx(Stack.Screen, { name: "SelectLanguageScreen", component: SelectLanguageScreen }), _jsx(Stack.Screen, { name: "LoginScreen", component: LoginScreen }), _jsx(Stack.Screen, { name: "CreateProfileScreen", component: CreateProfileScreen, initialParams: getInitialParams('CreateProfileScreen') }), _jsx(Stack.Screen, { name: "SelectEventScreen", component: SelectEventScreen, initialParams: getInitialParams('SelectEventScreen') }), _jsx(Stack.Screen, { name: "CompleteAthleteDetailsScreen", component: CompleteAthleteDetailsScreen, initialParams: getInitialParams('CompleteAthleteDetailsScreen') }), _jsx(Stack.Screen, { name: "CompleteSupportDetailsScreen", component: CompleteSupportDetailsScreen }), _jsx(Stack.Screen, { name: "CreateGroupProfileScreen", component: CreateGroupProfileScreen }), _jsx(Stack.Screen, { name: "CreatePhotographerProfileScreen", component: CreatePhotographerProfileScreen }), _jsx(Stack.Screen, { name: "LanguageScreen", component: LanguageScreen }), _jsx(Stack.Screen, { name: "AddTalentScreen", component: AddTalentScreen }), _jsx(Stack.Screen, { name: "SelecteTalent", component: SelecteTalent }), _jsx(Stack.Screen, { name: "ChestDetails", component: ChestDetails }), _jsx(Stack.Screen, { name: "SelectEvents", component: SelectEvents }), _jsx(Stack.Screen, { name: "ViewSelectedTalent", component: ViewSelectedTalent }), _jsx(Stack.Screen, { name: "TalenetForPhotograph", component: TalenetForPhotograph }), _jsx(Stack.Screen, { name: "PhotographyName", component: PhotographyName }), _jsx(Stack.Screen, { name: "ViewPhotographProfile", component: ViewPhotographProfile }), _jsx(Stack.Screen, { name: "BottomTabBar", component: BottomTabBar }), _jsx(Stack.Screen, { name: "EventsScreen", component: EventsScreen }), _jsx(Stack.Screen, { name: "ParticipantScreen", component: ParticipantScreen }), _jsx(Stack.Screen, { name: "ChooseEventScreen", component: ChooseEventScreen }), _jsx(Stack.Screen, { name: "CongratulationsScreen", component: CongratulationsScreen }), _jsx(Stack.Screen, { name: "Language", component: Language }), _jsx(Stack.Screen, { name: "DeleteAndPause", component: DeleteAndPause }), _jsx(Stack.Screen, { name: "PaymentMethod", component: PaymentMethod }), _jsx(Stack.Screen, { name: "AddNewCard", component: AddNewCard }), _jsx(Stack.Screen, { name: "ProfileSettings", component: ProfileSettings }), _jsx(Stack.Screen, { name: "AthleteDetailsHub", component: AthleteDetailsHub }), _jsx(Stack.Screen, { name: "FacialRecognitionSettings", component: FacialRecognitionSettings }), _jsx(Stack.Screen, { name: "EditProfile", component: EditProfile }), _jsx(Stack.Screen, { name: "EditBioScreens", component: EditBioScreens, initialParams: getInitialParams('EditBioScreens') }), _jsx(Stack.Screen, { name: "MediaScreens", component: MediaScreens }), _jsx(Stack.Screen, { name: "PhotosScreen", component: PhotosScreen }), _jsx(Stack.Screen, { name: "VideoScreen", component: VideoScreen }), _jsx(Stack.Screen, { name: "UploadedImagesScreen", component: UploadedImagesScreen }), _jsx(Stack.Screen, { name: "CreateCompetition", component: CreateCompetition }), _jsx(Stack.Screen, { name: "SelectCategory", component: SelectCategory }), _jsx(Stack.Screen, { name: "Videography", component: Videography }), _jsx(Stack.Screen, { name: "VideosForEvent", component: VideosForEvent }), _jsx(Stack.Screen, { name: "AllPhotosOfEvents", component: AllPhotosOfEvents }), _jsx(Stack.Screen, { name: "AllVideosOfEvents", component: AllVideosOfEvents }), _jsx(Stack.Screen, { name: "FrontFaceCaptureScreen", component: FrontFaceCaptureScreen }), _jsx(Stack.Screen, { name: "SearchFaceCaptureScreen", component: SearchFaceCaptureScreen }), _jsx(Stack.Screen, { name: "LeftSideCaptureScreen", component: LeftSideCaptureScreen }), _jsx(Stack.Screen, { name: "RightSideCaptureScreen", component: RightSideCaptureScreen }), _jsx(Stack.Screen, { name: "NameThisFaceScreen", component: NameThisFaceScreen }), _jsx(Stack.Screen, { name: "CompetitionDetailsScreen", component: CompetitionDetailsScreen }), _jsx(Stack.Screen, { name: "EventSummaryScreen", component: EventSummaryScreen }), _jsx(Stack.Screen, { name: "Location", component: Location }), _jsx(Stack.Screen, { name: "Help", component: Help }), _jsx(Stack.Screen, { name: "TermsOfService", component: TermsOfService }), _jsx(Stack.Screen, { name: "Subscription", component: Subscription }), _jsx(Stack.Screen, { name: "ChangePassword", component: ChangePassword }), _jsx(Stack.Screen, { name: "ChangeUsername", component: ChangeUsername }), _jsx(Stack.Screen, { name: "ChangeNationality", component: ChangeNationality }), _jsx(Stack.Screen, { name: "DateOfBirth", component: DateOfBirth }), _jsx(Stack.Screen, { name: "ChestNumberSettings", component: ChestNumberSettings }), _jsx(Stack.Screen, { name: "TrackFieldSettings", component: TrackFieldSettings }), _jsx(Stack.Screen, { name: "RoadTrailSettings", component: RoadTrailSettings }), _jsx(Stack.Screen, { name: "NameSettings", component: NameSettings }), _jsx(Stack.Screen, { name: "ManageProfiles", component: ManageProfiles }), _jsx(Stack.Screen, { name: "UserProfileScreen", component: UserProfileScreen, initialParams: getInitialParams('UserProfileScreen') }), _jsx(Stack.Screen, { name: "RootUploadSelectCompetitionScreen", component: SelectCompetitionScreen, initialParams: getInitialParams('RootUploadSelectCompetitionScreen') }), _jsx(Stack.Screen, { name: "RootUploadCompetitionDetailsScreen", component: UploadCompetitionDetailsScreen, initialParams: getInitialParams('RootUploadCompetitionDetailsScreen') }), _jsx(Stack.Screen, { name: "UploadDetailsScreen", component: UploadDetailsScreen, initialParams: getInitialParams('UploadDetailsScreen') }), _jsx(Stack.Screen, { name: "UploadSummaryScreen", component: UploadSummaryScreen, initialParams: getInitialParams('UploadSummaryScreen') }), _jsx(Stack.Screen, { name: "UploadProgressScreen", component: UploadProgressScreen, initialParams: getInitialParams('UploadProgressScreen') }), _jsx(Stack.Screen, { name: "ViewUserProfileScreen", component: ViewUserProfileScreen }), _jsx(Stack.Screen, { name: "ViewUserCollectionsPhotosScreen", component: ViewUserCollectionsPhotosScreen }), _jsx(Stack.Screen, { name: "ViewUserCollectionsVideosScreen", component: ViewUserCollectionsVideosScreen }), _jsx(Stack.Screen, { name: "ViewUserPostsViewAllScreen", component: ViewUserPostsViewAllScreen }), _jsx(Stack.Screen, { name: "ViewUserBlogDetailsScreen", component: ViewUserBlogDetailsScreen }), _jsx(Stack.Screen, { name: "EditPhotoCollectionsScreen", component: EditPhotoCollectionsScreen }), _jsx(Stack.Screen, { name: "EditVideoCollectionsScreen", component: EditVideoCollectionsScreen }), _jsx(Stack.Screen, { name: "PhotoDetailScreen", component: PhotoDetailScreen }), _jsx(Stack.Screen, { name: "VideoDetailsScreen", component: VideoDetailsScreen, initialParams: getInitialParams('VideoDetailsScreen') }), _jsx(Stack.Screen, { name: "VideoPlayingScreen", component: VideoPlayingScreen }), _jsx(Stack.Screen, { name: "CreateNewPostScreen", component: CreateNewPostScreen }), _jsx(Stack.Screen, { name: "ContextSearchLoadingScreen", component: ContextSearchLoadingScreen }), _jsx(Stack.Screen, { name: "AISearchResultsScreen", component: AISearchResultsScreen }), _jsx(Stack.Screen, { name: "AISearchScreen", component: CombinedSearchScreen, initialParams: getInitialParams('AISearchScreen') }), _jsx(Stack.Screen, { name: "SearchScreen", component: SearchScreen, initialParams: getInitialParams('SearchScreen') }), _jsx(Stack.Screen, { name: "HomeScreen", component: HomeScreen, initialParams: getInitialParams('HomeScreen') }), _jsx(Stack.Screen, { name: "HubScreen", component: HubScreen, initialParams: getInitialParams('HubScreen') }), _jsx(Stack.Screen, { name: "NotificationsScreen", component: NotificationsScreen, initialParams: getInitialParams('NotificationsScreen') }), _jsx(Stack.Screen, { name: "MenuScreen", component: MenuScreen, initialParams: getInitialParams('MenuScreen') }), _jsx(Stack.Screen, { name: "GroupProfileScreen", component: GroupProfileScreen, initialParams: getInitialParams('GroupProfileScreen') }), _jsx(Stack.Screen, { name: "GroupManageScreen", component: GroupManageScreen, initialParams: getInitialParams('GroupManageScreen') }), _jsx(Stack.Screen, { name: "GroupCollectionsManageScreen", component: GroupCollectionsManageScreen, initialParams: getInitialParams('GroupCollectionsManageScreen') }), _jsx(Stack.Screen, { name: "ProfileBlogEditorScreen", component: ProfileBlogEditorScreen, initialParams: getInitialParams('ProfileBlogEditorScreen') }), _jsx(Stack.Screen, { name: "ProfileTimelineEditScreen", component: ProfileTimelineEditScreen, initialParams: getInitialParams('ProfileTimelineEditScreen') }), _jsx(Stack.Screen, { name: "FullPageImageViewerScreen", component: FullPageImageViewerScreen, options: {
                    presentation: 'fullScreenModal',
                    animation: 'fade',
                } }), _jsx(Stack.Screen, { name: "GroupInviteLinkScreen", component: GroupInviteLinkScreen }), _jsx(Stack.Screen, { name: "E2ERegressionScenarioScreen", component: E2ERegressionScenarioScreen, initialParams: getInitialParams('E2ERegressionScenarioScreen') })] })));
};
export default RootStackNavigation;
