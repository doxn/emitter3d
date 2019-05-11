import * as THREE from 'three';

export type AntialiasMode = 'OFF' | 'SMAA' | 'SSAA x2' | 'SSAA x4';

export const antialiasModes: AntialiasMode[] = ['OFF', 'SMAA', 'SSAA x2', 'SSAA x4'];

export class Renderer {
  private webGL: THREE.WebGLRenderer;
  private passes: {
    render: THREE.RenderPass,
    renderSSAA: THREE.SSAARenderPass,
    focus: THREE.ShaderPass,
    bloom: THREE.UnrealBloomPass,
    copy: THREE.ShaderPass,
    SMAA: THREE.SMAAPass,
  };
  private composer: THREE.EffectComposer;

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.webGL = new THREE.WebGLRenderer({ antialias: false });
    this.webGL.setPixelRatio(window.devicePixelRatio);
    this.passes = {
      render: new THREE.RenderPass(scene, camera),
      renderSSAA: new THREE.SSAARenderPass(scene, camera),
      focus: new THREE.ShaderPass(THREE.FocusShader),
      bloom: new THREE.UnrealBloomPass(),
      copy: new THREE.ShaderPass(THREE.CopyShader),
      SMAA: new THREE.SMAAPass(2, 2),
    };
    this.passes.copy.renderToScreen = true;
    this.passes.SMAA.renderToScreen = true;

    this.composer = new THREE.EffectComposer(this.webGL);
    this.composer.addPass(this.passes.render);
    this.composer.addPass(this.passes.renderSSAA);
    this.composer.addPass(this.passes.focus);
    this.composer.addPass(this.passes.bloom);
    this.composer.addPass(this.passes.copy);
    this.composer.addPass(this.passes.SMAA);

    this.antialiasMode = 'OFF';
    this.bloom = false;
  }

  get domElement(): HTMLCanvasElement {
    return this.webGL.domElement;
  }

  set antialiasMode(mode: AntialiasMode) {
    this.passes.renderSSAA.enabled = mode.slice(0, 4) == 'SSAA';
    this.passes.renderSSAA.sampleLevel = (mode == 'SSAA x2') ? 1 : (mode == 'SSAA x4') ? 2 : 0;
    this.passes.SMAA.enabled = mode == 'SMAA';
    this.passes.render.enabled = !this.passes.renderSSAA.enabled;
    this.passes.copy.enabled = !this.passes.SMAA.enabled;
  }

  set focus(enabled: boolean) {
    this.passes.focus.enabled = enabled;
  }

  set bloom(enabled: boolean) {
    this.passes.bloom.enabled = enabled;
  }

  set bloomStrength(value: number) {
    this.passes.bloom.strength = value;
  }

  set bloomRadius(value: number) {
    this.passes.bloom.radius = value;
  }

  set bloomThreshold(value: number) {
    this.passes.bloom.threshold = value;
  }

  setSize(width: number, height: number): void {
    this.webGL.setSize(width, height);
    const ratio = this.webGL.getPixelRatio();
    this.composer.setSize(Math.floor(width * ratio), Math.floor(height * ratio));
  }

  render(): void {
    this.composer.render();
  }
}
