# version 330 core

in vec3 color;
in vec2 texcoord;

uniform float time;
uniform vec2 resolution;

out vec4 FragColor;

#define TAU 6.28318

float smoothy(float val){
    return smoothstep(0.0, 0.001, val);
}

float circle(vec2 p, float r)
{
    return length(p) - r;
}

float box(vec2 p, vec2 b)
{
	vec2 q = abs(p) - b;
  	return length(max(q,0.0)) + min(max(q.x,q.y),0.0);  
}

void main()
{
    vec4 color = vec4(1.0, 0.0, 1.0, 1.0);
    vec2 res = resolution;
    vec2 uv = texcoord;
    uv -= 0.5;
    vec2 p = texcoord;
    p -= 0.5;
    p.x *= res.x / res.y;

    float d = 999.;
    float d2 = 999.;

    // cam frame
    vec2 c = uv;
    c.x *= res.x * 2.0;
    c.y *= res.y * 2.0;
    c.x -= 1280.0;
    c.y += 520.0;
    d = min(d, box(c, vec2(544.0, 324.0)));
    d2 = min(d2, box(c, vec2(524.0, 304.0)));

    // cutout
    vec2 c2 = c;
    float r = TAU /8.0;
    float animVal = sin(time) * 20.0;
    c2 *= mat2(cos(r), -sin(r), sin(r), cos(r));
    d = max(d, box(c2, vec2(800.0, 400.0 + animVal)));

    // border
    d = min(d, abs(box(p, vec2(0.89, 0.5))) - 0.02);


    // colors
    vec4 blue = vec4(0.0549, 0.6196, 0.5922, 1.0);
    d = 1.0 - smoothy(d);
    d2 = 1.0 - smoothy(d2);
    color = vec4(d) * blue;
    if (d2 > 0.0) color = vec4(d2) * vec4(0.4471, 0.0588, 0.6745, 1.0);
    FragColor = color;
}