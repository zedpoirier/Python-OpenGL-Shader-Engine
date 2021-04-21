#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 resolution;

float smooth(float d){
 return 1.0 - smoothstep(0.0, 0.003, d);
}

float box(vec2 p, vec2 b){
  vec2 d = abs(p)-b;
  return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float circle(vec2 p, float rad){
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

//-----------------------------------------------
// Simplex Noise 
//-----------------------------------------------

//-----------------------------------------------
// Noise Helpers 
//-----------------------------------------------

vec2 mod289(vec2 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x)
{
    return mod289((x * 34.0 + 1.0) * x);
}

vec4 permute(vec4 x)
{
    return mod289((x * 34.0 + 1.0) * x);
}

vec3 taylorInvSqrt(vec3 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}

//-----------------------------------------------
// 2D Noise
//-----------------------------------------------

float noise(vec2 v)
{
    const vec4 C = vec4( 0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                         0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                         0.024390243902439); // 1.0 / 41.0

    // First corner
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);

    // Other corners
    vec2 i1;
    i1.x = step(x0.y, x0.x);
    i1.y = 1.0 - i1.x;

    // x1 = x0 - i1  + 1.0 * C.xx;
    // x2 = x0 - 1.0 + 2.0 * C.xx;
    vec2 x1 = x0 + C.xx - i1;
    vec2 x2 = x0 + C.zz;

    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p =
      permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                    + i.x + vec3(0.0, i1.x, 1.0));

    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
    m = m * m;
    m = m * m;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    m *= taylorInvSqrt(a0 * a0 + h * h);

    // Compute final noise value at P
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.y = a0.y * x1.x + h.y * x1.y;
    g.z = a0.z * x2.x + h.z * x2.y;
    return 130.0 * dot(m, g);
}

//-----------------------------------------------
// Fractal Componded Noise from Sebastion League
//-----------------------------------------------
const int dep = 3;

float fractalNoise(vec2 p)
{
	float sum = 0.;
	float amp = 1.;
	float freq = 1.;
	for (int i = 0; i < dep; i++)
	{
		sum += noise(p * freq) * amp;
		freq *= 2.;
		amp *= 0.5;
	}
	return sum;
}

// main program
void main(void) {

// uv center and swapping
vec2 uv = gl_FragCoord.xy / resolution;
uv -= 0.5;
uv *= 1.05;
uv.y /= resolution.x / resolution.y;

// globals
float tau = 6.283185;
vec2 tex = uv + 0.5;
tex.x+= 0.003;
tex.y -= 0.002;

// three orbital inner circles
float angle = tau / 3.0;
float sector = floor(atan(uv.x,uv.y) / angle + 0.5);
float an = sector * angle;
vec2 qq = uv;
qq *= mat2(cos(an), -sin(an),
          sin(an), cos(an));
qq.y -= 0.198;
float d1 = abs(circle(qq, 0.061)) - 0.002;


float d = 999.;
d = min(d, d1);

uv *= 1.3;

float c1 = 999.;
c1 = min(c1, abs(circle(uv, 0.63)) - 0.003);
c1 = min(c1, abs(circle(uv, 0.605)) - 0.003);
c1 = min(c1, abs(circle(uv, 0.515)) - 0.003);
c1 = min(c1, abs(circle(uv, 0.425)) - 0.002);
c1 = min(c1, abs(circle(uv, 0.150)) - 0.002);
c1 = min(c1, abs(circle(uv, 0.12)) - 0.002);
    
vec2 hs = uv;
float r = tau / 12.0;
float h1 = 999.;
hs *= mat2(cos(r), -sin(r), sin(r), cos(r));
h1 = min(h1, abs(hex(hs, 0.445)) - 0.001); 
    
vec2 cs = uv;
float c2 = 999.;
cs.y += 0.575;
c2 = min(c2, abs(circle(cs, 0.3)) - 0.003);
c2 = min(c2, abs(circle(cs, 0.25)) - 0.001);
cs.y -= 0.575;
r = tau / 3.0;
cs *= mat2(cos(r), -sin(r), sin(r), cos(r));
cs.y += 0.575;
c2 = min(c2, abs(circle(cs, 0.3)) - 0.003);
c2 = min(c2, abs(circle(cs, 0.25)) - 0.001);
cs.y -= 0.575;
r = tau / 3.0;
cs *= mat2(cos(r), -sin(r), sin(r), cos(r));
cs.y += 0.575;
c2 = min(c2, abs(circle(cs, 0.3)) - 0.003);
c2 = min(c2, abs(circle(cs, 0.25)) - 0.001);
// cutout shape
c2 = max(c2, hex(hs, 0.445));

vec2 ts = uv;
ts.y *= -1.0;
float t1 = 999.;
t1 = min(t1, abs(tri(ts, 0.44)) - 0.003);




vec2 ls = uv;
float l1 = 999.;
l1 = min(l1, box(ls, vec2(0.002, 0.515)));
float r1 = tau / 6.0;
ls *= mat2(cos(r1), -sin(r1), sin(r1), cos(r1));
l1 = min(l1, box(ls, vec2(0.002, 0.515)));
ls *= mat2(cos(r1), -sin(r1), sin(r1), cos(r1));
l1 = min(l1, box(ls, vec2(0.002, 0.515)));
 

 vec3 color = vec3(0.0);
 color += vec3(smooth(d));
 color += vec3(smooth(c1));
 color += vec3(smooth(c2));
 color += vec3(smooth(t1));
 color += vec3(smooth(h1));
 color += vec3(smooth(l1));
    
vec2 st = uv;
float w = 999.;
float val = atan(st.y,st.x);
val = 0.238 + fractalNoise(vec2(val) * 13.216) * 0.01 + 0.412;
val *= 0.356;
w = min(w, abs(circle(st, val)) - 0.0001);
val = atan(st.y,st.x);
val = -0.034 + fractalNoise(vec2(val) * 12.352) * 0.01 + 0.412;
val *= 0.356;
w = min(w, abs(circle(st, val)) - 0.0001);
val = atan(st.y,st.x);
val = 1.126 + fractalNoise(vec2(val) * 12.432) * -0.030 + 0.412;
val *= 0.356;
w = min(w, abs(circle(st, val)) - 0.0001);
    
w = smooth(w);
float sub = fractalNoise(st * 16.640);
//sub = abs(sub);
sub = smooth(sub);
w -= sub;
w = clamp(w, 0.0, 1.0);
color += w;
    
color *= vec3(0.204,0.236,0.730);

gl_FragColor = vec4(color, 1.0);

}