import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { useEffect, useRef, useState } from 'react';

const steps = [
  // Step 0: Primary Tab (clicks to switch)
  {
    target: '[data-tour="category-primary"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Primary Emails</h3>
        <p>These are your important emails that need your attention. Hermes AI automatically identifies emails that require a response or action from you.</p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  // Step 1: Primary Board (shows the list)
  {
    target: '[data-tour="primary-board"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Your Primary Inbox</h3>
        <p>Emails requiring your response or action appear here. Hermes AI analyzes each email to identify what truly needs your attention.</p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  // Step 2: Promotions Tab (clicks to switch)
  {
    target: '[data-tour="category-promotions"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Promotions</h3>
        <p>Marketing emails, deals, and newsletters are filtered here. Get a quick overview without cluttering your primary inbox.</p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  // Step 3: Promotions Board
  {
    target: '[data-tour="promotions-board"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Promotions Overview</h3>
        <p>Browse all your deals and offers at a glance. Each card shows the sender and a preview so you can quickly spot interesting promotions.</p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  // Step 4: Notifications Tab (clicks to switch)
  {
    target: '[data-tour="category-notifications"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Notifications</h3>
        <p>System notifications, social updates, and automated alerts are grouped here so you can check them when convenient.</p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  // Step 5: Notifications Board
  {
    target: '[data-tour="notifications-board"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Notifications Overview</h3>
        <p>All your system alerts, social updates, and automated notifications are grouped here. Check them at your convenience without missing anything important.</p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  // Step 6: Compose
  {
    target: '[data-tour="compose-button"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Compose with AI</h3>
        <p>Write emails faster with AI assistance. Just enter bullet points and Hermes will generate a professional email for you.</p>
      </div>
    ),
    placement: 'left',
    disableBeacon: true,
  },
  // Step 7: AI Profile (clicks to open menu)
  {
    target: '[data-tour="ai-profile"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">AI Profile</h3>
        <p>Customize your AI writing style here. Set your preferred tone and add context so Hermes writes emails that sound like you.</p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  // Step 8: Sync
  {
    target: '[data-tour="sync-button"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Sync Emails</h3>
        <p>Click here to manually sync new emails from your connected accounts. Emails also sync automatically in the background.</p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  // Step 9: Help (final)
  {
    target: '[data-tour="help-button"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">You're All Set!</h3>
        <p>That's the basics of Hermes Mail. Click this help button anytime to replay this tour.</p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
];

const tourStyles = {
  options: {
    primaryColor: '#3b82f6',
    backgroundColor: '#1e293b',
    textColor: '#e2e8f0',
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    spotlightShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    zIndex: 10000,
    arrowColor: '#1e293b',
  },
  tooltip: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    color: '#e2e8f0',
    padding: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid #334155',
  },
  tooltipContainer: {
    textAlign: 'left',
  },
  tooltipTitle: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  tooltipContent: {
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  buttonNext: {
    backgroundColor: '#3b82f6',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
  },
  buttonBack: {
    color: '#94a3b8',
    marginRight: '8px',
    fontSize: '14px',
  },
  buttonSkip: {
    color: '#64748b',
    fontSize: '14px',
  },
  buttonClose: {
    color: '#94a3b8',
  },
  spotlight: {
    borderRadius: '8px',
  },
  beacon: {
    display: 'none',
  },
  beaconInner: {
    backgroundColor: '#3b82f6',
  },
  beaconOuter: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
};

function ProductTour({ run, onComplete, onSkip }) {
  const scrollPositionRef = useRef(0);

  // Lock/unlock scrolling based on tour state
  useEffect(() => {
    if (run) {
      // Lock scroll when tour is running
      scrollPositionRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
    } else {
      // Unlock scroll when tour is not running
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPositionRef.current);
    }

    return () => {
      // Cleanup: unlock scroll on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [run]);

  const handleJoyrideCallback = (data) => {
    const { status, action, type, index } = data;

    // Auto-click elements when entering specific steps
    if (type === EVENTS.STEP_BEFORE) {
      switch (index) {
        case 0: // Primary tab
          document.querySelector('[data-tour="category-primary"]')?.click();
          break;
        case 2: // Promotions tab
          document.querySelector('[data-tour="category-promotions"]')?.click();
          break;
        case 4: // Notifications tab
          document.querySelector('[data-tour="category-notifications"]')?.click();
          break;
        case 7: // AI Profile button
          document.querySelector('[data-tour="ai-profile"]')?.click();
          break;
        default:
          break;
      }
    }

    // Tour finished or skipped
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (status === STATUS.SKIPPED && onSkip) {
        onSkip();
      } else if (status === STATUS.FINISHED && onComplete) {
        onComplete();
      }
    }

    // Handle close button click
    if (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER) {
      if (onSkip) {
        onSkip();
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      spotlightClicks
      disableOverlayClose
      hideCloseButton={false}
      callback={handleJoyrideCallback}
      styles={tourStyles}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Done',
        next: 'Next',
        skip: 'Skip tour',
      }}
      floaterProps={{
        styles: {
          floater: {
            filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3))',
          },
        },
      }}
    />
  );
}

export default ProductTour;
