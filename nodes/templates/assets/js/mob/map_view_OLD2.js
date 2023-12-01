// Desc: MobMapView for Vitulus WebUI

var move_vector = new THREE.Vector3(0, 0, 0);

ROS3D.OrbitControls.prototype.zoomIn = function(zoomScale) {
  viewer.orthozoom += 0.1;
  viewer.zoom();
  console.log("zoomScaleIn");
  console.log(zoomScale);
};

ROS3D.OrbitControls.prototype.zoomOut = function(zoomScale) {
  viewer.orthozoom -= 0.1;
  viewer.zoom();     // console.log(move_vector);
            // viewer.x = move_vector.x;
            // viewer.y = move_vector.y;
            // viewer.zoom();
  console.log("zoomScaleOut");
  console.log(zoomScale);
};

ROS3D.OrbitControls.prototype.showAxes = function() {

  console.log("showAxes");
  console.log(interactive_markers);

};

ROS3D.OrbitControls.prototype.rotateLeft = function(angle) {
  if (angle === undefined) {
    angle = 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
  }
  viewer.viewer.cameraControls.thetaDelta -= angle;
  console.log(viewer);
};



ROS3D.OrbitControls.prototype.update = function() {
  // x->y, y->z, z->x

  var position = this.camera.position;
  var offset = position.clone().sub(this.center);

  // angle from z-axis around y-axis
  var theta = Math.atan2(offset.y, offset.x);

  // angle from y-axis
  var phi = Math.atan2(Math.sqrt(offset.y * offset.y + offset.x * offset.x), offset.z);

  if (this.autoRotate) {
    this.rotateLeft(2 * Math.PI / 60 / 60 * this.autoRotateSpeed);
  }

  theta += this.thetaDelta;
  phi += this.phiDelta;

  // restrict phi to be between EPS and PI-EPS
  var eps = 0.000001;
  phi = Math.max(eps, Math.min(Math.PI - eps, phi));

  var radius = offset.length();
  offset.set(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
  offset.multiplyScalar(this.scale);

  position.copy(this.center).add(offset);

  this.camera.lookAt(this.center);

  radius = offset.length();
  this.axes.position.copy(this.center);
  this.axes.scale.set(radius * 0.05, radius * 0.05, radius * 0.05);
  this.axes.updateMatrixWorld(true);

  this.thetaDelta = 0;
  this.phiDelta = 0;
  this.scale = 1;

  if (this.lastPosition.distanceTo(this.camera.position) > 0) {
    this.dispatchEvent({
      type : 'change', center: this.center,
    });
    this.lastPosition.copy(this.camera.position);

  }

    // console.log(this);

  if (this.camera.position.x > 0.00001 || this.camera.position.x < -0.00001){
    move_vector = this.camera.position.clone();
    // console.log(this.camera.position);
  }
  // move_vector = this.camera.position.clone();
  // console.log(viewer);
  // console.log(this.lastPosition);
  //   viewer.x += this.center.x;
  //   viewer.y += this.center.y;
  //   viewer.zoom();
  //   this.center_move = this.center.clone();
  // viewer.viewer.cameraControls.center_move = this.center_move;

};

ROS3D.Viewer.prototype.resize = function(width, height) {
    var ortho_width = width;
    var ortho_height = height;
    var ortho_aspect_ratio = ortho_width / ortho_height;
    var ortho_view_size = 100;
    var orthozoom = 20;
    this.camera.left = (-ortho_aspect_ratio*ortho_view_size)/orthozoom;
    this.camera.right = (ortho_aspect_ratio*ortho_view_size)/orthozoom;
    this.camera.top = ortho_view_size/orthozoom;
    this.camera.bottom = -ortho_view_size/orthozoom;

    console.log(this.camera);
    // this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
};


////////// Overwrite getColor() of OccupancyGrid for custom coloring of maps depends on type.
////////// It's controled through the color attr of OccupancyGridClient
ROS3D.OccupancyGrid.prototype.getColor = function(index, row, col, value) {

    //  Occupancy identifiers in color attribute of OccupancyGridClient
    //  {r:0,g:255,b:255} gridmap,
    //  {r:255,g:0,b:255} loc costmap,
    //  {r:255,g:255,b:0} glob costmap

    // If map is not costmap.
    if (this.color.r === 0 && this.color.g === 255 && this.color.b === 255){
        if (value === 100){   // obstacle
            return [0,0,0,255];
        };

        if (value === 0){    // free space
            return [149,149,149,150];
        };

        if (value <= 99 && value >= 1){  // probably obstacle
            return [149-value,149-value,149-value,150];
        };

        if (value === -1){  // unknown
            return [0,0,0,25];
            console.log(value);
        };
    };

    // If map is local costmap.
    if (this.color.r === 255 && this.color.g === 0 && this.color.b === 255){
        if (value === 100){   // obstacle
            return [255,0,0,255];
        };

        if (value === 0){    // free space
            return [0,0,0,10];
        };

        if (value <= 99 && value >= 1){  // probably obstacle
            return [149,149-value,149-value,255];
        };

        if (value === -1){  // unknown
            return [0,0,0,0];
            console.log(value);
        };
    };

    // If map is global costmap.
    if (this.color.r === 255 && this.color.g === 255 && this.color.b === 0){
        if (value === 100){   // obstacle
            return [0,0,0,255];
        };

        if (value === 0){    // free space
            return [149,149,149,0];
        };

        if (value <= 99 && value >= 1){  // probably obstacle
            return [149,149-value,149,125];
        };

        if (value === -1){  // unknown
            return [0,0,0,0];
            console.log(value);
        };
    };

    return [(value * this.color.r) / 255,
              (value * this.color.g) / 255,
              (value * this.color.b) / 255,
              255];

};



class ROS {
    constructor() {
        this.ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});
        console.log("Connected to ROS.");
    }
}


