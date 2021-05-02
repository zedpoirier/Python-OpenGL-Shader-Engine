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
#define SURFACE_DIST 0.0001
#define PI 3.14159

int matID = 0;
vec3 uvw = vec3(0.0);

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

float Scene(vec3 p, out int mat, out vec3 uvw){
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
	vec3 pos1 = p;
	s1 = combine(s1, sphere(pos1, 1.0));
	if (s1 < geo){ mat = 1; uvw = pos1; }
	geo = combine(geo, s1);

	float s2 = 999.0;
	vec3 pos2 = p - vec3(sin(t * 1.5) * 1.2, sin(t * 1.5) * -0.8, cos(t * 1.5) * 1.2);
	s2 = combine(s2, sphere(pos2, 0.1));
	if (s2 < geo){ mat = 2; uvw = pos2; }
	geo = combine(geo, s2);

	float s3 = 999.0;
	vec3 pos3 = p - vec3(sin(t) * 2.0, sin(t) * 0.5, cos(t) * 2.0);
	s3 = combine(s3, sphere(pos3, 0.2));
	if (s3 < geo){ mat = 3; uvw = pos3; }
	geo = combine(geo, s3);
	
	float s4 = 999.0;
	vec3 pos4 = p - vec3(sin(t * 0.5) * 3.0, sin(t * 0.5) * 0.2, cos(t * 0.5) * 3.0);
	s4 = combine(s4, sphere(pos4, 0.4));
	if (s4 < geo){ mat = 4; uvw = pos4; }
	geo = combine(geo, s4);

	float s5 = 999.0;
	vec3 pos5 = p - vec3(sin(t * 0.3) * 5.0, 0.0, cos(t * 0.3) * 5.0);
	s5 = combine(s5, sphere(pos5, 0.7));
	if (s5 < geo){ mat = 5; uvw = pos5; }
	geo = combine(geo, s5);

	

	geo = combine(geo, combine(s1, combine(s2, combine(s3, combine(s4, s5)))));
	return geo;
}

float RayMarch(vec3 rayOrigin, vec3 rayDirection){
	float distFromOrigin = 0.0;
	for (int i=0; i < MAX_STEPS; i++)
	{
		vec3 p = rayOrigin + distFromOrigin * rayDirection;
		float distToScene = Scene(p, matID, uvw);
		distFromOrigin += distToScene;
		if (distToScene < SURFACE_DIST) return distFromOrigin;
		if (distFromOrigin > MAX_DIST) return 0.0;
	}
	return 0.0;
}

vec3 GetNormal(vec3 p){
	vec2 e = vec2(0.0001, 0.0);
	vec3 n = vec3(
		Scene(p + e.xyy, matID, uvw) - Scene(p - e.xyy, matID, uvw), 
		Scene(p + e.yxy, matID, uvw) - Scene(p - e.yxy, matID, uvw), 
		Scene(p + e.yyx, matID, uvw) - Scene(p - e.yyx, matID, uvw));
	vec3 N = normalize(n);
	return N;
}

vec3 light = vec3(0.0, 0.0, 0.0);

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
        float h = Scene(ro + rd*t, matID, uvw);
        if( h<0.001 )
            return 0.0;
        res = min( res, k*h/t );
        t += h;
    }
    return res;
}

vec3 GetMat(vec3 p){
	vec3 color = vec3(0.6588, 0.6471, 0.6471);

	vec3 N = GetNormal(p);
	float diffuse = GetLight(p, N);
	// diffuse *= softshadow(p + N * 0.05, normalize(light - p), 0.01, 3.0, 4.0);


	if (matID == 1){ // sun
		color =  vec3(0.8941, 0.8431, 0.1451);
	}
	else {
		if (matID == 2){
			color = vec3(0.0706, 0.9216, 0.1137);
		}
		if (matID == 3){
			float noise = fractalNoise(uvw * 2.0, 3);
			vec3 colA = vec3(0.1569, 0.0706, 0.9216);
			vec3 colB = vec3(0.1176, 0.6863, 0.0431);
			color =  mix(colA, colB, noise);
		}
		if (matID == 4){
			float r = 3.14;
			float noise = fractalNoise(uvw * vec3(1.0, 10.0, 1.0), 3);
			vec3 colA = vec3(0.5412, 0.0078, 0.0078);
			vec3 colB = vec3(0.9216, 0.0706, 0.5373);
			color = mix(colA, colB, noise);
		}
		if (matID == 5){
			color = vec3(0.3373, 0.0431, 0.4275);
		}

		color *= max(diffuse,0.05);
	}
	return color;
}

#define TINY 0.001
#define AA 1 // bool

void main(){
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
	uv *= 1.8; // works as FOV kinda

	// camera and ray setup
	vec3 ro = camPos;
	vec3 rt = vec3(0.0, 0.0, 0.0);
	vec3 color = vec3(0.0);
	vec3 tmpCol  = vec3(0.0);

	#if AA > 0
	// multisample scene
	for	(int x = -1; x < 2; x ++){
		for	(int y = -1; y < 2; y ++){
			float xCoord = uv.x + TINY * x;
			float yCoord = uv.y + TINY * y;
			vec3 rd = normalize(vec3(xCoord, yCoord, -1.0));
			rd = (viewMatrix(ro, rt) * vec4(rd, 0.0)).xyz;

			float d = RayMarch(ro, rd);
			if (d > 0.0)
			{
				vec3 p = ro + rd * d;
				tmpCol += GetMat(p);
				//color = 0.5 + 0.5*GetNormal(p);
			}
			else // background
			{
				vec3 p = rd;
				float cloudNoise = fractalNoise(p * 1.0, 3);
				vec3 cloudColA = vec3(0.3059, 0.7373, 0.9059);
				vec3 cloudColB = vec3(0.0667, 0.7804, 0.102);
				vec3 clouds = mix(cloudColA, cloudColB, cloudNoise);
				float cloudMix = fractalNoise(p * 2.5, 2);
				cloudMix = smoothstep(0.3, 1.2, cloudMix);
				tmpCol += cloudMix * clouds * 0.3;
				float stars = fractalNoise(rd * 50.0, 3);
				stars = smoothstep(0.98, 1.3, stars);
				tmpCol += vec3(stars);
			}
		}
	}
	color = tmpCol / 9; // 3 x 3 grid of smaples
	#else
		float xCoord = uv.x;
		float yCoord = uv.y;
		vec3 rd = normalize(vec3(xCoord, yCoord, -1.0));
		rd = (viewMatrix(ro, rt) * vec4(rd, 0.0)).xyz;

		float d = RayMarch(ro, rd);
		if (d > 0.0)
		{
			vec3 p = ro + rd * d;
			tmpCol += GetMat(p);
			//color = 0.5 + 0.5*GetNormal(p);
		}
		else // background
		{
			vec3 p = rd;
			float cloudNoise = fractalNoise(p * 1.0, 3);
			vec3 cloudColA = vec3(0.3059, 0.7373, 0.9059);
			vec3 cloudColB = vec3(0.0667, 0.7804, 0.102);
			vec3 clouds = mix(cloudColA, cloudColB, cloudNoise);
			float cloudMix = fractalNoise(p * 2.5, 2);
			cloudMix = smoothstep(0.3, 1.2, cloudMix);
			tmpCol += cloudMix * clouds * 0.3;
			float stars = fractalNoise(rd * 50.0, 3);
			stars = smoothstep(0.98, 1.3, stars);
			tmpCol += vec3(stars);
		}
		color = tmpCol;
	#endif
	
	color = pow( color, vec3(0.4545) ); // gamma correction
	FragColor = vec4(color, 1.0);
};

