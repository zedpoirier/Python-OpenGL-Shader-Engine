//----------------------------------------------------
// Primitive Operations (Constructive Solid Geometry)
//----------------------------------------------------

vec2 Scene(vec3 p, float dt = 0.0){}

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