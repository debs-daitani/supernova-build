// TODO: Add auth requirement after launch (Jan 26)
// Currently PUBLIC - no login required for guides

import Flipbook from '../components/Flipbook';
import { venuedGuide } from '../data/venued-guide';

export default function VenuedGuidePage() {
  return <Flipbook title="VENUED App Guide" pages={venuedGuide} />;
}
