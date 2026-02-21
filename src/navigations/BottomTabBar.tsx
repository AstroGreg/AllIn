import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icons from "../constants/Icons";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import HomeScreen from "../screens/home/HomeScreen";
import HubScreen from "../screens/hub/HubScreen";
import MyAllEventsScreen from "../screens/myAllEvents/MyAllEventsScreen";
import VideoDetailsScreen from "../screens/videoDetails/VideoDetailsScreen";
import EventDetailsScreen from "../screens/eventDetails/EventDetailsScreen";
import SentRequestStateScreen from "../screens/sentRequestState/SentRequestStateScreen";
import ReceivedRequestStateScreen from "../screens/receivedRequestState/ReceivedRequestStateScreen";
import VideoEditRequestsScreen from "../screens/videoEditRequests/VideoEditRequestsScreen";
import CompetitionsScreen from "../screens/competitions/CompetitionsScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import AvailableEventsScreen from "../screens/availableEvents/AvailableEventsScreen";
import AddToEventScreen from "../screens/addToEvent/AddToEventScreen";
import EventSummaryScreen from "../screens/eventSummary/EventSummaryScreen";
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
import EventsViewAllScreen from "../screens/eventsViewAll/EventsViewAllScreen";
import SelectCategoryScreen from "../screens/selectCategory/SelectCategoryScreen";
import SelectEventInterestScreen from "../screens/selectEventInterest/SelectEventInterestScreen";
import CompleteAthleteDetailsScreen from "../screens/completeAthleteDetails/CompleteAthleteDetailsScreen";
import CreatePhotographerProfileScreen from "../screens/createPhotographerProfile/CreatePhotographerProfileScreen";
import CreateGroupProfileScreen from "../screens/createGroupProfile/CreateGroupProfileScreen";
import GroupProfileScreen from "../screens/groupProfile/GroupProfileScreen";
import AddCoachScreen from "../screens/addCoach/AddCoachScreen";
import AddAthleteScreen from "../screens/addAthlete/AddAthleteScreen";
import EventAthletesScreen from "../screens/eventAthletes/EventAthletesScreen";
import GroupEventsViewAllScreen from "../screens/groupEventsViewAll/GroupEventsViewAllScreen";
import AthleteProfileScreen from "../screens/athleteProfile/AthleteProfileScreen";
import { Platform } from "react-native";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import SearchScreen from "../screens/search/SearchScreen";
import Videography from "../screens/search/searchScreens/Videography";
import VideosForEvent from "../screens/search/searchScreens/VideosForEvent";
import AllPhotosOfEvents from "../screens/search/searchScreens/AllPhotosOfEvents";
import AllVideosOfEvents from "../screens/search/searchScreens/AllVideosOfEvents";
import EventDivisionScreen from "../screens/search/searchScreens/EventDivisionScreen";
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
import WatermarkScreen from "../screens/upload/WatermarkScreen";
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
import RightToBeForgotten from "../screens/menu/menuScreens/RightToBeForgotten";
import Authentication from "../screens/menu/menuScreens/Authentication";
import AuthenticatorSetup from "../screens/menu/menuScreens/AuthenticatorSetup";
import VerificationCode from "../screens/menu/menuScreens/VerificationCode";
import Fonts from "../constants/Fonts";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const UploadStack = createNativeStackNavigator();
const MenuStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
            <HomeStack.Screen name="HubScreen" component={HubScreen} />
            <HomeStack.Screen name="MyAllEventsScreen" component={MyAllEventsScreen} />
            <HomeStack.Screen name="VideoDetailsScreen" component={VideoDetailsScreen} />
            <HomeStack.Screen name="EventDetailsScreen" component={EventDetailsScreen} />
            <HomeStack.Screen name="SentRequestStateScreen" component={SentRequestStateScreen} />
            <HomeStack.Screen name="ReceivedRequestStateScreen" component={ReceivedRequestStateScreen} />
            <HomeStack.Screen name="VideoEditRequestsScreen" component={VideoEditRequestsScreen} />
            <HomeStack.Screen name="CompetitionsScreen" component={CompetitionsScreen} />
            <HomeStack.Screen name="NotificationsScreen" component={NotificationsScreen} />
            <HomeStack.Screen name="AvailableEventsScreen" component={AvailableEventsScreen} />
            <HomeStack.Screen name="AddToEventScreen" component={AddToEventScreen} />
            <HomeStack.Screen name="EventSummaryScreen" component={EventSummaryScreen} />
            <HomeStack.Screen name="CongratulationsScreen" component={CongratulationsScreen} />
            <HomeStack.Screen name="FailedScreen" component={FailedScreen} />
            <HomeStack.Screen name="PhotosScreen" component={PhotosScreen} />
            <HomeStack.Screen name="PhotoDetailScreen" component={PhotoDetailScreen} />
            <HomeStack.Screen name="PhotoBuyScreen" component={PhotoBuyScreen} />
            <HomeStack.Screen name="VideosScreen" component={VideosScreen} />
            <HomeStack.Screen name="VideoPlayingScreen" component={VideoPlayingScreen} />
            <HomeStack.Screen name="AISearchScreen" component={CombinedSearchScreen} />
            <HomeStack.Screen name="SelectEventInterestScreen" component={SelectEventInterestScreen} />
            <HomeStack.Screen name="DownloadsDetailsScreen" component={DownloadsDetailsScreen} />
            <HomeStack.Screen name="ViewUserProfileScreen" component={ViewUserProfileScreen} />
            <HomeStack.Screen name="ViewUserBlogDetailsScreen" component={ViewUserBlogDetailsScreen} />
            <HomeStack.Screen name="ProfileTimelineDetailScreen" component={ProfileTimelineDetailScreen} />
            <HomeStack.Screen name="ProfileTimelineEditScreen" component={ProfileTimelineEditScreen} />
            <HomeStack.Screen name="ProfileBlogEditorScreen" component={ProfileBlogEditorScreen} />
        </HomeStack.Navigator>
    );
};

