export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
    primaryColor: string;
    secondaryColor: string;
    secondaryBlueColor: string;
    whiteColor: string;
    pureWhite: string;
    balckColor: string;
    mainTextColor: string;
    subTextColor: string;
    errorColor: string;
    grayColor: string;
    greenColor: string;
    pendingColor: string;
    borderColor: string;
    lightGrayColor: string;
    btnBackgroundColor: string;
    backgroundColor: string;
    cardBackground: string;
    modalBackground: string;
}

export const lightColors: ThemeColors = {
    primaryColor: '#3C82F6',
    secondaryColor: '#F7FAFF',
    secondaryBlueColor: '#E0ECFE',
    whiteColor: '#FFFFFF',
    pureWhite: '#FFFFFF',
    balckColor: '#000000',
    mainTextColor: '#171717',
    subTextColor: '#898989',
    errorColor: '#ED5454',
    grayColor: '#777777',
    greenColor: '#00BD48',
    pendingColor: '#FF8000',
    borderColor: '#E0ECFE',
    lightGrayColor: '#DEDEDE',
    btnBackgroundColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
    cardBackground: '#FFFFFF',
    modalBackground: '#FFFFFF',
};

export const darkColors: ThemeColors = {
    primaryColor: '#3C82F6',
    secondaryColor: '#131316',
    secondaryBlueColor: 'rgba(60, 130, 246, 0.2)',
    whiteColor: '#030409',
    pureWhite: '#FFFFFF',
    balckColor: '#FFFFFF',
    mainTextColor: '#FFFFFF',
    subTextColor: '#C4C4C4',
    errorColor: '#ED5454',
    grayColor: '#C4C4C4',
    greenColor: '#00BD48',
    pendingColor: '#FF8000',
    borderColor: 'rgba(255, 255, 255, 0.26)',
    lightGrayColor: 'rgba(255, 255, 255, 0.26)',
    btnBackgroundColor: '#131316',
    backgroundColor: '#030409',
    cardBackground: '#131316',
    modalBackground: '#131316',
};
