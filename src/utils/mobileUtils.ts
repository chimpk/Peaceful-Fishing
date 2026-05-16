
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
};

export const requestFullScreen = async (element: HTMLElement) => {
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      await (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      await (element as any).msRequestFullscreen();
    }
  } catch (error) {
    console.warn("Fullscreen request failed", error);
  }
};

export const lockOrientation = async () => {
  try {
    if (window.screen && (window.screen as any).orientation && (window.screen as any).orientation.lock) {
      await (window.screen as any).orientation.lock('landscape');
    }
  } catch (error) {
    console.warn("Orientation lock failed", error);
  }
};