const UploadStackNavigator = () => {
    return (
        <UploadStack.Navigator screenOptions={{ headerShown: false }}>
            <UploadStack.Screen name="UploadScreen" component={UploadScreen} />
            <UploadStack.Screen name="UploadDetailsScreen" component={UploadDetailsScreen} />
            <UploadStack.Screen name="UploadAnonymouslyScreen" component={UploadAnonymouslyScreen} />
            <UploadStack.Screen name="SelectCompetitionScreen" component={SelectCompetitionScreen} />
            <UploadStack.Screen name="CompetitionDetailsScreen" component={CompetitionDetailsScreen} />
            <UploadStack.Screen name="WatermarkScreen" component={WatermarkScreen} />
            <UploadStack.Screen name="UploadSummaryScreen" component={UploadSummaryScreen} />
            <UploadStack.Screen name="UploadProgressScreen" component={UploadProgressScreen} />
            <UploadStack.Screen name="UploadActivityScreen" component={UploadActivityScreen} />
            <UploadStack.Screen name="SelectCategory" component={SelectCategory} />
            <UploadStack.Screen name="CreateCompetition" component={CreateCompetition} />
            <UploadStack.Screen name="UploadedImagesScreen" component={UploadedImagesScreen} />
        </UploadStack.Navigator>
    );
};

const ProfileStackNavigator = () => {
    return (
        <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
            <ProfileStack.Screen name="UserProfileScreen" component={UserProfileScreen} />
            <ProfileStack.Screen name="ViewUserProfileScreen" component={ViewUserProfileScreen} />
            <ProfileStack.Screen name="ViewUserPostsViewAllScreen" component={ViewUserPostsViewAllScreen} />
            <ProfileStack.Screen name="ViewUserBlogDetailsScreen" component={ViewUserBlogDetailsScreen} />
            <ProfileStack.Screen name="ViewUserCollectionsPhotosScreen" component={ViewUserCollectionsPhotosScreen} />
            <ProfileStack.Screen name="ViewUserCollectionsVideosScreen" component={ViewUserCollectionsVideosScreen} />
            <ProfileStack.Screen name="EditPhotoCollectionsScreen" component={EditPhotoCollectionsScreen} />
            <ProfileStack.Screen name="EditVideoCollectionsScreen" component={EditVideoCollectionsScreen} />
            <ProfileStack.Screen name="CreateNewPostScreen" component={CreateNewPostScreen} />
            <ProfileStack.Screen name="EditBioScreens" component={EditBioScreens} />
            <ProfileStack.Screen name="ProfileSettings" component={ProfileSettings} />
            <ProfileStack.Screen name="ChestNumberSettings" component={ChestNumberSettings} />
            <ProfileStack.Screen name="PhotoDetailScreen" component={PhotoDetailScreen} />
            <ProfileStack.Screen name="VideoPlayingScreen" component={VideoPlayingScreen} />
            <ProfileStack.Screen name="DownloadsDetailsScreen" component={DownloadsDetailsScreen} />
            <ProfileStack.Screen name="EventsViewAllScreen" component={EventsViewAllScreen} />
            <ProfileStack.Screen name="SelectCategoryScreen" component={SelectCategoryScreen} />
            <ProfileStack.Screen name="SelectEventInterestScreen" component={SelectEventInterestScreen} />
            <ProfileStack.Screen name="CompleteAthleteDetailsScreen" component={CompleteAthleteDetailsScreen} />
            <ProfileStack.Screen name="CreatePhotographerProfileScreen" component={CreatePhotographerProfileScreen} />
            <ProfileStack.Screen name="CreateGroupProfileScreen" component={CreateGroupProfileScreen} />
            <ProfileStack.Screen name="GroupProfileScreen" component={GroupProfileScreen} />
            <ProfileStack.Screen name="AddCoachScreen" component={AddCoachScreen} />
            <ProfileStack.Screen name="AddAthleteScreen" component={AddAthleteScreen} />
            <ProfileStack.Screen name="EventAthletesScreen" component={EventAthletesScreen} />
            <ProfileStack.Screen name="GroupEventsViewAllScreen" component={GroupEventsViewAllScreen} />
            <ProfileStack.Screen name="CongratulationsScreen" component={CongratulationsScreen} />
            <ProfileStack.Screen name="AthleteProfileScreen" component={AthleteProfileScreen} />
            <ProfileStack.Screen name="ProfileTimelineDetailScreen" component={ProfileTimelineDetailScreen} />
            <ProfileStack.Screen name="ProfileTimelineEditScreen" component={ProfileTimelineEditScreen} />
            <ProfileStack.Screen name="ProfileBlogEditorScreen" component={ProfileBlogEditorScreen} />
        </ProfileStack.Navigator>
    );
};

