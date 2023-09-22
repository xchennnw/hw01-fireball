#version 300 es

precision highp float;

uniform vec4 u_Color; 
uniform vec4 u_ColorB;
uniform vec4 u_ColorC;
uniform vec4 u_CamPos;

in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_Pos;
out vec4 out_Col; 

vec3 power(vec3 v, float power)
{
    for (float i = 0.0; i < power; i += 1.0) {
       v *= v;
    }
    return v;
}

vec3 noise3DVec(vec3 v)
{
    v += 0.1;
    vec3 noise = sin(vec3(dot(v, vec3(127.1, 311.7, 150.0)),
                          dot(v, vec3(420.2, 631.2, 10.0)),
                          dot(v, vec3(320.2, 31.2, 50.0))));
    noise[0] *= 444.5453;
    noise[1] *= 133334.1453;
    noise[2] *= 7777.8453;
    return normalize(abs(fract(noise)));
}

float surflet3D(vec3 p, vec3 gridPoint)
{
    vec3 t2 = abs(p - gridPoint);
    vec3 t = vec3(1.0) - 6.0 * power(t2, 5.0) + 15.0 * power(t2, 4.0) - 10.0 * power(t2, 3.0);
    vec3 gradient = noise3DVec(gridPoint) * 2.0 - vec3(1.0, 1.0, 1.0);
    vec3 diff = p - gridPoint;
    float height = dot(diff, gradient);
    return height * t.x * t.y * t.z;
}

float perlinNoise3D(vec3 p)
{
    float surfletSum = 0.0;
    // Iterate over the four integer corners surrounding uv
    for(int dx = 0; dx <= 1; ++dx) {
        for(int dy = 0; dy <= 1; ++dy) {
            for(int dz = 0; dz <= 1; ++dz) {
                vec3 gridPoint = floor(p) + vec3(float(dx), float(dy), float(dz));
                surfletSum += surflet3D(p, gridPoint);
            }
        }
    }
    return surfletSum;
}

void main()
{
    vec4 camDir = u_CamPos - fs_Pos;
    float d = dot(fs_Nor, normalize(camDir));
    vec4 col = mix(u_Color, u_ColorB, step(d, 0.8));
    //col = mix(col, u_ColorC, step(d, 0.2));

    float edgeTerm = dot(normalize(fs_Nor), normalize(camDir));
    edgeTerm = clamp(edgeTerm, 0.0, 1.0);
    edgeTerm = edgeTerm + 0.0; 

    float alphaTerm = dot(normalize(fs_Nor), vec4(0.0, 1.0, 0.0, 0.0));
    alphaTerm = clamp(alphaTerm, 0.0, 1.0);
    alphaTerm = 1.5 - alphaTerm;

    vec4 edgeCol = u_ColorC;
    col = edgeCol * (1.0 - edgeTerm) + col * edgeTerm;
    
    out_Col = vec4(col.r, col.g, col.b, alphaTerm);
}