#version 330 core
#include "./sdf.glsl"
#include "./noise.glsl"

#line 6

in vec3 color;
in vec2 texcoord;

out vec4 FragColor;

uniform float time;
uniform vec2 resolution;

uniform vec3 camPos;
uniform vec3 camLook;

// raymarching somets called sphere tracing
#define MAX_STEPS 100
#define MAX_DIST 1000.0
#define SURFACE_DIST 0.01
#define PI 3.14159

int matID = 0;

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

float Scene(vec3 p, out int mat){
	float geo = 999.0;
	float t = time;

	// lines and angles
	float angle = PI * 2.0 / 12.0;
	float sector = round(atan(p.z,p.x)/angle);
	vec3 l = p;
	float an = sector*angle;
	l.xz = mat2(cos(an), -sin(an), sin(an), cos(an)) * l.xz; // order of operation matters here!!!!
	l.y -= -0.5;
	geo = combine(geo, line(l - vec3(12.0, 0.0, 0.0), 0.2));

	//create plane (aligned to cam axis)
	//float planeDist = p.y + 2.0; // groundplane using the height of cam pos downwards
	//geo = min(geo, planeDist);

	// spheres and stuff
	float s1 = 999.0;
	s1 = combine(s1, sphere(p, 1.0));
	// s1 = smin(s1, box(p - vec3(0.0, 0.8, 0.0), vec3(0.3, 0.8, 0.3)), 0.2);
	if (s1 < geo){
		mat = 1;
		geo = s1;
	} 

	float s2 = 999.0;
	s2 = combine(s2, sphere(p - vec3(sin(t * 1.5) * 1.2, sin(t * 1.5) * -0.8, cos(t * 1.5) * 1.2), 0.1));
	if (s2 < geo){
		mat = 2;
		geo = s2;
	} 

	float s3 = 999.0;
	s3 = combine(s3, sphere(p - vec3(sin(t) * 2.0, sin(t) * 0.5, cos(t) * 2.0), 0.2));
	if (s3 < geo){
		mat = 3;
		geo = s3;
	} 
	
	float s4 = 999.0;
	s4 = combine(s4, sphere(p - vec3(sin(t * 0.5) * 3.0, sin(t * 0.5) * 0.2, cos(t * 0.5) * 3.0), 0.4));
	if (s4 < geo){
		mat = 4;
		geo = s4;
	} 

	float s5 = 999.0;
	s5 = combine(s5, sphere(p - vec3(sin(t * 0.3) * 5.0, 0.0, cos(t * 0.3) * 5.0), 0.7));
	if (s5 < geo){
		mat = 5;
		geo = s5;
	} 

	

	geo = combine(geo, combine(s1, combine(s2, combine(s3, combine(s4, s5)))));
	return geo;
}

float RayMarch(vec3 rayOrigin, vec3 rayDirection){
	float distFromOrigin = 0.0;
	for (int i=0; i < MAX_STEPS; i++)
	{
		vec3 p = rayOrigin + distFromOrigin * rayDirection;
		float distToScene = Scene(p, matID);
		distFromOrigin += distToScene;
		if (distToScene < SURFACE_DIST) return distFromOrigin;
		if (distFromOrigin > MAX_DIST) return 0.0;
	}
	return 0.0;
}

vec3 GetNormal(vec3 p){
	vec2 e = vec2(0.0001, 0.0);
	vec3 n = vec3(
		Scene(p + e.xyy, matID) - Scene(p - e.xyy, matID), 
		Scene(p + e.yxy, matID) - Scene(p - e.yxy, matID), 
		Scene(p + e.yyx, matID) - Scene(p - e.yyx, matID));
	vec3 N = normalize(n);
	return N;
}

vec3 light = vec3(6.0, 10.0, 0.0);

float GetLight(vec3 p, vec3 N){
	vec3 L = normalize(light); // directional light
	L = normalize(light - p);

	float diffuse = clamp(dot(N, L), -1.0, 1.0);
	diffuse = pow(diffuse * 0.5 + 0.5, 2.0);
	return diffuse;
}

float softshadow( in vec3 ro, in vec3 rd, float mint, float maxt, float k )
{
    float res = 1.0;
    for( float t=mint; t<maxt; )
    {
        float h = Scene(ro + rd*t, matID);
        if( h<0.001 )
            return 0.0;
        res = min( res, k*h/t );
        t += h;
    }
    return res;
}

vec3 GetMat(vec3 p){
	vec3 mat = vec3(1.0);

	if (matID == 1){
		mat = vec3(0.1569, 0.0706, 0.9216);
	}
	if (matID == 2){
		mat = vec3(0.0706, 0.9216, 0.1137);
	}
	if (matID == 3){
		mat = vec3(0.9216, 0.6235, 0.0706);
	}
	if (matID == 4){
		mat = vec3(0.9216, 0.0706, 0.5373);
	}
	if (matID == 5){
		mat = vec3(0.3373, 0.0431, 0.4275);
	}

	return mat;
}

void main(){
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
		vec3 N = GetNormal(p);
		float diffuse = GetLight(p, N);
		// diffuse *= softshadow(p + N * 0.05, normalize(light - p), 0.01, 3.0, 4.0);
		vec3 mat = GetMat(p);
		color = mat * max(diffuse,0.05);
		//color = 0.5 + 0.5*GetNormal(p);
	}
	else 
	{
		//color = vec3((uv.y + 0.5)*0.6);
	}
	
	FragColor = vec4(color, 1.0);
};