class Viewer3D{

    constructor(ros) {
        this.camHeihgt = 4;
        this.viewer = new ROS3D.Viewer({
            divID : 'map_view',
            width : 600,
            height : 600,
            near : 0.2,
            far : 100000,
            antialias : true,
            intensity : 1.0,
            alpha : 1.0,
            background : '#1e2f38',  // 1e2f38
            cameraPose : {  x : 0, y : 0, z : this.camHeihgt },
            displayPanAndZoomFrame : false
        });
        this.x = 0;
        this.y = 0;
        console.log(this.viewer.camera)
        // this.viewer.createCamera();
        console.log(this.viewer.renderer.getSize().width);
        this.touchStartPosition = new Array(2);
        this.touchMoveVector = new Array(2);

        var ortho_width = this.viewer.renderer.getSize().width;
        var ortho_height = this.viewer.renderer.getSize().height;
        this.ortho_aspect_ratio = ortho_width / ortho_height;
        this.ortho_view_size = this.camHeihgt;
        this.orthozoom = this.camHeihgt;
        var orthCam = new THREE.OrthographicCamera( (-this.ortho_aspect_ratio*this.ortho_view_size)*this.orthozoom,
                                                    (this.ortho_aspect_ratio*this.ortho_view_size)*this.orthozoom,
                                                    this.ortho_view_size*this.orthozoom,
                                                    -this.ortho_view_size*this.orthozoom ,
                                                    -1, 1000 );
        var last_camera = this.viewer.camera;
        // var last_cam_controls = this.viewer.cameraControls;
        // console.log(last_camera.position);
        orthCam.position.copy(last_camera.position);
        orthCam.rotation.copy(last_camera.rotation);
        this.viewer.camera = orthCam;
        // this.viewer.camera = new THREE.OrthographicCamera(
        // this.viewer.width / -2, this.viewer.width / 2, this.viewer.height / 2, this.viewer.height / -2, this.viewer.near, this.viewer.far);
        // // this.camera.position = this.cameraPose;
        // // this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        var controls = new ROS3D.OrbitControls({
            scene : this.viewer.scene,
            camera : this.viewer.camera,
            displayPanAndZoomFrame : this.viewer.cameraControls.displayPanAndZoomFrame,
            lineTypePanAndZoomFrame: this.viewer.cameraControls.lineTypePanAndZoomFrame
          });
        controls.addEventListener('mousedown', this.downMouse);

        this.viewer.cameraControls = controls;

        // this.viewer.cameraControlsd = this.viewer.cameraControls;
        this.viewer.cameraControls.update();

        // this.viewer.cameraControls.camera = this.viewer.camera;
        this.viewer.camera.updateProjectionMatrix();
        // this.viewer.start();
        this.zoom();
        this.viewer.stop();
        this.viewer.start();

        console.log(this.viewer.camera)


        // this.init();

    }

    // init(){
    //     console.log("Init viewer");
    //     this.viewer.cameraControls.addEventListener('mousewheel', function(event3d) {
    //    console.log(event3d);
    //    // console.log(viewer.viewer.cameraControls.scale)
    //    // console.log(viewer.viewer.camera.position.z)
    //    viewer.zoom();
    //    // var map_x = event3d.mouseRay.origin.x + (event3d.mouseRay.direction.x * event3d.mouseRay.origin.z);
    //    // var map_y = event3d.mouseRay.origin.y + (event3d.mouseRay.direction.y * event3d.mouseRay.origin.z);
    //    // console.log('x: ' + map_x + '  y: ' + map_y);
    // });
    //
    // }
    downMouse(event3d){
        console.log("downMouse");
        console.log(event3d);
    }

    zoom() {
        var ortho_width = this.viewer.renderer.getSize().width;
        var ortho_height = this.viewer.renderer.getSize().height;
        this.ortho_aspect_ratio = ortho_width / ortho_height;
        // this.orthozoom = this.viewer.camera.position.z;
        this.ortho_view_size = this.orthozoom;
        this.viewer.camera.left = ((this.ortho_aspect_ratio*this.ortho_view_size)*this.orthozoom) + this.x;
        this.viewer.camera.right = ((-this.ortho_aspect_ratio*this.ortho_view_size)*this.orthozoom) + this.x;
        this.viewer.camera.top = (-this.ortho_view_size*this.orthozoom) + this.y;
        this.viewer.camera.bottom = (this.ortho_view_size*this.orthozoom) + this.y;
        this.viewer.camera.updateProjectionMatrix();
        // console.log("Viewer:");
        // console.log(this.viewer);
        // console.log("CameraControls:");
        // console.log(this.viewer.cameraControls);
        // console.log("zoom: " + this.viewer.camera.position.z);
        // console.log("left: " + this.viewer.camera.left + " right: " + this.viewer.camera.right + " top: " + this.viewer.camera.top + " bottom: " + this.viewer.camera.bottom);
    }

    changeViewerSize(){
            var width = document.getElementById("map_view").clientWidth;
            var height = document.getElementById("map_view").clientHeight;
            var padding = parseInt((document.getElementById("map_view").style.padding).replace('px', ''));
            this.viewer.resize(width, height);
            document.getElementById("map_view").Width = width;
            document.getElementById("map_view").Height = height;
            this.zoom();
        };

    updateCam(){
        // this.viewer.cameraControls.rotateDown();
        // this.viewer.cameraControls.rotateLeft(-1.57);
        // this.viewer.camera.fov = 1;
        console.log(this.viewer);
    };


}


