export const shakeElement = (element) => {
  if (!element) {
    return;
  }

  // Cancel an unfinished shake so repeated invalid attempts restart the feedback.
  element.getAnimations().forEach((animation) => animation.cancel());

  // Web Animations keeps this transient effect out of React state and render cycles.
  element.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-8px)' },
      { transform: 'translateX(8px)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(0)' }
    ],
    { duration: 300, easing: 'ease-in-out' }
  );
};
