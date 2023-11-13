// Desc: MobIMU for Vitulus WebUI

class ROS {
    constructor() {
        this.ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});
        console.log("Connected to ROS.");
    }
}

class Viewer3D{


    constructor(ros) {

        this.viewer = new ROS3D.Viewer({
                divID : '3d_view',
                width : 600,
                height : 600,
                near : 0.2,
                far : 1000,
                antialias : true,
                intensity : 1.0,
                alpha : 1.0,
                background : '#1e2f38',  // 1e2f38
                cameraPose : {  x : 0, y : 0, z : 200 },
                displayPanAndZoomFrame : false
            });

    }

    changeViewerSize(){
            var width = document.getElementById("3d_view").clientWidth;
            var height = document.getElementById("3d_view").clientHeight;
            var padding = parseInt((document.getElementById("3d_view").style.padding).replace('px', ''));
            // console.log(padding)
            viewer.viewer.resize(width, height);
            document.getElementById("3d_view").Width = width;
            document.getElementById("3d_view").Height = height;
        };



    updateCam(){
        viewer.viewer.cameraControls.rotateDown();
        viewer.viewer.camera.fov = 1;
        console.log(viewer.viewer);
    };



}

class ViewerGrid{

    constructor(viewer) {
        viewer.viewer.scene.add(new ROS3D.Grid({
                                        num_cells : 50,
                                        color: "#333333",
                                        cellSize: 0.1,
        }));
    }
}

class Imu_Markers {

        constructor(ros) {

        this.tfClient = new ROSLIB.TFClient({
          ros : ros.ros,
          angularThres : 0.01,
          transThres : 0.01,
          rate : 10.0,
          fixedFrame : '/base_link'
        });
        console.log("viewer");
        console.log(viewer);
        this.markerArrayClient = new ROS3D.MarkerArrayClient({
          ros: ros.ros,
          rootObject: viewer.viewer.scene,
          tfClient: this.tfClient,
          topic: "/imu/markers",
        });

    }
}

class ImuDiag {

    constructor(ros) {

        var diag_arr = [];

        this.diag_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/diagnostics',
            messageType: 'diagnostic_msgs/DiagnosticArray'
        });

        this.subscribe = this.diag_topic.subscribe(function (message) {
            message.status.forEach(function(element){
                var contains_element = false;
                diag_arr.forEach(function(item){
                    if (item.name === element.name){
                        item.message = element.message;
                        item.level = element.level;
                        contains_element = true;
                    }
                });
                if (contains_element === false){
                    if (element.name.includes("BNO085")){
                        diag_arr.push(element);
                    }
                }
            });
            var diag_html_content = '';
            diag_arr.forEach(function(item){
                var diag_html_item = '<div>';
                diag_html_item += '<span>' + item.name.replace("IMU BNO085: ", "") + ': </span> ';
                if (item.level === 0){ diag_html_item += '<span style="color: var(--success);">' + item.message + '</span>';};
                if (item.level === 1){ diag_html_item += '<span style="color: var(--warning);">' + item.message + '</span>';}
                if (item.level === 2){ diag_html_item += '<span style="color: var(--danger);">' + item.message + '</span>';}

                diag_html_item += '</div>';
                diag_html_content += diag_html_item;
            });
            div_diag.innerHTML = diag_html_content;
            });
    }
}

window.onload = function () {
    console.log("onload")
    ros = new ROS();
    imu_diag = new ImuDiag(ros);
    viewer = new Viewer3D(ros);
    console.log(viewer);
    viewer.changeViewerSize();
    new ResizeObserver(viewer.changeViewerSize).observe(document.getElementById("3d_view"));

    viewer.updateCam();
    viewer.viewer.addObject(new THREE.AmbientLight(0x696969));
    // viewer.scene.add(new THREE.AmbientLight(0xffffff));
    viewer_grid = new ViewerGrid(viewer);
    imu_markers = new Imu_Markers(ros);


}