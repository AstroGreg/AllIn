import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icons from "../constants/Icons";
import Colors from "../constants/Colors";
import HomeScreen from "../screens/home/HomeScreen";
import HubScreen from "../screens/hub/HubScreen";
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