const MenuStackNavigator = () => {
    return (
        <MenuStack.Navigator screenOptions={{ headerShown: false }}>
            <MenuStack.Screen name="MenuScreen" component={MenuScreen} />
            <MenuStack.Screen name="Language" component={Language} />
            <MenuStack.Screen name="DeleteAndPause" component={DeleteAndPause} />
            <MenuStack.Screen name="PaymentMethod" component={PaymentMethod} />
            <MenuStack.Screen name="AddNewCard" component={AddNewCard} />
            <MenuStack.Screen name="ProfileSettings" component={ProfileSettings} />
            <MenuStack.Screen name="EditProfile" component={EditProfile} />
            <MenuStack.Screen name="Location" component={Location} />
            <MenuStack.Screen name="Help" component={Help} />
            <MenuStack.Screen name="TermsOfService" component={TermsOfService} />
            <MenuStack.Screen name="Subscription" component={Subscription} />
            <MenuStack.Screen name="ChangePassword" component={ChangePassword} />
            <MenuStack.Screen name="ChangeUsername" component={ChangeUsername} />
            <MenuStack.Screen name="ChangeNationality" component={ChangeNationality} />
            <MenuStack.Screen name="DateOfBirth" component={DateOfBirth} />
            <MenuStack.Screen name="ChestNumberSettings" component={ChestNumberSettings} />
            <MenuStack.Screen name="RightToBeForgotten" component={RightToBeForgotten} />
            <MenuStack.Screen name="AISearchScreen" component={CombinedSearchScreen} />
            <MenuStack.Screen name="Authentication" component={Authentication} />
            <MenuStack.Screen name="AuthenticatorSetup" component={AuthenticatorSetup} />
            <MenuStack.Screen name="VerificationCode" component={VerificationCode} />
        </MenuStack.Navigator>
    );
};

