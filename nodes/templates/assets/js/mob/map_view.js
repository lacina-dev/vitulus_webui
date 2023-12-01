// Desc: MobMapView for Vitulus WebUI

ROS3D.Viewer.prototype.resize = function(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
};


////////// Override getColor() of OccupancyGrid for custom coloring of maps depends on type.
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
        };
    };

    // If map is local costmap.
    if (this.color.r === 255 && this.color.g === 0 && this.color.b === 255){
        if (value === 100){   // obstacle
            return [255,0,0,255];
        };
        if (value === 0){    // free space
            return [0,0,0,0];
        };
        if (value <= 99 && value >= 1){  // probably obstacle
            return [149,149-value,149-value,255];
        };
        if (value === -1){  // unknown
            return [0,0,0,0];
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
            width : 200,
            height : 200,
            near : 20,
            far : 6000,
            antialias : true,
            intensity : 1.0,
            alpha : 1.0,
            background : '#1e2f38',  // 1e2f38
            cameraPose : {  x : 0, y : 0, z : 1000 },
            displayPanAndZoomFrame : false
        });


    }



    changeViewerSize(){
        var width = document.getElementById("map_view").offsetWidth;
        var height = document.getElementById("map_view").offsetHeight;
        // var width = parseInt(document.getElementById("map_view").style.width.replace('px', ''));
        // var height = parseInt(document.getElementById("map_view").style.height.replace('px', ''));
        console.log("changeViewerSize W: ", width);
        console.log("changeViewerSize H: ", height);
        var padding = parseInt((document.getElementById("map_view").style.padding).replace('px', ''));
        this.viewer.resize(width, height);
        // document.getElementById("map_view").style.width = width + 'px';
        // document.getElementById("map_view").style.height = height + 'px';
    };

    updateCam(){
        // viewer.camera.focus = 100000.0;
        this.viewer.camera.filmGauge = 0.04;
        // viewer.camera.zoom = 120;
        this.viewer.camera.setFocalLength(1.0);
        this.viewer.camera.updateProjectionMatrix();
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


class TfClient {
    constructor(ros, viewer) {
        this.robot_cam_position = new THREE.Vector3();
        this.robot_cam_position.copy(viewer.camera.position);
        this.map_cam_position = new THREE.Vector3();
        this.map_cam_rotation = new THREE.Quaternion();
        this.map_cam_center = new THREE.Vector3();
        this.map_cam_position.copy(viewer.camera.position);
        this.map_cam_rotation.copy(viewer.camera.rotation);
        this.map_cam_center.copy(viewer.cameraControls.center);
        this.follow_target = 'map';
        this.map_reinit = true;
        this.tfClientMap = new ROSLIB.TFClient({
          ros : ros.ros,
          angularThres : 0.000001,
          transThres : 0.00001,
          rate : 20.0,
          fixedFrame : '/map'
        });

    }

    follow_robot_set(viewer, tf){
        console.log(this.follow_target);
        if (this.follow_target === 'map'){
            if (this.map_reinit){
                viewer.camera.position.x = this.map_cam_position.x;
                viewer.camera.position.y = this.map_cam_position.y;
                viewer.camera.position.z = this.map_cam_position.z;
                viewer.camera.rotation.x = this.map_cam_rotation.x;
                viewer.camera.rotation.y = this.map_cam_rotation.y;
                viewer.camera.rotation.z = this.map_cam_rotation.z;
                viewer.camera.rotation.w = this.map_cam_rotation.w;
                viewer.cameraControls.center.x = this.map_cam_center.x;
                viewer.cameraControls.center.y = this.map_cam_center.y;
                viewer.cameraControls.center.z = this.map_cam_center.z;
                this.map_reinit = false;
            }
        };
        if (this.follow_target === 'robot'){
            viewer.cameraControls.center.x = tf.translation.x;
            viewer.cameraControls.center.y = tf.translation.y;
            viewer.cameraControls.center.z = tf.translation.z;
            viewer.cameraControls.rotateLeft(Math.PI);
            viewer.camera.position.x = tf.translation.x;
            viewer.camera.position.y = tf.translation.y;
            // viewer.camera.rotation.x = tf.rotation.x;
            // viewer.camera.rotation.y = tf.rotation.y;
            // viewer.camera.rotation.z = tf.rotation.z;
            // viewer.camera.rotation.w = tf.rotation.w;
            let euler = new THREE.Euler(0,0,0, 'XYZ');
            let quat = new THREE.Quaternion(tf.rotation.x, tf.rotation.y, tf.rotation.z, tf.rotation.w);
            euler.setFromQuaternion(quat);
            viewer.cameraControls.thetaDelta = euler.z + Math.PI;
        };
        if (this.follow_target === 'camera'){
            viewer.cameraControls.center.x = tf.translation.x;
            viewer.cameraControls.center.y = tf.translation.y;
            viewer.cameraControls.center.z = tf.translation.z;
            viewer.camera.position.x = tf.translation.x;
            viewer.camera.position.y = tf.translation.y;
            viewer.camera.position.z = tf.translation.z + 170;
            let euler = new THREE.Euler(0,0,0, 'XYZ');
            let quat = new THREE.Quaternion(tf.rotation.x, tf.rotation.y, tf.rotation.z, tf.rotation.w);
            euler.setFromQuaternion(quat);
            viewer.cameraControls.thetaDelta = euler.z + Math.PI;
            viewer.cameraControls.phiDelta = Math.PI/2.5;
        };

    }
}


class Maps{
    constructor(ros, tf_client, viewer) {
        this.rtabmap_offset =new ROSLIB.Pose({ position : new ROSLIB.Vector3({ x : 0, y : 0, z : -0.01 }),
                    orientation : new ROSLIB.Quaternion({ x : 0.0, y : 0.0, z : 0.0, w : 1.0 }) });
        this.rtabmap_grid_map = new ROS3D.OccupancyGridClient({
            ros : ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            continuous: true,
            topic: '/rtabmap/grid_map',
            // topic: '/map_assembled',
            // topic: '/web_plan/map_edited',
            color: {r:0,g:255,b:255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
            opacity: 0.9,
            offsetPose: this.rtabmap_offset,
        });
        this.local_costmap_offset = new ROSLIB.Pose({ position : new ROSLIB.Vector3({ x : 0, y : 0, z : 0.05 }),
                    orientation : new ROSLIB.Quaternion({ x : 0.0, y : 0.0, z : 0.0, w : 1.0 }) });
        this.local_costmap = new ROS3D.OccupancyGridClient({
            ros : ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            continuous: true,
            compression: 'cbor',
            // topic: '/rtabmap/grid_map',
            // topic: '/map_assembled',
            // topic: '/navi_manager/local_costmap',
            topic: '/move_base_flex/local_costmap/costmap',
            color: {r:255,g:0,b:255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
            opacity: 0.4,
            offsetPose: this.local_costmap_offset,
        });
    }
}


class LaserScan{
    constructor(ros, tf_client, viewer) {

        this.laser = new ROS3D.LaserScan({
            ros : ros.ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            topic: '/scan',
            material: { size: 3, color: 0x007bff }
        });
    }
}


class InteractiveMarkers{
    constructor(ros, tf_client, viewer) {
        this.imClient = new ROS3D.InteractiveMarkerClient({
          ros : ros,
          tfClient : tf_client,
          topic : '/interactive_marker',
          camera : viewer.camera,
          rootObject : viewer.selectableObjects
        });
        this.imClient.rootObject.visible = false;
        this.euler = new THREE.Euler(0, 0, 0, 'XYZ');
        this.newInteractiveMarkerTopic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/new_interactive_marker',
            messageType : 'geometry_msgs/Pose'
        });
        this.interactiveMarkerGoalTopic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/interactive_marker_goal',
            messageType : 'std_msgs/String'
        });

        this.init();
    }
    init(){
        this.newInteractiveMarkerTopic.advertise();
        this.interactiveMarkerGoalTopic.advertise();
    }

    send_goal(){
        console.log('Sending interactive marker goal.');
        var interactiveMarkerGoalMsg = new ROSLIB.Message({
            data : 'interactiveGoal',
        });
        this.interactiveMarkerGoalTopic.publish(interactiveMarkerGoalMsg);
    }

    new_marker(event3d){
        console.log(event3d.mouseRay);
        var map_x = event3d.mouseRay.origin.x + (event3d.mouseRay.direction.x * event3d.mouseRay.origin.z);
        var map_y = event3d.mouseRay.origin.y + (event3d.mouseRay.direction.y * event3d.mouseRay.origin.z);
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
        this.newInteractiveMarkerTopic.publish(newInteractiveMarkerMsg);
    }
}

