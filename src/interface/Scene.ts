export interface SceneConfig {
  name: string;
  originName: string;
  panoKey: string;
  userKey: string;
  xmlPath: string;
  multires: string;
  cubeUrl: string;
  _key: string;
  viewAngle?: ViewAngle;
  BGM?: any;
  specialEffect?: { mode: string; url?: string; _key: string; scale: string };
  shade?: any;
  ttsContent?: string;
  viewPoints?: any;
}
export interface ViewAngle {
  fov: string;
  fovmax: string;
  fovmin: string;
  hlookat: string;
  hlookatmax: string;
  vlookatmax: string;
  vlookat: string;
  hlookatmin: string;
  vlookatmin: string;
}
