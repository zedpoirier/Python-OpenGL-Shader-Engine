# version 330 core

in vec3 color;
in vec2 texcoord;

uniform float time;
uniform vec2 resolution;

out vec4 FragColor;

float smoothy(float val){
    return smoothstep(0.0, 0.003, val);
}

void main()
{
    vec4 color = vec4(1.0, 0.0, 1.0, 1.0);
    vec2 p = texcoord;
    p -= 0.5;
    p.x *= resolution.x / resolution.y;
    //p.y += sin(time) * 0.2;
    //p.x += cos(time) * 0.2;

    float d = 999.;
    d = min(d, length(p) - 0.2);
    d = 1.0 - smoothy(d);
    if (d > 0.0) color = vec4(vec3(0.1176, 0.8941, 0.5059), d);


    float ddd = 999.;
    p.x -= 0.2;
    ddd = min(ddd, length(p) - 0.11);
    ddd = 1.0 - smoothy(ddd);
    if (ddd > 0.0) color = vec4(vec3(0.0275, 0.0235, 0.0275), ddd * 0.5);

    
    float dd = 999.;
    dd = min(dd, length(p) - 0.1);
    dd = 1.0 - smoothy(dd);
    if (dd > 0.0) color = vec4(vec3(0.6471, 0.0863, 0.6196), dd);


    //d = min(d, dd);
    float final = d + dd + ddd;
    if (final <= 0.001) color = vec4(0.0);
    FragColor = color;
}