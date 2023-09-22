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

void main()
{

    vec4 col1 = vec4(0.5, 0.4, 0.6, 1.0);
    vec4 col2 = vec4(0.3, 0.4, 0.7, 1.0);
    float t = (fs_Pos.y + 4.5) / 6.0;
    t = floor(t * 7.0) / 7.0;
    vec4 col = mix(col1, col2, t);
       
    // Compute final shaded color
    out_Col = col;
}