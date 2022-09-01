export interface SceneConfig {
  name: string;
  originName: string;
  panoKey: string;
  userKey: string;
  xmlPath: string;
  multires: string;
  _key: string;
  viewAngle?: ViewAngle;
  sandTable?: any;
  BGM?: any;
  specialEffect?: { mode: string; url?: string; _key: string };
  shade?: any;
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