class ViewerGrid{
    constructor(viewer) {
        viewer.viewer.scene.add(new ROS3D.Grid({
                                        num_cells : 50,
                                        color: "#333333",
                                        lineWidth: 0.1,
                                        cellSize: 1.0,
        }));
    }
}


class MapTfClient{
    constructor(ros) {
        this.tfClientMap = new ROSLIB.TFClient({
          ros : ros.ros,
          angularThres : 0.01,
          transThres : 0.01,
          rate : 10.0,
          fixedFrame : '/map'
        });
    }
}

class MapPlanner{
    constructor(ros, map_tf_client, viewer) {
        this.map_offset =new ROSLIB.Pose({ position : new ROSLIB.Vector3({ x : 0, y : 0, z : -0.01 }),
                    orientation : new ROSLIB.Quaternion({ x : 0.0, y : 0.0, z : 0.0, w : 1.0 }) });
        this.gridClient = new ROS3D.OccupancyGridClient({
        ros : ros.ros,
        tfClient: map_tf_client,
        rootObject : viewer.scene,
        continuous: true,
        topic: '/rtabmap/grid_map',
        // topic: '/map_assembled',
        // topic: '/web_plan/map_edited',
        color: {r:0,g:255,b:255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
        opacity: 0.9,
        offsetPose: this.map_offset,
    });
    }
}



class MapLocalCostmap{

