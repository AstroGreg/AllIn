import { jsx as _jsx } from "react/jsx-runtime";
import { Profile2User, User } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';
import { normalizeFocusId } from '../../utils/profileSelections';
const DEFAULT_COLOR = '#1D7BF1';
const SportFocusIcon = ({ focusId, size = 20, color = DEFAULT_COLOR }) => {
    if (focusId === 'support') {
        return _jsx(User, { size: size, color: color, variant: "Linear" });
    }
    const normalized = normalizeFocusId(focusId);
    switch (normalized) {
        case 'track-field':
            return _jsx(Icons.TrackFieldLogo, { width: Math.round(size * 1.15), height: size });
        case 'road-events':
            return _jsx(Icons.PersonRunningColorful, { width: size, height: size });
        case 'triathlon':
            return _jsx(Icons.TriathlonColorful, { width: size, height: size });
        case 'hyrox':
            return _jsx(Icons.HyroxColorful, { width: size, height: size });
        case 'ironman':
            return _jsx(Icons.IronmanColorful, { width: size, height: size });
        case 'cycling':
            return _jsx(Icons.CyclingColorful, { width: size, height: size });
        default:
            return _jsx(Profile2User, { size: size, color: color, variant: "Linear" });
    }
};
export default SportFocusIcon;