const SearchStackNavigator = () => {
    return (
        <SearchStack.Navigator screenOptions={{ headerShown: false }}>
            <SearchStack.Screen name="SearchScreen" component={SearchScreen} />
            {/* Profile screens accessible from search */}
            <SearchStack.Screen name="UserProfileScreen" component={UserProfileScreen} />
            <SearchStack.Screen name="ViewUserProfileScreen" component={ViewUserProfileScreen} />
            <SearchStack.Screen name="AthleteProfileScreen" component={AthleteProfileScreen} />
            <SearchStack.Screen name="GroupProfileScreen" component={GroupProfileScreen} />
            <SearchStack.Screen name="ViewUserPostsViewAllScreen" component={ViewUserPostsViewAllScreen} />
            <SearchStack.Screen name="ViewUserBlogDetailsScreen" component={ViewUserBlogDetailsScreen} />
            <SearchStack.Screen name="ViewUserCollectionsPhotosScreen" component={ViewUserCollectionsPhotosScreen} />
            <SearchStack.Screen name="ViewUserCollectionsVideosScreen" component={ViewUserCollectionsVideosScreen} />
            <SearchStack.Screen name="PhotoDetailScreen" component={PhotoDetailScreen} />
            <SearchStack.Screen name="VideoPlayingScreen" component={VideoPlayingScreen} />
            {/* Search-related screens */}
            <SearchStack.Screen name="Videography" component={Videography} />
            <SearchStack.Screen name="VideosForEvent" component={VideosForEvent} />
            <SearchStack.Screen name="EventDivisionScreen" component={EventDivisionScreen} />
            <SearchStack.Screen name="AllPhotosOfEvents" component={AllPhotosOfEvents} />
            <SearchStack.Screen name="AllVideosOfEvents" component={AllVideosOfEvents} />
            <SearchStack.Screen name="CompetitionDetailsScreen" component={SearchCompetitionDetailsScreen} />
            <SearchStack.Screen name="EventsScreen" component={EventsScreen} />
            {/* Face capture flow */}
            <SearchStack.Screen name="SearchFaceCaptureScreen" component={SearchFaceCaptureScreen} />
            <SearchStack.Screen name="FrontFaceCaptureScreen" component={FrontFaceCaptureScreen} />
            <SearchStack.Screen name="LeftSideCaptureScreen" component={LeftSideCaptureScreen} />
            <SearchStack.Screen name="RightSideCaptureScreen" component={RightSideCaptureScreen} />
            <SearchStack.Screen name="NameThisFaceScreen" component={NameThisFaceScreen} />
            <SearchStack.Screen name="AISearchScreen" component={CombinedSearchScreen} />
            <SearchStack.Screen name="ContextSearchLoadingScreen" component={ContextSearchLoadingScreen} />
            <SearchStack.Screen name="AISearchResultsScreen" component={AISearchResultsScreen} />
            <SearchStack.Screen name="ProfileTimelineDetailScreen" component={ProfileTimelineDetailScreen} />
        </SearchStack.Navigator>
    );
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
    const getTabBarStyle = (route: any) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? '';
        if (routeName === 'VideoPlayingScreen') {
            return { display: 'none' as const };
        }
        return baseTabBarStyle;
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    switch (route.name) {
                        case "Home":
                            iconName = focused ? <Icons.HomeActive heigh={25} width={25} /> : <Icons.Home heigh={24} width={24} />;
                            break;
                        case "Search":
                            iconName = focused ? <Icons.SearchActive heigh={22} width={22} /> : <Icons.Search heigh={22} width={22} />;
                            break;
                        case "Upload":
                            iconName = focused ? <Icons.UploadBlue heigh={24} width={24} /> : <Icons.Upload heigh={24} width={24} />;
                            break;
                        case "Profile":
                            iconName = focused ? <Icons.ProfileActive heigh={26} width={26} /> : <Icons.Profile heigh={24} width={24} />;
                            break;
                        case "Menu":
                            iconName = focused ? <Icons.MenuActive heigh={24} width={24} /> : <Icons.Menu heigh={23} width={23} />;
                            break;
                    }

                    return iconName;
                },
                headerShown: false,
                tabBarActiveTintColor: colors.primaryColor,
                tabBarInactiveTintColor: colors.subTextColor,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    ...Fonts.regular12,
                    color: colors.subTextColor
                },
                tabBarStyle: baseTabBarStyle,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeStackNavigator}
                options={({ route }) => ({
                    tabBarStyle: getTabBarStyle(route),
                    tabBarLabel: t("Home"),
                })}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Home' }],
                        });
                    },
                })}
            />
            <Tab.Screen
                name="Search"
                component={SearchStackNavigator}
                options={({ route }) => ({
                    tabBarStyle: getTabBarStyle(route),
                    tabBarLabel: t("Search"),
                })}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        navigation.reset({
                            index: 0,
                            routes: [{
                                name: 'Search',
                                state: { index: 0, routes: [{ name: 'SearchScreen' }] },
                            }],
                        });
                    },
                })}
            />
            <Tab.Screen
                name="Upload"
                component={UploadStackNavigator}
                options={({ route }) => ({
                    tabBarStyle: getTabBarStyle(route),
                    tabBarLabel: t("Upload"),
                })}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('Upload', {
                            screen: 'UploadScreen',
                        });
                    },
                })}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStackNavigator}
                options={({ route }) => ({
                    tabBarStyle: getTabBarStyle(route),
                    tabBarLabel: t("Profile"),
                })}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Profile' }],
                        });
                    },
                })}
            />
            <Tab.Screen
                name="Menu"
                component={MenuStackNavigator}
                options={({ route }) => ({
                    tabBarStyle: getTabBarStyle(route),
                    tabBarLabel: t("Settings"),
                })}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Menu' }],
                        });
                    },
                })}
            />
        </Tab.Navigator>
    );
};

export default BottomTabBar;
