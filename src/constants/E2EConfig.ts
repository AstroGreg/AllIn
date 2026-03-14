let e2eLaunchEnabled = false;

export const setE2ELaunchEnabled = (enabled: boolean) => {
    e2eLaunchEnabled = Boolean(enabled);
};

export const isE2ELaunchEnabled = () => e2eLaunchEnabled;
