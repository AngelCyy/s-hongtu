THREE.WebGLCanvas = function(isMobile , widthOffset , height , domElement , resSrc)
{
    this.canHeight = height;
    this.domElement = domElement;

    var vertexShaderCode =
    [
        //"#extension GL_OES_standard_derivatives : enable",
        "#define MAX_POINT_LIGHTS 0",

        "attribute vec4 tangent;",
        "uniform vec3 ambientLightColor;",

        "#if MAX_POINT_LIGHTS > 0",
        "uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
        "varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",
        "#endif",

        "#ifdef USE_SHADOWMAP",
        "varying vec4 vShadowCoord[ MAX_SHADOWS ];",
        "uniform mat4 shadowMatrix[ MAX_SHADOWS ];",
        "#endif",

        "varying vec3 vNormal;",
        "varying vec3 vViewPosition;",
        "varying vec2 vUv;",

        "varying vec3 vWorldPosition;",
        "varying vec3 vTangent;",
        "varying vec3 vBinormal;",
        "varying vec3 vWorldNormal;",

        "void main()",
        "{",
            "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
            "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
            "vWorldPosition = worldPosition.xyz;",

            "vNormal = normalize( normalMatrix * normal );",
            "vWorldNormal = normalize( mat3( modelMatrix[ 0 ].xyz, modelMatrix[ 1 ].xyz, modelMatrix[ 2 ].xyz ) * normal );",
            "vViewPosition = -mvPosition.xyz;",
            "gl_Position = projectionMatrix * mvPosition;",

        "#ifdef USE_SHADOWMAP",
            "for( int i = 0; i < MAX_SHADOWS; i ++ )",
            "{",
                "vShadowCoord[ i ] = shadowMatrix[ i ] * ( modelMatrix * vec4( mappedPosition, 1.0 ) );",
            "}",
        "#endif",
        "}",
    ].join("\n");

    var fragmentShaderCode =
    [
        //"#extension GL_OES_standard_derivatives : enable",

		"#define MAX_DIR_LIGHTS 0",
		"#define MAX_POINT_LIGHTS 0",

        "uniform vec2 resolution;",
        "uniform float time;",
        "uniform vec3 ambientLightColor;",
        "uniform float roughnessScale;",
        "uniform float diffuseScale;",
        "uniform float iorScale;",

        "#if MAX_DIR_LIGHTS > 0",
        "uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
        "uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
        "#endif",

        "#if MAX_POINT_LIGHTS > 0",
        "uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
        "uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
        "varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",
        "#endif",

        "uniform samplerCube diffuseAmbientCube;",
        "uniform samplerCube lightDirectionCube;",

        "uniform samplerCube glossLowReflectionCube;",
        "uniform samplerCube glossMidReflectionCube;",
        "uniform samplerCube glossHighReflectionCube;",

        "varying vec2 vUv;",
        "varying vec3 vNormal;",
        "varying vec3 vViewPosition;",
        "varying vec3 vWorldPosition;",
        "varying vec3 vWorldNormal;",

        "varying vec3 vTangent;",
        "varying vec3 vBinormal;",

        "//#define saturate( value ) clamp( value, 0.0, 1.0 )",
        "#define lerp( x, y, a ) mix( x, y, a )",
        "#define Pi 3.14159",
        "#define OneOverPi 0.318310",
        "#define sqr(x) pow( x, 2.0 )",
        "#define lumcoeff vec3( 0.299, 0.587, 0.114 )",

        "float CalculateGGX( float roughness, float cosThetaM )",
        "{",
        "float CosSquared = cosThetaM * cosThetaM;",
        "float alpha = roughness * roughness;",
        "float GGX = CosSquared * ( alpha - 1.0 ) + 1.0;",
        "return ( alpha ) / ( Pi * GGX * GGX );",
        "}",

        "float CalculateGeometric( float n_dot_x, float roughness )",
        "{",
        "return n_dot_x / ( n_dot_x * ( 1.0 - roughness ) + roughness );",
        "}",

        "float CalculateGeometricAtten( float n_dot_l, float n_dot_v, float roughness )",
        "{",
        "float roughnessRemap = roughness * 0.5; ",
        "float atten = CalculateGeometric( n_dot_v, roughnessRemap ) * CalculateGeometric( n_dot_l, roughnessRemap );",
        "return atten;",
        "}",

        "float Fresnel( float x, float y, float z )",
        "{",
        "return x + ( z - x ) * pow( 1.0 - y, 5.0 );",
        "}",

        /*"float CalculateLambert( float h_dot_d, float n_dot_v, float n_dot_l, float roughness )",
        "{",
        "float frk = 0.5 + 2.0 * h_dot_d * h_dot_d * roughness;        ",
        "return Fresnel( 1.0, n_dot_v, frk ) * Fresnel( 1.0, n_dot_l, frk );",
        "}",*/

        "vec3 CalculatePBRLighting( vec3 diffuse, float scattering, float roughness, float SRNI, float specular, vec3 normal, float n_dot_v, vec3 lightDirection, vec3 viewPosition, float n_dot_l )",
        "{",
        "if( n_dot_l <= 0.0 )",
        "return vec3( 0.0 );",

        "diffuse *= 0.625;",
        "vec3 halfVector = normalize( lightDirection + viewPosition );",

        "float h_dot_n = saturate( dot(    halfVector, normal ) );",
        "float h_dot_v = max( dot(    halfVector, viewPosition ), 0.0 );",
        "float h_dot_d = dot( lightDirection, halfVector );",

        "float fresnel = Fresnel( SRNI, h_dot_v, 1.0 );",

        "float distribution = CalculateGGX( roughness, h_dot_n );",
        "float geometricAttenuation = CalculateGeometricAtten( n_dot_l, h_dot_v, roughness );",
        "float specFinal = max( distribution * fresnel * geometricAttenuation * saturate( 1.0 / ( 4.0 * n_dot_l * n_dot_v ) ), 0.0 ) * specular;",

        "vec3 lambert = OneOverPi * diffuse;// * max( CalculateLambert( h_dot_d, n_dot_v, n_dot_l, 1.0 - roughness ), 0.0 );",
        "return n_dot_l * ( lambert + specFinal ) * 3.0;",
        "}",

        "float SampleCubeLuminance( samplerCube cube, vec3 position )",
        "{",
        "vec3 sample = textureCube( cube, vec3( -position.x, position.yz ) ).rgb;",
        "return dot( lumcoeff, sample );",
        "}",

        "vec3 CalculateLightNormal( samplerCube cube, in vec3 pos )",
        "{",
        "const vec3 eps = vec3( 0.5, 0.0, 0.0 ) ;",
        "return normalize( vec3(",
        "SampleCubeLuminance( cube, pos + eps.xyy ) - SampleCubeLuminance( cube, pos - eps.xyy ),",
        "SampleCubeLuminance( cube, pos + eps.yxy ) - SampleCubeLuminance( cube, pos - eps.yxy ),",
        "SampleCubeLuminance( cube, pos + eps.yyx ) - SampleCubeLuminance( cube, pos - eps.yyx ) ) );",
        "}",

        "vec3 CalculateIBL( vec3 diffuse, float scattering, float roughness, float SRNI, float specular, vec3 normal, vec3 viewDirection, vec3 reflectionVector, float  n_dot_v )",
        "{",
        "vec3 ambientDiffuse       = textureCube( diffuseAmbientCube, vec3( -vWorldNormal.x,     vWorldNormal.yz ) ).rgb;",
        "vec3 diffuseReflection    = textureCube( diffuseAmbientCube, vec3( -reflectionVector.x, reflectionVector.yz ) ).rgb;",

        "vec3 correctedReflection     = vec3( -reflectionVector.x, reflectionVector.yz );",
        "vec3 glossLowReflection      = textureCube( glossLowReflectionCube, correctedReflection ).rgb;",
        "vec3 glossMidReflection      = textureCube( glossMidReflectionCube, correctedReflection ).rgb;",
        "vec3 glossHighReflection     = textureCube( glossHighReflectionCube,correctedReflection ).rgb;",

        "vec3 finalReflection = lerp( glossLowReflection, glossMidReflection,  saturate( roughness * 1.5 ) );",
        "finalReflection      = lerp( finalReflection,    glossHighReflection, saturate( roughness - 0.666 ) * 3.0 );",

        "float irradianceLuminance = dot( lumcoeff, ambientDiffuse );",
        "float irradianceReflectionLuminance = dot( lumcoeff, diffuseReflection );",

        "float fresnel = Fresnel( SRNI, n_dot_v, 1.0 );",
        "return ( diffuse * OneOverPi * ambientDiffuse ) + ( specular * fresnel * finalReflection );",
        "}",
        "void main()	",
        "{",
        "float roughness = roughnessScale;",
        "vec3 diffuse = vec3( diffuseScale );",
        "float scattering = 0.05;",
        "float ior = iorScale;",
        "float SRNI = pow( ( 1.0 - ior ) / ( 1.0 + ior ), 2.0 );",
        "float specular = 1.25;",

        "vec3 normal = normalize( vNormal );",
        "vec3 viewPosition = normalize( vViewPosition );",

        "vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );",
        "vec3 reflectVec = reflect( cameraToVertex, vWorldNormal );",

        "float n_dot_v = dot( normal, viewPosition );",
        "roughness *= 0.5 + saturate( 0.5 - ( 0.5 + n_dot_v * 0.5 ) * 0.5 );",
        "n_dot_v = saturate( n_dot_v );",

        // PBR Lighting
        "vec3 lightAccumulation = CalculateIBL( diffuse, scattering, roughness, SRNI, specular, normal, viewPosition, reflectVec, n_dot_v );",

        "#if MAX_DIR_LIGHTS > 0",
        "for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) ",
        "{",
        "vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
        "vec3 dirVector = normalize( lDirection.xyz );",

        "float n_dot_l = dot( dirVector, normal );",
        "lightAccumulation += directionalLightColor[i].xyz * CalculatePBRLighting( diffuse, scattering, roughness, SRNI, specular, normal, n_dot_v, dirVector, viewPosition, n_dot_l ) * shadowTerm;",
        "}",
        "#endif",

        "#if MAX_POINT_LIGHTS > 0",
        "for( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) ",
        "{",

        "vec3 pointVector = ( viewMatrix * vec4( pointLightPosition[ i ], 1.0 ) ).xyz + vViewPosition.xyz;",
        "vec3 pointDirection = normalize( pointVector );",
        "float pointDistance = length( pointVector ) * 0.00333;",

        "float falloff = saturate( 1.0 - pow( pointDistance / 1.0, 4.0 ) );",
        "falloff *= falloff;",
        "falloff /= ( pointDistance * pointDistance ) + 1.0;",

        "float n_dot_l = dot( pointDirection, normal );",
        "lightAccumulation += pointLightColor[i].xyz * CalculatePBRLighting( diffuse, scattering, roughness, SRNI, specular,",
        "normal, n_dot_v, pointDirection, viewPosition, n_dot_l ) * falloff;",
        "}",
        "#endif",

        "gl_FragColor = vec4( lightAccumulation, 1.0 );",
        "}",
    ].join("\n");

    var camera, scene, renderer;

    var texture_placeholder,
    isUserInteracting = false,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0,
    lon = 0, onMouseDownLon = 0,
    lat = 0, onMouseDownLat = 0,
    phi = 0, theta = 0;
    var numSpheres = 65;

    var sphereMeshes = [];
    var directionalLight, pointLight1, pointLight2;

    var canWidth = window.innerWidth - widthOffset;
    var canHeight = height;

    var Settings = function () {
        this.Roughness = 1.0;
        this.RefractiveIndex = 3;
        this.Diffusion = 0.8;
    }
    var settings = new Settings();
	
	var sceneIbl = null;
	var sceneOffice = null;
	
	var sceneParticle = null;

	var sceneIdx = 0;
	
    this.setupWebGLCanvas = function()
    {
        init();
        animate();
    }
	
	this.switchScene = function (dir)
	{
		for (var i = scene.children.length - 1; i >= 0; i--) 
		{
			scene.remove(scene.children[i]);
		}
		
		sceneIdx = (sceneIdx + 1) % 3;
		
		switch (sceneIdx)
		{
			case 0:
			{
				if (sceneIbl == null)
				{
					sceneIbl = new THREE.Object3D()
					initIbl();
				}
				scene.add(sceneIbl);
			}
			break;
			
			case 1:
			{
				if (sceneOffice == null)
				{
					sceneOffice = new THREE.Object3D()
					initOffice();
				}
			
				camera.position.copy(new THREE.Vector3(7.64, 6.87, -1.30));
				var targetPostition = new THREE.Vector3(4.01 , 4.58 , -3.17);
				camera.lookAt(targetPostition);
			
				scene.add(sceneOffice);
				
				renderer.setClearColor(0x8079e8);
			}
			
			break;
			
			case 2:
			{
				if (sceneParticle == null)
				{
					sceneParticle = new THREE.Object3D();
					
					initParticle();
				}
				
				scene.add(sceneParticle);
				
				renderer.setClearColor(0x000000);
			}
			break;
		}
	}

    function addMeshToScene(geometry, scale, x, y, z, rx, ry, rz, material) {
        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(scale, scale, scale);
        mesh.position.set(x, y, z);
        mesh.rotation.set(rx, ry, rz);

        sceneIbl.add(mesh);
    }

    function addObjectToScene(object, scale, x, y, z, rx, ry, rz, material) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                addMeshToScene(child.geometry, scale, x, y, z, rx, ry, rz, material);
            }
        });
    }

    function LoadCube(src) {
        var format = '.jpg';
        var urls = [
                src + 'c00' + format, src + 'c01' + format,
                src + 'c02' + format, src + 'c03' + format,
                src + 'c04' + format, src + 'c05' + format
        ];

        var reflectionCube = THREE.ImageUtils.loadTextureCube(urls);
        reflectionCube.format = THREE.RGBFormat;
        return reflectionCube;
    }
	
	function initIbl()
	{
		if (sceneIbl == null)
		{
			sceneIbl = new THREE.Object3D();
		}
		
		var diffuseAmbientCube = LoadCube(resSrc + "data/IBL/Grace/Irradiance/");
        var glossLowReflectionCube = LoadCube(resSrc + "data/IBL/Grace/LowGloss/");
        var glossMidReflectionCube = LoadCube(resSrc + "data/IBL/Grace/MidGloss/");
        var glossHighReflectionCube = glossMidReflectionCube;//LoadCube(resSrc + "data/IBL/Grace/HighGloss/");

        // Skybox
        var shader = THREE.ShaderLib["cube"];
        shader.uniforms["tCube"].value = glossLowReflectionCube;//LoadCube(resSrc + "data/IBL/Grace/LowGloss/");
        var material = new THREE.ShaderMaterial(
        {
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        }),
        mesh = new THREE.Mesh(new THREE.CubeGeometry(1000, 1000, 1000), material);
        sceneIbl.add(mesh);

        // Spheres
        var geo = new THREE.SphereGeometry(3, 64, 64);
        geo.computeTangents();
        for (var i = 0; i < numSpheres; i++) 
        {
        	var newMat = null;
        	
			isMobile = true;
			
        	if (isMobile)
        	{
				newMat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, envMap: glossLowReflectionCube, envMapIntensity : 2.0, roughness: Math.random(), metalness: Math.random() });
        	}
        	else
        	{
        		var iuniforms = THREE.UniformsUtils.merge([
                THREE.UniformsLib["lights"], THREE.UniformsLib["shadowmap"], {
                    roughnessScale: { type: "f", value: 0.7 },
                    diffuseScale: { type: "f", value: 0.05 },
                    iorScale: { type: "f", value: 0.05 },

                    "diffuseAmbientCube": { type: "t", value: null },

                    "glossLowReflectionCube": { type: "t", value: null },
                    "glossMidReflectionCube": { type: "t", value: null },
                    "glossHighReflectionCube": { type: "t", value: null }
                }]);

	            iuniforms["diffuseAmbientCube"].value = diffuseAmbientCube;
	            iuniforms["glossLowReflectionCube"].value = glossLowReflectionCube;
	            iuniforms["glossMidReflectionCube"].value = glossMidReflectionCube;
	            iuniforms["glossHighReflectionCube"].value = glossHighReflectionCube;

	            newMat = new THREE.ShaderMaterial({
	                uniforms: iuniforms,
	                vertexShader: vertexShaderCode,// document.getElementById('vertexShader').textContent,
	                fragmentShader: fragmentShaderCode,// document.getElementById('fragmentShader').textContent,
	                lights: true
	            });
        	}

            var sphereMesh = new THREE.Mesh(geo, newMat);
            sphereMesh.position.x = Math.random() * 300 - 150;
            sphereMesh.position.y = Math.random() * 300 - 150;
            sphereMesh.position.z = Math.random() * 300 - 150;
            sphereMesh.scale.x = sphereMesh.scale.y = sphereMesh.scale.z = Math.random() * 3 + 1;

            if (i == 0) {
                sphereMesh.position.set(5, -1, 5);
                sphereMesh.scale.set(1.25, 1.25, 1.25);
            }

            sceneIbl.add(sphereMesh);
            sphereMeshes.push(sphereMesh);
        }

		if (isMobile === false)
		{
			pointLight1 = new THREE.PointLight(0xff2222);
	        pointLight1.scale.set(0.05, 0.05, 0.05);
	        pointLight1.position.set(0, 5, 0);
	        sceneIbl.add(pointLight1);

	        pointLight2 = new THREE.PointLight(0xff2222);
	        pointLight2.scale.set(0.05, 0.05, 0.05);
	        pointLight2.position.set(0, -5, 0);
	        sceneIbl.add(pointLight2);
		}
		else
		{
			pointLight1 = new THREE.PointLight(0xff2222);
	        pointLight1.scale.set(0.05, 0.05, 0.05);
	        pointLight1.position.set(0, 5, 0);
	        //sceneIbl.add(pointLight1);
	        
			pointLight2 = new THREE.DirectionalLight(0xaaaaaa);
	        pointLight2.scale.set(0.05, 0.05, 0.05);
	        pointLight2.position.set(0, -5, 0);
	        //sceneIbl.add(pointLight2);
		}
	}
	
	function initOffice()
	{
		if (sceneOffice == null)
		{
			sceneOffice = new THREE.Object3D();
		}
		
		var manager = new THREE.LoadingManager();
		manager.onProgress = function ( item, loaded, total ) {

			console.log( item, loaded, total );

		};
		
		var texture = new THREE.Texture();

		var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				console.log( Math.round(percentComplete, 2) + '% downloaded' );
			}
		};

		var onError = function ( xhr ) {
		};


		var loader = new THREE.ImageLoader( manager );
		loader.load( 'source/InteriorOffice/SimpleOffice_Texture.png', function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;

		} );

		// model
		
		var centerOffset = new THREE.Vector3();

		var loader = new THREE.OBJLoader( manager );
		loader.load( 'source/InteriorOffice/office.obj', function ( object ) {

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {

					child.material.map = texture;

				}

			} );
			
			mesh = object;
			sceneOffice.add(mesh);

			mesh.traverse( function( node )
			{
				if ( node instanceof THREE.Mesh )
				{
					//node.geometry.computeVertexNormals();
				}
				
				if (node.material)
				{
					//node.material.side = THREE.DoubleSide;
				}
			} );

			objBox3 = new THREE.Box3().setFromObject(mesh);
			
			centerOffset.x = -(objBox3.min.x + objBox3.max.x) * 0.5 * 0.0;
			centerOffset.y = -(objBox3.min.y + objBox3.max.y) * 0.5 * 0.0;
			centerOffset.z = -(objBox3.min.z + objBox3.max.z) * 0.5 * 0.0;
			
			mesh.translateX(centerOffset.x);
			mesh.translateY(centerOffset.y);
			mesh.translateZ(centerOffset.z);

			console.log("=============Max: " + objBox3.max.x + ", " + objBox3.max.y + ", " + objBox3.max.z);
			console.log("=============Min: " + objBox3.min.x + ", " + objBox3.min.y + ", " + objBox3.min.z);

			//controls.reset();

			camera.position.copy(new THREE.Vector3(7.64, 6.87, -1.30));
			var targetPostition = new THREE.Vector3(4.01 , 4.58 , -3.17);
			camera.lookAt(targetPostition);
			//controls.target.copy(targetPostition);

		}, onProgress, onError );
		
		var loader = new THREE.ObjectLoader();
		loader.load('source/InteriorOffice/scene.json', function (obj)
		{
			mesh = obj;
			
			mesh.traverse( function( node )
			{
				if ( node instanceof THREE.Light )
				{
					//node.geometry.computeVertexNormals();
					console.log("====================== is light: " + node.intensity + ", " + node.distance + ", " + node.name + ", " + node.exponent);
					
					node.intensity = node.intensity * 0.3;
					node.distance = 10;
					
					node.translateX(centerOffset.x);
					node.translateY(centerOffset.y);
					node.translateZ(centerOffset.z);
					
					if (node.name == "DynLight0")
					{
						node.visible = false;
						
						dynLightGreen = new THREE.SpotLight(node.color);
						dynLightGreen.position.set(node.position.x , node.position.y , node.position.z);
						dynLightGreen.distance = node.distance;
						dynLightGreen.intensity = node.intensity * 4;
						dynLightGreen.penumbra = 0.5;
					}
					
					if (node.name == "DynLight1")
					{
						node.visible = false;
						
						dynLightRed = new THREE.SpotLight(node.color);
						dynLightRed.position.set(node.position.x , node.position.y , node.position.z);
						dynLightRed.distance = node.distance;
						dynLightRed.intensity = node.intensity * 5;
						dynLightRed.penumbra = 0.5;
					}
				}
				else
				{
					if (node.name == "DynLight0_target")
					{
						dynLightGreenTarget = node;
					}
					
					if (node.name == "DynLight1_target")
					{
						dynLightRedTarget = node;
					}
				}
			} );
			
			dynLightGreen.target = dynLightGreenTarget;
			dynLightRed.target = dynLightRedTarget;
			
			sceneOffice.add(dynLightGreen);
			sceneOffice.add(dynLightRed);
			
			sceneOffice.add(obj);
		});
	}

	var proton, emitter;
    var clock, spring, controls;
    var color1, color2, tha = 0, hcolor = 0;
		
	var ctha = 0;
    var r = 500;
	function initParticle()
	{
		if (sceneParticle == null)
		{
			sceneParticle = new THREE.Object3D();
		}
		
		clock = new THREE.Clock();
		
		//addScene();
        addControls();
        addLights();
        addStars();
        addProton();
		
		console.log('add particle');
	}
	
	function addScene() {
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 500;
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xffffff, 1, 10000);

        clock = new THREE.Clock();

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
    }

    function addControls() {
        controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
    }

    function addLights() {
        var ambientLight = new THREE.AmbientLight(0x101010);
        sceneParticle.add(ambientLight);

        var pointLight = new THREE.PointLight(0xffffff, 2, 1000, 1);
        pointLight.position.set(0, 200, 200);
        sceneParticle.add(pointLight);
    }

    function addStars() {
        var geometry = new THREE.Geometry();
        for (var i = 0; i < 10000; i++) {
            var vertex = new THREE.Vector3();
            vertex.x = THREE.Math.randFloatSpread(2000);
            vertex.y = THREE.Math.randFloatSpread(2000);
            vertex.z = THREE.Math.randFloatSpread(2000);
            geometry.vertices.push(vertex);
        }
        var particles = new THREE.Points(geometry, new THREE.PointsMaterial({
            color: 0x888888,
			size:2
        }));
        sceneParticle.add(particles);
    }

    function addProton() {
        proton = new Proton();

        emitter = new Proton.Emitter();
        //setRate
        emitter.rate = new Proton.Rate(new Proton.Span(4, 16), new Proton.Span(.01));
        //addInitialize
        emitter.addInitialize(new Proton.Position(new Proton.PointZone(0, 0)));
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(6, 12));
        emitter.addInitialize(new Proton.Life(3));
        emitter.addInitialize(new Proton.V(45, new Proton.Vector3D(0, 1, 0), 180));
        //addBehaviour
        emitter.addBehaviour(new Proton.Alpha(1, 0));
        emitter.addBehaviour(new Proton.Scale(.1, 1.3));

        color1 = new THREE.Color();
        color2 = new THREE.Color();
        colorBehaviour = new Proton.Color(color1, color2);
        emitter.addBehaviour(colorBehaviour);

        emitter.emit();
        //add emitter
        proton.addEmitter(emitter);
        proton.addRender(new Proton.SpriteRender(scene));
    }

    function createSprite() {
        var map = new THREE.TextureLoader().load("./img/dot.png");
        var material = new THREE.SpriteMaterial({
            map: map,
            color: 0xff0000,
            blending: THREE.AdditiveBlending,
            fog: true
        });
        return new THREE.Sprite(material);
    }

    function setColor() {
        hcolor += .01;
        color1.setHSL(hcolor - (hcolor >> 0), 1, .5);
        color2.setHSL(hcolor - (hcolor >> 0) + .3, 1, .5);
        //colorBehaviour.reset(color1, color2);
    }
	
    function init()
    {
		console.log('---------------------------------------------------- ');
        var container, mesh;

        var container = domElement;

        camera = new THREE.PerspectiveCamera(60, canWidth / canHeight, 1, 1100);
        camera.target = new THREE.Vector3(0, 0, 0);

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: "mediump" });
        renderer.setSize(canWidth, canHeight);

		renderer.setClearColor(0x8079e8);
		
		//initIbl();
		//scene.add(sceneIbl);
		//sceneIdx = 0;
		
		//initOffice();
		//scene.add(sceneOffice);
		//renderer.setClearColor(0x8079e8);
		//sceneIdx = 1;
		
		initParticle()
		scene.add(sceneParticle);
		renderer.setClearColor(0x000000);
		sceneIdx = 2;
		
        container.appendChild(renderer.domElement);

        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = "0px";
        renderer.domElement.style.left = "0px";

        /*
        var gui = new dat.GUI();
        var guiShading = gui.addFolder('Shading');
        guiShading.add( settings, 'Roughness', 0, 1 );
        guiShading.add( settings, 'Roughness', 0, 1 );
        guiShading.add( settings, 'Roughness', 0, 1 );
        guiShading.add( settings, 'Diffusion', 0, 1 );
        guiShading.add( settings, 'RefractiveIndex', 1, 6 );
        guiShading.open();
        //*/
        container.addEventListener('mousedown', onDocumentMouseDown, false);
        container.addEventListener('mousemove', onDocumentMouseMove, false);
        container.addEventListener('mouseup', onDocumentMouseUp, false);
        //container.addEventListener('mousewheel', onDocumentMouseWheel, false);
        container.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
        //

        container.addEventListener('resize', onWindowResize, true);

        window.onresize = function ()
        {
            console.log("==================================== on Window Resize");

            canWidth = window.innerWidth - widthOffset;

            camera.aspect = canWidth / canHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(canWidth, canHeight);
        }

    }

    function onWindowResize() {

        console.log("==================================== on Window Resize");
        canWidth = window.innerWidth - widthOffset;

        camera.aspect = canWidth / canHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(canWidth, canHeight);

    }

    function onDocumentMouseDown(event) {

        event.preventDefault();

        isUserInteracting = true;

        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;

        onPointerDownLon = lon;
        onPointerDownLat = lat;
		
		if (event.button == 0)
		{
			if (sceneIdx == 1)
			{
				var ratio = ( event.clientX / window.innerWidth );
				
				if (ratio > 0.5)
				{
					dynLightRed.visible = !dynLightRed.visible;
				}
				else
				{
					dynLightGreen.visible = !dynLightGreen.visible;
				}
			}
		}
    }

    function onDocumentMouseMove(event) {

        if (isUserInteracting === true) {

            lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
            lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;

        }

    }

    function onDocumentMouseUp(event) {

        isUserInteracting = false;

    }

    function onDocumentMouseWheel(event) {

        // WebKit

        if (event.wheelDeltaY) {

            camera.fov -= event.wheelDeltaY * 0.05;

            // Opera / Explorer 9

        } else if (event.wheelDelta) {

            camera.fov -= event.wheelDelta * 0.05;

            // Firefox

        } else if (event.detail) {

            camera.fov += event.detail * 1.0;

        }

        camera.updateProjectionMatrix();

    }

    function animate() {

        requestAnimationFrame(animate);
        update();

    }

    var r = 6.5;
    function update() {

        if (isUserInteracting === false) {

            lon += 0.1;

        }

		if (sceneIdx == 0)
		{
			if (isMobile === false)
			{
				sphereMeshes[0].material.uniforms["roughnessScale"].value = settings.Roughness;
				sphereMeshes[0].material.uniforms["diffuseScale"].value = settings.Diffusion;
				sphereMeshes[0].material.uniforms["iorScale"].value = settings.RefractiveIndex;
			}

			var d = 0.0;
			for (var i = 1; i < numSpheres; i++) 
			{
				d += 0.1;
				
				if (isMobile === false)
				{
					sphereMeshes[i].material.uniforms["roughnessScale"].value = Math.max(Math.min(0.5 + Math.sin(d + r * 1.25) * 0.5, 0.95), 0.05);
					sphereMeshes[i].material.uniforms["diffuseScale"].value = Math.max(Math.min(0.5 + Math.cos(d + r * 1.5) * 0.5, 0.95), 0.05);
					sphereMeshes[i].material.uniforms["iorScale"].value = Math.max(Math.min(2.5 + Math.sin(d + r * 0.325) * 1.0, 3.95), 1.0);
				}
			}
			
			pointLight1.position.x = -12 * Math.sin(r);
			pointLight1.position.y = -2 * Math.sin(-r) + 4;
			pointLight1.position.z = -2 + Math.cos(r) * 25;

			pointLight2.position.x = 12 * Math.cos(-r);
			pointLight2.position.y = 3 * Math.cos(r) - 4;
			pointLight2.position.z = -2 + Math.sin(r) * 20;

			r += 0.01;
			
			
			lat = Math.max(-85, Math.min(85, lat));
			phi = THREE.Math.degToRad(90 - lat);
			theta = THREE.Math.degToRad(lon);

			camera.position.x = 18 * Math.sin(phi) * Math.cos(theta);
			camera.position.y = 18 * Math.cos(phi);
			camera.position.z = 18 * Math.sin(phi) * Math.sin(theta);

			camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
		}
		else if (sceneIdx == 2)
		{
			var delta = clock.getDelta();

			setColor();

			delta < 5 / 60 && proton.update(delta);
			tha += Math.PI / 150;
			var p = 300 * Math.sin(2 * tha)
			emitter.p.x = p * Math.cos(tha);
			emitter.p.y = p * Math.sin(tha);
			emitter.p.z = p * Math.tan(tha) / 2;

			renderer.render(scene, camera);
			//controls.update();
			camera.lookAt(scene.position);

			ctha += .016;
			r = 300;
			camera.position.x = Math.sin(ctha) * r;
			camera.position.z = Math.cos(ctha) * r;
			camera.position.y = Math.sin(ctha) * r;
		}

        renderer.render(scene, camera);

    }
}