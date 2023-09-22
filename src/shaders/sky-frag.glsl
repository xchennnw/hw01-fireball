#version 300 es

precision highp float;

uniform int u_Time;

in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_Pos;
out vec4 out_Col; 

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+10.0)*x);
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float PerlinNoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); 
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 r = vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  vec4 norm = 1.79284291400159 - 0.85373472095314 * r;
  g00 *= norm.x;  
  g01 *= norm.y;  
  g10 *= norm.z;  
  g11 *= norm.w;  

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

float fbm2DPerlin(vec2 v, float frequency, float persistence)
{
    float total = 0.0;
    int octaves = 4;
    float amp = persistence;
    float freq = frequency;

    for (int i = 1; i <= octaves; i++)
    {
        total += PerlinNoise(vec2(v.x * freq, v.y * freq)) * amp;
        freq *= frequency;
        amp *= persistence;
    }
    return total;
}

float qinticOut(float t) {
  return 1.0 - (pow(t - 1.0, 5.0));
}

void main()
{
     // Material base color (before shading)
    float noise = fbm2DPerlin(0.75 * vec2(fs_Pos.x + float(u_Time) * 0.01, fs_Pos.y), 0.5, 1.4);

    vec4 c1 = vec4(0.26, 0.41, 0.88, 1.0);
    vec4 c2 = vec4(1.0, 0.85, 0.72, 1.0);
    float t = abs(fs_Pos.y) / 20.0;
    vec4 col1 = mix(c2, c1, t);

    vec4 a1 = vec4(0.96, 0.62, 0.48, 1.0);
    vec4 a2 = vec4(0.95, 0.9, 0.8, 1.0);
    t = abs(fs_Pos.y - 5.0) / 20.0;
    vec4 col3 = mix(a2, a1, t);

    vec4 col2 = vec4(0.8, 0.7, 0.8, 1.0);


    noise = clamp(noise, 0.0 , 1.0);
    vec4 grad = mix(col2, col3, (noise - 0.7)/0.3);

    vec4 col = mix(grad, col1, step(noise, 0.7));
     
    // Compute final shaded color
    out_Col = vec4(col.rgb, col.a);
}