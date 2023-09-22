import {vec2, vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Square extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  center: vec4;
  scale: vec2;

  constructor(center: vec3, size: vec2) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.scale = vec2.fromValues(size[0], size[1]);
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3]);
  this.positions = new Float32Array([-this.scale[0] + this.center[0], -this.scale[1] + this.center[1], this.center[2], 1,
                                      this.scale[0] + this.center[0], -this.scale[1] + this.center[1], this.center[2], 1,
                                      this.scale[0] + this.center[0], this.scale[1] + this.center[1], this.center[2], 1,
                                     -this.scale[0] + this.center[0], this.scale[1] + this.center[1], this.center[2], 1]);

    this.generateIdx();
    this.generatePos();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created square`);
  }
};

export default Square;
