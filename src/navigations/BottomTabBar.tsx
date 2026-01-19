import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icons from "../constants/Icons";
import Colors from "../constants/Colors";
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
import { Platform } from "react-native";
import SearchScreen from "../screens/search/SearchScreen";
import UploadScreen from "../screens/upload/UploadScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import MenuScreen from "../screens/menu/MenuScreen";
import Fonts from "../constants/Fonts";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

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
        </HomeStack.Navigator>
    );
};

const BottomTabBar = () => {
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
                tabBarActiveTintColor: Colors.primaryColor,
                tabBarInactiveTintColor: Colors.subTextColor,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    ...Fonts.regular12
                },
                tabBarStyle: {
                    backgroundColor: Colors.whiteColor,
                    elevation: 5,
                    height: Platform.OS === 'ios' ? 83 : 60,
                    borderTopWidth: 0.3,
                    borderStartColor: Colors.lightGrayColor,
                    paddingTop: Platform.OS === 'ios' ? 10 : 10
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStackNavigator} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Upload" component={UploadScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
            <Tab.Screen name="Menu" component={MenuScreen} />
        </Tab.Navigator>
    );
};

export default BottomTabBar;
