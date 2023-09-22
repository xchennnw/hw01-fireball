import {vec2} from 'gl-matrix';
import {vec3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially 
  color1: [ 255, 255, 157, 255 ],
  color2: [ 255, 200, 85, 255 ],
  color3: [ 255, 56, 56, 255 ],
  fireHeight: 0.5,
  fireDisturb: 1.0,
  fireFreq: 1.5,
  fireSpeed: 0.03,
  'Reset' : Reset,
};

const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

let icosphere: Icosphere;
let ground: Icosphere;
let sea: Square;
let firewood: Icosphere;
let fakeSky: Icosphere;

let prevTesselations: number = 5;
let timer: number = 0;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(-4, -0.5, -8), 1, controls.tesselations);
  icosphere.create();
  firewood = new Icosphere(vec3.fromValues(-4, -0.8, -8), 0.8, controls.tesselations);
  firewood.create();
  ground = new Icosphere(vec3.fromValues(-3, -28.75, -14), 25, controls.tesselations);
  ground.create();
  sea = new Square(vec3.fromValues(-3, -3, -14), vec2.fromValues(20, 5));
  sea.create();
  fakeSky = new Icosphere(vec3.fromValues(-3, 0, -10), 20, controls.tesselations);
  fakeSky.create();
}

function Reset() {
  camera.reset();
  controls.color1 = [ 255, 255, 157, 255 ];
  controls.color2 = [ 255, 200, 85, 255 ];
  controls.color3 = [ 255, 56, 56, 255 ];
  controls.fireHeight = 0.5;
  controls.fireDisturb = 1.0;
  controls.fireFreq = 1.5;
  controls.fireSpeed = 0.03;
}

function main() {

  // Add controls to the gui
  const gui = new DAT.GUI();  
  gui.add(controls, 'Load Scene');
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'fireHeight', 0, 1.0).step(0.1);
  gui.add(controls, 'fireDisturb', 0, 2.0).step(0.1);
  gui.add(controls, 'fireFreq', 0.1, 10.0).step(0.1);
  gui.add(controls, 'fireSpeed', 0.01, 0.05).step(0.0001);

  gui.addColor(controls, 'color1');
  gui.addColor(controls, 'color2');
  gui.addColor(controls, 'color3');

  gui.add(controls, 'Reset');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Initial call to load scene
  loadScene();

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.5, 0.5, 0.5, 1);
  gl.enable(gl.DEPTH_TEST);

  const wood = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/wood-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/wood-frag.glsl')),
  ]);

  const fire = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/fire-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/fire-frag.glsl')),
  ]);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const gradient = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/gradient-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/gradient-frag.glsl')),
  ]);

  const sky = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/sky-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/sky-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    timer += 1;
    camera.update();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }

    fire.setGeometryColor(vec4.fromValues(controls.color1[0]/255.0, controls.color1[1]/255.0, 
                                          controls.color1[2]/255.0, controls.color1[3]));
    fire.setGeometryColorB(vec4.fromValues(controls.color2[0]/255.0, controls.color2[1]/255.0, 
                                          controls.color2[2]/255.0, controls.color2[3]));
    fire.setGeometryColorC(vec4.fromValues(controls.color3[0]/255.0, controls.color3[1]/255.0, 
                                          controls.color3[2]/255.0, controls.color3[3]));

    fire.setTime(timer);
    fire.setDisturb(controls.fireDisturb);
    fire.setHeight(controls.fireHeight);
    fire.setFreq(controls.fireFreq);
    fire.setSpeed(controls.fireSpeed);
    sky.setTime(timer);

    renderer.render(camera, fire, [
      icosphere,
    ]);

    renderer.render(camera, lambert, [
      ground,
    ]);

    renderer.render(camera, gradient, [
      sea,
    ]);

    renderer.render(camera, wood, [
      firewood,
    ]);

    renderer.render(camera, sky, [
      fakeSky,
    ]);

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