class Clouds {
    constructor(ros, tf_client, viewer) {
        this.groung_cloud = new ROS3D.PointCloud2({
            ros : ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            topic: '/ground_cloud',
            max_pts: 100000,
            max_age: 60,
            opacity: 1.0,
            alpha: 1.0,
            pointRatio: 1.0,
            material: { size: 2.0, color: 0x71ff02 }
        });
        this.obstacle_cloud = new ROS3D.PointCloud2({
            ros : ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            topic: '/obstacles_cloud',
            max_pts: 100000,
            max_age: 60,
            opacity: 1.0,
            alpha: 1.0,
            pointRatio: 1.0,
            material: { size: 2.0, color: 0xfb0202 }
        });
    }
}

class RobotVisualization {
    constructor(ros, tf_client, viewer) {
        this.robotPolygon = new ROS3D.Polygon({
            ros : ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            topic: '/move_base_flex/local_costmap/footprint',
            color: 0xffffff,
        });
    }
}

class PathsPointsVisualization {
    constructor(ros, tf_client, viewer) {
        this.localPlan = new ROS3D.Path({
            ros : ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            topic: '/move_base_flex/TebLocalPlannerROS/local_plan',
            color: 0xff00ff,
        });
        this.globalPlan = new ROS3D.Path({
            ros : ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            topic: '/move_base_flex/TebLocalPlannerROS/global_plan',
            color: 0xffffff,
        });
        this.mapMarker = new ROS3D.MarkerClient({
            ros : ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            topic: '/navi_manager/map_point',
            color: 0x020cf9,
        });
        this.markerArrayClient = new ROS3D.MarkerArrayClient({
          ros: ros,
          rootObject: viewer.scene,
          tfClient: tf_client,
          topic: "/zone_path_lines",
       });
        this.mapPath = new ROS3D.Path({
            ros : ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            topic: '/navi_manager/map_path',
            color: 0x020cf9,
        });
    }
}


