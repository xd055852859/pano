import { SceneConfig } from "./Scene";

export interface PanoConfig {
  name: string;
  public: number;
  userKey: string;
  tagKey?: string;
  labels?: string;
  location?: string;
  config?: any;
  sandTable?: any;
  _key: string;
}

export interface PanoTag {
  name: string;
  _key: string;
}
