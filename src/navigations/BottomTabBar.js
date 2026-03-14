import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icons from "../constants/Icons";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import HomeScreen from "../screens/home/HomeScreen";
import HubScreen from "../screens/hub/HubScreen";
import MyAllEventsScreen from "../screens/myAllCompetitions/MyAllCompetitionsScreen";
import VideoDetailsScreen from "../screens/videoDetails/VideoDetailsScreen";
import EventDetailsScreen from "../screens/competitionEventDetails/CompetitionEventDetailsScreen";
import SentRequestStateScreen from "../screens/sentRequestState/SentRequestStateScreen";
import ReceivedRequestStateScreen from "../screens/receivedRequestState/ReceivedRequestStateScreen";
import VideoEditRequestsScreen from "../screens/videoEditRequests/VideoEditRequestsScreen";
import CompetitionsScreen from "../screens/competitions/CompetitionsScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import AvailableEventsScreen from "../screens/availableCompetitions/AvailableCompetitionsScreen";
import AddToEventScreen from "../screens/addDisciplineToCompetition/AddDisciplineToCompetitionScreen";
import EventSummaryScreen from "../screens/competitionSummary/CompetitionSummaryScreen";
import CongratulationsScreen from "../screens/congratulations/CongratulationsScreen";
import FailedScreen from "../screens/failed/FailedScreen";
import PhotosScreen from "../screens/photos/PhotosScreen";
import PhotoDetailScreen from "../screens/photoDetail/PhotoDetailScreen";
import PhotoBuyScreen from "../screens/photoBuy/PhotoBuyScreen";
import VideosScreen from "../screens/videos/VideosScreen";
import VideoPlayingScreen from "../screens/videoPlaying/VideoPlayingScreen";
import ProfileTimelineDetailScreen from "../screens/profileTimeline/ProfileTimelineDetailScreen";
import ProfileTimelineEditScreen from "../screens/profileTimeline/ProfileTimelineEditScreen";
import ProfileBlogEditorScreen from "../screens/profileBlog/ProfileBlogEditorScreen";
import ViewUserPostsViewAllScreen from "../screens/viewUserPostsViewAll/ViewUserPostsViewAllScreen";
import ViewUserBlogDetailsScreen from "../screens/viewUserBlogDetails/ViewUserBlogDetailsScreen";
import ViewUserCollectionsPhotosScreen from "../screens/viewUserCollectionsPhotos/ViewUserCollectionsPhotosScreen";
import ViewUserCollectionsVideosScreen from "../screens/viewUserCollectionsVideos/ViewUserCollectionsVideosScreen";
import ViewUserProfileScreen from "../screens/viewUserProfile/ViewUserProfileScreen";
import EditPhotoCollectionsScreen from "../screens/editPhotoCollections/EditPhotoCollectionsScreen";
import EditVideoCollectionsScreen from "../screens/editVideoCollections/EditVideoCollectionsScreen";
import CreateNewPostScreen from "../screens/createNewPost/CreateNewPostScreen";
import EditBioScreens from "../screens/viewUserProfile/profileScreens/EditBioScreens";
import DownloadsDetailsScreen from "../screens/downloadsDetails/DownloadsDetailsScreen";
import EventsViewAllScreen from "../screens/competitionsViewAll/CompetitionsViewAllScreen";
import SelectCategoryScreen from "../screens/selectCategory/SelectCategoryScreen";
import CategorySelectionScreen from "../screens/categorySelection/CategorySelectionScreen";
import SelectEventInterestScreen from "../screens/selectEventInterest/SelectEventInterestScreen";
import CompleteAthleteDetailsScreen from "../screens/completeAthleteDetails/CompleteAthleteDetailsScreen";
import CreatePhotographerProfileScreen from "../screens/createPhotographerProfile/CreatePhotographerProfileScreen";
import CreateGroupProfileScreen from "../screens/createGroupProfile/CreateGroupProfileScreen";
import GroupProfileScreen from "../screens/groupProfile/GroupProfileScreen";
import GroupManageScreen from "../screens/groupManage/GroupManageScreen";
import GroupCompetitionSelectScreen from "../screens/groupCompetitionSelect/GroupCompetitionSelectScreen";
import GroupCompetitionAssignScreen from "../screens/groupCompetitionAssign/GroupCompetitionAssignScreen";
import AddCoachScreen from "../screens/addCoach/AddCoachScreen";
import AddAthleteScreen from "../screens/addAthlete/AddAthleteScreen";
import EventAthletesScreen from "../screens/competitionAthletes/CompetitionAthletesScreen";
import GroupEventsViewAllScreen from "../screens/groupCompetitionsViewAll/GroupCompetitionsViewAllScreen";
import GroupCollectionsManageScreen from "../screens/groupCollectionsManage/GroupCollectionsManageScreen";
import AthleteProfileScreen from "../screens/athleteProfile/AthleteProfileScreen";
import { Platform } from "react-native";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import SearchScreen from "../screens/search/SearchScreen";
import Videography from "../screens/search/searchScreens/Videography";
import VideosForEvent from "../screens/search/searchScreens/VideosForCompetition";
import AllPhotosOfEvents from "../screens/search/searchScreens/AllPhotosOfCompetitions";
import AllVideosOfEvents from "../screens/search/searchScreens/AllVideosOfCompetitions";
import EventDivisionScreen from "../screens/search/searchScreens/CompetitionDisciplineScreen";
import FrontFaceCaptureScreen from "../screens/search/searchScreens/FrontFaceCaptureScreen";
import LeftSideCaptureScreen from "../screens/search/searchScreens/LeftSideCaptureScreen";
import RightSideCaptureScreen from "../screens/search/searchScreens/RightSideCaptureScreen";
import NameThisFaceScreen from "../screens/search/searchScreens/NameThisFaceScreen";
import SearchCompetitionDetailsScreen from "../screens/search/searchScreens/CompetitionDetailsScreen";
import ContextSearchLoadingScreen from "../screens/search/searchScreens/ContextSearchLoadingScreen";
import SearchFaceCaptureScreen from "../screens/search/searchScreens/SearchFaceCaptureScreen";
import AISearchResultsScreen from "../screens/search/searchScreens/AISearchResultsScreen";
import CombinedSearchScreen from "../screens/search/searchScreens/CombinedSearchScreen";
import EventsScreen from "../screens/Events/EventsScreen";
import UploadScreen from "../screens/upload/UploadScreen";
import UploadDetailsScreen from "../screens/upload/UploadDetailsScreen";
import UploadAnonymouslyScreen from "../screens/upload/UploadAnonymouslyScreen";
import SelectCompetitionScreen from "../screens/upload/SelectCompetitionScreen";
import CompetitionDetailsScreen from "../screens/upload/CompetitionDetailsScreen";
import UploadSummaryScreen from "../screens/upload/UploadSummaryScreen";
import UploadProgressScreen from "../screens/upload/UploadProgressScreen";
import UploadActivityScreen from "../screens/upload/UploadActivityScreen";
import SelectCategory from "../screens/upload/uploadScreens/SelectCategory";
import CreateCompetition from "../screens/upload/uploadScreens/CreateCompetition";
import UploadedImagesScreen from "../screens/upload/uploadScreens/UploadedImagesScreen";
import UserProfileScreen from "../screens/userProfile/UserProfileScreen";
import MenuScreen from "../screens/menu/MenuScreen";
import Language from "../screens/menu/menuScreens/Language";
import DeleteAndPause from "../screens/menu/menuScreens/DeleteAndPause";
import PaymentMethod from "../screens/menu/menuScreens/PaymentMethod";
import AddNewCard from "../screens/menu/menuScreens/AddNewCard";
import ProfileSettings from "../screens/menu/menuScreens/ProfileSettings";
import EditProfile from "../screens/menu/menuScreens/EditProfile";
import Location from "../screens/menu/menuScreens/Location";
import Help from "../screens/menu/menuScreens/Help";
import TermsOfService from "../screens/menu/menuScreens/TermsOfService";
import Subscription from "../screens/menu/menuScreens/Subscription";
import ChangePassword from "../screens/menu/menuScreens/ChangePassword";
import ChangeUsername from "../screens/menu/menuScreens/ChangeUsername";
import ChangeNationality from "../screens/menu/menuScreens/ChangeNationality";
import DateOfBirth from "../screens/menu/menuScreens/DateOfBirth";
import ChestNumberSettings from "../screens/menu/menuScreens/ChestNumberSettings";
import TrackFieldSettings from "../screens/menu/menuScreens/TrackFieldSettings";
import RoadTrailSettings from "../screens/menu/menuScreens/RoadTrailSettings";
import NameSettings from "../screens/menu/menuScreens/NameSettings";
import ManageProfiles from "../screens/menu/menuScreens/ManageProfiles";
import RightToBeForgotten from "../screens/menu/menuScreens/RightToBeForgotten";
import Authentication from "../screens/menu/menuScreens/Authentication";
import AuthenticatorSetup from "../screens/menu/menuScreens/AuthenticatorSetup";
import VerificationCode from "../screens/menu/menuScreens/VerificationCode";
import AdminPane from "../screens/menu/menuScreens/AdminPane";
import Fonts from "../constants/Fonts";
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const UploadStack = createNativeStackNavigator();
const MenuStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const nativeStackOptions = {
    headerShown: false,
    gestureEnabled: true,
    fullScreenGestureEnabled: Platform.OS === 'ios',
};
const HomeStackNavigator = () => {
    return (_jsxs(HomeStack.Navigator, Object.assign({ screenOptions: nativeStackOptions }, { children: [_jsx(HomeStack.Screen, { name: "HomeScreen", component: HomeScreen }), _jsx(HomeStack.Screen, { name: "HubScreen", component: HubScreen }), _jsx(HomeStack.Screen, { name: "MyAllEventsScreen", component: MyAllEventsScreen }), _jsx(HomeStack.Screen, { name: "VideoDetailsScreen", component: VideoDetailsScreen }), _jsx(HomeStack.Screen, { name: "EventDetailsScreen", component: EventDetailsScreen }), _jsx(HomeStack.Screen, { name: "SentRequestStateScreen", component: SentRequestStateScreen }), _jsx(HomeStack.Screen, { name: "ReceivedRequestStateScreen", component: ReceivedRequestStateScreen }), _jsx(HomeStack.Screen, { name: "VideoEditRequestsScreen", component: VideoEditRequestsScreen }), _jsx(HomeStack.Screen, { name: "CompetitionsScreen", component: CompetitionsScreen }), _jsx(HomeStack.Screen, { name: "NotificationsScreen", component: NotificationsScreen }), _jsx(HomeStack.Screen, { name: "AvailableEventsScreen", component: AvailableEventsScreen }), _jsx(HomeStack.Screen, { name: "AddToEventScreen", component: AddToEventScreen }), _jsx(HomeStack.Screen, { name: "EventSummaryScreen", component: EventSummaryScreen }), _jsx(HomeStack.Screen, { name: "CongratulationsScreen", component: CongratulationsScreen }), _jsx(HomeStack.Screen, { name: "FailedScreen", component: FailedScreen }), _jsx(HomeStack.Screen, { name: "PhotosScreen", component: PhotosScreen }), _jsx(HomeStack.Screen, { name: "PhotoDetailScreen", component: PhotoDetailScreen }), _jsx(HomeStack.Screen, { name: "PhotoBuyScreen", component: PhotoBuyScreen }), _jsx(HomeStack.Screen, { name: "VideosScreen", component: VideosScreen }), _jsx(HomeStack.Screen, { name: "VideoPlayingScreen", component: VideoPlayingScreen }), _jsx(HomeStack.Screen, { name: "AISearchScreen", component: CombinedSearchScreen }), _jsx(HomeStack.Screen, { name: "CategorySelectionScreen", component: CategorySelectionScreen }), _jsx(HomeStack.Screen, { name: "SelectEventInterestScreen", component: SelectEventInterestScreen }), _jsx(HomeStack.Screen, { name: "DownloadsDetailsScreen", component: DownloadsDetailsScreen }), _jsx(HomeStack.Screen, { name: "ViewUserProfileScreen", component: ViewUserProfileScreen }), _jsx(HomeStack.Screen, { name: "ViewUserBlogDetailsScreen", component: ViewUserBlogDetailsScreen }), _jsx(HomeStack.Screen, { name: "ProfileTimelineDetailScreen", component: ProfileTimelineDetailScreen }), _jsx(HomeStack.Screen, { name: "ProfileTimelineEditScreen", component: ProfileTimelineEditScreen }), _jsx(HomeStack.Screen, { name: "ProfileBlogEditorScreen", component: ProfileBlogEditorScreen })] })));
};
const UploadStackNavigator = () => {
    return (_jsxs(UploadStack.Navigator, Object.assign({ screenOptions: nativeStackOptions }, { children: [_jsx(UploadStack.Screen, { name: "UploadScreen", component: UploadScreen }), _jsx(UploadStack.Screen, { name: "UploadDetailsScreen", component: UploadDetailsScreen }), _jsx(UploadStack.Screen, { name: "UploadAnonymouslyScreen", component: UploadAnonymouslyScreen }), _jsx(UploadStack.Screen, { name: "SelectCompetitionScreen", component: SelectCompetitionScreen }), _jsx(UploadStack.Screen, { name: "CompetitionDetailsScreen", component: CompetitionDetailsScreen }), _jsx(UploadStack.Screen, { name: "UploadSummaryScreen", component: UploadSummaryScreen }), _jsx(UploadStack.Screen, { name: "UploadProgressScreen", component: UploadProgressScreen }), _jsx(UploadStack.Screen, { name: "UploadActivityScreen", component: UploadActivityScreen }), _jsx(UploadStack.Screen, { name: "SelectCategory", component: SelectCategory }), _jsx(UploadStack.Screen, { name: "CreateCompetition", component: CreateCompetition }), _jsx(UploadStack.Screen, { name: "UploadedImagesScreen", component: UploadedImagesScreen })] })));
};
const ProfileStackNavigator = () => {
    return (_jsxs(ProfileStack.Navigator, Object.assign({ screenOptions: nativeStackOptions }, { children: [_jsx(ProfileStack.Screen, { name: "UserProfileScreen", component: UserProfileScreen }), _jsx(ProfileStack.Screen, { name: "ViewUserProfileScreen", component: ViewUserProfileScreen }), _jsx(ProfileStack.Screen, { name: "ViewUserPostsViewAllScreen", component: ViewUserPostsViewAllScreen }), _jsx(ProfileStack.Screen, { name: "ViewUserBlogDetailsScreen", component: ViewUserBlogDetailsScreen }), _jsx(ProfileStack.Screen, { name: "ViewUserCollectionsPhotosScreen", component: ViewUserCollectionsPhotosScreen }), _jsx(ProfileStack.Screen, { name: "ViewUserCollectionsVideosScreen", component: ViewUserCollectionsVideosScreen }), _jsx(ProfileStack.Screen, { name: "EditPhotoCollectionsScreen", component: EditPhotoCollectionsScreen }), _jsx(ProfileStack.Screen, { name: "EditVideoCollectionsScreen", component: EditVideoCollectionsScreen }), _jsx(ProfileStack.Screen, { name: "CreateNewPostScreen", component: CreateNewPostScreen }), _jsx(ProfileStack.Screen, { name: "EditBioScreens", component: EditBioScreens }), _jsx(ProfileStack.Screen, { name: "ProfileSettings", component: ProfileSettings }), _jsx(ProfileStack.Screen, { name: "ChestNumberSettings", component: ChestNumberSettings }), _jsx(ProfileStack.Screen, { name: "TrackFieldSettings", component: TrackFieldSettings }), _jsx(ProfileStack.Screen, { name: "RoadTrailSettings", component: RoadTrailSettings }), _jsx(ProfileStack.Screen, { name: "NameSettings", component: NameSettings }), _jsx(ProfileStack.Screen, { name: "ManageProfiles", component: ManageProfiles }), _jsx(ProfileStack.Screen, { name: "PhotoDetailScreen", component: PhotoDetailScreen }), _jsx(ProfileStack.Screen, { name: "VideoPlayingScreen", component: VideoPlayingScreen }), _jsx(ProfileStack.Screen, { name: "DownloadsDetailsScreen", component: DownloadsDetailsScreen }), _jsx(ProfileStack.Screen, { name: "EventsViewAllScreen", component: EventsViewAllScreen }), _jsx(ProfileStack.Screen, { name: "CategorySelectionScreen", component: CategorySelectionScreen }), _jsx(ProfileStack.Screen, { name: "SelectCategoryScreen", component: SelectCategoryScreen }), _jsx(ProfileStack.Screen, { name: "SelectEventInterestScreen", component: SelectEventInterestScreen }), _jsx(ProfileStack.Screen, { name: "CompleteAthleteDetailsScreen", component: CompleteAthleteDetailsScreen }), _jsx(ProfileStack.Screen, { name: "CreatePhotographerProfileScreen", component: CreatePhotographerProfileScreen }), _jsx(ProfileStack.Screen, { name: "CreateGroupProfileScreen", component: CreateGroupProfileScreen }), _jsx(ProfileStack.Screen, { name: "GroupProfileScreen", component: GroupProfileScreen }), _jsx(ProfileStack.Screen, { name: "GroupManageScreen", component: GroupManageScreen }), _jsx(ProfileStack.Screen, { name: "GroupCompetitionSelectScreen", component: GroupCompetitionSelectScreen }), _jsx(ProfileStack.Screen, { name: "GroupCompetitionAssignScreen", component: GroupCompetitionAssignScreen }), _jsx(ProfileStack.Screen, { name: "AddCoachScreen", component: AddCoachScreen }), _jsx(ProfileStack.Screen, { name: "AddAthleteScreen", component: AddAthleteScreen }), _jsx(ProfileStack.Screen, { name: "EventAthletesScreen", component: EventAthletesScreen }), _jsx(ProfileStack.Screen, { name: "GroupEventsViewAllScreen", component: GroupEventsViewAllScreen }), _jsx(ProfileStack.Screen, { name: "GroupCollectionsManageScreen", component: GroupCollectionsManageScreen }), _jsx(ProfileStack.Screen, { name: "CompetitionDetailsScreen", component: SearchCompetitionDetailsScreen }), _jsx(ProfileStack.Screen, { name: "EventSummaryScreen", component: EventSummaryScreen }), _jsx(ProfileStack.Screen, { name: "CongratulationsScreen", component: CongratulationsScreen }), _jsx(ProfileStack.Screen, { name: "AthleteProfileScreen", component: AthleteProfileScreen }), _jsx(ProfileStack.Screen, { name: "ProfileTimelineDetailScreen", component: ProfileTimelineDetailScreen }), _jsx(ProfileStack.Screen, { name: "ProfileTimelineEditScreen", component: ProfileTimelineEditScreen }), _jsx(ProfileStack.Screen, { name: "ProfileBlogEditorScreen", component: ProfileBlogEditorScreen })] })));
};
const MenuStackNavigator = () => {
    return (_jsxs(MenuStack.Navigator, Object.assign({ screenOptions: nativeStackOptions }, { children: [_jsx(MenuStack.Screen, { name: "MenuScreen", component: MenuScreen }), _jsx(MenuStack.Screen, { name: "Language", component: Language }), _jsx(MenuStack.Screen, { name: "DeleteAndPause", component: DeleteAndPause }), _jsx(MenuStack.Screen, { name: "PaymentMethod", component: PaymentMethod }), _jsx(MenuStack.Screen, { name: "AddNewCard", component: AddNewCard }), _jsx(MenuStack.Screen, { name: "ProfileSettings", component: ProfileSettings }), _jsx(MenuStack.Screen, { name: "EditProfile", component: EditProfile }), _jsx(MenuStack.Screen, { name: "Location", component: Location }), _jsx(MenuStack.Screen, { name: "Help", component: Help }), _jsx(MenuStack.Screen, { name: "TermsOfService", component: TermsOfService }), _jsx(MenuStack.Screen, { name: "Subscription", component: Subscription }), _jsx(MenuStack.Screen, { name: "ChangePassword", component: ChangePassword }), _jsx(MenuStack.Screen, { name: "ChangeUsername", component: ChangeUsername }), _jsx(MenuStack.Screen, { name: "ChangeNationality", component: ChangeNationality }), _jsx(MenuStack.Screen, { name: "DateOfBirth", component: DateOfBirth }), _jsx(MenuStack.Screen, { name: "ChestNumberSettings", component: ChestNumberSettings }), _jsx(MenuStack.Screen, { name: "TrackFieldSettings", component: TrackFieldSettings }), _jsx(MenuStack.Screen, { name: "RoadTrailSettings", component: RoadTrailSettings }), _jsx(MenuStack.Screen, { name: "NameSettings", component: NameSettings }), _jsx(MenuStack.Screen, { name: "ManageProfiles", component: ManageProfiles }), _jsx(MenuStack.Screen, { name: "RightToBeForgotten", component: RightToBeForgotten }), _jsx(MenuStack.Screen, { name: "AISearchScreen", component: CombinedSearchScreen }), _jsx(MenuStack.Screen, { name: "Authentication", component: Authentication }), _jsx(MenuStack.Screen, { name: "AuthenticatorSetup", component: AuthenticatorSetup }), _jsx(MenuStack.Screen, { name: "VerificationCode", component: VerificationCode }), _jsx(MenuStack.Screen, { name: "AdminPane", component: AdminPane }), _jsx(MenuStack.Screen, { name: "CategorySelectionScreen", component: CategorySelectionScreen })] })));
};
const SearchStackNavigator = () => {
    return (_jsxs(SearchStack.Navigator, Object.assign({ screenOptions: nativeStackOptions }, { children: [_jsx(SearchStack.Screen, { name: "SearchScreen", component: SearchScreen }), _jsx(SearchStack.Screen, { name: "UserProfileScreen", component: UserProfileScreen }), _jsx(SearchStack.Screen, { name: "ViewUserProfileScreen", component: ViewUserProfileScreen }), _jsx(SearchStack.Screen, { name: "AthleteProfileScreen", component: AthleteProfileScreen }), _jsx(SearchStack.Screen, { name: "GroupProfileScreen", component: GroupProfileScreen }), _jsx(SearchStack.Screen, { name: "GroupManageScreen", component: GroupManageScreen }), _jsx(SearchStack.Screen, { name: "GroupCompetitionSelectScreen", component: GroupCompetitionSelectScreen }), _jsx(SearchStack.Screen, { name: "GroupCompetitionAssignScreen", component: GroupCompetitionAssignScreen }), _jsx(SearchStack.Screen, { name: "GroupCollectionsManageScreen", component: GroupCollectionsManageScreen }), _jsx(SearchStack.Screen, { name: "ViewUserPostsViewAllScreen", component: ViewUserPostsViewAllScreen }), _jsx(SearchStack.Screen, { name: "ViewUserBlogDetailsScreen", component: ViewUserBlogDetailsScreen }), _jsx(SearchStack.Screen, { name: "ViewUserCollectionsPhotosScreen", component: ViewUserCollectionsPhotosScreen }), _jsx(SearchStack.Screen, { name: "ViewUserCollectionsVideosScreen", component: ViewUserCollectionsVideosScreen }), _jsx(SearchStack.Screen, { name: "PhotoDetailScreen", component: PhotoDetailScreen }), _jsx(SearchStack.Screen, { name: "VideoPlayingScreen", component: VideoPlayingScreen }), _jsx(SearchStack.Screen, { name: "Videography", component: Videography }), _jsx(SearchStack.Screen, { name: "VideosForEvent", component: VideosForEvent }), _jsx(SearchStack.Screen, { name: "EventDivisionScreen", component: EventDivisionScreen }), _jsx(SearchStack.Screen, { name: "AllPhotosOfEvents", component: AllPhotosOfEvents }), _jsx(SearchStack.Screen, { name: "AllVideosOfEvents", component: AllVideosOfEvents }), _jsx(SearchStack.Screen, { name: "CompetitionDetailsScreen", component: SearchCompetitionDetailsScreen }), _jsx(SearchStack.Screen, { name: "EventSummaryScreen", component: EventSummaryScreen }), _jsx(SearchStack.Screen, { name: "EventsScreen", component: EventsScreen }), _jsx(SearchStack.Screen, { name: "SearchFaceCaptureScreen", component: SearchFaceCaptureScreen }), _jsx(SearchStack.Screen, { name: "FrontFaceCaptureScreen", component: FrontFaceCaptureScreen }), _jsx(SearchStack.Screen, { name: "LeftSideCaptureScreen", component: LeftSideCaptureScreen }), _jsx(SearchStack.Screen, { name: "RightSideCaptureScreen", component: RightSideCaptureScreen }), _jsx(SearchStack.Screen, { name: "NameThisFaceScreen", component: NameThisFaceScreen }), _jsx(SearchStack.Screen, { name: "AISearchScreen", component: CombinedSearchScreen }), _jsx(SearchStack.Screen, { name: "ContextSearchLoadingScreen", component: ContextSearchLoadingScreen }), _jsx(SearchStack.Screen, { name: "AISearchResultsScreen", component: AISearchResultsScreen }), _jsx(SearchStack.Screen, { name: "ProfileTimelineDetailScreen", component: ProfileTimelineDetailScreen })] })));
};
const BottomTabBar = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const baseTabBarStyle = {
        backgroundColor: colors.backgroundColor,
        elevation: 5,
        height: Platform.OS === 'ios' ? 83 : 60,
        borderTopWidth: 0.3,
        borderTopColor: colors.lightGrayColor,
        paddingTop: Platform.OS === 'ios' ? 10 : 10,
    };
    const getTabBarStyle = (route) => {
        var _a;
        const routeName = (_a = getFocusedRouteNameFromRoute(route)) !== null && _a !== void 0 ? _a : '';
        if (routeName === 'VideoPlayingScreen') {
            return { display: 'none' };
        }
        return baseTabBarStyle;
    };
    return (_jsxs(Tab.Navigator, Object.assign({ backBehavior: "history", screenOptions: ({ route }) => ({
            tabBarIcon: ({ focused, color: _color, size: _size }) => {
                let iconName;
                switch (route.name) {
                    case "Home":
                        iconName = focused ? _jsx(Icons.HomeActive, { heigh: 25, width: 25 }) : _jsx(Icons.Home, { heigh: 24, width: 24 });
                        break;
                    case "Search":
                        iconName = focused ? _jsx(Icons.SearchActive, { heigh: 22, width: 22 }) : _jsx(Icons.Search, { heigh: 22, width: 22 });
                        break;
                    case "Upload":
                        iconName = focused ? _jsx(Icons.UploadBlue, { heigh: 24, width: 24 }) : _jsx(Icons.Upload, { heigh: 24, width: 24 });
                        break;
                    case "Profile":
                        iconName = focused ? _jsx(Icons.ProfileActive, { heigh: 26, width: 26 }) : _jsx(Icons.Profile, { heigh: 24, width: 24 });
                        break;
                    case "Menu":
                        iconName = focused ? _jsx(Icons.MenuActive, { heigh: 24, width: 24 }) : _jsx(Icons.Menu, { heigh: 23, width: 23 });
                        break;
                }
                return iconName;
            },
            headerShown: false,
            tabBarActiveTintColor: colors.primaryColor,
            tabBarInactiveTintColor: colors.subTextColor,
            tabBarShowLabel: true,
            tabBarLabelStyle: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.subTextColor }),
            sceneStyle: {
                backgroundColor: colors.backgroundColor,
            },
            tabBarStyle: baseTabBarStyle,
        }) }, { children: [_jsx(Tab.Screen, { name: "Home", component: HomeStackNavigator, options: ({ route }) => ({
                    tabBarStyle: getTabBarStyle(route),
                    tabBarLabel: t("Home"),
                }), listeners: ({ navigation }) => ({
                    tabPress: (_e) => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Home' }],
                        });
                    },
                }) }), _jsx(Tab.Screen, { name: "Search", component: SearchStackNavigator, options: ({ route }) => ({
                    tabBarStyle: getTabBarStyle(route),
                    tabBarLabel: t("Search"),
                }), listeners: ({ navigation }) => ({
                    tabPress: (_e) => {
                        navigation.reset({
                            index: 0,
                            routes: [{
                                    name: 'Search',
                                    state: { index: 0, routes: [{ name: 'SearchScreen' }] },
                                }],
                        });
                    },
                }) }), _jsx(Tab.Screen, { name: "Upload", component: UploadStackNavigator, options: ({ route }) => ({
                    tabBarStyle: getTabBarStyle(route),
                    tabBarLabel: t("Upload"),
                }), listeners: ({ navigation }) => ({
                    tabPress: (_e) => {
                        _e.preventDefault();
                        navigation.navigate('Upload', {
                            screen: 'UploadScreen',
                        });
                    },
                }) }), _jsx(Tab.Screen, { name: "Profile", component: ProfileStackNavigator, options: ({ route }) => ({
                    tabBarStyle: getTabBarStyle(route),
                    tabBarLabel: t("Profile"),
                }), listeners: ({ navigation }) => ({
                    tabPress: (_e) => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Profile' }],
                        });
                    },
                }) }), _jsx(Tab.Screen, { name: "Menu", component: MenuStackNavigator, options: ({ route }) => ({
                    tabBarStyle: getTabBarStyle(route),
                    tabBarLabel: t("Settings"),
                }), listeners: ({ navigation }) => ({
                    tabPress: (_e) => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Menu' }],
                        });
                    },
                }) })] })));
};
export default BottomTabBar;
