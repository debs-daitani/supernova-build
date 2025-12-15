// TODO: Add auth requirement after launch (Jan 26)
// Currently PUBLIC - no login required for guides

import PlatformFlipbook from '../components/PlatformFlipbook';
import { platformGuide } from '../data/platform-guide';

export default function PlatformGuidePage() {
  return <PlatformFlipbook title="dAItaniverse Platform Guide" pages={platformGuide} />;
}
