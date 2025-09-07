import { useEffect, useState } from 'react';

export type Orientation = 'portrait' | 'landscape';

export const useOrientation = () => {
  const getOrientation = (): Orientation => {
    if (typeof window === 'undefined') return 'portrait';
    if (window.matchMedia && window.matchMedia('(orientation: landscape)').matches) {
      return 'landscape';
    }
    return 'portrait';
  };

  const [orientation, setOrientation] = useState<Orientation>(getOrientation());

  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape)');
    const handler = () => setOrientation(mq.matches ? 'landscape' : 'portrait');
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else if ((mq as any).addListener) {
      (mq as any).addListener(handler);
    }
    window.addEventListener('resize', handler);
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler);
      } else if ((mq as any).removeListener) {
        (mq as any).removeListener(handler);
      }
      window.removeEventListener('resize', handler);
    };
  }, []);

  return orientation;
};
