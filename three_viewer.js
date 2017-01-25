$(document).ready( function() {
  $("div.three_viewer").each( function(viewer_index) {
    var canvas_width = $(this).width();
    var canvas_height = $(this).height();
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, canvas_width/canvas_height, 0.1, 1000);
    camera.position.z = -5.5;
    camera.lookAt(new THREE.Vector3(0,0,0));
    var renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize( canvas_width, canvas_height );
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    var shadow = $(this).attr("three_shadow");
    if (shadow === "false")
      renderer.shadowMap.enabled = false;
    else
      renderer.shadowMap.enabled = true;

    $(this).append(renderer.domElement);

    var prev_x = undefined;
    var prev_y = undefined;
    var quaternion = new THREE.Quaternion();
    $(renderer.domElement)
      .mousedown( function(evt) { prev_x = evt.offsetX; prev_y = evt.offsetY; })
      .mouseup( function(evt) { prev_x = undefined; prev_y = undefined; })
      .mousemove( function(evt) {
        if (typeof prev_x === "undefined") return;
        if (typeof prev_y === "undefined") return;
        var delta_x = Math.PI/180*(evt.offsetX-prev_x)*.5;
        var delta_y = Math.PI/180*(evt.offsetY-prev_y)*.5;
        var delta_quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-delta_y, delta_x, 0, 'XYZ'));
        quaternion.multiplyQuaternions(delta_quaternion, quaternion);
        prev_x = evt.offsetX;
        prev_y = evt.offsetY;
      });

    {
      var light_directional = new THREE.DirectionalLight( 0xffffff, .6 );
      light_directional.position.set(0,5,0);
      light_directional.castShadow = true;
      light_directional.shadow.camera.top = 15;
      light_directional.shadow.camera.bottom = -15;
      light_directional.shadow.mapSize.width = 1024;
      light_directional.shadow.mapSize.height = 1024;
      scene.add( light_directional );
      //scene.add( new THREE.CameraHelper(light_directional.shadow.camera) );
    }
    {
      var light_ambient = new THREE.AmbientLight(0xffffff, .3);
      scene.add(light_ambient);
    }
    {
      var light_point = new THREE.PointLight(0xffffff, .3, 100);
      light_point.position.set(1,0,-3);
      scene.add(light_point);
    }

    var plane = undefined;
    {
      var geometry = new THREE.PlaneBufferGeometry( 10.5, 5.5 );
      var material_flat = new THREE.MeshPhongMaterial({ color: 0xffffff});
      plane = new THREE.Mesh( geometry, material_flat );
      plane.position.y =  -2.5;
      plane.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2);
      plane.receiveShadow = true;
      scene.add(plane);
    }

    var root = undefined;
    {
      root = new THREE.AxisHelper(1);
      root.castShadow = true;
      scene.add( root );
    }

    var json_filename = $(this).attr("three_json");
    var origin_str = $(this).attr("three_origin");
    var scale_str = $(this).attr("three_scale");
    console.log("loading "+json_filename);
    var json_loader = new THREE.JSONLoader();
    json_loader.load(json_filename, function(geometry, materials) {
      console.log("got "+json_filename+" geometry");
      var mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
      mesh.castShadow = true;
      if (typeof origin_str !== "undefined") {
        origin_splitted = origin_str.split(",");
        console.log("origin "+json_filename+" "+origin_splitted);
        mesh.position.x = -parseFloat(origin_splitted[0]);
        mesh.position.y = -parseFloat(origin_splitted[1]);
        mesh.position.z = -parseFloat(origin_splitted[2]);
      }
      if (typeof scale_str !== "undefined") {
        console.log("scale "+json_filename+" "+scale_str);
        root.scale.set(parseFloat(scale_str), parseFloat(scale_str), parseFloat(scale_str));
      }
      root.add(mesh);
    });

    var render = function () {
      root.quaternion.copy(quaternion);
      renderer.render(scene, camera);

      requestAnimationFrame( render );
    };

    render();
  });
});
