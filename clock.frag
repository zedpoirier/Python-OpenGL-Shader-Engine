# version 330 core

in vec3 color;
in vec2 texcoord;

out vec4 FragColor;

uniform float time;
uniform vec2 resolution;
uniform vec4 date;

#include "../lygia/space/ratio.glsl"
#include "../lygia/sdf/flowerSDF.glsl"

float smoothy(float d)
{
 	return 1.0 - smoothstep(0.0, 0.0025, d);
}

float smoothy(float d, float v)
{
 	return 1.0 - smoothstep(0.0, v, d);
}

float box( in vec2 p, in vec2 b )
{
	vec2 d = abs(p)-b;
	return length(max(d,0.0))
    	+ min(max(d.x,d.y),0.0);
}


float circle( in vec2 p, in float rad)
{
	return length(p) - rad;
}

float tri(vec2 p, float r){
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r/k;
    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
    p.x -= clamp( p.x, -2.0*r, 0.0 );
    return -length(p)*sign(p.y);
}

float hex(vec2 p, float r){
    const vec3 k = vec3(-0.866025404,0.5,0.577350269);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
    return length(p)*sign(p.y);
}

void main(void) {

// uv center and swapping
vec2 uv = texcoord;
uv -= 0.5;
//uv.x -= 0.166;
bool val = 124521.0 > 3600.0*12.0;
//uv.x -= 0.5*float(val) -0.5*float(!val);
uv /= 0.75;
uv.y /= resolution.x / resolution.y;

// globals
vec3 color = vec3(0.0);
float tau = 6.283185;
float hour = date.x;
float minu = date.y;
float seco = date.z;
float ring = 0.45;
float a = 0.7;
float b = 0.2;
float c = 0.5;
vec3 red = vec3(a, b, c);
vec3 green = vec3(c, a, b);
vec3 blue = vec3(b, c, a);

// Red Space - Hours
float dR = 999.;
vec2 hhs = uv;
float ha = tau * hour / 12.0;
ha -= tau / 4.0;
hhs *= mat2(cos(ha), -sin(ha),
          sin(ha), cos(ha));
hhs.x -= ring;
float hd = abs(circle(hhs, 0.12)) - 0.0003;
float hdn = circle(hhs, 0.12);
dR = min(dR, hd);
//dR = max(dR, -hdn);

vec2 rr = uv;
//dR = min(dR, abs(circle(rr, 0.31)) - 0.0003);
dR = min(dR, abs(circle(rr, 0.59)) - 0.0003);
rr *= mat2(cos(ha), -sin(ha),
          sin(ha), cos(ha));
dR = min(dR, abs(hex(rr, 0.39)) - 0.0003);
float rRot = tau / 4.0;
rr *= mat2(cos(rRot), -sin(rRot),
          sin(rRot), cos(rRot));
dR = min(dR, abs(hex(rr, 0.39)) - 0.0003);


// Green Space - Minutes
float dG = 999.;
vec2 mm = uv;
float mA = tau * minu / 60.0;
mA -= tau / 4.0;
mm *= mat2(cos(mA), -sin(mA),
          sin(mA), cos(mA));
mm.x -= ring;
float md = abs(circle(mm, 0.075)) - 0.0003;
float mdn = circle(mm, 0.075);
dG = min(dG, md);
//dG = max(dG, -mdn);

vec2 gg = uv;
//dG = min(dG, abs(circle(gg, 0.36)) - 0.0003);
dG = min(dG, abs(circle(gg, 0.54)) - 0.0003);
mA += tau / 8.0;
gg *= mat2(cos(mA), -sin(mA),
          sin(mA), cos(mA));
float gRot = tau / 8.0;
dG = min(dG, abs(box(gg, vec2(0.32))) - 0.0003);
gg *= mat2(cos(gRot), -sin(gRot), sin(gRot), cos(gRot));
dG = min(dG, abs(box(gg, vec2(0.32))) - 0.0003);
gRot = tau / 6.0;
gg *= mat2(cos(gRot), -sin(gRot), sin(gRot), cos(gRot));

// Blue Space - Seconds
float dB = 999.;
vec2 ss = uv;
float sA = tau * seco / 60.0;
sA -= tau /4.0;
ss *= mat2(cos(sA), -sin(sA),
           sin(sA), cos(sA));
ss.x -= ring;
float sd = abs(circle(ss, 0.025)) - 0.0003;
float sdn = circle(ss, 0.025);
dB = min(dB, sd);
//dB = max(dB, -sdn);

vec2 bb = uv;
//dB = min(dB, abs(circle(bb, 0.41)) - 0.0003);
dB = min(dB, abs(circle(bb, 0.49)) - 0.0003);
sA -= tau /6.0;
float bRot = tau / -4.0;
bb *= mat2(cos(sA), -sin(sA), sin(sA), cos(sA));
bb *= mat2(cos(bRot), -sin(bRot), sin(bRot), cos(bRot));
dB = min(dB, abs(tri(bb, 0.39)) - 0.0003);
bRot = tau / 6.0;
bb *= mat2(cos(bRot), -sin(bRot), sin(bRot), cos(bRot));
dB = min(dB, abs(tri(bb, 0.39)) - 0.0003);


// White Space
float dW = 999.;
// hour ticks
float angle = tau / 12.0;
float sector = floor(atan(uv.x,uv.y) / angle + 0.5);
float an = sector * angle;
vec2 q = uv;
q *= mat2(cos(an), -sin(an),
          sin(an), cos(an));
q.y -= ring - 0.04;
float ticks = box(q, vec2(0.0005, 0.21));
// dots
angle = tau / 60.0;
sector = floor(atan(uv.x,uv.y) / angle + 0.5);
an = sector * angle;
vec2 qq = uv;
qq *= mat2(cos(an), -sin(an),
          sin(an), cos(an));
qq.y -= ring;
float dots = circle(qq, 0.0025);
// inner circles
float b1 = 999.;
dW = min(dW, b1);

dW = min(dW, ticks);
dW = min(dW, abs(circle(uv, 0.2)) - 0.0003);
dW = max(dW, -sdn);
dW = min(dW, sd);
dW = max(dW, -mdn);
dW = min(dW, md);
dW = max(dW, -hdn);
dW = min(dW, hd);
dW = min(dW, dots);
dW = min(dW, flowerSDF(uv, 7));


// Coloring
color += vec3(smoothy(dW, 0.005));
color += vec3(smoothy(dR, 0.005)) * red;
color += vec3(smoothy(dG, 0.005)) * green;
color += vec3(smoothy(dB, 0.005)) * blue;


float alpha = 0.0;
if (length(color) > 0){
    alpha = 1.0;
}
FragColor = vec4(color, 1);
}