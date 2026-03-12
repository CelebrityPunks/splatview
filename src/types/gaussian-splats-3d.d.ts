declare module "@mkkellogg/gaussian-splats-3d" {
  import { WebGLRenderer } from "three";

  interface ViewerOptions {
    renderer?: WebGLRenderer;
    cameraUp?: [number, number, number];
    initialCameraPosition?: [number, number, number];
    initialCameraLookAt?: [number, number, number];
    dynamicScene?: boolean;
    selfDrivenMode?: boolean;
  }

  interface SplatSceneOptions {
    showLoadingUI?: boolean;
    progressiveLoad?: boolean;
  }

  export class Viewer {
    constructor(options?: ViewerOptions);
    addSplatScene(url: string, options?: SplatSceneOptions): Promise<void>;
    start(): void;
    dispose(): void;
  }
}
