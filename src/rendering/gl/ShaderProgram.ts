import {vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;
  attrColB: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifColorB: WebGLUniformLocation;
  unifColorC: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifCamPos: WebGLUniformLocation;
  unifHeight: WebGLUniformLocation;
  unifDisturb: WebGLUniformLocation;
  unifFreq: WebGLUniformLocation;
  unifSpeed: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifColor      = gl.getUniformLocation(this.prog, "u_Color");
    this.unifColorB      = gl.getUniformLocation(this.prog, "u_ColorB");
    this.unifColorC      = gl.getUniformLocation(this.prog, "u_ColorC");
    this.unifTime      = gl.getUniformLocation(this.prog, "u_Time");
    this.unifCamPos   = gl.getUniformLocation(this.prog, "u_CamPos");
    this.unifHeight      = gl.getUniformLocation(this.prog, "u_Height");
    this.unifDisturb      = gl.getUniformLocation(this.prog, "u_Disturb");
    this.unifFreq      = gl.getUniformLocation(this.prog, "u_Freq");
    this.unifSpeed      = gl.getUniformLocation(this.prog, "u_Speed");
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setGeometryColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);
    }
  }

  setGeometryColorB(color: vec4) {
    this.use();
    if (this.unifColorB !== -1) {
      gl.uniform4fv(this.unifColorB, color);
    }
  }

  setGeometryColorC(color: vec4) {
    this.use();
    if (this.unifColorC !== -1) {
      gl.uniform4fv(this.unifColorC, color);
    }
  }

  setTime(time: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1i(this.unifTime, time);
    }
  }

  setHeight(time: number) {
    this.use();
    if (this.unifHeight !== -1) {
      gl.uniform1f(this.unifHeight, time);
    }
  }

  setDisturb(time: number) {
    this.use();
    if (this.unifDisturb !== -1) {
      gl.uniform1f(this.unifDisturb, time);
    }
  }

  setFreq(time: number) {
    this.use();
    if (this.unifFreq !== -1) {
      gl.uniform1f(this.unifFreq, time);
    }
  }

  setSpeed(time: number) {
    this.use();
    if (this.unifSpeed !== -1) {
      gl.uniform1f(this.unifSpeed, time);
    }
  }

  setCameraPos(cp: vec4) {
    this.use();
    if (this.unifCamPos !== -1) {
      gl.uniform4fv(this.unifCamPos, cp);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
  }
};

export default ShaderProgram;
