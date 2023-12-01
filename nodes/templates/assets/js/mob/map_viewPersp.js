// Desc: MobIMU for Vitulus WebUI

// Overwrite camera in ROS3D.Viewer to orthographic camera.


// /**
//  * @fileOverview
//  * @author David Gossow - dgossow@willowgarage.com
//  * @author Russell Toris - rctoris@wpi.edu
//  * @author Jihoon Lee - jihoonlee.in@gmail.com
//  */
// /**
//  * A Viewer can be used to render an interactive 3D scene to a HTML5 canvas.
//  *
//  * @constructor
//  * @param options - object with following keys:
//  *
//  *  * divID - the ID of the div to place the viewer in
//  *  * elem - the elem to place the viewer in (overrides divID if provided)
//  *  * width - the initial width, in pixels, of the canvas
//  *  * height - the initial height, in pixels, of the canvas
//  *  * background (optional) - the color to render the background, like '#efefef'
//  *  * alpha (optional) - the alpha of the background
//  *  * antialias (optional) - if antialiasing should be used
//  *  * intensity (optional) - the lighting intensity setting to use
//  *  * cameraPosition (optional) - the starting position of the camera
//  *  * displayPanAndZoomFrame (optional) - whether to display a frame when
//  *  *                                     panning/zooming. Defaults to true.
//  *  * lineTypePanAndZoomFrame - line type for the frame that is displayed when
//  *  *                           panning/zooming. Only has effect when
//  *  *                           displayPanAndZoomFrame is set to true.
//  */
//
// ROS3D.ViewerOrtho = function(options) {
//   options = options || {};
//   var divID = options.divID;
//   var elem = options.elem;
//   var width = options.width;
//   var height = options.height;
//   var background = options.background || '#111111';
//   var antialias = options.antialias;
//   var intensity = options.intensity || 0.66;
//   var near = options.near || 0.01;
//   var far = options.far || 1000;
//   var alpha = options.alpha || 1.0;
//   var cameraPosition = options.cameraPose || {
//     x : 3,
//     y : 3,
//     z : 3
//   };
//   var cameraZoomSpeed = options.cameraZoomSpeed || 0.5;
//   var displayPanAndZoomFrame = (options.displayPanAndZoomFrame === undefined) ? true : !!options.displayPanAndZoomFrame;
//   var lineTypePanAndZoomFrame = options.lineTypePanAndZoomFrame || 'full';
//   // create the canvas to render to
//   this.renderer = new THREE.WebGLRenderer({
//     antialias : antialias,
//     alpha: true
//   });
//   this.renderer.setClearColor(parseInt(background.replace('#', '0x'), 16), alpha);
//   this.renderer.sortObjects = false;
//   this.renderer.setSize(width, height);
//   this.renderer.shadowMap.enabled = false;
//   this.renderer.autoClear = false;
//   // create the global scene
//   this.scene = new THREE.Scene();
//   // create the global camera
//   // this.camera = new THREE.PerspectiveCamera(40, width / height, near, far);
//   var ortho_width = width;
//     var ortho_height = height;
//     this.ortho_aspect_ratio = ortho_width / ortho_height;
//     this.ortho_view_size = cameraPosition.z;
//     this.orthozoom = cameraPosition.z;
//     this.camera = new THREE.OrthographicCamera( (-this.ortho_aspect_ratio*this.ortho_view_size)*this.orthozoom,
//                                                 (this.ortho_aspect_ratio*this.ortho_view_size)*this.orthozoom,
//                                                 this.ortho_view_size*this.orthozoom,
//                                                 -this.ortho_view_size*this.orthozoom ,
//                                                 -1, 1000 );
//   this.camera.position.x = cameraPosition.x;
//   this.camera.position.y = cameraPosition.y;
//   this.camera.position.z = cameraPosition.z;
//   // add controls to the camera
//   // this.cameraControls = new ROS3D.OrbitControls({
//   //   scene : this.scene,
//   //   camera : this.camera,
//   //   displayPanAndZoomFrame : displayPanAndZoomFrame,
//   //   lineTypePanAndZoomFrame: lineTypePanAndZoomFrame
//   // });
//   // this.cameraControls.userZoomSpeed = cameraZoomSpeed;
//   // lights
//   this.scene.add(new THREE.AmbientLight(0x555555));
//   this.directionalLight = new THREE.DirectionalLight(0xffffff, intensity);
//   this.scene.add(this.directionalLight);
//   // propagates mouse events to three.js objects
//   this.selectableObjects = new THREE.Group();
//   this.scene.add(this.selectableObjects);
//   var mouseHandler = new ROS3D.MouseHandler({
//     renderer : this.renderer,
//     camera : this.camera,
//     rootObject : this.selectableObjects,
//     fallbackTarget : this.cameraControls
//   });
//   // highlights the receiver of mouse events
//   this.highlighter = new ROS3D.Highlighter({
//     mouseHandler : mouseHandler
//   });
//   this.stopped = true;
//   this.animationRequestId = undefined;
//   // add the renderer to the page
//   var node = elem || document.getElementById(divID);
//   node.appendChild(this.renderer.domElement);
//   // begin the render loop
//   this.start();
// };
// /**
//  *  Start the render loop
//  */
// ROS3D.ViewerOrtho.prototype.start = function(){
//   this.stopped = false;
//   this.draw();
// };
// /**
//  * Renders the associated scene to the viewer.
//  */
// ROS3D.ViewerOrtho.prototype.draw = function(){
//   if(this.stopped){
//     // Do nothing if stopped
//     return;
//   }
//   // update the controls
//   // this.cameraControls.update();
//   // put light to the top-left of the camera
//   // BUG: position is a read-only property of DirectionalLight,
//   // attempting to assign to it either does nothing or throws an error.
//   //this.directionalLight.position = this.camera.localToWorld(new THREE.Vector3(-1, 1, 0));
//   this.directionalLight.position.normalize();
//   // set the scene
//   this.renderer.clear(true, true, true);
//   // this.renderer.render(this.scene, this.camera);
//   this.renderer.render(this.scene, this.camera);
//   this.highlighter.renderHighlights(this.scene, this.renderer, this.camera);
//   // draw the frame
//   this.animationRequestId = requestAnimationFrame(this.draw.bind(this));
// };
// /**
//  *  Stop the render loop
//  */
// ROS3D.ViewerOrtho.prototype.stop = function(){
//   if(!this.stopped){
//     // Stop animation render loop
//     cancelAnimationFrame(this.animationRequestId);
//   }
//   this.stopped = true;
// };
// /**
//  * Add the given THREE Object3D to the global scene in the viewer.
//  *
//  * @param object - the THREE Object3D to add
//  * @param selectable (optional) - if the object should be added to the selectable list
//  */
// ROS3D.ViewerOrtho.prototype.addObject = function(object, selectable) {
//   if (selectable) {
//     this.selectableObjects.add(object);
//   } else {
//     this.scene.add(object);
//   }
// };
// /**
//  * Resize 3D viewer
//  *
//  * @param width - new width value
//  * @param height - new height value
//  */
// ROS3D.ViewerOrtho.prototype.resize = function(width, height) {
//   // this.camera.aspect = width / height;
//   // this.camera.updateProjectionMatrix();
//   // this.renderer.setSize(width, height);
//     var ortho_width = width;
//     var ortho_height = height;
//     var ortho_aspect_ratio = ortho_width / ortho_height;
//     var ortho_view_size = 100;
//     var orthozoom = 20;
//     this.camera.left = (-ortho_aspect_ratio*ortho_view_size)/orthozoom;
//     this.camera.right = (ortho_aspect_ratio*ortho_view_size)/orthozoom;
//     this.camera.top = ortho_view_size/orthozoom;
//     this.camera.bottom = -ortho_view_size/orthozoom;
//
//     console.log(this.camera);
//     // this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(width, height);
// };
//
//