class IconStatus {
    constructor(ros) {
        this.icon_status_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/device_state_pub/icon_status',
            messageType: 'vitulus_msgs/Device_icon_status'
        });
        this.subscribe = this.icon_status_topic.subscribe(function (message) {
            // WiFi
            if (message.wifi === "FINE") {
                ico_wifi.src = "/assets/img/robot_icons/Nextion_ico_wifi_green.png";
            }
            if (message.wifi === "MEDIUM") {
                ico_wifi.src = "/assets/img/robot_icons/Nextion_ico_wifi_orange.png";
            }
            if (message.wifi === "BAD") {
                ico_wifi.src = "/assets/img/robot_icons/Nextion_ico_wifi_red.png";
            }
            if (message.wifi === "DISCONNECTED") {
                ico_wifi.src = "/assets/img/robot_icons/Nextion_ico_wifi_grey.png";
            }
            // GPS
            if (message.gnss === "RTK") {
                ico_gps.src = "/assets/img/robot_icons/Nextion_ico_gps_green.png";
            }
            if (message.gnss === "3DFIX") {
                ico_gps.src = "/assets/img/robot_icons/Nextion_ico_gps_orange.png";
            }
            if (message.gnss === "BAD") {
                ico_gps.src = "/assets/img/robot_icons/Nextion_ico_gps_red.png";
            }
            if (message.gnss === "DISABLED") {
                ico_gps.src = "/assets/img/robot_icons/Nextion_ico_gps_grey.png";
            }
            // GPS_NAV
            if (message.gnss_nav === "RTK") {
                ico_gps_nav.src = "/assets/img/robot_icons/Nextion_ico_gpsnav_green.png";
            }
            if (message.gnss_nav === "3DFIX") {
                ico_gps_nav.src = "/assets/img/robot_icons/Nextion_ico_gpsnav_orange.png";
            }
            if (message.gnss_nav === "BAD") {
                ico_gps_nav.src = "/assets/img/robot_icons/Nextion_ico_gpsnav_red.png";
            }
            if (message.gnss_nav === "DISABLED") {
                ico_gps_nav.src = "/assets/img/robot_icons/Nextion_ico_gpsnav_grey.png";
            }
            // IMU
            if (message.imu === "ON") {
                ico_imu.src = "/assets/img/robot_icons/Nextion_ico_imu_green.png";
            }
            else  {
                ico_imu.src = "/assets/img/robot_icons/Nextion_ico_imu_grey.png";
            }
            // LIDAR
            if (message.lidar === "ON") {
                ico_lidar.src = "/assets/img/robot_icons/Nextion_ico_lidar_green.png";
            }
            else  {
                ico_lidar.src = "/assets/img/robot_icons/Nextion_ico_lidar_grey.png";
            }
            // D435
            if (message.d435 === "ON") {
                ico_camera.src = "/assets/img/robot_icons/Nextion_ico_camera_green.png";
            }
            else  {
                ico_camera.src = "/assets/img/robot_icons/Nextion_ico_camera_grey.png";
            }
            // MOWER
            if (message.mower === "ON") {
                ico_mower.src = "/assets/img/robot_icons/Nextion_ico_mower_green.png";
            }
            if (message.mower === "BUSY") {
                ico_mower.src = "/assets/img/robot_icons/Nextion_ico_mower_green.png";
            }
            if (message.mower === "ERROR") {
                ico_mower.src = "/assets/img/robot_icons/Nextion_ico_mower_red.png";
            }
            if (message.mower === "DISABLED") {
                ico_mower.src = "/assets/img/robot_icons/Nextion_ico_mower_grey.png";
            }
            // FL MOTOR
            if (message.mot_lf === "OK") {
                ico_fl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLF_green.png";
            }
            if (message.mot_lf === "WARM") {
                ico_fl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLF_orange.png";
            }
            if (message.mot_lf === "HOT") {
                ico_fl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLF_red.png";
            }
            if (message.mot_lf === "DISABLED") {
                ico_fl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLF_grey.png";
            }
            // FR MOTOR
            if (message.mot_rf === "OK") {
                ico_fr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRF_green.png";
            }
            if (message.mot_rf === "WARM") {
                ico_fr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRF_orange.png";
            }
            if (message.mot_rf === "HOT") {
                ico_fr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRF_red.png";
            }
            if (message.mot_rf === "DISABLED") {
                ico_fr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRF_grey.png";
            }
            // RL MOTOR
            if (message.mot_lr === "OK") {
                ico_rl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLR_green.png";
            }
            if (message.mot_lr === "WARM") {
                ico_rl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLR_orange.png";
            }
            if (message.mot_lr === "HOT") {
                ico_rl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLR_red.png";
            }
            if (message.mot_lr === "DISABLED") {
                ico_rl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLR_grey.png";
            }
            // RR MOTOR
            if (message.mot_rr === "OK") {
                ico_rr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRR_green.png";
            }
            if (message.mot_rr === "WARM") {
                ico_rr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRR_orange.png";
            }
            if (message.mot_rr === "HOT") {
                ico_rr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRR_red.png";
            }
            if (message.mot_rr === "DISABLED") {
                ico_rr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRR_grey.png";
            }
            // TEMP_PCB
            if (message.temp_int === "OK") {
                ico_temp_pcb.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_green.png";
            }
            if (message.temp_int === "WARM") {
                ico_temp_pcb.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_orange.png";
            }
            if (message.temp_int === "HOT") {
                ico_temp_pcb.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_red.png";
            }
            if (message.temp_int === "DISABLED") {
                ico_temp_pcb.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_grey.png";
            }
            // FAN_PCB
            if (message.fan_int === "ON") {
                ico_fan_pcb.src = "/assets/img/robot_icons/Nextion_ico_fanPCB_green.png";
            }
            else  {
                ico_fan_pcb.src = "/assets/img/robot_icons/Nextion_ico_fanPCB_grey.png";
            }
            // TEMP_EXT
            if (message.temp_ext === "OK") {
                ico_temp.src = "/assets/img/robot_icons/Nextion_ico_temp_green.png";
            }
            if (message.temp_ext === "WARM") {
                ico_temp.src = "/assets/img/robot_icons/Nextion_ico_temp_orange.png";
            }
            if (message.temp_ext === "HOT") {
                ico_temp.src = "/assets/img/robot_icons/Nextion_ico_temp_red.png";
            }
            if (message.temp_ext === "DISABLED") {
                ico_temp.src = "/assets/img/robot_icons/Nextion_ico_temp_grey.png";
            }
            // FAN_EXT
            if (message.fan_ext === "ON") {
                ico_fan.src = "/assets/img/robot_icons/Nextion_ico_fan_green.png";
            }
            else  {
                ico_fan.src = "/assets/img/robot_icons/Nextion_ico_fan_grey.png";
            }
            // supply
            if (message.supply === "ONLINE") {
                ico_supply.src = "/assets/img/robot_icons/Nextion_ico_supply_green.png";
            }
            else  {
                if (message.supply === "FAIL") {
                ico_supply.src = "/assets/img/robot_icons/Nextion_ico_supply_red.png";
                }
                else  {
                    ico_supply.src = "/assets/img/robot_icons/Nextion_ico_supply_grey.png";
                }
            }
            // BATTERY
            if (message.batt === "FULL") {
                ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_full.png";
            }
            if (message.batt === "75") {
                ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_34.png";
            }
            if (message.batt === "50") {
                ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_half.png";
            }
            if (message.batt === "25") {
                ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_14.png";
            }
            if (message.batt === "EMPTY") {
                ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_empty.png";
            }
            if (message.batt === "FULL_CHARGE") {
                ico_batt.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_full.png";
            }
            if (message.batt === "75_CHARGE") {
                ico_batt.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_34.png";
            }
            if (message.batt === "50_CHARGE") {
                ico_batt.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_half.png";
            }
            if (message.batt === "25_CHARGE") {
                ico_batt.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_14.png";
            }
            if (message.batt === "EMPTY_CHARGE") {
                ico_batt.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_empty.png";
            }
            if (message.batt === "DISABLED") {
                ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_disabled.png";
            }
        });
    }
}


class JoyTeleop {
    constructor(ros) {
        this.twist = new ROSLIB.Message({
            linear: {x: 0, y: 0, z: 0},
            angular: {x: 0,y: 0, z: 0}
        });
        this.cmdVel = new ROSLIB.Topic({
            ros: ros.ros,
            name: "/cmd_vel",
            messageType: "geometry_msgs/Twist"
        });
        this.publishImmidiately = true;
        this.lin = 0;
        this.ang = 0;
        this.publish_joy = false;
        this.joysize = 130;
        this.speed_lin_fast = 0.75;
        this.speed_ang_fast = 1.5;
        this.speed_lin_moderate = 0.5;
        this.speed_ang_moderate = 1.2;
        this.speed_lin_low = 0.25;
        this.speed_ang_low = 0.75;
        this.speed_lin = this.speed_lin_moderate;
        this.speed_ang = this.speed_ang_moderate;
        // this.joysize = 172;
        this.joystickContainer = document.getElementById("joy_view");
        this.options = {
            zone: this.joystickContainer,
            position: { left: 50 + "%", top: 50 + "%" },
            mode: "dynamic",
            //catchDistance: 1,
            size: this.joysize,
            color: "#0066ff",
            dynamicPage: true,
            //restJoystick: true
        };
        this.manager = nipplejs.create(this.options);
        this.pub_end_published = false;

        this.init();
    }

    init(){
        this.cmdVel.advertise();
    }

    moveAction(linear, angular) {
        if (linear !== undefined && angular !== undefined) {
            this.twist.linear.x = linear;
            this.twist.angular.z = angular;
        } else {
            this.twist.linear.x = 0;
            this.twist.angular.z = 0;
        }
        this.cmdVel.publish(this.twist);
    }

    joy_pub_speed(){
        if (this.publish_joy){
            this.moveAction(this.lin, this.ang);
            this.pub_end_published = false;
        }else{
            if (this.pub_end_published === false){
                this.moveAction(0, 0);
                this.pub_end_published = true;
            }
        }
    }

    set_lin(lin){
        this.lin = lin;
    }

