function buildBottomTabProfileState(screen, params) {
    return {
        index: 0,
        routes: [
            {
                name: 'BottomTabBar',
                state: {
                    index: 3,
                    routes: [
                        { name: 'Home' },
                        { name: 'Search' },
                        { name: 'Upload' },
                        {
                            name: 'Profile',
                            state: {
                                index: 0,
                                routes: [{ name: screen, params }],
                            },
                        },
                        { name: 'Menu' },
                    ],
                },
            },
        ],
    };
}
export function buildBottomTabUserProfileReset(params) {
    return buildBottomTabProfileState('UserProfileScreen', params);
}
export function buildBottomTabGroupProfileReset(groupId, params) {
    return buildBottomTabProfileState('GroupProfileScreen', Object.assign({ groupId }, (params !== null && params !== void 0 ? params : {})));
}