// ROS3D.Viewer.prototype.resize = function(width, height) {
//     var ortho_width = width;
//     var ortho_height = height;
//     var ortho_aspect_ratio = ortho_width / ortho_height;
//     var ortho_view_size = 100;
//     var orthozoom = 20;
//     this.camera.left = (-ortho_aspect_ratio*ortho_view_size)/orthozoom;
//     this.camera.right = (ortho_aspect_ratio*ortho_view_size)/orthozoom;
//     this.camera.top = ortho_view_size/orthozoom;
//     this.camera.bottom = -ortho_view_size/orthozoom;
//
//     console.log(this.camera);
//     // this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(width, height);
// };


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
        this.camHeihgt = 7;
        // this.viewer = new ROS3D.ViewerOrtho({
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
        console.log(this.viewer.camera)
        // this.viewer.createCamera();
        // console.log(this.viewer.renderer.getSize().width);
        // this.touchStartPosition = new Array(2);
        // this.touchMoveVector = new Array(2);
        //
        // var ortho_width = this.viewer.renderer.getSize().width;
        // var ortho_height = this.viewer.renderer.getSize().height;
        // this.ortho_aspect_ratio = ortho_width / ortho_height;
        // this.ortho_view_size = this.camHeihgt;
        // this.orthozoom = this.camHeihgt;
        // var orthCam = new THREE.OrthographicCamera( (-this.ortho_aspect_ratio*this.ortho_view_size)*this.orthozoom,
        //                                             (this.ortho_aspect_ratio*this.ortho_view_size)*this.orthozoom,
        //                                             this.ortho_view_size*this.orthozoom,
        //                                             -this.ortho_view_size*this.orthozoom ,
        //                                             -1, 1000 );
        // var last_camera = this.viewer.camera;
        // // var last_cam_controls = this.viewer.cameraControls;
        // console.log(last_camera.position);
        // orthCam.position.copy(last_camera.position);
        // orthCam.rotation.copy(last_camera.rotation);
        // this.viewer.camera = orthCam;
        // // this.viewer.camera = new THREE.OrthographicCamera(
        // // this.viewer.width / -2, this.viewer.width / 2, this.viewer.height / 2, this.viewer.height / -2, this.viewer.near, this.viewer.far);
        // // // this.camera.position = this.cameraPose;
        // // // this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        // // this.viewer.cameraControls.camera = this.viewer.camera;
        // this.viewer.camera.updateProjectionMatrix();
        // // this.viewer.start();
        // this.zoom();
        //
        // console.log(this.viewer.camera)

    }

    zoom() {
        var ortho_width = this.viewer.renderer.getSize().width;
        var ortho_height = this.viewer.renderer.getSize().height;
        this.ortho_aspect_ratio = ortho_width / ortho_height;
        this.orthozoom = this.viewer.camera.position.z;
        this.ortho_view_size = this.viewer.camera.position.z;
        this.viewer.camera.left = (-this.ortho_aspect_ratio*this.ortho_view_size)*this.orthozoom;
        this.viewer.camera.right = (this.ortho_aspect_ratio*this.ortho_view_size)*this.orthozoom;
        this.viewer.camera.top = this.ortho_view_size*this.orthozoom;
        this.viewer.camera.bottom = -this.ortho_view_size*this.orthozoom;
        this.viewer.camera.updateProjectionMatrix();
        console.log("zoom: " + this.viewer.camera.position.z);
        console.log("left: " + this.viewer.camera.left + " right: " + this.viewer.camera.right + " top: " + this.viewer.camera.top + " bottom: " + this.viewer.camera.bottom);
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
        this.viewer.cameraControls.rotateDown();
        this.viewer.cameraControls.rotateLeft(-1.57);
        this.viewer.camera.fov = 10.0;
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
          angularThres : 0.00,
          transThres : 0.00,
          rate : 10.0,
          fixedFrame : '/map'
        });
    }
}