    set_ang(ang){
        this.ang = ang;
    }

    set_publish_joy(publish_joy){
        this.publish_joy = publish_joy;
    }
}

class CameraView {

    constructor(ros) {
        this.width = 640;
        this.height = 480;
        this.camViewer = new MJPEGCANVAS.Viewer({
          divID : 'div_camera_view',
          host : location.hostname,
          port: 8080,
          quality: 15,
          refreshRate: 15,
          width : this.width,
          height : this.height,
          topic : '/d435/color/image_raw',
        });
    }

    calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return { width: Math.round(srcWidth*ratio), height: Math.round(srcHeight*ratio) };
     }

    changeViewerSize_cam_view(){
        const width_el = document.getElementById("div_camera_view").clientWidth;
        const height_el = document.getElementById("div_camera_view").clientHeight;
        const padding_el = parseInt((document.getElementById("div_camera_view").style.padding).replace('px', ''));
        const border_el = parseInt((document.getElementById("div_camera_view").style.border).replace('px', ''));
        this.camViewer.width = width_el - (padding_el*2);
        this.camViewer.height = height_el - (padding_el*2);
        const canvas_size = this.calculateAspectRatioFit(this.width, this.height, this.camViewer.width, this.camViewer.height);
        const content = document.getElementById('div_camera_view');
        content.firstChild.width = canvas_size.width;
        content.firstChild.height = canvas_size.height;
        content.style.width = Math.round(canvas_size.width + (border_el*2) + (padding_el*2)) + 'px';
        content.style.height = Math.round(canvas_size.height + (border_el*2) + (padding_el*2)) + 'px';
        const map_width = document.getElementById("div_camera_view").clientWidth;
    };
}


class LidarControl {
    constructor(ros) {
        this.stop_lidar_srvs = new ROSLIB.Service({
            ros : ros,
            name : '/stop_motor',
            serviceType : 'std_srvs/EmptyRequest'
        });
        this.start_lidar_srvs = new ROSLIB.Service({
            ros : ros,
            name : '/start_motor',
            serviceType : 'std_srvs/EmptyRequest'
        });
        this.request = new ROSLIB.ServiceRequest({});
    }
    stop_lidar(){
        this.stop_lidar_srvs.callService(this.request, function(result) {
            console.log(result);
            console.log('Result for service call on stop lidar: ' + result);
        }, function(error){
            console.error("Got an error while trying to call stop lidar service");
        });
    }
    start_lidar(){
        this.start_lidar_srvs.callService(this.request, function(result) {
            console.log(result);
            console.log('Result for service call on start lidar: ' + result);
        }, function(error){
            console.error("Got an error while trying to call start lidar service");
        });
    }
}


class MotorControl {
    constructor(ros) {
        this.motorPowerTopic = new ROSLIB.Topic({
            ros : ros,
            name : '/base/motor_power',
            messageType : 'std_msgs/Bool'
        });
        this.pmMotorSwitchTopic = new ROSLIB.Topic({
            ros : ros,
            name : '/set_motor_switch',
            messageType : 'std_msgs/Bool'
        });
        this.motor_power_msg = new ROSLIB.Message({
            data : false
        });
        this.pm_motor_switch_msg = new ROSLIB.Message({
            data : false
        });
        this.init();
    }

    init(){
        this.motorPowerTopic.advertise();
        this.pmMotorSwitchTopic.advertise();
    }

    motors_on(){
        this.motor_power_msg.data = true;
        this.pm_motor_switch_msg.data = true;
        this.pmMotorSwitchTopic.publish(this.pm_motor_switch_msg);
        this.motorPowerTopic.publish(this.motor_power_msg);
    }
    motors_off(){
        this.motor_power_msg.data = false;
        this.pm_motor_switch_msg.data = false;
        this.pmMotorSwitchTopic.publish(this.pm_motor_switch_msg);
        this.motorPowerTopic.publish(this.motor_power_msg);
    }
}


