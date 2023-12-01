

window.onload = function () {
    const ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});

    const viewer = new ROS3D.Viewer({
        divID: 'viewer',
        ros: ros,
        width: window.innerWidth,
        height: window.innerHeight,
		near : 20,
		far : 6000,
		antialias : true,
		intensity : 1.0,
		alpha : 1.0,
		background : '#1e2f38',  // 1e2f38
		cameraPose : {  x : 0, y : 0, z : 1000 },
		displayPanAndZoomFrame : false
    });
    console.log(viewer.camera.getEffectiveFOV());
    console.log(viewer.camera.getFilmHeight());
    console.log(viewer.camera.getFilmWidth());
    console.log(viewer.camera.getFocalLength());
    console.log(viewer.camera.filmGauge);
    console.log(viewer.camera.focus);
    console.log(viewer.camera.zoom);
    console.log(viewer.camera.view);
    console.log(viewer.camera.aspect);

	// viewer.camera.focus = 100000.0;
	viewer.camera.filmGauge = 0.04;
	// viewer.camera.zoom = 120;
	viewer.camera.setFocalLength(1.0);
	viewer.cameraControls.rotateDown();
    viewer.camera.updateProjectionMatrix();
    console.log(viewer);
    console.log(viewer.camera.getEffectiveFOV());
    console.log(viewer.camera.getFilmHeight());
    console.log(viewer.camera.getFilmWidth());
    console.log(viewer.camera.getFocalLength());
    console.log(viewer.camera.filmGauge);
    console.log(viewer.camera.focus);
    console.log(viewer.camera.zoom);

	  const tfClientMap = new ROSLIB.TFClient({
        ros: ros,
        angularThres: 0.01,
        transThres: 0.01,
        rate: 10.0,
        fixedFrame: '/map'
    });


	var imClient = new ROS3D.InteractiveMarkerClient({
      ros : ros,
      tfClient : tfClientMap,
      topic : '/interactive_marker',
      camera : viewer.camera,
      rootObject : viewer.selectableObjects
    });





    ////////// click on map publisher
    var newInteractiveMarkerTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/new_interactive_marker',
        messageType : 'geometry_msgs/Pose'
    });
    newInteractiveMarkerTopic.advertise();

    viewer.cameraControls.addEventListener('mousedown', function(event3d) {
		console.log("event3d");
		console.log(event3d);
        console.log(imClient);
        console.log(viewer);
       if (true){
           console.log(event3d.mouseRay);
           var map_x = event3d.mouseRay.origin.x + (event3d.mouseRay.direction.x * event3d.mouseRay.origin.z);
           var map_y = event3d.mouseRay.origin.y + (event3d.mouseRay.direction.y * event3d.mouseRay.origin.z);
    //       console.log('x: ' + map_x + '  y: ' + map_y);
            var newInteractiveMarkerMsg = new ROSLIB.Message({
                position : {
                          x : map_x,
                          y : map_y,
                          z : 0
                        },
                        orientation : {
                          x : 0.0,
                          y : 0.0,
                          z : 0.0,
                          w : 1.0
                        }

            });
            newInteractiveMarkerTopic.publish(newInteractiveMarkerMsg);
            imClient.rootObject.visible = true;
            console.log(viewer.selectableObjects.children[0].children[1]);
            console.log(viewer.highlighter.hoverObjs);
            viewer.highlighter.hoverObjs[viewer.selectableObjects.children[0].children[1].uuid] = viewer.selectableObjects.children[0].children[1];
            // goal_btn.disabled = false;
        };
    });

    viewer.cameraControls.addEventListener('touchstart', function(event3d) {
		console.log("event3d");
		console.log(event3d);
		console.log(event3d.domEvent.touches);
        console.log(imClient);
        console.log(viewer);
       if (event3d.domEvent.touches.length == 2){
           console.log(event3d.mouseRay);
           var map_x = event3d.mouseRay.origin.x + (event3d.mouseRay.direction.x * event3d.mouseRay.origin.z);
           var map_y = event3d.mouseRay.origin.y + (event3d.mouseRay.direction.y * event3d.mouseRay.origin.z);
    //       console.log('x: ' + map_x + '  y: ' + map_y);
            var newInteractiveMarkerMsg = new ROSLIB.Message({
                position : {
                          x : map_x,
                          y : map_y,
                          z : 0
                        },
                        orientation : {
                          x : 0.0,
                          y : 0.0,
                          z : 0.0,
                          w : 1.0
                        }

            });
            newInteractiveMarkerTopic.publish(newInteractiveMarkerMsg);
            imClient.rootObject.visible = true;
            console.log(viewer.selectableObjects.children[0].children[1]);
            console.log(viewer.highlighter.hoverObjs);
            viewer.highlighter.hoverObjs[viewer.selectableObjects.children[0].children[1].uuid] = viewer.selectableObjects.children[0].children[1];
            // goal_btn.disabled = false;
        };
    });



    viewer.scene.add(new ROS3D.Grid({num_cells : 50, color: "#333333"}));

    var v0 = new ROSLIB.Vector3({x: 0, y: 0, z: -0.00});
    var v1 = new ROSLIB.Vector3({x: 0, y: 0, z: -0.082});
    var v2 = new ROSLIB.Vector3({x: 0, y: 0, z: -0.081});
    var v3 = new ROSLIB.Vector3({x: 0, y: 0, z: 0.01});
    var q1 = new ROSLIB.Quaternion({x: 0.0, y: 0.0, z: 0.0, w: 0.0});
    var z_offset_map = new ROSLIB.Pose({position: v1, orientation: q1});
    var z_offset_map2 = new ROSLIB.Pose({position: v0, orientation: q1});
    var z_offset_glob_cost = new ROSLIB.Pose({position: v2, orientation: q1});
    var z_offset_loc_cost = new ROSLIB.Pose({position: v3, orientation: q1});


    var gridClient = new ROS3D.OccupancyGridClient({
        ros: ros,
        tfClient: tfClientMap,
        rootObject: viewer.scene,
        continuous: true,
        topic: '/rtabmap/grid_map',
        // topic: '/map_assembled',
        // topic: '/web_plan/map_edited',
        color: {r: 0, g: 255, b: 255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
        opacity: 0.99,
        offsetPose: z_offset_map
    });

     var localCostmapClient = new ROS3D.OccupancyGridClient({
        ros : ros,
        tfClient: tfClientMap,
        rootObject : viewer.scene,
        continuous: true,
        topic: '/move_base_flex/local_costmap/costmap',
        color: {r:255,g:0,b:255},
        opacity: 0.4,
        offsetPose: z_offset_loc_cost
    });



     var laser = new ROS3D.LaserScan({
      ros : ros,
      tfClient: tfClientMap,
      rootObject : viewer.scene,
      topic: '/scan',
      material: { size: 2, color: 0x007bff }
    });

    // Add your 3D objects or other ROS3D components here

    // function animate() {
    //   // Update your animations or interactions here
    //   orbitControls.update(); // Update orbit controls
    //   viewer.render(); // Render the scene
    //   requestAnimationFrame(animate);
    // }
    //
    // animate();
    console.log("Orthographic camera with orbit controls loaded");
    console.log(viewer);

    const euler = new THREE.Euler(0, 0, 0, 'XYZ');
    // btn_highlite.onclick = function() {
    slider_marker_z.oninput = function() {
        console.log(viewer);
        console.log("webgui_marker");
        console.log(viewer.scene.getObjectByName("webgui_marker"));
        const marker = viewer.scene.getObjectByName("webgui_marker");
        // console.log(viewer.selectableObjects.children[0].children[1]);
        // console.log(viewer.highlighter.hoverObjs);
        // euler.z = euler.z + 0.1;
        euler.z = parseFloat(slider_marker_z.value);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(euler);
        console.log(quaternion);
        const rotate_z = viewer.scene.getObjectByName("rotate_z");
        // marker.quaternion.copy(quaternion);
        // marker.rotateAxis.bind(marker, rotate_z, quaternion);
        marker.setOrientation(rotate_z, quaternion);

        // viewer.highlighter.hoverObjs[viewer.selectableObjects.children[0].children[1].uuid] = viewer.selectableObjects.children[0].children[1];


        // console.log("webgui_marker");
        // console.log(viewer.scene.getObjectByName("webgui_marker"));
    };

    var interactiveMarkerGoalTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/interactive_marker_goal',
        messageType : 'std_msgs/String'
    });

    interactiveMarkerGoalTopic.advertise();

    btn_goal.onclick = function() {
        console.log('Sending interactive marker goal.');
        var interactiveMarkerGoalMsg = new ROSLIB.Message({
            data : 'interactiveGoal',
        });
        interactiveMarkerGoalTopic.publish(interactiveMarkerGoalMsg);
    };
    console.log(viewer.scene.getObjectByName("webgui_marker"));
}