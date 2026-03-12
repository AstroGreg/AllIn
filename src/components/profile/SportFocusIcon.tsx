import React from 'react';
import { Profile2User, User } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';
import { normalizeFocusId, type SportFocusId } from '../../utils/profileSelections';

type FocusIconId = SportFocusId | 'support' | string | null | undefined;

type SportFocusIconProps = {
  focusId: FocusIconId;
  size?: number;
  color?: string;
};

const DEFAULT_COLOR = '#1D7BF1';

const SportFocusIcon = ({ focusId, size = 20, color = DEFAULT_COLOR }: SportFocusIconProps) => {
  if (focusId === 'support') {
    return <User size={size} color={color} variant="Linear" />;
  }

  const normalized = normalizeFocusId(focusId);
  switch (normalized) {
    case 'track-field':
      return <Icons.TrackFieldLogo width={Math.round(size * 1.15)} height={size} />;
    case 'road-events':
      return <Icons.PersonRunningColorful width={size} height={size} />;
    case 'triathlon':
      return <Icons.TriathlonColorful width={size} height={size} />;
    case 'hyrox':
      return <Icons.HyroxColorful width={size} height={size} />;
    case 'ironman':
      return <Icons.IronmanColorful width={size} height={size} />;
    case 'cycling':
      return <Icons.CyclingColorful width={size} height={size} />;
    default:
      return <Profile2User size={size} color={color} variant="Linear" />;
  }
};

export default SportFocusIcon;