class MapMenu {
    constructor(ros) {
        this.row_submenu = document.getElementById("row_submenu");
        this.row_submenu_visible = false;
        this.row_submenu.style.display = "none";

        this.current_submenu = 'none';

        this.div_menu_marker = document.getElementById("div_menu_marker");
        this.div_menu_marker.style.display = "none";
        this.btn_marker = document.getElementById("btn_marker");
        this.btn_marker.active = false;
        this.btn_marker_send_goal = document.getElementById("btn_marker_send_goal");
        this.range_marker_orientation = document.getElementById("range_marker_orientation");

        this.div_menu_config = document.getElementById("div_menu_config");
        this.div_menu_config.style.display = "none";
        this.btn_settings = document.getElementById("btn_settings");
        this.btn_settings.active = false;
        this.btn_menu_motors_on = document.getElementById("btn_menu_motors_on");
        this.btn_menu_motors_off = document.getElementById("btn_menu_motors_off");
        this.btn_menu_lidar_on = document.getElementById("btn_menu_lidar_on");
        this.btn_menu_lidar_off = document.getElementById("btn_menu_lidar_off");
        this.btn_menu_speed_low = document.getElementById("btn_menu_speed_low");
        this.btn_menu_speed_moderate = document.getElementById("btn_menu_speed_moderate");
        this.btn_menu_speed_fast = document.getElementById("btn_menu_speed_fast");
        this.btn_menu_joy_show = document.getElementById("btn_menu_joy_show");
        this.btn_menu_joy_hide = document.getElementById("btn_menu_joy_hide");

        this.btn_map = document.getElementById("btn_map");
        this.div_menu_map = document.getElementById("div_menu_map");
        this.div_menu_map.style.display = "none";
        this.btn_menu_map_new_indoor = document.getElementById("btn_menu_map_new_indoor");
        this.btn_menu_map_new_outdoor = document.getElementById("btn_menu_map_new_outdoor");
        this.btn_menu_map_rtabmap_mapping = document.getElementById("btn_menu_map_rtabmap_mapping");
        this.btn_menu_map_rtabmap_localization = document.getElementById("btn_menu_map_rtabmap_localization");
        this.btn_menu_map_new_save = document.getElementById("btn_menu_map_new_save");
        this.input_menu_map_new = document.getElementById("input_menu_map_new");

        this.btn_joy = document.getElementById("btn_joy");
        this.joy_view = document.getElementById("joy_view");
        this.joy_view.style.display = "none";

        this.btn_camera_show = document.getElementById("btn_camera_show");
        this.div_camera_view = document.getElementById("div_camera_view");
        this.div_camera_view.style.display = "none";

        this.btn_follow = document.getElementById("btn_follow");

        this.btn_log = document.getElementById("btn_log");
        this.div_log_view = document.getElementById("div_log_view");
        this.div_log_view.style.display = "none";

        this.btn_stop_all = document.getElementById("btn_stop_all");

        this.new_map_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/new_map',
            messageType : 'std_msgs/String'
        });
        this.new_map_msg = new ROSLIB.Message({
            data : ''
        });
        this.save_map_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/save_map',
            messageType : 'std_msgs/String'
        });

        this.init();

    }

    init(){
        this.new_map_Topic.advertise();
        this.save_map_Topic.advertise();
    }

    save_map(){
        const save_map_Msg = new ROSLIB.Message({
            data : this.input_menu_map_new.value,
        });
        this.save_map_Topic.publish(save_map_Msg);
    }

    new_map(map_type){
        this.new_map_msg.data = map_type;
        this.new_map_Topic.publish(this.new_map_msg);
    }

    joy_show(){
        if (this.joy_view.style.display === "none"){
            this.joy_view.style.display = "block";
            this.btn_joy.active = true;
        } else {
            this.joy_view.style.display = "none";
            this.btn_joy.active = false;
        }
    }

    camera_show(camera_view){
        if (this.div_camera_view.style.display === "none"){
            this.div_camera_view.style.display = "block";
            this.btn_camera_show.active = true;
            camera_view.camViewer.width = 640;
            camera_view.camViewer.height = 480;
            this.div_camera_view.style.width = '180px';
            this.div_camera_view.style.height = '120px';

            camera_view.changeViewerSize_cam_view();
        } else {
            this.div_camera_view.style.display = "none";
            this.btn_camera_show.active = false;
        }
    }

    hide_all_submenu_divs() {
        this.div_menu_marker.style.display = "none";
        this.div_menu_config.style.display = "none";
        this.div_menu_map.style.display = "none";
        this.row_submenu_visible = false;
    }

    btn_map_onclick(interactive_markers) {
        if (this.current_submenu !== 'map') {
            this.hide_all_submenu_divs();
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
            interactive_markers.imClient.rootObject.visible = false;
        }
        if (this.row_submenu_visible === false) {
            this.current_submenu = 'map';
            this.div_menu_map.style.display = "block";
            this.row_submenu.style.display = "block";
            this.row_submenu_visible = true;
            this.btn_map.active = true;
        }
        else {
            this.current_submenu = 'none';
            this.div_menu_map.style.display = "none";
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
            this.btn_map.active = false;
        }
    }

    btn_config_onclick(interactive_markers) {
        if (this.current_submenu !== 'config') {
            this.hide_all_submenu_divs();
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
            interactive_markers.imClient.rootObject.visible = false;
        }
        if (this.row_submenu_visible === false) {
            this.current_submenu = 'config';
            this.div_menu_config.style.display = "block";
            this.row_submenu.style.display = "block";
            this.row_submenu_visible = true;
            this.btn_settings.active = true;
        }
        else {
            this.current_submenu = 'none';
            this.div_menu_config.style.display = "none";
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
            this.btn_settings.active = false;
        }
    }
    btn_menu_motors_on_onclick(motors_control, status) {
        if (status === true) {
            motors_control.motors_on();
        }
        else {
            motors_control.motors_off();
        }
    }
    btn_menu_lidar_on_onclick(lidar_control, status) {
        if (status === true) {
            lidar_control.start_lidar();
        }
        else {
            lidar_control.stop_lidar();
        }
    }

    btn_marker_onclick(interactive_markers) {
        if (this.current_submenu !== 'marker') {
            this.hide_all_submenu_divs();
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
        }
        if (this.row_submenu_visible === false) {
            this.current_submenu = 'marker';
            this.div_menu_marker.style.display = "block";
            this.row_submenu.style.display = "block";
            this.row_submenu_visible = true;
            this.btn_marker.active = true;
            interactive_markers.imClient.rootObject.visible = true;
        }
        else {
            console.log(this.row_submenu);
            this.current_submenu = 'none';
            this.div_menu_marker.style.display = "none";
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
            this.btn_marker.active = false;
            interactive_markers.imClient.rootObject.visible = false;
        }
    }
    btn_marker_send_goal_onclick(interactive_markers) {
        interactive_markers.send_goal();
        this.btn_marker_onclick(interactive_markers);
    }
}

class RosLog{
    constructor(ros) {
        this.LOG_LENGTH = 60;
        this.log_array = [];
        this.log_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/rosout_agg',
            messageType: 'rosgraph_msgs/Log'
        });

    }
    process_message(message, div_log){
        // console.log(message);

        let log_item = '';
        switch (message.level) {
            case 1: log_item = '<span style="font-size: 10px;display: block;color: #7a8288;">[DEBUG]';
            break;
            case 2: log_item = '<span style="font-size: 10px;display: block;color: #0268b4;">[INFO]';
            break;
            case 4: log_item = '<span style="font-size: 10px;display: block;color: #fc7e14;">[WARN]';
            break;
            case 8: log_item = '<span style="font-size: 10px;display: block;color: #e83e8c;">[ERROR]';
            break;
            case 16: log_item = '<span style="font-size: 10px;display: block;color: #e83e8c;">[FATAL]';
            break;
        };
        log_item += '[' + message.header.stamp.secs + '][<b>' + message.name + '</b>] ' + message.msg + '</span>';
        this.log_array.push(log_item);
        if (this.log_array.length > this.LOG_LENGTH){
            this.log_array.shift();
        };


        // console.log("top: " + div_log.scrollTop + "height: " + div_log.scrollHeight);
        if (div_log.scrollTop + 150 > div_log.scrollHeight) {
            div_log.innerHTML = this.log_array.join('');
            div_log.scrollTop = div_log.scrollHeight;
        }


        // div_log.innerHTML = '<p>' + message.msg + '</p>';
    }
}


class MoveBaseControl {
    constructor(ros) {
        this.div_status_speed = document.getElementById("div_status_speed");
        this.span_status_speed = document.getElementById("span_status_speed");
        this.cancelGoalTopic = new ROSLIB.Topic({
            ros: ros,
            // name : '/move_base_flex/move_base/cancel',
            name: '/move_base_flex/exe_path/cancel',
            messageType: 'actionlib_msgs/GoalID'
        });
            this.speedTopic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/speed',
            messageType : 'std_msgs/String'
        });
        this.init();
    }

    init() {
        this.cancelGoalTopic.advertise();
        this.speedTopic.advertise();
    }
    pub_cancel_goal() {
        const cancelGoalMsg = new ROSLIB.Message({});
        this.cancelGoalTopic.publish(cancelGoalMsg);
        console.log('Cancel goal published and motors stopped.');
    }
    pub_set_speed(speed) {
        if (speed === 'slow') {
            this.speedTopic.publish({data: 'SLOW'});
            this.span_status_speed.innerText = 'SLOW';
        }
        if (speed === 'moderate') {
            this.speedTopic.publish({data: 'MEDIUM'});
            this.span_status_speed.innerText = 'MODERATE';
        }
        if (speed === 'fast') {
            this.speedTopic.publish({data: 'FAST'});
            this.span_status_speed.innerText = 'FAST';
        }
        console.log('Speed set.');
    }
}


