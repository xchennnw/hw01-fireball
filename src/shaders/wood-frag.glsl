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
    vec4 diffuseColor = vec4(0.3, 0.2, 0.2, 1.0);

    // Calculate the diffuse term for Lambert shading
    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

    float ambientTerm = 0.5;

    float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                        //to simulate ambient lighting. This ensures that faces that are not
                                                        //lit by our point light are not completely black.
    
    float alpha = mix(0.0, diffuseColor.a, step(fs_Nor.y, -0.35));
    alpha = mix(alpha, 0.0, step(fs_Nor.y, -0.5));

    // Compute final shaded color
    out_Col = vec4(diffuseColor.rgb * lightIntensity, alpha);
}