    constructor(ros, tfClient, scene) {
        console.log("Viewer1");
        console.log(viewer.viewer);
        this.map_offset = new ROSLIB.Pose({ position : new ROSLIB.Vector3({ x : 0, y : 0, z : 0.05 }),
                    orientation : new ROSLIB.Quaternion({ x : 0.0, y : 0.0, z : 0.0, w : 1.0 }) });
        this.gridClient = new ROS3D.OccupancyGridClient({
            ros : ros,
            tfClient: tfClient,
            rootObject : scene,
            continuous: true,
            compression: 'cbor',
            // topic: '/rtabmap/grid_map',
            // topic: '/map_assembled',
            // topic: '/web_plan/map_edited',
            topic: '/move_base_flex/local_costmap/costmap',
            color: {r:255,g:0,b:255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
            opacity: 0.4,
            offsetPose: this.map_offset,
        });

        console.log(this.gridClient);
        console.log("Viewer2");
        console.log(viewer.viewer);
    }
}

class LaserScan{
    constructor(ros, map_tf_client, viewer) {

        this.laser = new ROS3D.LaserScan({
            ros : ros.ros,
            tfClient: map_tf_client,
            rootObject : viewer.scene,
            topic: '/scan',
            material: { size: 0.02, color: 0x007bff }
        });
    }
}

class InteractiveMarkers{
    constructor(ros, map_tf_client, viewer) {
        this.imClient = new ROS3D.InteractiveMarkerClient({
          ros : ros,
          tfClient : map_tf_client,
          topic : '/interactive_marker',
          camera : viewer.camera,
          rootObject : viewer.selectableObjects
        });
        this.newInteractiveMarkerTopic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/new_interactive_marker',
            messageType : 'geometry_msgs/Pose'
        });
        this.init();
    }
    init(){
        this.newInteractiveMarkerTopic.advertise();
    }
}


