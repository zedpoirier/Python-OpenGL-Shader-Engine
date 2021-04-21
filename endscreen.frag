# version 330 core

in vec3 color;
in vec2 texcoord;

uniform float time;
uniform vec2 resolution;

out vec4 FragColor;

#define TAU 6.28318

float smoothy(float val){
    return smoothstep(0.0, 0.9, val);
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

float endy(vec2 p){
    float d = 999.;
    float speed = time * 2.0;
    p.x -= -3.0 + 6.0 * fract(time * 0.1);
    p *= mat2(cos(speed), -sin(speed), sin(speed), cos(speed));
    d = min(d, box(p, vec2(0.03)));
    p.y -= 0.05;
    d = min(d, circle(p, 0.01));
    p.y += 0.1;
    d = min(d, circle(p, 0.01));
    p.y -= 0.05;
    p.x -= 0.05;
    d = min(d, circle(p, 0.01));
    p.x += 0.1;
    d = min(d, circle(p, 0.01));
    return d;

}

void main()
{
    vec2 screen = texcoord;
    screen.y -= 1.0;
    screen.y *= -1.0;
    screen *= resolution;
    vec2 uv = texcoord;
    uv -= 0.5;
    vec2 p = uv;
    p.y *= resolution.y / resolution.x;

    float d = 999.;
    float d1 = 999.;
    float d2 = 999.;
    float d3 = 999.;

    // endscreen
    vec2 e = p * 2.0;
    e *= 1.3;
    float rot = TAU / 8.0;
    e *= mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
    
    e.y += 1.2;
    d = min(d, endy(e));
    e.x += 0.7;
    e.y -= 0.2;
    d = min(d, endy(e));
    e.x += 0.3;
    e.y -= 0.2;
    d = min(d, endy(e));
    e.x -= 0.4;
    e.y -= 0.2;
    d = min(d, endy(e));
    e.x += 0.6;
    e.y -= 0.2;
    d = min(d, endy(e));
    e.x -= 0.7;
    e.y -= 0.2;
    d = min(d, endy(e));
    e.x += 0.7;
    e.y -= 0.2;
    d = min(d, endy(e));
    e.x += 0.3;
    e.y -= 0.2;
    d = min(d, endy(e));
    e.x -= 0.4;
    e.y -= 0.2;
    d = min(d, endy(e));
    e.x -= 0.6;
    e.y -= 0.2;
    d = min(d, endy(e));
    e.x -= 0.7;
    e.y -= 0.2;


    // border frame
    float frameVal = sin((screen.x) / 20.0 - time) * 8.0;
    vec2 f = screen * 2.0;
    f -= vec2(1920.0, 1080.0);
    d1 = min(d1, box(f, resolution));
    d1 = max(d1, -box(f, resolution - 60.0 - frameVal));
    
    // cam frame
    vec2 c = screen * 2.0;
    c -= vec2(1600.0, 800.0) * 2.0;
    d2 = min(d2, box(c, vec2(544.0, 324.0)));
    d2 = max(d2, -box(c, vec2(504.0, 284.0)));
    d3 = min(d3, box(c, vec2(524.0, 304.0)));
    d3 = max(d3, -box(c, vec2(504.0, 284.0)));
    float r = TAU /8.0;
    float animVal = sin(time) * 20.0;
    c *= mat2(cos(r), -sin(r), sin(r), cos(r));
    d2 = max(d2, box(c, vec2(800.0, 400.0 + animVal)));

    

    

    // colors
    vec4 color = vec4(0.0);
    d = step(d, 0.0);
    d1 = 1.0 - smoothy(d1);
    d2 = 1.0 - smoothy(d2);
    d3 = 1.0 - smoothy(d3);
    if (d2 > 0.0) color = vec4(d2) * vec4(0.5412, 0.1647, 0.7608, 1.0);
    if (d3 > 0.0) color = vec4(d3) * vec4(0.6745, 0.6118, 0.0588, 1.0);
    if (d > 0.0) color = vec4(d) * vec4(0.6745, 0.6118, 0.0588, 1.0);
    if (d1 > 0.0) color = vec4(d1) * vec4(0.0118, 0.7059, 0.7059, 1.0);

    FragColor = color;
}