class BaseTfClient{
    constructor(ros) {
        this.tfClient = new ROSLIB.TFClient({
          ros : ros.ros,
          angularThres : 0.01,
          transThres : 0.01,
          rate : 10.0,
          fixedFrame : '/base_link'
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
        // topic: '/move_base_flex/local_costmap/costmap',
        color: {r:0,g:255,b:255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
        opacity: 0.4,
        offsetPose: this.map_offset,
    });
    }
}

// class MapScene{
//     constructor(ros, map_tf_client, viewer) {
//         this.MapScenePose = new ROS3D.SceneNode({
//           frameID : '/base_link',
//           tfClient : map_tf_client.tfClientMap,
//     //      object : new ROS3D.Grid()
//         });
//     frontViewer.scene.add(frontScenePose);
//     }
// }

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



window.onload = function () {
    ros = new ROS();
    viewer = new Viewer3D(ros);
    // viewer.updateCam();
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
    //
    // console.log(viewer.viewer.cameraControls);
    // console.log(viewer.viewer.cameraControls.scale);
    // viewer.viewer.cameraControls.addEventListener('mousewheel', function(event3d) {
    //    // console.log(event3d);
    //    // console.log(viewer.viewer.cameraControls.scale)
    //    // console.log(viewer.viewer.camera.position.z)
    //    viewer.zoom();
    //    // var map_x = event3d.mouseRay.origin.x + (event3d.mouseRay.direction.x * event3d.mouseRay.origin.z);
    //    // var map_y = event3d.mouseRay.origin.y + (event3d.mouseRay.direction.y * event3d.mouseRay.origin.z);
    //    // console.log('x: ' + map_x + '  y: ' + map_y);
    // });
    //
    // // viewer.viewer.cameraControls.addEventListener('touchstart', function(event3d) {
    // //     console.log("touchstart");
    // //     console.log(event3d);
    // //     switch (event3d.domEvent.touches.length) {
    // //         case 2:
    // //             viewer.touchStartPosition[0] = new THREE.Vector2(event3d.domEvent.touches[0].pageX,
    // //                 event3d.domEvent.touches[0].pageY);
    // //             viewer.touchStartPosition[1] = new THREE.Vector2(event3d.domEvent.touches[1].pageX,
    // //                 event3d.domEvent.touches[1].pageY);
    // //             viewer.touchMoveVector[0] = new THREE.Vector2(0, 0);
    // //             viewer.touchMoveVector[1] = new THREE.Vector2(0, 0);
    // //     event3d.domEvent.preventDefault();
    // //     }
    // // });
    //
    // viewer.viewer.cameraControls.addEventListener('touchmove', function(event3d) {
    //    console.log(event3d);
    //    console.log(event3d.domEvent);
    //    console.log(event3d.domEvent.touches);
    //    console.log(viewer.viewer);
    //    switch (event3d.domEvent.touches.length) {
    //        case 1:
    //            console.log("case 1");
    //            var moveStartNormal = new THREE.Vector3(0, 0, 1);
    //            var rMat = new THREE.Matrix4().extractRotation(viewer.viewer.camera.matrix);
    //            moveStartNormal.applyMatrix4(rMat);
    //            moveStartCenter = viewer.viewer.cameraControls.center.clone();
    //            moveStartPosition = viewer.viewer.cameraControls.camera.position.clone();
    //            console.log(viewer.viewer.cameraControls.intersectViewPlane(event3d.mouseRay,
    //                                                moveStartCenter,
    //                                                moveStartNormal));
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
    //
    //
    // viewer.viewer.addObject(new THREE.AmbientLight(0x696969));
    //
    //
    //

    map_tf_client = new MapTfClient(ros);
    base_tf_client = new BaseTfClient(ros);
    viewer_grid = new ViewerGrid(viewer);
    //
    map_planner = new MapPlanner(ros, map_tf_client.tfClientMap, viewer.viewer);

    map_local_costmap = new MapLocalCostmap(ros.ros,  map_tf_client.tfClientMap, viewer.viewer.scene);
    // map_local_costmap.gridClient.on('change', function() {
    //     console.log("costmap change");
    //     console.log(viewer.viewer);
    //     console.log(map_local_costmap.gridClient.currentGrid.message.info);
    //     map_local_costmap.gridClient.currentGrid.visible = true;
    //
    // });


    laser_scan = new LaserScan(ros, map_tf_client.tfClientMap, viewer.viewer);



}