class StatusBar {
    constructor(ros) {
        this.active_map_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/active_map',
            messageType : 'std_msgs/String'
        });
        this.is_indoor_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/is_indoor',
            messageType : 'std_msgs/Bool'
        });
        this.nextion_log_info_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/nextion/log_info',
            messageType : 'std_msgs/String'
        });
        this.span_status_info = document.getElementById("span_status_info");
        this.span_status_info.style.display = "none";

        this.div_status_follow_ico = document.getElementById("div_status_follow_ico");
        this.div_status_follow_ico.style.display = "inline-flex";
        this.div_status_follow_txt = document.getElementById("div_status_follow_txt");
        this.div_status_follow_txt.style.display = "inline-flex";
        this.span_status_follow = document.getElementById("span_status_follow");
        this.span_status_follow.style.display = "inline";
        this.set_follow_text("Map");

        this.div_status_map_name = document.getElementById("div_status_map_name");
        this.div_status_map_name.style.display = "none";
        this.div_status_map_ico = document.getElementById("div_status_map_ico");
        this.div_status_map_ico.style.display = "none";
        this.span_status_map_name = document.getElementById("span_status_map_name");
        this.span_status_map_name.style.display = "none";
        this.ico_map_outdoor = document.getElementById("ico_map_outdoor");
        this.ico_map_outdoor.style.display = "none";
        this.ico_map_indoor = document.getElementById("ico_map_indoor");
        this.ico_map_indoor.style.display = "none";
        this.ico_status_follow = document.getElementById("ico_status_follow");
        this.ico_status_follow.style.display = "inline";
        this.timeout = 10000;
        this.info_timeout = setTimeout(this.hide_status_info, this.timeout);

    }
    set_follow_text(text) {
        this.span_status_follow.innerText = text;
    }
    set_map_name(message) {
        this.div_status_map_name.style.display = "inline-flex";
        this.div_status_map_ico.style.display = "inline-flex";
        this.span_status_map_name.style.display = "inline";
        this.span_status_map_name.innerText = message.data;
    }
    set_indoor(message) {
        if (message.data === true) {
                this.ico_map_outdoor.style.display = "none";
                this.ico_map_indoor.style.display = "inline";
            }
            else {
                this.ico_map_outdoor.style.display = "inline";
                this.ico_map_indoor.style.display = "none";
            }
    }
    set_status_info_text(text) {
        this.span_status_info.innerText = text;
        this.span_status_info.style.display = "inline";
    }
    hide_status_info() {
        this.span_status_info.style.display = "none";
        this.span_status_info.innerText = " ";
    }
}


class LayoutManager {
    constructor(viewer, camera_view) {
        this.viewer = viewer;
        this.camera_view = camera_view;
        this.is_portrait = true;
        this.div_menu = document.getElementById("div_menu");
        this.menu_spacer = document.getElementById("menu_spacer");
        this.div_content = document.getElementById("div_content");
        this.map_view = document.getElementById("map_view");
        this.div_camera_view = document.getElementById("div_camera_view");
        this.div_log_view = document.getElementById("div_log_view");
        this.div_bottom_menu = document.getElementById("div_bottom_menu");
    }
    set_layout() {
        if (this.is_portrait) {
            this.set_portrait_layout();
        }
        else {
            this.set_landscape_layout();
        }
    }

    set_portrait_layout() {
        console.log("Portrait orientation");
        // var width = document.getElementById("div_container").offsetWidth;
        // var height = document.getElementById("div_container").offsetHeight;
        // console.log("Portrait layout window width: " + width + " height: " + height);
        this.div_menu.style.display = 'block';
        this.menu_spacer.style.display = 'block';
        // this.div_content.style.height = (height - 42) + 'px';
        this.div_content.style.setProperty('height', 'calc(100vh - 42px)');
        // this.map_view.style.height = (height - 42) + 'px';
        // this.div_bottom_menu.style.marginTop = (height - 32) + 'px';
        this.div_bottom_menu.style.setProperty('margin-top', 'calc(100vh - 32px)');
        // this.div_bottom_menu.style.width = '100%';
        this.div_camera_view.style.height = '120px';
        this.div_camera_view.style.width = '160px';
        this.camera_view.changeViewerSize_cam_view();

        if (this.div_log_view.style.display === "block"){
            // this.div_camera_view.style.marginTop = (height - 268) + 'px';
            this.div_camera_view.style.setProperty('margin-top', 'calc(100vh - 268px)');
        }
        else {
            // this.div_camera_view.style.marginTop = (height - 157) + 'px';
            this.div_camera_view.style.setProperty('margin-top', 'calc(100vh - 157px)');
        }
        // console.log("Portrait layout window width: " + width);
        this.div_log_view.style.marginLeft = '4px';
        this.div_log_view.style.setProperty('width', 'calc(100vw - 8px)');
        this.div_log_view.style.setProperty('width', 'calc(100vw - 8px)');

        this.viewer.changeViewerSize();
    };
    set_landscape_layout(viewer) {
        console.log("Landscape orientation");
        var width = document.getElementById("div_container").offsetWidth;
        var height = document.getElementById("div_container").offsetHeight;
        console.log("Landscape layout window width: " + width + " height: " + height);
        this.div_menu.style.display = 'none';
        this.menu_spacer.style.display = 'none';
        // this.div_content.style.height = height + 'px';
        this.div_content.style.setProperty('height', '100vh');
        // this.map_view.style.height = height + 'px';
        this.map_view.style.setProperty('height', '100vh');
        // this.div_camera_view.style.marginTop = (height - 157) + 'px';
        // this.div_bottom_menu.style.marginTop = (height - 32) + 'px';
        this.div_bottom_menu.style.setProperty('margin-top', 'calc(100vh - 32px)');
        // this.div_camera_view.style.marginTop = (height - 141) + 'px';
        this.div_camera_view.style.setProperty('margin-top', 'calc(100vh - 141px)');
        this.div_camera_view.style.height = '106px';
        this.camera_view.changeViewerSize_cam_view();

        let cam_w = parseInt(this.div_camera_view.style.width.replace('px', ''));
        // let map_view_w = parseInt(this.map_view.style.width.replace('px', ''));
        console.log("cam_w: " + cam_w);
        if (this.div_camera_view.style.display === "block"){
            // this.div_log_view.style.marginLeft = (cam_w + 4) + 'px';
            this.div_log_view.style.setProperty('margin-left', (cam_w + 8) + 'px');
            // this.div_log_view.style.width = (width - (cam_w + 8)) + 'px';
            this.div_log_view.style.setProperty('width', 'calc(100vw - ' + (cam_w + 12) +  'px)');
        }
        else {
            this.div_log_view.style.marginLeft = '4px';
            // this.div_log_view.style.width = (width - 8) + 'px';
            this.div_log_view.style.setProperty('width', 'calc(100vw - 8px)');
        }
        this.viewer.changeViewerSize();
    };
}


