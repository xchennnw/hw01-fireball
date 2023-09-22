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

float noise1D( vec2 p ) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) *
                 43758.5453);
}


vec2 noise2D( vec2 p ) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)),
                 dot(p, vec2(269.5,183.3))))
                 * 43758.5453);
}


float interpNoise2D(float x, float y) {
    int intX = int(floor(x));
    float fractX = fract(x);
    int intY = int(floor(y));
    float fractY = fract(y);

    float v1 = noise1D(vec2(intX, intY));
    float v2 = noise1D(vec2(intX + 1, intY));
    float v3 = noise1D(vec2(intX, intY + 1));
    float v4 = noise1D(vec2(intX + 1, intY + 1));

    float i1 = mix(v1, v2, fractX);
    float i2 = mix(v3, v4, fractX);
    return mix(i1, i2, fractY);
}

float fbm(float x, float y) {
    float total = 0.0;
    float persistence = 0.5f;
    int octaves = 8;
    float freq = 2.f;
    float amp = 0.5f;
    for(int i = 1; i <= octaves; i++) {
        total += interpNoise2D(x * freq,
                               y * freq) * amp;

        freq *= 2.f;
        amp *= persistence;
    }
    return total;
}

vec2 rotate(vec2 p, float deg) {
    float rad = deg * 3.14159 / 180.0;
    return vec2(cos(rad) * p.x - sin(rad) * p.y,
                sin(rad) * p.x + cos(rad) * p.y);
}

vec2 WorleyNoise(vec2 uv) {
    uv *= 20.0; // Now the space is 10x10 instead of 1x1. Change this to any number you want.
    vec2 uvInt = floor(uv);
    vec2 uvFract = fract(uv);

    float minDist = 0.6;
    vec2 minimum_point;
    for(int y = -1; y <= 1; ++y) {
        for(int x = -1; x <= 1; ++x) {           
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = noise2D(uvInt + neighbor );
            float speed = 0.1;
            point = vec2( cos(point.x), sin(point.y) ) * 0.5 + 0.5;
            vec2 diff = neighbor + point - uvFract;
            float dist = length(diff);
            //minDist = min(minDist, dist);

            if(dist < minDist) {
                minDist = dist;
                minimum_point = point;
            }

        }
    }
    return minimum_point;
}

void main()
{
     // Material base color (before shading)
    float noise =  WorleyNoise(0.5 * vec2(fs_Pos.x, fs_Pos.z)).x;

    vec4 col1 = vec4(0.65, 0.55, 0.55, 1.0);
    vec4 col2 = vec4(0.5, 0.5, 0.5, 1.0);
    vec4 diffuseColor = mix(col2, col1, step(noise, 0.9995));

    // Calculate the diffuse term for Lambert shading
    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

    float ambientTerm = 0.5;

    float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                        //to simulate ambient lighting. This ensures that faces that are not
                                                        //lit by our point light are not completely black.
    
    
    // Compute final shaded color
    out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
}