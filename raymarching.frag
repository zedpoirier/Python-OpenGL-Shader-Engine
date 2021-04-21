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

// raymarching somets called sphere tracing
#define MAX_STEPS 100
#define MAX_DIST 1000.0
#define SURFACE_DIST 0.001
#define PI 3.14159

//----------------------------------------------------
// Primitive Operations (Constructive Solid Geometry)
//----------------------------------------------------

float combine(float distA, float distB)
{
	return min(distA, distB);
}

float intersect(float distA, float distB)
{
	return max(distA, distB);
}

float difference(float distA, float distB)
{
	return max(distA, -distB);
}

float sphere( vec3 p, float s )
{
  return length(p)-s;
}

float line( vec3 p, float r, vec3 a = vec3(0.0, 0.0, 0.0), vec3 b = vec3(0.0, 1.0, 0.0))
{
  vec3 pa = p - a, ba = b - a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa - ba*h ) - r;
}

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

float RayMarch(vec3 rayOrigin, vec3 rayDirection)
{
	float distFromOrigin = 0.0;
	for (int i=0; i < MAX_STEPS; i++)
	{
		vec3 p = rayOrigin + distFromOrigin * rayDirection;
		float distToScene = Scene(p).x;
		distFromOrigin += distToScene;
		if (distToScene < SURFACE_DIST) return distFromOrigin;
		if (distFromOrigin > MAX_DIST) return 0.0;
	}
	return 0.0;
}

vec3 Lighting(vec3 p, float dt = 0.0)
{
	vec3 lightPos = vec3(4.0, 10.0, -3.0); // light within scene
	vec3 L = normalize(lightPos - p);
	L = normalize(lightPos); // light as a "sun" direction (reusing lightpos)

	vec2 e = vec2(0.0001, 0.0);
	vec3 n = vec3(
		Scene(p + e.xyy, dt).x - Scene(p - e.xyy, dt).x, 
		Scene(p + e.yxy, dt).x - Scene(p - e.yxy, dt).x, 
		Scene(p + e.yyx, dt).x - Scene(p - e.yyx, dt).x);
	vec3 N = normalize(n);

	float diffuse = clamp(dot(N, L), -1.0, 1.0);
	diffuse = pow(diffuse * 0.5 + 0.5, 2.0);
	//float d = RayMarch(p + normal * 0.05, lightDir);
	//if(d < length(lightPos - p)) diff *= 0.1;

	vec3 mat = vec3(1.0);
	float matID = Scene(p, dt).y;
	if (matID > 0.5){
		mat = vec3(0.1569, 0.0706, 0.9216);
	}
	if (matID > 1.5){
		mat = vec3(0.0706, 0.9216, 0.1137);
	}
	if (matID > 2.5){
		mat = vec3(0.9216, 0.6235, 0.0706);
	}
	if (matID > 3.5){
		mat = vec3(0.9216, 0.0706, 0.5373);
	}
	if (matID > 4.5){
		mat = vec3(0.0471, 0.8431, 0.9451);
	}

	vec3 color = mat * max(diffuse,0.05);
	return color;
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