class RtabMap{
    constructor(ros) {
        this.div_rtabmap = document.getElementById("div_rtabmap");
        this.div_rtabmap.style.display = "none";
        this.span_rtabmap_id = document.getElementById("span_rtabmap_id");
        this.span_rtabmap_proximity = document.getElementById("span_rtabmap_proximity");
        this.span_rtabmap_lc = document.getElementById("span_rtabmap_lc");
        this.rtabmap_status_topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/is_rtabmap',
            messageType : 'std_msgs/Bool'
        });
        this.rtabmap_info_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/rtabmap/info',
            messageType : 'rtabmap_msgs/Info'
        });
        this.rtabmap_localization_srvs = new ROSLIB.Service({
            ros : ros,
            name : '/rtabmap/set_mode_localization',
            serviceType : 'std_srvs/EmptyRequest'
        });
        this.rtabmap_mapping_srvs = new ROSLIB.Service({
            ros : ros,
            name : '/rtabmap/set_mode_mapping',
            serviceType : 'std_srvs/EmptyRequest'
        });
        this.request = new ROSLIB.ServiceRequest({});
    }

    set_rtabmap_localization(){
        this.rtabmap_localization_srvs.callService(this.request, function(result) {
            console.log(result);
            console.log('Result for service call on rtabmap localization: ' + result);
        });
    }

    set_rtabmap_mapping(){
        this.rtabmap_mapping_srvs.callService(this.request, function(result) {
            console.log(result);
            console.log('Result for service call on rtabmap mapping: ' + result);
        });
    }

    set_info(message){
        if (message.proximityDetectionId > 0){
            this.span_rtabmap_proximity.style.background = "#fff500";
        }
        else {
            this.span_rtabmap_proximity.style.background = "#555555";
        }
        if (message.loopClosureId > 0){
            this.span_rtabmap_lc.style.background = "#00d716";
        }
        else {
            this.span_rtabmap_lc.style.background = "#555555";
        }
        this.span_rtabmap_id.textContent = message.refId;
    }
}

