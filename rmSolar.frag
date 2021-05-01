// https://www.youtube.com/watch?v=8--5LwHRhjk
// https://www.shadertoy.com/view/WsSBzh
#version 330 core
in vec3 color;
in vec2 texcoord;

out vec4 FragColor;

uniform float time;
uniform vec2 resolution;

uniform vec3 camPos;
uniform vec3 camLook;

#include "./sdf.glsl"
#include "./raymarching.glsl"

// raymarching aka sphere tracing
#define MAX_STEPS 100
#define MAX_DIST 1000.0
#define SURFACE_DIST 0.001
#define PI 3.14159


mat4 viewMatrix(vec3 camPos, vec3 camTarget) {
	vec3 f = normalize(camTarget - camPos);
	vec3 s = normalize(cross(f, vec3(0.0, 1.0, 0.0)));
	vec3 u = cross(s, f);
	return mat4(
		vec4(s, 0.0),
		vec4(u, 0.0),
		vec4(-f, 0.0),
		vec4(0.0, 0.0, 0.0, 1)
	);
}

vec2 Scene(vec3 p, float dt = 0.0)
{
	vec2 geo = vec2(999.0, 0.0); // X = distance, Y = Material
	float t = time + dt;

	// lines and angles
	float angle = PI * 2.0 / 12.0;
	float sector = round(atan(p.z,p.x)/angle);
	vec3 l = p;
	float an = sector*angle;
	l.xz = mat2(cos(an), -sin(an), sin(an), cos(an)) * l.xz; // order of operation matters here!!!!
	l.y -= -0.5;
	geo.x = combine(geo.x, line(l - vec3(12.0, 0.0, 0.0), 0.2));

	// spheres and stuff
	float s1 = 999.0;
	s1 = combine(s1, sphere(p, 1.0));
	if (s1 < geo.x){
		geo = vec2(s1, 1.0);
	}
	float s2 = 999.0;
	s2 = combine(s2, sphere(p - vec3(sin(t * 1.5) * 1.2, sin(t * 1.5) * -0.8, cos(t * 1.5) * 1.2), 0.1));
	if (s2 < geo.x){
		geo = vec2(s2, 2.0);
	}
	float s3 = 999.0;
	s3 = combine(s3, sphere(p - vec3(sin(t) * 2.0, sin(t) * 0.5, cos(t) * 2.0), 0.2));
	if (s3 < geo.x){
		geo = vec2(s3, 3.0);
	}
	float s4 = 999.0;
	s4 = combine(s4, sphere(p - vec3(sin(t * 0.5) * 3.0, sin(t * 0.5) * 0.2, cos(t * 0.5) * 3.0), 0.4));
	if (s4 < geo.x){
		geo = vec2(s4, 4.0);
	}
	float s5 = 999.0;
	s5 = combine(s5, sphere(p - vec3(sin(t * 0.3) * 5.0, 0.0, cos(t * 0.3) * 5.0), 0.7));
	if (s5 < geo.x){
		geo = vec2(s5, 5.0);
	}

	//create plane (aligned to cam axis)
	float planeDist = p.y; // groundplane using the height of cam pos downwards
	//geo = min(geo, planeDist);

	geo.x = combine(geo.x, combine(s1, combine(s2, combine(s3, combine(s4, s5)))));
	return geo;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
	uv *= 1.8; // works as FOV kinda
	vec3 color = vec3(0.05);

	// camera and ray setup
	//vec3 ro = vec3(0.0, 2.0, 6.0);
	vec3 ro = camPos;
	vec3 rt = vec3(0.0, 0.0, 0.0);
	//vec3 rt = ro + camLook;
	vec3 rd = normalize(vec3(uv.x, uv.y, -1.0));
	rd = (viewMatrix(ro, rt) * vec4(rd, 0.0)).xyz;

	float d = RayMarch(ro, rd);
	if (d > 0.0)
	{
		vec3 p = ro + rd * d;
		color = Lighting(p);
		color += Lighting(p, 0.1);
		color += Lighting(p, -0.1);
		color /= 3.0;
		//color = 0.5 + 0.5*GetNormal(p);
	}
	else 
	{
		//color = vec3((uv.y + 0.5)*0.6);
	}
	
	FragColor = vec4(color, 1.0);
};