window.onload = function () {
    ros = new ROS();
    viewer = new Viewer3D(ros);
    viewer.changeViewerSize();
    const resizeObserver =  new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.target.id === "map_view") {
                viewer.changeViewerSize();
            }
        }
    });
    resizeObserver.observe(document.getElementById("map_view"));
    viewer.updateCam();

    console.log("mousewheel before")
    console.log(viewer.viewer);
    console.log(viewer.viewer.cameraControls);
    // console.log(viewer.viewer.cameraControls.scale);

    viewer.viewer.cameraControls.addEventListener('change', function(event) {
            // console.log(move_vector);
            viewer.x = move_vector.y * -1;
            viewer.y = move_vector.x;
            viewer.zoom();
    });

    // viewer.viewer.cameraControls.addEventListener('mousewheel', function(event3d) {
    //    console.log(event3d);
    //    // console.log(viewer.viewer.cameraControls.scale)
    //    // console.log(viewer.viewer.camera.position.z)
    //    viewer.zoom();
    //    // var map_x = event3d.mouseRay.origin.x + (event3d.mouseRay.direction.x * event3d.mouseRay.origin.z);
    //    // var map_y = event3d.mouseRay.origin.y + (event3d.mouseRay.direction.y * event3d.mouseRay.origin.z);
    //    // console.log('x: ' + map_x + '  y: ' + map_y);
    // });

    // viewer.viewer.cameraControls.addEventListener('touchstart', function(event3d) {
    //     console.log("touchstart");
    //     console.log(event3d);
    //     switch (event3d.domEvent.touches.length) {
    //         case 2:
    //             viewer.touchStartPosition[0] = new THREE.Vector2(event3d.domEvent.touches[0].pageX,
    //                 event3d.domEvent.touches[0].pageY);
    //             viewer.touchStartPosition[1] = new THREE.Vector2(event3d.domEvent.touches[1].pageX,
    //                 event3d.domEvent.touches[1].pageY);
    //             viewer.touchMoveVector[0] = new THREE.Vector2(0, 0);
    //             viewer.touchMoveVector[1] = new THREE.Vector2(0, 0);
    //     event3d.domEvent.preventDefault();
    //     }
    // });

    // viewer.viewer.cameraControls.addEventListener('touchmove', function(event3d) {
    //    console.log(event3d);
    //    console.log(event3d.domEvent);
    //    console.log(event3d.domEvent.touches);
    //    console.log(viewer.viewer);
    //    switch (event3d.domEvent.touches.length) {
    //        case 1:
    //            console.log("case 1");
    //            // var moveStartNormal = new THREE.Vector3(0, 0, 1);
    //            // var rMat = new THREE.Matrix4().extractRotation(viewer.viewer.camera.matrix);
    //            // moveStartNormal.applyMatrix4(rMat);
    //            // moveStartCenter = viewer.viewer.cameraControls.center.clone();
    //            // moveStartPosition = viewer.viewer.cameraControls.camera.position.clone();
    //            // console.log(viewer.viewer.cameraControls.intersectViewPlane(event3d.mouseRay,
    //            //                                     moveStartCenter,
    //            //                                     moveStartNormal));
    //        case 2:
    //            viewer.zoom();
    //            // console.log(viewer.viewer.camera.position.z)
    //        // touchMoveVector[0].set(touchStartPosition[0].x - event3d.domEvent.touches[0].pageX,
    //        //                         touchStartPosition[0].y - event3d.domEvent.touches[0].pageY);
    //        // touchMoveVector[1].set(touchStartPosition[1].x - event3d.domEvent.touches[1].pageX,
    //        //                         touchStartPosition[1].y - event3d.domEvent.touches[1].pageY);
    //        // if (touchMoveVector[0].lengthSq() > touchMoveThreshold && touchMoveVector[1].lengthSq() > touchMoveThreshold) {
    //        //     touchStartPosition[0].set(event3d.domEvent.touches[0].pageX, event3d.domEvent.touches[0].pageY);
    //        //     touchStartPosition[1].set(event3d.domEvent.touches[1].pageX, event3d.domEvent.touches[1].pageY);
    //        //
    //    }
    //
    //
    //    // console.log(viewer.viewer.camera.position.z)
    //    // viewer.zoom();
    //
    // });


    viewer.viewer.addObject(new THREE.AmbientLight(0x696969));

    console.log("hasEventListener");

    console.log(viewer.viewer.cameraControls.hasEventListener ('mousedown'));
    viewer.viewer.cameraControls.addEventListener('mousedown', function(event3d) {
            console.log("mousedown");
            console.log(event3d);
        });

    map_tf_client = new MapTfClient(ros);
    laser_scan = new LaserScan(ros, map_tf_client.tfClientMap, viewer.viewer);
    map_planner = new MapPlanner(ros, map_tf_client.tfClientMap, viewer.viewer);

    viewer_grid = new ViewerGrid(viewer);
    map_local_costmap = new MapLocalCostmap(ros.ros,  map_tf_client.tfClientMap, viewer.viewer.scene);

    interactive_markers = new InteractiveMarkers(ros.ros,  map_tf_client.tfClientMap, viewer.viewer);
    viewer.viewer.cameraControls.addEventListener('mousedown', function(event3d) {
       console.log(event3d.mouseRay);
        if (btn_test1.textContent == 'TST1'){
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
            interactive_markers.newInteractiveMarkerTopic.publish(newInteractiveMarkerMsg);
            interactive_markers.imClient.rootObject.visible = true;
            // goal_btn.disabled = false;
        };
    });



    console.log("interactive_markers");
    console.log(interactive_markers)
    console.log(viewer.viewer)

    // map_local_costmap.gridClient.on('change', function() {
    //     console.log("costmap change");
    //     console.log(viewer.viewer);
    //     console.log(map_local_costmap.gridClient.currentGrid.message.info);
    //     map_local_costmap.gridClient.currentGrid.visible = true;
    //
    // });
    btn_test1.onclick = function() {
        // ++viewer.x;
        // console.log("test1");
        // viewer.zoom();
        viewer.viewer.cameraControls.rotateLeft(0.1);
        // viewer.viewer.draw();
        // viewer.viewer.camera.position.x = viewer.x;
        // console.log(viewer.viewer.camera.position.x);
        // viewer.viewer.camera.updateProjectionMatrix();

    };
    btn_test2.onclick = function() {
        // --viewer.x;
        // console.log("test2");
        // viewer.zoom();
        viewer.viewer.cameraControls.rotateRight(0.1);
        // viewer.viewer.draw();
        console.log(viewer.viewer)
        // viewer.viewer.camera.position.x = viewer.x;
        // console.log(viewer.viewer.camera.position.x);
        // viewer.viewer.camera.updateProjectionMatrix();

    };





}