window.onload = function () {
    ros = new ROS();

     /**
     *  Camera view
     */
    camera_view = new CameraView(ros);


    /**
     *  3D view
     */
    viewer = new Viewer3D(ros);
    layout_man = new LayoutManager(viewer, camera_view);
    layout_man.is_portrait = screen.orientation.type === "portrait-primary" || screen.orientation.type === "portrait-secondary";
    layout_man.set_layout();

    viewer.changeViewerSize();

    viewer.updateCam();
    viewer.viewer.addObject(new THREE.AmbientLight(0x696969));


    // viewer.viewer.cameraControls.rotateDown(Math.PI/1.9);
    // viewer.viewer.cameraControls.zoomIn(10);


    tf_client = new TfClient(ros, viewer.viewer);
    tf_client.tfClientMap.subscribe('base_link', function(tf) {
    // tf_client.tfClientMap.subscribe('d435_depth_optical_frame', function(tf) {
        tf_client.follow_robot_set(viewer.viewer, tf);
    });

    laser_scan = new LaserScan(ros, tf_client.tfClientMap, viewer.viewer);

    // maps = new Maps(ros.ros, tf_client.tfClientMap, viewer.viewer);
    // maps.local_costmap.on('change', function(event) {
    //     console.log("local_costmap_change");
    //     // console.log(event);
    //     // console.log(maps.local_costmap.currentGrid.message.data);
    //
    // })

    viewer_grid = new ViewerGrid(viewer);

    interactive_markers = new InteractiveMarkers(ros.ros, tf_client.tfClientMap, viewer.viewer);
    viewer.viewer.cameraControls.addEventListener('touchstart', function(event3d) {
        interactive_markers.new_marker(event3d);
    });
    viewer.viewer.cameraControls.addEventListener('mousedown', function(event3d) {
        interactive_markers.new_marker(event3d);
    });
    // viewer.viewer.cameraControls.addEventListener('mousewheel', function(event3d) {
    //     tf_client.cam_z = viewer.viewer.camera.position.z;
    // });

    clouds = new Clouds(ros.ros, tf_client.tfClientMap, viewer.viewer);

    robot_visualization = new RobotVisualization(ros.ros, tf_client.tfClientMap, viewer.viewer);

    rtabmap = new RtabMap(ros.ros);


    /**
     *  Paths
     */

    paths_visualization = new PathsPointsVisualization(ros.ros, tf_client.tfClientMap, viewer.viewer);

    /**
     *  Robot control
     */
    icon_status = new IconStatus(ros);
    motors_control = new MotorControl(ros.ros);
    lidar_control = new LidarControl(ros.ros);

    /**
     *  Status bar
     */

    status_bar = new StatusBar(ros.ros);

    function update_status_bar_info(text) {
        status_bar.set_status_info_text(text);
        status_bar.info_timeout = setTimeout(status_bar.hide_status_info, status_bar.timeout);
    }

    status_bar.nextion_log_info_Topic.subscribe(function (message) {
        update_status_bar_info(message.data);
    });
    status_bar.active_map_Topic.subscribe(function (message) {
        status_bar.set_map_name(message);
    });
    status_bar.is_indoor_Topic.subscribe(function (message) {
        status_bar.set_indoor(message);
    });

    /**
     *  Menu control
     */

    map_menu = new MapMenu(ros.ros);

    /**
     *  Submenu marker
     */
    map_menu.btn_marker.onclick = function () {
        map_menu.btn_marker_onclick(interactive_markers);
    };
    map_menu.range_marker_orientation.oninput = function() {
        const marker = viewer.viewer.scene.getObjectByName("webgui_marker");
        interactive_markers.euler.z = parseFloat(map_menu.range_marker_orientation.value);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(interactive_markers.euler);
        const rotate_z = viewer.viewer.scene.getObjectByName("rotate_z");
        marker.setOrientation(rotate_z, quaternion);
    };
    map_menu.btn_marker_send_goal.onclick = function () {
        map_menu.btn_marker_send_goal_onclick(interactive_markers);
    };

    /**
     *  Submenu settings
     */

    map_menu.btn_settings.onclick = function () {
        map_menu.btn_config_onclick(interactive_markers);
    };
    map_menu.btn_menu_motors_on.onclick = function () {
        map_menu.btn_menu_motors_on_onclick(motors_control, true);
    };
    map_menu.btn_menu_motors_off.onclick = function () {
        map_menu.btn_menu_motors_on_onclick(motors_control, false);
    };
    map_menu.btn_menu_lidar_on.onclick = function () {
        map_menu.btn_menu_lidar_on_onclick(lidar_control, true);
    };
    map_menu.btn_menu_lidar_off.onclick = function () {
        map_menu.btn_menu_lidar_on_onclick(lidar_control, false);
    };

    /**
     *  Map submenu
     */

    map_menu.btn_map.onclick = function () {
        map_menu.btn_map_onclick(interactive_markers);
    };
    document.getElementById("btn_tst_modal").onclick = function () {
        // document.getElementById("modal_remove_map").classList.add('show');
        // document.getElementById("modal_remove_map").style.display = "block";
        $('#modal_remove_map').modal('show')
        console.log("btn_tst_modal");
    }
    map_menu.btn_menu_map_new_indoor.onclick = function () {
        map_menu.new_map('indoor');
        map_menu.hide_all_submenu_divs();
    }
    map_menu.btn_menu_map_new_outdoor.onclick = function () {
        map_menu.new_map('outdoor');
        map_menu.hide_all_submenu_divs();
    }
    map_menu.btn_menu_map_rtabmap_mapping.onclick = function () {
        rtabmap.set_rtabmap_mapping();
        map_menu.hide_all_submenu_divs();
    }
    map_menu.btn_menu_map_rtabmap_localization.onclick = function () {
        rtabmap.set_rtabmap_localization();
        map_menu.hide_all_submenu_divs();
    }
    map_menu.btn_menu_map_new_save.onclick = function () {
        map_menu.save_map();
    }


     /**
     *  Camera show/hide
     */

    map_menu.btn_camera_show.onclick = function () {
        map_menu.camera_show(camera_view);
        layout_man.set_layout();
    };

    /**
     *  Follow robot
     */

    map_menu.btn_follow.onclick = function () {
        switch(tf_client.follow_target){
            case 'map':
                tf_client.map_cam_position.copy(viewer.viewer.camera.position);
                tf_client.map_cam_rotation.copy(viewer.viewer.camera.rotation);
                tf_client.map_cam_center.copy(viewer.viewer.cameraControls.center);
                tf_client.follow_target = 'robot';
                viewer.viewer.camera.position.z = tf_client.robot_cam_position.z;
                status_bar.set_follow_text("Robot");
                break;
            case 'robot':
                tf_client.robot_cam_position.copy(viewer.viewer.camera.position);
                tf_client.follow_target = 'camera';
                status_bar.set_follow_text("Robot front");
                break;
            case 'camera':
                tf_client.follow_target = 'map';
                tf_client.map_reinit = true;
                status_bar.set_follow_text("Map");
                break;
        }
    };


     /**
     *  Move base control
     */

    move_base_control = new MoveBaseControl(ros.ros);
    map_menu.btn_stop_all.onclick = function () {
        move_base_control.pub_cancel_goal();
        motors_control.motors_off();
        update_status_bar_info("Emergency stop");
    }


    /**
     *  Joystick
     */
    map_menu.btn_joy.onclick = function () {
        map_menu.joy_show();
    };

    joy_teleop = new JoyTeleop(ros);

    joy_teleop.manager.on("move", function(evt, nipple) {
        let direction = nipple.angle.degree - 90;
        if (direction > 180) {
            direction = -(450 - nipple.angle.degree);
        }
        let nip_distance = (nipple.distance/(joy_teleop.joysize/2));
        let lin = Math.cos(direction / 57.29) * nip_distance * joy_teleop.speed_lin; // linear speed conversion
        let ang = Math.sin(direction / 57.29) * nip_distance * joy_teleop.speed_ang; // angular speed conversion
        joy_teleop.set_lin(lin);
        joy_teleop.set_ang(ang);
        joy_teleop.set_publish_joy(true);
    });
    joy_teleop.manager.on("end", function() {
        //moveAction(0, 0);
        joy_teleop.set_publish_joy(false);
        joy_teleop.set_lin(0);
        joy_teleop.set_ang(0);
    });
    setInterval(function() {joy_teleop.joy_pub_speed()}, 50)
    joy_teleop.speed_lin = joy_teleop.speed_lin_low;
    joy_teleop.speed_ang = joy_teleop.speed_ang_low;
    move_base_control.pub_set_speed('slow');
    map_menu.btn_menu_speed_low.style.color = "#446de5";
    map_menu.btn_menu_speed_moderate.style.color = "#ffffff";
    map_menu.btn_menu_speed_fast.style.color = "#ffffff";

    // predelat content oncliku na funkce v tride
    map_menu.btn_menu_speed_fast.onclick = function () {
        joy_teleop.speed_lin = joy_teleop.speed_lin_fast;
        joy_teleop.speed_ang = joy_teleop.speed_ang_fast;
        move_base_control.pub_set_speed('fast');
        map_menu.btn_menu_speed_low.style.color = "#ffffff";
        map_menu.btn_menu_speed_moderate.style.color = "#ffffff";
        map_menu.btn_menu_speed_fast.style.color = "#446de5";
    };
    map_menu.btn_menu_speed_moderate.onclick = function () {
        joy_teleop.speed_lin = joy_teleop.speed_lin_moderate;
        joy_teleop.speed_ang = joy_teleop.speed_ang_moderate;
        move_base_control.pub_set_speed('moderate');
        map_menu.btn_menu_speed_low.style.color = "#ffffff";
        map_menu.btn_menu_speed_moderate.style.color = "#446de5";
        map_menu.btn_menu_speed_fast.style.color = "#ffffff";
    };
    map_menu.btn_menu_speed_low.onclick = function () {
        joy_teleop.speed_lin = joy_teleop.speed_lin_low;
        joy_teleop.speed_ang = joy_teleop.speed_ang_low;
        move_base_control.pub_set_speed('slow');
        map_menu.btn_menu_speed_low.style.color = "#446de5";
        map_menu.btn_menu_speed_moderate.style.color = "#ffffff";
        map_menu.btn_menu_speed_fast.style.color = "#ffffff";
    };


    function resize() {
        document.getElementById("div_container").style.width = window.innerWidth + 'px';
        document.getElementById("div_container").style.height = window.innerHeight + 'px';
        console.log("resize w :", window.innerWidth, " h :", window.innerHeight);
        layout_man.set_layout();
    }
    window.addEventListener('resize', function(event){
            resize();
    });
    resize();


    ros_log = new RosLog(ros);
    ros_log.log_topic.subscribe(function (message) {
        ros_log.process_message(message, map_menu.div_log_view);
    });
    map_menu.btn_log.onclick = function () {
        if (map_menu.div_log_view.style.display === "block"){
            map_menu.div_log_view.style.display = "none";
            layout_man.set_layout();

        }
        else {
            map_menu.div_log_view.style.display = "block";
            map_menu.div_log_view.scrollTop = map_menu.div_log_view.scrollHeight;
            layout_man.set_layout();
        }
    };



    maps = new Maps(ros.ros, tf_client.tfClientMap, viewer.viewer);

    rtabmap.rtabmap_status_topic.subscribe(function(message) {
         // console.log(message);
        if (message.data){
            rtabmap.div_rtabmap.style.display = "inline-flex";
        }
        else {
            rtabmap.div_rtabmap.style.display = "none";
        }
    });
    rtabmap.rtabmap_info_Topic.subscribe(function(message) {
        rtabmap.set_info(message);
    });


    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
        const portrait = e.matches;
        layout_man.is_portrait = portrait;
        layout_man.set_layout();
    });

}