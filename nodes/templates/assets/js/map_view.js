// Desc: MapView for Vitulus WebUI

ROS3D.Viewer.prototype.resize = function(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
};


// Override getColor() of OccupancyGrid for custom coloring of maps depends on type.
// It's controled through the color attr of OccupancyGridClient
ROS3D.OccupancyGrid.prototype.getColor = function(index, row, col, value) {
    //  Occupancy identifiers in color attribute of OccupancyGridClient
    //  {r:0,g:255,b:255} gridmap,
    //  {r:255,g:0,b:255} loc costmap,
    //  {r:255,g:255,b:0} glob costmap

    // If map is not costmap.
    if (this.color.r === 0 && this.color.g === 255 && this.color.b === 255){
        // console.log(value);
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
            return [0,0,0,150];
        };
    };

    // If map is local costmap.
    if (this.color.r === 255 && this.color.g === 0 && this.color.b === 255){
        // this.opacity = 0.4;
        // console.log(value);
        if (value === 100){   // obstacle
            return [255,0,0,255];
        };
        if (value === 0){    // free space
            return [0,0,0,10];
        };
        // if (value <= 99 && value >= 1){  // probably obstacle
        //     return [149,149-value,149-value,255];
        // };
        if (value === -1){  // unknown
            return [0,0,0,1];
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
            // console.log(value);
        };
    };
    return [(value * this.color.r) / 255,
              (value * this.color.g) / 255,
              (value * this.color.b) / 255,
              255];
};


class PathListItemTemplate {
    constructor(item) {
        this.name = item;
        this.element =  `
            <div class="col-auto" style="overflow: hidden;margin-bottom: 3px;">
                <div class="input-group input-group-sm">
                    <button onclick="map_menu.path_clicked_exec('${this.name}')" class="btn btn-primary" type="button" style="width: 42px;">
                        <i class="fa fa-arrow-circle-right text-info"></i>
                    </button>
                    <span class="text-info input-group-text" style="padding-left: 5px;width: 143.1562px;padding-right: 5px;font-size: 13px;">
                        ${this.name}
                    </span>
                    <button onclick="map_menu.add_path_point('${this.name}')" class="btn btn-primary" type="button">Add</button>
                    <button onclick="map_menu.path_clicked_show('${this.name}')" class="btn btn-primary" type="button">Show</button>
                    <button onclick="map_menu.show_modal_remove_path('${this.name}')" class="btn btn-primary" type="button" style="width: 40px;">
                        <i class="fa fa-remove text-danger"></i>
                    </button>
                </div>
            </div>
            `;
    }
}


class ProgramZoneItemTemplate {
    constructor(zone) {
        this.zone = zone;
        this.name = zone.name;
        this.area = zone.area;
        this.length = zone.length;
        this.cut_height = zone.cut_height;
        this.rpm = zone.rpm;
        this.coverage_angle = zone.coverage_angle;
        this.paths_distance = zone.paths_distance;
        this.border_paths = zone.border_paths;
        this.paths = zone.paths.length;
        this.element =  `
            <div class="col-auto" style="margin-top: 4px;">
                <div style="background: #37434d;padding: 5px;border-radius: 4px;padding-left: 8px;padding-right: 8px;">
                    <div class="row" style="padding-left: 7px;padding-right: 7px;">
                        <div class="col-auto" style="padding-left: 5px;padding-right: 2px;">
                            <div class="d-flex align-items-center"><span class="text-info" style="display: block;color: var(--bs-gray-500);font-size: 14px;padding-right: 6px;">
                                    ${this.name}
                                </span>
                            </div>
                        </div>
                        <div class="col-auto" style="padding-right: 2px;padding-left: 5px;">
                            <div class="d-flex align-items-center"><span class="text-secondary" style="display: block;font-size: 14px;">
                                    Cut height: 
                                </span><span class="text-light" style="display: block;font-size: 14px;">
                                ${this.cut_height}
                                </span><span class="text-light" style="display: block;font-size: 14px;"> cm</span>
                            </div>
                        </div>
                        <div class="col-auto" style="padding-right: 2px;padding-left: 5px;">
                            <div class="d-flex align-items-center"><span class="text-secondary" style="display: block;font-size: 14px;">
                                RPM: 
                                </span><span class="text-light" style="display: block;font-size: 14px;">
                                ${this.rpm}
                                </span></div>
                        </div>
                        <div class="col-auto" style="padding-right: 2px;padding-left: 5px;">
                            <div class="d-flex align-items-center"><span class="text-secondary" style="display: block;font-size: 14px;">
                                Coverage angle: 
                                </span><span class="text-light" style="display: block;font-size: 14px;">
                                ${this.coverage_angle}
                                </span><span class="text-light" style="display: block;font-size: 14px;">°</span></div>
                        </div>
                        <div class="col-auto" style="padding-right: 2px;padding-left: 5px;">
                            <div class="d-flex align-items-center"><span class="text-secondary" style="display: block;font-size: 14px;">
                                Path distance: 
                                </span><span class="text-light" style="display: block;font-size: 14px;">
                                ${this.paths_distance}
                                </span><span class="text-light" style="display: block;font-size: 14px;"> m</span></div>
                        </div>
                        <div class="col-auto" style="padding-right: 2px;padding-left: 5px;">
                            <div class="d-flex align-items-center"><span class="text-secondary" style="display: block;font-size: 14px;">
                                Area: 
                                </span><span class="text-light" style="display: block;font-size: 14px;">
                                ${this.area}
                                </span><span class="text-light" style="display: block;font-size: 14px;"> m</span><span class="text-light" style="display: block;font-size: 9px;"> 2</span></div>
                        </div>
                        <div class="col-auto" style="padding-right: 2px;padding-left: 5px;">
                            <div class="d-flex align-items-center"><span class="text-secondary" style="display: block;font-size: 14px;">
                                Length: 
                                </span><span class="text-light" style="display: block;font-size: 14px;">
                                ${this.length}
                                </span><span class="text-light" style="display: block;font-size: 14px;"> m</span></div>
                        </div>
                        <div class="col-auto" style="padding-right: 2px;padding-left: 5px;">
                            <div class="d-flex align-items-center"><span class="text-secondary" style="display: block;font-size: 14px;">
                                Borders: 
                                </span><span class="text-light" style="display: block;font-size: 14px;">
                                ${this.border_paths}
                                </span></div>
                        </div>
                        <div class="col-auto" style="padding-right: 2px;padding-left: 5px;">
                            <div class="d-flex align-items-center"><span class="text-secondary" style="display: block;font-size: 14px;">
                                Paths: 
                                </span><span class="text-light" style="display: block;font-size: 14px;">
                                ${this.paths}
                                </span></div>
                        </div>
                    </div>
                </div>
            </div>
            `;
    }
}


class ProgramListItemTemplate {
    constructor(item, id) {
        this.program = id;
        this.name = item.name;
        this.length = item.length;
        this.area = item.area;
        this.last_duration = item.last_duration_minutes;
        this.element =  `
            <div class="col-auto" style="overflow: hidden;margin-bottom: 3px;">
                <div class="input-group input-group-sm" style="width: 319px;">
                    <button onclick="programs.show_program(${this.program})" class="btn btn-primary" type="button" style="width: 42px;">
                        <i class="fa fa-arrow-circle-right text-info"></i>
                    </button>
                    <span class="text-info input-group-text" style="padding-left: 5px;width: 277.1562px;padding-right: 5px;font-size: 13px;">
                        <span class="text-info" style="font-size: 13px;">
                            ${this.name} ${this.area}
                        </span>
                        <span class="text-info" style="font-size: 13px;padding-left: 3px;">m</span>
                        <span class="text-info" style="font-size: 9px;">2</span>
                    </span>
                </div>
            </div>
            `;
    }
}


class ItemList {
    constructor(ros, map_menu, type) {
        this.list = [];
        this.type = type;
        this.map_menu = map_menu;
        if (this.type === 'point'){
            this.list_Topic = new ROSLIB.Topic({
                ros : ros,
                name : '/navi_manager/map_point_str_list',
                messageType : 'vitulus_msgs/StringList'
            });
        }
        if (this.type === 'path'){
            this.list_Topic = new ROSLIB.Topic({
                ros : ros,
                name : '/navi_manager/map_path_str_list',
                messageType : 'vitulus_msgs/StringList'
            });
        }
        this.list_Topic.subscribe((message) => {
            // console.log(message);
            this.process_list(message);
        });
    }
    get_html(){
        let elements = "";
        this.list.forEach((item) => {
            elements += item.element;
        });
        return elements;
    }
    process_list(message){
        // Add new item to list if not exist in list.
        let change_list = false;
        message.string_list.forEach(async (msg_item) => {
            let add_new = true;
            this.list.forEach((item) => {
                if (item.name === msg_item){
                    add_new = false;
                }
            });
            if (add_new){
                change_list = true;
                if (this.type === 'path'){
                    this.list.push(new PathListItemTemplate(msg_item));
                }
                if (this.type === 'point') {
                    this.list.push(new PointListItemTemplate(msg_item));
                }
            }
        });
        // Remove item from list if not exist in message.
        this.list.forEach(async (item, index) => {
            let remove = true;
            message.string_list.forEach((msg_item) => {
                // console.log('item exist: ', item.name);
                if (msg_item === item.name){
                    remove = false;
                }
            });
            if (remove){
                change_list = true;
                delete this.list[index];
            }
        });
        // Redraw list if there was any change.
        if (change_list){
            // console.log(this.list);
            if (this.type === 'path'){
                this.map_menu.div_menu_path_items_row.innerHTML = this.get_html()
            }
            if (this.type === 'point') {
                this.map_menu.div_menu_point_items_row.innerHTML = this.get_html()
            }
        }
    }
}

class PointListItemTemplate {
    constructor(item) {
        this.name = item;
        this.element =  `
            <div class="col-auto" style="overflow: hidden;margin-bottom: 3px;">
                <div class="input-group input-group-sm">
                    <button onclick="map_menu.point_clicked_goal('${this.name}')" class="btn btn-primary" type="button" style="width: 42px;">
                        <i class="fa fa-map-marker text-info"></i>
                    </button>
                    <span class="text-info input-group-text" style="padding-left: 5px;width: 185.9219px;padding-right: 5px;font-size: 13px;">
                        ${this.name}
                    </span>
                    <button onclick="map_menu.point_clicked_show('${this.name}')" class="btn btn-primary" type="button">Show</button>
                    <button onclick="map_menu.show_modal_remove_point('${this.name}')" class="btn btn-primary" type="button" style="width: 40px;">
                        <i class="fa fa-remove text-danger"></i>
                    </button>
                </div>
            </div>
            `;
    }
}


class MapList {
    constructor(ros, map_menu) {
        this.map_list = [];
        this.map_menu = map_menu;
        this.map_list_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/map_str_list',
            messageType : 'vitulus_msgs/StringList'
        });
        this.map_list_Topic.subscribe((message) => {
            this.process_map_list(message);
        });
    }
    get_html(){
        let map_elements = "";
        this.map_list.forEach((map) => {
            map_elements += map.element;
        });
        return map_elements;
    }
    process_map_list(message){
        // Add new maps to map_list if not exist in map_list.
        let change_list = false;
        message.string_list.forEach(async (map) => {
            let add_new = true;
            this.map_list.forEach((map_item) => {
                if (map_item.map === map){
                    add_new = false;
                }
            });
            if (add_new){
                change_list = true;
                const items = map.split('***env*');
                const map_name = items[0];
                const items2 = items[1].split(' (');
                const map_type = items2[0];
                const map_size = items2[1].replace(' GB)', '');
                this.map_list.push(new MapListItemTemplate(map_name, map_type, map_size, map));
            }
        });
        // Remove maps from map_list if not exist in message.
        this.map_list.forEach(async (map, index) => {
            let remove = true;
            message.string_list.forEach((map_item) => {
                // console.log('map exist: ', map_item.map);
                if (map_item === map.map){
                    remove = false;
                }
            });
            if (remove){
                change_list = true;
                delete this.map_list[index];
            }
        });
        // Redraw map_list if there was any change.
        if (change_list){
            // console.log(this.map_list);
            this.map_menu.div_menu_map_items_row.innerHTML = this.get_html()
        }
    }
}

class MapListItemTemplate {
    constructor(name, type, size, map) {
        this.name = name;
        this.map = map;
        this.file_name = name + '***env*' + type;
        this.type = type;
        this.ico = 'fa fa-tree';
        if (type === 'INDOOR'){
            this.ico = 'fa fa-home';
        }
        this.size = size;
        this.element =  `<div class="col-auto" style="overflow: hidden;margin-bottom: 3px;">
                            <div class="input-group input-group-sm">
                                <button onclick="map_menu.load_clicked_map('${this.file_name}', '${this.type}')" class="btn btn-primary" type="button" style="width: 42px;">
                                    <i class="fa fa-arrow-circle-right text-info"></i>
                                </button>
                                <span class="text-info input-group-text" style="padding-left: 5px;width: 237.1562px;padding-right: 4px;">
                                    <span style="font-size: 13px;width: 164.797px;text-align: left;">
                                        ${this.name}
                                    </span>
                                    <span>
                                        <span style="padding-right: 0px;padding-left: 0px;border-right-style: none;border-left-style: none;font-size: 12px;color: var(--bs-gray-500);margin-left: 2px;">
                                            ${this.size}
                                        </span>
                                        <span style="padding-right: 0px;padding-left: 0px;border-right-style: none;border-left-style: none;font-size: 9px;color: var(--bs-gray-500);">
                                         GB
                                        </span>
                                        <span class="text-info d-inline-flex justify-content-center align-items-center" style="display: inline-flex;width: 20px;margin-right: -5px;">
                                            <i class="${this.ico}" style="font-size: 11px;color: var(--bs-light);"></i>
                                        </span>
                                    </span>
                                </span>
                                <button onclick="map_menu.show_modal_remove_map('${this.name}', '${this.file_name}')" class="btn btn-primary" type="button" style="width: 40px;">
                                    <i class="fa fa-remove text-danger"></i>
                                </button>
                            </div>
                        </div>`;
    }
}


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
        var padding = parseInt((document.getElementById("map_view").style.padding).replace('px', ''));
        this.viewer.resize(width, height);
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
        viewer.viewer.scene.add(new ROS3D.Grid({num_cells : 50, color: "#333333", lineWidth: 0.1, cellSize: 1.0, }));
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
        // console.log(this.follow_target);
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
        this.map_offset =new ROSLIB.Pose({ position : new ROSLIB.Vector3({ x : 0, y : 0, z : -0.03 }),
                    orientation : new ROSLIB.Quaternion({ x : 0.0, y : 0.0, z : 0.0, w : 1.0 }) });
        this.map = null;
        this.local_costmap_offset = new ROSLIB.Pose({ position : new ROSLIB.Vector3({ x : 0, y : 0, z : -0.01 }),
                    orientation : new ROSLIB.Quaternion({ x : 0.0, y : 0.0, z : 0.0, w : 1.0 }) });
        this.local_costmap = null;
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
        // console.log('Sending interactive marker goal.');
        var interactiveMarkerGoalMsg = new ROSLIB.Message({
            data : 'interactiveGoal',
        });
        this.interactiveMarkerGoalTopic.publish(interactiveMarkerGoalMsg);
    }

    new_marker(event3d){
        // console.log(event3d.mouseRay);
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
            max_pts: 10000,
            // max_age: 0,
            // opacity: 1.0,
            // alpha: 1.0,
            pointRatio: 2.0,
            material: { size: 2.0, color: 0x71ff02 }
        });
        this.obstacle_cloud = new ROS3D.PointCloud2({
            ros : ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            topic: '/obstacles_cloud',
            max_pts: 10000,
            // max_age: 60,
            // opacity: 1.0,
            // alpha: 1.0,
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
            topic: '/move_base_flex/TebLocalPlannerROS/local_plan_slow',
            color: 0xff00ff,
        });
        this.globalPlan = new ROS3D.Path({
            ros : ros,
            tfClient: tf_client,
            rootObject : viewer.scene,
            topic: '/move_base_flex/TebLocalPlannerROS/global_plan_slow',
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
          topic: "/web_plan/program_marker",
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
        this.ico_wifi = document.getElementById("ico_wifi");
        this.ico_gps = document.getElementById("ico_gps");
        this.ico_gps_nav = document.getElementById("ico_gps_nav");
        this.ico_imu = document.getElementById("ico_imu");
        this.ico_lidar = document.getElementById("ico_lidar");
        this.ico_camera = document.getElementById("ico_camera");
        this.ico_mower = document.getElementById("ico_mower");
        this.ico_fl_motor = document.getElementById("ico_fl_motor");
        this.ico_fr_motor = document.getElementById("ico_fr_motor");
        this.ico_rl_motor = document.getElementById("ico_rl_motor");
        this.ico_rr_motor = document.getElementById("ico_rr_motor");
        this.ico_temp_pcb = document.getElementById("ico_temp_pcb");
        this.ico_temp = document.getElementById("ico_temp");
        this.ico_fan = document.getElementById("ico_fan");
        this.ico_fan_pcb = document.getElementById("ico_fan_pcb");
        this.ico_supply = document.getElementById("ico_supply");
        this.ico_batt = document.getElementById("ico_batt");
        this.ico_fl_motor_conf = document.getElementById("ico_fl_motor_conf");
        this.ico_fr_motor_conf = document.getElementById("ico_fr_motor_conf");
        this.ico_rl_motor_conf = document.getElementById("ico_rl_motor_conf");
        this.ico_rr_motor_conf = document.getElementById("ico_rr_motor_conf");
        this.ico_temp_pcb_conf = document.getElementById("ico_temp_pcb_conf");
        this.ico_temp_conf = document.getElementById("ico_temp_conf");
        this.ico_fan_conf = document.getElementById("ico_fan_conf");
        this.ico_fan_pcb_conf = document.getElementById("ico_fan_pcb_conf");
        this.ico_supply_conf = document.getElementById("ico_supply_conf");
        this.ico_batt_conf = document.getElementById("ico_batt_conf");

        this.icon_status_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/device_state_pub/icon_status',
            messageType: 'vitulus_msgs/Device_icon_status'
        });
    }

    icon_data(message){
        // WiFi
            if (message.wifi === "FINE") {
                this.ico_wifi.src = "/assets/img/robot_icons/Nextion_ico_wifi_green.png";
            }
            if (message.wifi === "MEDIUM") {
                this.ico_wifi.src = "/assets/img/robot_icons/Nextion_ico_wifi_orange.png";
            }
            if (message.wifi === "BAD") {
                this.ico_wifi.src = "/assets/img/robot_icons/Nextion_ico_wifi_red.png";
            }
            if (message.wifi === "DISCONNECTED") {
                this.ico_wifi.src = "/assets/img/robot_icons/Nextion_ico_wifi_grey.png";
            }
            // GPS
            if (message.gnss === "RTK") {
                this.ico_gps.src = "/assets/img/robot_icons/Nextion_ico_gps_green.png";
            }
            if (message.gnss === "3DFIX") {
                this.ico_gps.src = "/assets/img/robot_icons/Nextion_ico_gps_orange.png";
            }
            if (message.gnss === "BAD") {
                this.ico_gps.src = "/assets/img/robot_icons/Nextion_ico_gps_red.png";
            }
            if (message.gnss === "DISABLED") {
                this.ico_gps.src = "/assets/img/robot_icons/Nextion_ico_gps_grey.png";
            }
            // GPS_NAV
            if (message.gnss_nav === "RTK") {
                this.ico_gps_nav.src = "/assets/img/robot_icons/Nextion_ico_gpsnav_green.png";
            }
            if (message.gnss_nav === "3DFIX") {
                this.ico_gps_nav.src = "/assets/img/robot_icons/Nextion_ico_gpsnav_orange.png";
            }
            if (message.gnss_nav === "BAD") {
                this.ico_gps_nav.src = "/assets/img/robot_icons/Nextion_ico_gpsnav_red.png";
            }
            if (message.gnss_nav === "DISABLED") {
                this.ico_gps_nav.src = "/assets/img/robot_icons/Nextion_ico_gpsnav_grey.png";
            }
            // IMU
            if (message.imu === "ON") {
                this.ico_imu.src = "/assets/img/robot_icons/Nextion_ico_imu_green.png";
            }
            else  {
                this.ico_imu.src = "/assets/img/robot_icons/Nextion_ico_imu_grey.png";
            }
            // LIDAR
            if (message.lidar === "ON") {
                this.ico_lidar.src = "/assets/img/robot_icons/Nextion_ico_lidar_green.png";
            }
            else  {
                this.ico_lidar.src = "/assets/img/robot_icons/Nextion_ico_lidar_grey.png";
            }
            // D435
            if (message.d435 === "ON") {
                this.ico_camera.src = "/assets/img/robot_icons/Nextion_ico_camera_green.png";
            }
            else  {
                this.ico_camera.src = "/assets/img/robot_icons/Nextion_ico_camera_grey.png";
            }
            // MOWER
            if (message.mower === "ON") {
                this.ico_mower.src = "/assets/img/robot_icons/Nextion_ico_mower_green.png";
            }
            if (message.mower === "BUSY") {
                this.ico_mower.src = "/assets/img/robot_icons/Nextion_ico_mower_green.png";
            }
            if (message.mower === "ERROR") {
                this.ico_mower.src = "/assets/img/robot_icons/Nextion_ico_mower_red.png";
            }
            if (message.mower === "DISABLED") {
                this.ico_mower.src = "/assets/img/robot_icons/Nextion_ico_mower_grey.png";
            }
            // FL MOTOR
            if (message.mot_lf === "OK") {
                this.ico_fl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLF_green.png";
            }
            if (message.mot_lf === "WARM") {
                this.ico_fl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLF_orange.png";
            }
            if (message.mot_lf === "HOT") {
                this.ico_fl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLF_red.png";
            }
            if (message.mot_lf === "DISABLED") {
                this.ico_fl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLF_grey.png";
            }
            // FR MOTOR
            if (message.mot_rf === "OK") {
                this.ico_fr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRF_green.png";
            }
            if (message.mot_rf === "WARM") {
                this.ico_fr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRF_orange.png";
            }
            if (message.mot_rf === "HOT") {
                this.ico_fr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRF_red.png";
            }
            if (message.mot_rf === "DISABLED") {
                this.ico_fr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRF_grey.png";
            }
            // RL MOTOR
            if (message.mot_lr === "OK") {
                this.ico_rl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLR_green.png";
            }
            if (message.mot_lr === "WARM") {
                this.ico_rl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLR_orange.png";
            }
            if (message.mot_lr === "HOT") {
                this.ico_rl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLR_red.png";
            }
            if (message.mot_lr === "DISABLED") {
                this.ico_rl_motor.src = "/assets/img/robot_icons/Nextion_ico_motorLR_grey.png";
            }
            // RR MOTOR
            if (message.mot_rr === "OK") {
                this.ico_rr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRR_green.png";
            }
            if (message.mot_rr === "WARM") {
                this.ico_rr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRR_orange.png";
            }
            if (message.mot_rr === "HOT") {
                this.ico_rr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRR_red.png";
            }
            if (message.mot_rr === "DISABLED") {
                this.ico_rr_motor.src = "/assets/img/robot_icons/Nextion_ico_motorRR_grey.png";
            }
            // TEMP_PCB
            if (message.temp_int === "OK") {
                this.ico_temp_pcb.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_green.png";
            }
            if (message.temp_int === "WARM") {
                this.ico_temp_pcb.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_orange.png";
            }
            if (message.temp_int === "HOT") {
                this.ico_temp_pcb.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_red.png";
            }
            if (message.temp_int === "DISABLED") {
                this.ico_temp_pcb.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_grey.png";
            }
            // FAN_PCB
            if (message.fan_int === "ON") {
                this.ico_fan_pcb.src = "/assets/img/robot_icons/Nextion_ico_fanPCB_green.png";
            }
            else  {
                this.ico_fan_pcb.src = "/assets/img/robot_icons/Nextion_ico_fanPCB_grey.png";
            }
            // TEMP_EXT
            if (message.temp_ext === "OK") {
                this.ico_temp.src = "/assets/img/robot_icons/Nextion_ico_temp_green.png";
            }
            if (message.temp_ext === "WARM") {
                this.ico_temp.src = "/assets/img/robot_icons/Nextion_ico_temp_orange.png";
            }
            if (message.temp_ext === "HOT") {
                this.ico_temp.src = "/assets/img/robot_icons/Nextion_ico_temp_red.png";
            }
            if (message.temp_ext === "DISABLED") {
                this.ico_temp.src = "/assets/img/robot_icons/Nextion_ico_temp_grey.png";
            }
            // FAN_EXT
            if (message.fan_ext === "ON") {
                this.ico_fan.src = "/assets/img/robot_icons/Nextion_ico_fan_green.png";
            }
            else  {
                this.ico_fan.src = "/assets/img/robot_icons/Nextion_ico_fan_grey.png";
            }
            // supply
            if (message.supply === "ONLINE") {
                this.ico_supply.src = "/assets/img/robot_icons/Nextion_ico_supply_green.png";
            }
            else  {
                if (message.supply === "FAIL") {
                this.ico_supply.src = "/assets/img/robot_icons/Nextion_ico_supply_red.png";
                }
                else  {
                    this.ico_supply.src = "/assets/img/robot_icons/Nextion_ico_supply_grey.png";
                }
            }
            // BATTERY
            if (message.batt === "FULL") {
                this.ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_full.png";
            }
            if (message.batt === "75") {
                this.ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_34.png";
            }
            if (message.batt === "50") {
                this.ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_half.png";
            }
            if (message.batt === "25") {
                this.ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_14.png";
            }
            if (message.batt === "EMPTY") {
                this.ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_empty.png";
            }
            if (message.batt === "FULL_CHARGE") {
                this.ico_batt.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_full.png";
            }
            if (message.batt === "75_CHARGE") {
                this.ico_batt.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_34.png";
            }
            if (message.batt === "50_CHARGE") {
                this.ico_batt.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_half.png";
            }
            if (message.batt === "25_CHARGE") {
                this.ico_batt.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_14.png";
            }
            if (message.batt === "EMPTY_CHARGE") {
                this.ico_batt.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_empty.png";
            }
            if (message.batt === "DISABLED") {
                this.ico_batt.src = "/assets/img/robot_icons/Nextion_ico_batt_disabled.png";
            }

            // MOTOR CONFIG MENU  ///
            // FL MOTOR
            if (message.mot_lf === "OK") {
                this.ico_fl_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorLF_green.png";
            }
            if (message.mot_lf === "WARM") {
                this.ico_fl_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorLF_orange.png";
            }
            if (message.mot_lf === "HOT") {
                this.ico_fl_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorLF_red.png";
            }
            if (message.mot_lf === "DISABLED") {
                this.ico_fl_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorLF_grey.png";
            }
            // FR MOTOR
            if (message.mot_rf === "OK") {
                this.ico_fr_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorRF_green.png";
            }
            if (message.mot_rf === "WARM") {
                this.ico_fr_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorRF_orange.png";
            }
            if (message.mot_rf === "HOT") {
                this.ico_fr_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorRF_red.png";
            }
            if (message.mot_rf === "DISABLED") {
                this.ico_fr_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorRF_grey.png";
            }
            // RL MOTOR
            if (message.mot_lr === "OK") {
                this.ico_rl_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorLR_green.png";
            }
            if (message.mot_lr === "WARM") {
                this.ico_rl_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorLR_orange.png";
            }
            if (message.mot_lr === "HOT") {
                this.ico_rl_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorLR_red.png";
            }
            if (message.mot_lr === "DISABLED") {
                this.ico_rl_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorLR_grey.png";
            }
            // RR MOTOR
            if (message.mot_rr === "OK") {
                this.ico_rr_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorRR_green.png";
            }
            if (message.mot_rr === "WARM") {
                this.ico_rr_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorRR_orange.png";
            }
            if (message.mot_rr === "HOT") {
                this.ico_rr_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorRR_red.png";
            }
            if (message.mot_rr === "DISABLED") {
                this.ico_rr_motor_conf.src = "/assets/img/robot_icons/Nextion_ico_motorRR_grey.png";
            }

            /// POWER CONFIG MENU  ///
            // TEMP_PCB
            if (message.temp_int === "OK") {
                this.ico_temp_pcb_conf.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_green.png";
            }
            if (message.temp_int === "WARM") {
                this.ico_temp_pcb_conf.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_orange.png";
            }
            if (message.temp_int === "HOT") {
                this.ico_temp_pcb_conf.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_red.png";
            }
            if (message.temp_int === "DISABLED") {
                this.ico_temp_pcb_conf.src = "/assets/img/robot_icons/Nextion_ico_tempPCB_grey.png";
            }
            // FAN_PCB
            if (message.fan_int === "ON") {
                this.ico_fan_pcb_conf.src = "/assets/img/robot_icons/Nextion_ico_fanPCB_green.png";
            }
            else  {
                this.ico_fan_pcb_conf.src = "/assets/img/robot_icons/Nextion_ico_fanPCB_grey.png";
            }
            // TEMP_EXT
            if (message.temp_ext === "OK") {
                this.ico_temp_conf.src = "/assets/img/robot_icons/Nextion_ico_temp_green.png";
            }
            if (message.temp_ext === "WARM") {
                this.ico_temp_conf.src = "/assets/img/robot_icons/Nextion_ico_temp_orange.png";
            }
            if (message.temp_ext === "HOT") {
                this.ico_temp_conf.src = "/assets/img/robot_icons/Nextion_ico_temp_red.png";
            }
            if (message.temp_ext === "DISABLED") {
                this.ico_temp_conf.src = "/assets/img/robot_icons/Nextion_ico_temp_grey.png";
            }
            // FAN_EXT
            if (message.fan_ext === "ON") {
                this.ico_fan_conf.src = "/assets/img/robot_icons/Nextion_ico_fan_green.png";
            }
            else  {
                this.ico_fan_conf.src = "/assets/img/robot_icons/Nextion_ico_fan_grey.png";
            }
            // supply
            if (message.supply === "ONLINE") {
                this.ico_supply_conf.src = "/assets/img/robot_icons/Nextion_ico_supply_green.png";
            }
            else  {
                if (message.supply === "FAIL") {
                this.ico_supply_conf.src = "/assets/img/robot_icons/Nextion_ico_supply_red.png";
                }
                else  {
                    this.ico_supply_conf.src = "/assets/img/robot_icons/Nextion_ico_supply_grey.png";
                }
            }
            // BATTERY
            if (message.batt === "FULL") {
                this.ico_batt_conf.src = "/assets/img/robot_icons/Nextion_ico_batt_full.png";
            }
            if (message.batt === "75") {
                this.ico_batt_conf.src = "/assets/img/robot_icons/Nextion_ico_batt_34.png";
            }
            if (message.batt === "50") {
                this.ico_batt_conf.src = "/assets/img/robot_icons/Nextion_ico_batt_half.png";
            }
            if (message.batt === "25") {
                this.ico_batt_conf.src = "/assets/img/robot_icons/Nextion_ico_batt_14.png";
            }
            if (message.batt === "EMPTY") {
                this.ico_batt_conf.src = "/assets/img/robot_icons/Nextion_ico_batt_empty.png";
            }
            if (message.batt === "FULL_CHARGE") {
                this.ico_batt_conf.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_full.png";
            }
            if (message.batt === "75_CHARGE") {
                this.ico_batt_conf.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_34.png";
            }
            if (message.batt === "50_CHARGE") {
                this.ico_batt_conf.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_half.png";
            }
            if (message.batt === "25_CHARGE") {
                this.ico_batt_conf.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_14.png";
            }
            if (message.batt === "EMPTY_CHARGE") {
                this.ico_batt_conf.src = "/assets/img/robot_icons/Nextion_ico_battCHARGE_empty.png";
            }
            if (message.batt === "DISABLED") {
                this.ico_batt_conf.src = "/assets/img/robot_icons/Nextion_ico_batt_disabled.png";
            }
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
        // this.speed_lin_fast = 0.75;
        // this.speed_ang_fast = 1.5;
        // this.speed_lin_moderate = 0.5;
        // this.speed_ang_moderate = 1.2;
        // this.speed_lin_low = 0.25;
        // this.speed_ang_low = 0.75;
        // this.speed_lin = this.speed_lin_moderate;
        // this.speed_ang = this.speed_ang_moderate;
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
        this.width = 160;
        this.height = 120;
        this.camViewer = new MJPEGCANVAS.Viewer({
          divID : 'div_camera_view',
          host : location.hostname,
          port: 8080,
          type: 'mjpeg',
          // type: 'ros_compressed',
          quality: 20,
          refreshRate: 6,
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
    };
}


class LidarControl {
    constructor(ros) {
        this.btn_menu_lidar_on = document.getElementById("btn_menu_lidar_on");
        this.btn_menu_lidar_off = document.getElementById("btn_menu_lidar_off");
        this.btngroup_lidar_on_off = document.getElementById("btngroup_lidar_on_off");
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
        this.icon_status_topic = new ROSLIB.Topic({
            ros: ros,
            name: '/device_state_pub/icon_status',
            messageType: 'vitulus_msgs/Device_icon_status'
        });
    }
    stop_lidar(){
        this.stop_lidar_srvs.callService(this.request, function(result) {
            console.log('Result for service call on stop lidar: ' + result);
        }, function(error){
            console.error("Got an error while trying to call stop lidar service");
        });
    }
    start_lidar(){
        this.start_lidar_srvs.callService(this.request, function(result) {
            console.log('Result for service call on start lidar: ' + result);
        }, function(error){
            console.error("Got an error while trying to call start lidar service");
        });
    }
    status_data(message){
        if (message.lidar === "ON") {
            this.btngroup_lidar_on_off.style.setProperty('border', '2px solid var(--bs-success)');
        }
        else {
            this.btngroup_lidar_on_off.style.setProperty('border', '2px solid var(--bs-danger)');
        }
    }
}


class MotorControl {
    constructor(ros) {
        this.btn_motor_torque = document.getElementById("btn_motor_torque");
        this.input_motor_torque = document.getElementById("input_motor_torque");
        this.span_motor1_status = document.getElementById("span_motor1_status");
        this.span_motor1_torque = document.getElementById("span_motor1_torque");
        this.span_motor1_temp = document.getElementById("span_motor1_temp");
        this.span_motor1_velocity = document.getElementById("span_motor1_velocity");
        this.span_motor1_position = document.getElementById("span_motor1_position");
        this.span_motor1_volts = document.getElementById("span_motor1_volts");
        this.span_motor1_mode = document.getElementById("span_motor1_mode");
        this.span_motor1_id = document.getElementById("span_motor1_id");
        this.span_motor2_status = document.getElementById("span_motor2_status");
        this.span_motor2_torque = document.getElementById("span_motor2_torque");
        this.span_motor2_temp = document.getElementById("span_motor2_temp");
        this.span_motor2_velocity = document.getElementById("span_motor2_velocity");
        this.span_motor2_position = document.getElementById("span_motor2_position");
        this.span_motor2_volts = document.getElementById("span_motor2_volts");
        this.span_motor2_mode = document.getElementById("span_motor2_mode");
        this.span_motor2_id = document.getElementById("span_motor2_id");
        this.span_motor3_status = document.getElementById("span_motor3_status");
        this.span_motor3_torque = document.getElementById("span_motor3_torque");
        this.span_motor3_temp = document.getElementById("span_motor3_temp");
        this.span_motor3_velocity = document.getElementById("span_motor3_velocity");
        this.span_motor3_position = document.getElementById("span_motor3_position");
        this.span_motor3_volts = document.getElementById("span_motor3_volts");
        this.span_motor3_mode = document.getElementById("span_motor3_mode");
        this.span_motor3_id = document.getElementById("span_motor3_id");
        this.span_motor4_status = document.getElementById("span_motor4_status");
        this.span_motor4_torque = document.getElementById("span_motor4_torque");
        this.span_motor4_temp = document.getElementById("span_motor4_temp");
        this.span_motor4_velocity = document.getElementById("span_motor4_velocity");
        this.span_motor4_position = document.getElementById("span_motor4_position");
        this.span_motor4_volts = document.getElementById("span_motor4_volts");
        this.span_motor4_mode = document.getElementById("span_motor4_mode");
        this.span_motor4_id = document.getElementById("span_motor4_id");
        this.span_motor_torque = document.getElementById("span_motor_torque");
        this.btn_motors_on = document.getElementById("btn_motors_on");
        this.btn_motors_off = document.getElementById("btn_motors_off");
        this.btngroup_motors_on_off = document.getElementById("btngroup_motors_on_off");


        // this.joy_teleop = joy_teleop_arg;
        // this.move_base_control = move_base_control_arg;

        this.motorPowerTopic = new ROSLIB.Topic({
            ros : ros,
            name : '/base/motor_power',
            messageType : 'std_msgs/Bool'
        });
        this.motorPowerStateTopic = new ROSLIB.Topic({
            ros : ros,
            name : '/base/motor_power_state',
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
        this.front_left_wheel_state_topic = new ROSLIB.Topic({
            ros: ros,
            name: '/base/front_left_wheel_state',
            messageType: 'vitulus_msgs/Moteus_controller_state'
        });
        this.rear_left_wheel_state_topic = new ROSLIB.Topic({
            ros: ros,
            name: '/base/rear_left_wheel_state',
            messageType: 'vitulus_msgs/Moteus_controller_state'
        });
        this.front_right_wheel_state_topic = new ROSLIB.Topic({
            ros: ros,
            name: '/base/front_right_wheel_state',
            messageType: 'vitulus_msgs/Moteus_controller_state'
        });
        this.rear_right_wheel_state_topic = new ROSLIB.Topic({
            ros: ros,
            name: '/base/rear_right_wheel_state',
            messageType: 'vitulus_msgs/Moteus_controller_state'
        });
        this.get_torque_set_topic = new ROSLIB.Topic({
            ros: ros,
            name: '/base/get_torque_set',
            messageType: 'std_msgs/Float32'
        });
        this.set_torque_topic = new ROSLIB.Topic({
            ros : ros,
            name : '/base/set_torque',
            messageType : 'std_msgs/Float32'
        });

        this.init();
    }

    init(){
        this.motorPowerTopic.advertise();
        this.pmMotorSwitchTopic.advertise();
        this.set_torque_topic.advertise();
    }

    motor_state_data(message){
        if (message.data){
            this.btngroup_motors_on_off.style.setProperty('border', '2px solid var(--bs-success)');
        }
        else {
            this.btngroup_motors_on_off.style.setProperty('border', '2px solid var(--bs-danger)');
        }
    }

    motor1_data(message){
        this.span_motor1_status.textContent = message.fault;
        if (message.fault === "OK") {
            this.span_motor1_status.className = 'text-success';
        }else {
            this.span_motor1_status.className = 'text-danger';
        }
        this.span_motor1_torque.textContent = message.torque.toFixed(2);
        let torque_color = 'text-success';
        if (Math.abs(message.torque) >= 10){
            torque_color = 'text-warning';
        }
        if (Math.abs(message.torque) >= 15){
            torque_color = 'text-danger';
        }
        this.span_motor1_torque.className = torque_color;
        this.span_motor1_temp.textContent = message.temperature;
        let temp_color = 'text-success';
        if (message.temperature >= 50){
            temp_color = 'text-warning';
        }
        if (message.temperature >= 60){
            temp_color = 'text-danger';
        }
        this.span_motor1_temp.className = temp_color;
        this.span_motor1_velocity.textContent = message.velocity.toFixed(2);
        this.span_motor1_position.textContent = message.position.toFixed(2);
        this.span_motor1_volts.textContent = message.voltage;
        this.span_motor1_mode.textContent = message.mode;
        if (message.mode === "POSITION") {
            this.span_motor1_mode.className = 'text-success';
        }else {
            this.span_motor1_mode.className = 'text-danger';
        }
        this.span_motor1_id.textContent = message.id;
    }
    motor2_data(message){
        this.span_motor2_status.textContent = message.fault;
        if (message.fault === "OK") {
            this.span_motor2_status.className = 'text-success';
        }else {
            this.span_motor2_status.className = 'text-danger';
        }
        this.span_motor2_torque.textContent = message.torque.toFixed(2);
        let torque_color = 'text-success';
        if (Math.abs(message.torque) >= 10){
            torque_color = 'text-warning';
        }
        if (Math.abs(message.torque) >= 15){
            torque_color = 'text-danger';
        }
        this.span_motor2_torque.className = torque_color;
        this.span_motor2_temp.textContent = message.temperature;
        let temp_color = 'text-success';
        if (message.temperature >= 50){
            temp_color = 'text-warning';
        }
        if (message.temperature >= 60){
            temp_color = 'text-danger';
        }
        this.span_motor2_temp.className = temp_color;
        this.span_motor2_velocity.textContent = message.velocity.toFixed(2);
        this.span_motor2_position.textContent = message.position.toFixed(2);
        this.span_motor2_volts.textContent = message.voltage;
        this.span_motor2_mode.textContent = message.mode;
        if (message.mode === "POSITION") {
            this.span_motor2_mode.className = 'text-success';
        }else {
            this.span_motor2_mode.className = 'text-danger';
        }
        this.span_motor2_id.textContent = message.id;
    }
    motor3_data(message){
        this.span_motor3_status.textContent = message.fault;
        if (message.fault === "OK") {
            this.span_motor3_status.className = 'text-success';
        }else {
            this.span_motor3_status.className = 'text-danger';
        }
        this.span_motor3_torque.textContent = message.torque.toFixed(2);
        let torque_color = 'text-success';
        if (Math.abs(message.torque) >= 10){
            torque_color = 'text-warning';
        }
        if (Math.abs(message.torque) >= 15){
            torque_color = 'text-danger';
        }
        this.span_motor3_torque.className = torque_color;
        this.span_motor3_temp.textContent = message.temperature;
        let temp_color = 'text-success';
        if (message.temperature >= 50){
            temp_color = 'text-warning';
        }
        if (message.temperature >= 60){
            temp_color = 'text-danger';
        }
        this.span_motor3_temp.className = temp_color;
        this.span_motor3_velocity.textContent = message.velocity.toFixed(2);
        this.span_motor3_position.textContent = message.position.toFixed(2);
        this.span_motor3_volts.textContent = message.voltage;
        this.span_motor3_mode.textContent = message.mode;
        if (message.mode === "POSITION") {
            this.span_motor3_mode.className = 'text-success';
        }else {
            this.span_motor3_mode.className = 'text-danger';
        }
        this.span_motor3_id.textContent = message.id;
    }
    motor4_data(message){
        this.span_motor4_status.textContent = message.fault;
        if (message.fault === "OK") {
            this.span_motor4_status.className = 'text-success';
        }else {
            this.span_motor4_status.className = 'text-danger';
        }
        this.span_motor4_torque.textContent = message.torque.toFixed(2);
        let torque_color = 'text-success';
        if (Math.abs(message.torque) >= 10){
            torque_color = 'text-warning';
        }
        if (Math.abs(message.torque) >= 15){
            torque_color = 'text-danger';
        }
        this.span_motor4_torque.className = torque_color;
        this.span_motor4_temp.textContent = message.temperature;
        let temp_color = 'text-success';
        if (message.temperature >= 50){
            temp_color = 'text-warning';
        }
        if (message.temperature >= 60){
            temp_color = 'text-danger';
        }
        this.span_motor4_temp.className = temp_color;
        this.span_motor4_velocity.textContent = message.velocity.toFixed(2);
        this.span_motor4_position.textContent = message.position.toFixed(2);
        this.span_motor4_volts.textContent = message.voltage;
        this.span_motor4_mode.textContent = message.mode;
        if (message.mode === "POSITION") {
            this.span_motor4_mode.className = 'text-success';
        }else {
            this.span_motor4_mode.className = 'text-danger';
        }
        this.span_motor4_id.textContent = message.id;
    }

    pub_set_torque(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.set_torque_topic.publish(msg);
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
    btn_motors_on_onclick(motors_control, status) {
        if (status === true) {
            motors_control.motors_on();
        }
        else {
            motors_control.motors_off();
        }
    }

}


class MapMenu {
    constructor(ros, maps, status_bar) {
        this.maps = maps;
        // this.rtabmap = rtabmap;
        this.status_bar = status_bar;
        this.map_to_show = 'planner';
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
        this.span_menu_rtabmap_distance_apply = document.getElementById("span_menu_rtabmap_distance_apply");

        this.div_menu_config = document.getElementById("div_menu_config");
        this.div_menu_config.style.display = "none";
        this.btn_settings = document.getElementById("btn_settings");
        this.btn_settings.active = false;

        this.btn_menu_lidar_on = document.getElementById("btn_menu_lidar_on");
        this.btn_menu_lidar_off = document.getElementById("btn_menu_lidar_off");
        this.btn_menu_rtabmap_camera = document.getElementById("btn_menu_rtabmap_camera");
        this.btn_menu_rtabmap_lidar = document.getElementById("btn_menu_rtabmap_lidar");
        this.btn_menu_rtabmap_both = document.getElementById("btn_menu_rtabmap_both");
        this.input_range_rtabmap_distance = document.getElementById("input_range_rtabmap_distance");
        this.span_rtabmap_distance = document.getElementById("span_rtabmap_distance");
        this.rtabmap_sensor = 0;


        this.btn_menu_joy_show = document.getElementById("btn_menu_joy_show");
        this.btn_menu_joy_hide = document.getElementById("btn_menu_joy_hide");

        this.btn_map = document.getElementById("btn_map");
        this.div_menu_map = document.getElementById("div_menu_map");
        this.div_menu_map.style.display = "none";
        this.btn_menu_map_new_indoor = document.getElementById("btn_menu_map_new_indoor");
        this.btn_menu_map_new_outdoor = document.getElementById("btn_menu_map_new_outdoor");

        this.btn_menu_map_new_save = document.getElementById("btn_menu_map_new_save");
        this.input_menu_map_new = document.getElementById("input_menu_map_new");
        this.div_menu_map_items_row = document.getElementById("div_menu_map_items_row");
        this.div_menu_map_items_row.innerHTML = '';
        this.btn_menu_map_planner_show = document.getElementById("btn_menu_map_planner_show");
        this.btn_menu_map_rtabmap_show = document.getElementById("btn_menu_map_rtabmap_show");

        this.btn_points = document.getElementById("btn_points");
        this.div_menu_map_point = document.getElementById("div_menu_map_point");
        this.div_menu_point_items_row = document.getElementById("div_menu_point_items_row");
        this.div_menu_point_items_row.innerHTML = '';
        this.btn_menu_point_new_save = document.getElementById("btn_menu_point_new_save");
        this.input_menu_point_new = document.getElementById("input_menu_point_new");
        this.btn_menu_point_clear = document.getElementById("btn_menu_point_clear");

        this.btn_paths = document.getElementById("btn_paths");
        this.div_menu_map_path = document.getElementById("div_menu_map_path");
        this.div_menu_path_items_row = document.getElementById("div_menu_path_items_row");
        this.div_menu_path_items_row.innerHTML = '';
        this.btn_menu_path_new_save = document.getElementById("btn_menu_path_new_save");
        this.input_menu_path_new = document.getElementById("input_menu_path_new");
        this.btn_menu_path_clear = document.getElementById("btn_menu_path_clear");

        this.btn_programs = document.getElementById("btn_programs");
        this.div_menu_map_program = document.getElementById("div_menu_map_program");
        this.div_menu_program_detail_row = document.getElementById("div_menu_program_detail_row");
        this.div_menu_program_detail_row.style.display = 'none';
        this.div_menu_program_items_row = document.getElementById("div_menu_program_items_row");
        this.div_menu_program_items_row.innerHTML = '';
        this.span_menu_program_name = document.getElementById("span_menu_program_name");
        this.span_menu_program_length = document.getElementById("span_menu_program_length");
        this.span_menu_program_area = document.getElementById("span_menu_program_area");
        this.span_menu_program_duration = document.getElementById("span_menu_program_duration");
        this.btn_menu_program_show = document.getElementById("btn_menu_program_show");
        this.btn_menu_program_run = document.getElementById("btn_menu_program_run");
        this.span_menu_program_map = document.getElementById("span_menu_program_map");
        this.span_menu_program_env = document.getElementById("span_menu_program_env");
        this.row_menu_program_detail_zones = document.getElementById("row_menu_program_detail_zones");
        this.btn_menu_program_stop = document.getElementById("btn_menu_program_stop");
        this.span_menu_program_status = document.getElementById("span_menu_program_status");

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
        this.map_list_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/map_str_list',
            messageType : 'vitulus_msgs/StringList'
        });
        this.load_map_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/load_map',
            messageType : 'std_msgs/String'
        });
        this.load_map_rtabmap_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/load_map_rtabmap',
            messageType : 'std_msgs/String'
        });
        this.remove_map_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/remove_map',
            messageType : 'std_msgs/String'
        });
        this.new_point_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/save_waypoint',
            messageType : 'std_msgs/String'
        });
        this.publish_point_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/publish_point',
            messageType : 'std_msgs/String'
        });
        this.send_point_goal_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/goal_point',
            messageType : 'std_msgs/String'
        });
        this.remove_point_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/remove_point',
            messageType : 'std_msgs/String'
        });
        this.new_path_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/save_path',
            messageType : 'std_msgs/String'
        });
        this.new_path_point_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/save_path_point',
            messageType : 'std_msgs/String'
        });
        this.publish_path_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/publish_path',
            messageType : 'std_msgs/String'
        });
        this.remove_path_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/remove_path',
            messageType : 'std_msgs/String'
        });
        this.execute_path_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/execute_path',
            messageType : 'std_msgs/String'
        });
        this.show_map_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/show_map',
            messageType : 'std_msgs/String'
        });
        this.map_source_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/map_source',
            messageType : 'std_msgs/String'
        });
        this.rtabmap_settings_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/rtabmap_settings',
            messageType : 'vitulus_msgs/Rtabmap_settings'
        });
        this.rtabmap_settings_set_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/rtabmap_settings_set',
            messageType : 'vitulus_msgs/Rtabmap_settings'
        });
        this.map_source_Topic.subscribe((message) => {
            this.map_btns_state(message);
        });
        this.rtabmap_settings_Topic.subscribe((message) => {
            this.rtabmap_settings_btns_state(message);
        });

        this.init();
    }

    init(){
        this.new_map_Topic.advertise();
        this.save_map_Topic.advertise();
        this.load_map_Topic.advertise();
        this.load_map_rtabmap_Topic.advertise();
        this.remove_map_Topic.advertise();
        this.new_point_Topic.advertise();
        this.publish_point_Topic.advertise();
        this.send_point_goal_Topic.advertise();
        this.remove_point_Topic.advertise();
        this.new_path_Topic.advertise();
        this.new_path_point_Topic.advertise();
        this.publish_path_Topic.advertise();
        this.remove_path_Topic.advertise();
        this.execute_path_Topic.advertise();
        this.show_map_Topic.advertise();
        this.rtabmap_settings_set_Topic.advertise();
        if (this.status_bar.is_indoor === true){
            this.map_to_show = 'rtabmap';
        }
        else {
            this.map_to_show = 'planner';
        }
    }

    rtabmap_apply(){
        const msg = new ROSLIB.Message({
            grid_sensor: parseInt(this.rtabmap_sensor),
            grid_sensor_distance: parseFloat(this.span_menu_rtabmap_distance_apply.textContent),
        });
        this.rtabmap_settings_set_Topic.publish(msg);
    }

    map_btns_state(msg){
        if (msg.data === 'planner'){
            this.btn_menu_map_planner_show.style.color = "#446de5";
            this.btn_menu_map_rtabmap_show.style.color = "#ffffff";
        }
        if (msg.data === 'rtabmap'){
            this.btn_menu_map_planner_show.style.color = "#ffffff";
            this.btn_menu_map_rtabmap_show.style.color = "#446de5";
        }
    }

    rtabmap_settings_btns_state(msg){
        if (msg.grid_sensor === 0) {
            this.btn_menu_rtabmap_lidar.style.color = "#446de5";
            this.btn_menu_rtabmap_camera.style.color = "#ffffff";
            this.btn_menu_rtabmap_both.style.color = "#ffffff";
        }
        if (msg.grid_sensor === 1) {
            this.btn_menu_rtabmap_lidar.style.color = "#ffffff";
            this.btn_menu_rtabmap_camera.style.color = "#446de5";
            this.btn_menu_rtabmap_both.style.color = "#ffffff";
        }
        if (msg.grid_sensor === 2) {
            this.btn_menu_rtabmap_lidar.style.color = "#ffffff";
            this.btn_menu_rtabmap_camera.style.color = "#ffffff";
            this.btn_menu_rtabmap_both.style.color = "#446de5";
        }
        this.span_rtabmap_distance.textContent = Math.round(msg.grid_sensor_distance * 100) / 100;
    }



    show_rtabmap_map() {
        this.show_map_Topic.publish(new ROSLIB.Message({data: 'rtabmap'}));
    }
    show_planner_map() {
        this.show_map_Topic.publish(new ROSLIB.Message({data: 'planner'}));
    }

    path_clicked_exec(name){
        // console.log("execute_path: " + name);
        this.execute_path_Topic.publish(new ROSLIB.Message({
            data: name,
        }));
    }
    show_modal_remove_path(name){
        document.getElementById("span_modal_remove_path_name").innerHTML = name;
        $('#btn_modal_remove_path').attr('onclick', 'map_menu.remove_path("' + name + '")');
        $('#modal_remove_path').modal('show');
    }
    remove_path(name){
        // console.log("remove_path: " + name);
        this.remove_path_Topic.publish(new ROSLIB.Message({
            data: name,
        }));
        $('#modal_remove_path').modal('hide');
    }
    path_clicked_show(name){
        // console.log("publish_path: " + name);
        this.publish_path_Topic.publish(new ROSLIB.Message({
            data: name,
        }));
    }
    add_path_point(path_name){
        const msg = new ROSLIB.Message({
            data : path_name,
        });
        this.new_path_point_Topic.publish(msg);
    }
    save_path(){
        const msg = new ROSLIB.Message({
            data : this.input_menu_path_new.value,
        });
        this.new_path_Topic.publish(msg);
        this.input_menu_path_new.value = '';
    }

    show_modal_remove_point(name){
        document.getElementById("span_modal_remove_point_name").innerHTML = name;
        $('#btn_modal_remove_point').attr('onclick', 'map_menu.remove_point("' + name + '")');
        $('#modal_remove_point').modal('show');
    }
    save_point(){
        const msg = new ROSLIB.Message({
            data : this.input_menu_point_new.value,
        });
        this.new_point_Topic.publish(msg);
        this.input_menu_point_new.value = '';
    }
    remove_point(name){
        // console.log("remove_point: " + name);
        this.remove_point_Topic.publish(new ROSLIB.Message({
            data: name,
        }));
        $('#modal_remove_point').modal('hide');
    }
    point_clicked_show(name){
        // console.log("publish_point: " + name);
        this.publish_point_Topic.publish(new ROSLIB.Message({
            data: name,
        }));
    }
    point_clicked_goal(name){
        // console.log("send_point_goal: " + name);
        this.send_point_goal_Topic.publish(new ROSLIB.Message({
            data: name,
        }));
    }

    show_modal_remove_map(map_name, map_filename){
        document.getElementById("span_modal_remove_map_name").innerHTML = map_name;
        $('#btn_modal_remove_map').attr('onclick', 'map_menu.remove_map("' + map_filename + '")');
        $('#modal_remove_map').modal('show');
    }

    remove_map(map_filename){
        // console.log("remove_map: " + map_filename);
        this.remove_map_Topic.publish(new ROSLIB.Message({
            data: map_filename,
        }));
        $('#modal_remove_map').modal('hide');
    }

    load_clicked_map(map_name, type){
        // console.log("load_clicked_map: " + map_name);
        if (type === 'INDOOR') {
            this.load_map_rtabmap_Topic.publish(new ROSLIB.Message({
                data: map_name,
            }));
        }
        if (type === 'OUTDOOR') {
            this.load_map_Topic.publish(new ROSLIB.Message({
                data: map_name,
            }));
        }
    }

    process_map_list(message){
        let map_elements = "";
        message.string_list.forEach(async (map) => {
            const items = map.split('***env*');
            const map_name = items[0];
            const items2 = items[1].split(' (');
            const map_type = items2[0];
            const map_size = items2[1].replace(' GB)', '');
            const tmpl = new MapListItemTemplate(map_name, map_type, map_size);
            map_elements += tmpl.element;
        });
        this.div_menu_map_items_row.innerHTML = map_elements;
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
            camera_view.camViewer.width = 180;
            camera_view.camViewer.height = 120;
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
        this.div_menu_map_point.style.display = "none";
        this.div_menu_map_path.style.display = "none";
        this.div_menu_map_program.style.display = "none";
        this.row_submenu_visible = false;
    }

    btn_points_onclick(interactive_markers) {
        if (this.current_submenu !== 'map') {
            this.hide_all_submenu_divs();
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
            interactive_markers.imClient.rootObject.visible = false;
        }
        if (this.row_submenu_visible === false) {
            this.current_submenu = 'map';
            this.div_menu_map_point.style.display = "block";
            this.row_submenu.style.display = "block";
            this.row_submenu_visible = true;
            this.btn_points.active = true;
        }
        else {
            this.current_submenu = 'none';
            this.div_menu_map_point.style.display = "none";
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
            this.btn_points.active = false;
        }
    }

    btn_paths_onclick(interactive_markers) {
        if (this.current_submenu !== 'path') {
            this.hide_all_submenu_divs();
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
            interactive_markers.imClient.rootObject.visible = false;
        }
        if (this.row_submenu_visible === false) {
            this.current_submenu = 'path';
            this.div_menu_map_path.style.display = "block";
            this.row_submenu.style.display = "block";
            this.row_submenu_visible = true;
            this.btn_paths.active = true;
        }
        else {
            this.current_submenu = 'none';
            this.div_menu_map_path.style.display = "none";
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
            this.btn_paths.active = false;
        }
    }

    btn_programs_onclick(interactive_markers) {
        if (this.current_submenu !== 'program') {
            this.hide_all_submenu_divs();
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
            interactive_markers.imClient.rootObject.visible = false;
        }
        if (this.row_submenu_visible === false) {
            this.current_submenu = 'program';
            this.div_menu_map_program.style.display = "block";
            this.row_submenu.style.display = "block";
            this.row_submenu_visible = true;
            this.btn_programs.active = true;
        }
        else {
            this.current_submenu = 'none';
            this.div_menu_map_program.style.display = "none";
            this.row_submenu.style.display = "none";
            this.row_submenu_visible = false;
            this.btn_programs.active = false;
        }
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

    btn_menu_lidar_on_onclick(lidar_control, status) {
        if (status === true) {
            lidar_control.start_lidar();
        }
        else {
            lidar_control.stop_lidar();
        }
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
        if (div_log.scrollTop + 150 > div_log.scrollHeight) {
            div_log.innerHTML = this.log_array.join('');
            div_log.scrollTop = div_log.scrollHeight;
        }
    }
}


class MoveBaseControl {
    constructor(ros, joy_teleop) {
        this.joy_teleop = joy_teleop;
        this.div_status_speed = document.getElementById("div_status_speed");
        this.span_status_speed = document.getElementById("span_status_speed");
        this.btn_menu_speed_low = document.getElementById("btn_menu_speed_low");
        this.btn_menu_speed_moderate = document.getElementById("btn_menu_speed_moderate");
        this.btn_menu_speed_fast = document.getElementById("btn_menu_speed_fast");

        this.btn_menu_speed_low_sm = document.getElementById("btn_menu_speed_low_sm");
        this.btn_menu_speed_moderate_sm = document.getElementById("btn_menu_speed_moderate_sm");
        this.btn_menu_speed_fast_sm = document.getElementById("btn_menu_speed_fast_sm");
        this.cancelGoalTopic = new ROSLIB.Topic({
            ros: ros,
            name: '/move_base_flex/exe_path/cancel',
            messageType: 'actionlib_msgs/GoalID'
        });
        this.speedTopic = new ROSLIB.Topic({
            ros : ros,
            name : '/navi_manager/speed',
            messageType : 'std_msgs/String'
        });
        this.speed_lin_fast = 0.75;
        this.speed_ang_fast = 1.5;
        this.speed_lin_moderate = 0.5;
        this.speed_ang_moderate = 1.2;
        this.speed_lin_slow = 0.3;
        this.speed_ang_slow = 0.4;
        this.speed_lin_current = this.speed_lin_moderate;
        this.speed_ang_current = this.speed_ang_moderate;
        // Keyboard teleop
        this.keyboard_teleop = new KEYBOARDTELEOP.Teleop({
            ros: ros,
            topic: "/cmd_vel",
            throttle_lin: this.speed_lin_current,
            throttle_ang: this.speed_ang_current
        });
        this.keyboard_teleop.scale = 1.0;
        this.keyboard_teleop.working = false;
        this.checkbox_keyboard = document.getElementById('checkbox_keyboard_teleop');
        this.checkbox_keyboard.checked = false;

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
            this.speed_lin_current = this.speed_lin_slow;
            this.speed_ang_current = this.speed_ang_slow;
        }
        if (speed === 'moderate') {
            this.speedTopic.publish({data: 'MEDIUM'});
            this.span_status_speed.innerText = 'MODERATE';
            this.speed_lin_current = this.speed_lin_moderate;
            this.speed_ang_current = this.speed_ang_moderate;
        }
        if (speed === 'fast') {
            this.speedTopic.publish({data: 'FAST'});
            this.span_status_speed.innerText = 'FAST';
            this.speed_lin_current = this.speed_lin_fast;
            this.speed_ang_current = this.speed_ang_fast;
        }
        this.keyboard_teleop.throttle_lin = this.speed_lin_current;
        this.keyboard_teleop.throttle_ang = this.speed_ang_current;
    }
    btn_speed_fast_onclick() {
        this.joy_teleop.speed_lin = this.speed_lin_fast;
        this.joy_teleop.speed_ang = this.speed_ang_fast;
        this.pub_set_speed('fast');
        this.btn_menu_speed_low.style.color = "#ffffff";
        this.btn_menu_speed_moderate.style.color = "#ffffff";
        this.btn_menu_speed_fast.style.color = "#446de5";
        this.btn_menu_speed_low_sm.style.color = "#ffffff";
        this.btn_menu_speed_moderate_sm.style.color = "#ffffff";
        this.btn_menu_speed_fast_sm.style.color = "#446de5";
    }
    btn_speed_moderate_onclick() {
        this.joy_teleop.speed_lin = this.speed_lin_moderate;
        this.joy_teleop.speed_ang = this.speed_ang_moderate;
        this.pub_set_speed('moderate');
        this.btn_menu_speed_low.style.color = "#ffffff";
        this.btn_menu_speed_moderate.style.color = "#446de5";
        this.btn_menu_speed_fast.style.color = "#ffffff";
        this.btn_menu_speed_low_sm.style.color = "#ffffff";
        this.btn_menu_speed_moderate_sm.style.color = "#446de5";
        this.btn_menu_speed_fast_sm.style.color = "#ffffff";
    }
    btn_speed_slow_onclick() {
        this.joy_teleop.speed_lin = this.speed_lin_slow;
        this.joy_teleop.speed_ang = this.speed_ang_slow;
        this.pub_set_speed('slow');
        this.btn_menu_speed_low.style.color = "#446de5";
        this.btn_menu_speed_moderate.style.color = "#ffffff";
        this.btn_menu_speed_fast.style.color = "#ffffff";
        this.btn_menu_speed_low_sm.style.color = "#446de5";
        this.btn_menu_speed_moderate_sm.style.color = "#ffffff";
        this.btn_menu_speed_fast_sm.style.color = "#ffffff";
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
        this.is_indoor = false;

    }
    set_follow_text(text) {
        this.span_status_follow.innerText = text;
    }
    set_map_name(message) {
        this.div_status_map_name.style.display = "inline-flex";
        this.div_status_map_ico.style.display = "inline-flex";
        this.span_status_map_name.style.display = "inline";
        this.span_status_map_name.innerText = message.data.split('***env*')[0];
    }
    set_indoor(message) {
        if (message.data === true) {
                this.ico_map_outdoor.style.display = "none";
                this.ico_map_indoor.style.display = "inline";
                this.is_indoor = true;
            }
            else {
                this.ico_map_outdoor.style.display = "inline";
                this.ico_map_indoor.style.display = "none";
                this.is_indoor = false;
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
        this.tab_power = document.getElementById("tab_power");
        this.tab_mower = document.getElementById("tab_mower");
        this.tab_motors = document.getElementById("tab_motors");
        this.tab_diag = document.getElementById("tab_diag");

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
        // console.log("Portrait orientation");
        var width = document.getElementById("div_container").offsetWidth;
        var height = document.getElementById("div_container").offsetHeight;
        this.div_menu.style.display = 'block';
        this.menu_spacer.style.display = 'block';
        this.div_content.style.setProperty('height', 'calc(100vh - 42px)');
        this.div_bottom_menu.style.setProperty('margin-top', 'calc(100vh - 29px)');
        this.div_camera_view.style.height = '120px';
        this.div_camera_view.style.width = '160px';
        this.camera_view.changeViewerSize_cam_view();

        if (this.div_log_view.style.display === "block"){
            this.div_camera_view.style.setProperty('margin-top', 'calc(100vh - 268px)');
        }
        else {
            this.div_camera_view.style.setProperty('margin-top', 'calc(100vh - 157px)');
        }
        this.div_log_view.style.marginLeft = '4px';
        this.div_log_view.style.setProperty('width', 'calc(100vw - 8px)');
        this.div_log_view.style.setProperty('width', 'calc(100vw - 8px)');
        this.tab_power.style.maxHeight = height - 145 + 'px';
        this.tab_mower.style.maxHeight = height - 145 + 'px'
        this.tab_motors.style.maxHeight = height - 145 + 'px'
        this.tab_diag.style.maxHeight = height - 145 + 'px'

        this.viewer.changeViewerSize();
    };
    set_landscape_layout(viewer) {
        // console.log("Landscape orientation");
        var width = document.getElementById("div_container").offsetWidth;
        var height = document.getElementById("div_container").offsetHeight;
        if (height < 600) {
            this.div_menu.style.display = 'none';
            this.menu_spacer.style.display = 'none';
            this.div_content.style.setProperty('height', '100vh');
            this.map_view.style.setProperty('height', '100vh');
        }
        else {
            this.div_menu.style.display = 'block';
            this.menu_spacer.style.display = 'block';
            this.div_content.style.setProperty('height', 'calc(100vh - 42px)');
        }

        this.div_bottom_menu.style.setProperty('margin-top', 'calc(100vh - 29px)');
        this.div_camera_view.style.setProperty('margin-top', 'calc(100vh - 141px)');
        this.div_camera_view.style.height = '106px';
        this.camera_view.changeViewerSize_cam_view();

        let cam_w = parseInt(this.div_camera_view.style.width.replace('px', ''));
        if (this.div_camera_view.style.display === "block"){
            this.div_log_view.style.setProperty('margin-left', (cam_w + 8) + 'px');
            this.div_log_view.style.setProperty('width', 'calc(100vw - ' + (cam_w + 12) +  'px)');
        }
        else {
            this.div_log_view.style.marginLeft = '4px';
            this.div_log_view.style.setProperty('width', 'calc(100vw - 8px)');
        }
        this.tab_power.style.maxHeight = height - 100 + 'px';
        this.tab_mower.style.maxHeight = height - 100 + 'px'
        this.tab_motors.style.maxHeight = height - 100 + 'px'
        this.tab_diag.style.maxHeight = height - 100 + 'px'

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
        this.span_rtabmap_loc_map = document.getElementById("span_rtabmap_loc_map");
        this.btn_menu_map_rtabmap_mapping = document.getElementById("btn_menu_map_rtabmap_mapping");
        this.btn_menu_map_rtabmap_localization = document.getElementById("btn_menu_map_rtabmap_localization");
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
        this.is_rtabmap = false;
        this.is_localization = false;
    }

    set_rtabmap_localization(){
        this.rtabmap_localization_srvs.callService(this.request, function(result) {
            // console.log(result);
            console.log('Result for service call on rtabmap localization: ' + result);
        });
    }

    set_rtabmap_mapping(){
        this.rtabmap_mapping_srvs.callService(this.request, function(result) {
            // console.log(result);
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
        this.span_rtabmap_id.innerText = message.refId;

        let status = 'localization';
        this.is_localization = true;
        let localize= true;
        message.statsKeys.forEach(function (item, index) {
            if (item === 'Memory/Rehearsal_sim/') {
                status = 'mapping';
                localize = false;
            }
        });
        this.is_localization = localize;
        this.span_rtabmap_loc_map.innerText = status;
    }
    rtabmap_loc_map_buttons_state(){
        // console.log("rtabmap_loc_map_buttons_state");
        if (this.is_rtabmap === true) {
            if (this.is_localization === true) {
                this.btn_menu_map_rtabmap_mapping.style.color = "#ffffff";
                this.btn_menu_map_rtabmap_localization.style.color = "#446de5";
            } else {
                this.btn_menu_map_rtabmap_mapping.style.color = "#446de5";
                this.btn_menu_map_rtabmap_localization.style.color = "#ffffff";
            }
        } else {
            this.btn_menu_map_rtabmap_mapping.style.color = "#ffffff";
            this.btn_menu_map_rtabmap_localization.style.color = "#ffffff";
        }
    }
}


class Diag {
    constructor(ros) {
        this.diag_arr = [];
        this.div_diag_all = document.getElementById("div_diag_all");
        this.diag_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/diagnostics',
            messageType: 'diagnostic_msgs/DiagnosticArray'
        });
    }
    diag_data(message, diag_arr) {
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
                diag_arr.push(element);
            }
        });
        var diag_html_content = '';
        diag_arr.forEach(function(item){
            var diag_html_item = '<div>';
            diag_html_item += '<span>' + item.name + ': </span> ';
            if (item.level === 0){ diag_html_item += '<span style="color: var(--bs-success);">' + item.message + '</span>';};
            if (item.level === 1){ diag_html_item += '<span style="color: var(--bs-warning);">' + item.message + '</span>';}
            if (item.level === 2){ diag_html_item += '<span style="color: var(--bs-danger);">' + item.message + '</span>';}
            diag_html_item += '</div>';
            diag_html_content += diag_html_item;
        });
        this.div_diag_all.innerHTML = diag_html_content;
    }
}


class Mower {
    constructor(ros) {
        this.span_mower_status = document.getElementById("span_mower_status");
        this.span_mower_direction = document.getElementById("span_mower_direction");
        this.span_mower_cut_height = document.getElementById("span_mower_cut_height");
        this.span_mower_rpm = document.getElementById("span_mower_rpm");
        this.btn_mower_on = document.getElementById("btn_mower_on");
        this.btn_mower_off = document.getElementById("btn_mower_off");
        this.btn_mower_left = document.getElementById("btn_mower_left");
        this.btn_mower_right = document.getElementById("btn_mower_right");
        this.btn_mower_set_height = document.getElementById("btn_mower_set_height");
        this.btn_mower_set_rpm = document.getElementById("btn_mower_set_rpm");
        this.btn_mower_calibration = document.getElementById("btn_mower_calibration");
        this.btn_mower_home = document.getElementById("btn_mower_home");
        this.btn_mower_start_motor = document.getElementById("btn_mower_start_motor");
        this.btn_mower_stop_motor = document.getElementById("btn_mower_stop_motor");
        this.btn_mower_cmd1_send = document.getElementById("btn_mower_cmd1_send");
        this.btn_mower_cmd2_send = document.getElementById("btn_mower_cmd2_send");
        this.btn_mower_cmd3_send = document.getElementById("btn_mower_cmd3_send");
        this.btn_mower_cmd4_send = document.getElementById("btn_mower_cmd4_send");
        this.input_mower_cmd1 = document.getElementById("input_mower_cmd1");
        this.input_mower_cmd2 = document.getElementById("input_mower_cmd2");
        this.input_mower_cmd3 = document.getElementById("input_mower_cmd3");
        this.input_mower_cmd4 = document.getElementById("input_mower_cmd4");
        this.input_mower_cut_height = document.getElementById("input_mower_cut_height");
        this.input_mower_rpm = document.getElementById("input_mower_rpm");
        this.inputgroup_mower_on_off = document.getElementById("inputgroup_mower_on_off");

        this.mower_status_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/mower/status',
            messageType: 'vitulus_msgs/Mower'
        });
        this.mower_set_power_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/mower/set_power',
            messageType : 'std_msgs/Bool'
        });
        this.mower_set_dir_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/mower/set_motor_dir',
            messageType : 'std_msgs/String'
        });
        this.mower_set_cut_height_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/mower/set_cut_height',
            messageType : 'std_msgs/Int16'
        });
        this.mower_set_motor_rpm_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/mower/set_motor_rpm',
            messageType : 'std_msgs/Int16'
        });
        this.mower_set_calibrate_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/mower/set_calibrate',
            messageType : 'std_msgs/Bool'
        });
        this.mower_set_home_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/mower/set_home',
            messageType : 'std_msgs/Bool'
        });
        this.mower_set_motor_on_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/mower/set_motor_on',
            messageType : 'std_msgs/Bool'
        });
        this.mower_set_cmd_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/mower/set_cmd',
            messageType : 'std_msgs/String'
        });
        this.init();
    }

    init() {
        this.mower_set_power_topic.advertise();
        this.mower_set_dir_topic.advertise();
        this.mower_set_cut_height_topic.advertise();
        this.mower_set_motor_rpm_topic.advertise();
        this.mower_set_calibrate_topic.advertise();
        this.mower_set_home_topic.advertise();
        this.mower_set_motor_on_topic.advertise();
        this.mower_set_cmd_topic.advertise();
    }

    mower_status(message) {
        switch (message.status) {
            case 'UNK':
                this.span_mower_status.textContent = 'OFF';
                break;
            case 'CALIBRATING':
                this.span_mower_status.textContent = 'CALIB';
                break;
            case 'CHANGE_HEIGHT':
                this.span_mower_status.textContent = 'HEIGHT';
                break;
            default:
                this.span_mower_status.textContent = message.status;
        }
        if (message.status === 'UNK' || message.status === 'OFF' || message.status === 'ERROR') {
            this.inputgroup_mower_on_off.style.setProperty('border', '2px solid var(--bs-danger)');
        }
        else {
            if (message.status === 'WAIT' || message.status === 'RUN') {
                this.inputgroup_mower_on_off.style.setProperty('border', '2px solid var(--bs-success)');
            }
            else {
                this.inputgroup_mower_on_off.style.setProperty('border', '2px solid var(--bs-warning)');
            }
        }

        this.span_mower_direction.textContent = message.moto_dir;
        this.span_mower_cut_height.textContent = message.current_height + "/" + message.max_height + " cm";
        this.span_mower_rpm.textContent = message.moto_rpm + "/" + message.setpoint_rpm + " rpm";
    }

    pub_mower_set_power(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.mower_set_power_topic.publish(msg);
    }

    pub_mower_set_dir(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.mower_set_dir_topic.publish(msg);
    }

    pub_mower_set_cut_height(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.mower_set_cut_height_topic.publish(msg);
    }

    pub_mower_set_motor_rpm(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.mower_set_motor_rpm_topic.publish(msg);
    }

    pub_mower_set_calibrate(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.mower_set_calibrate_topic.publish(msg);
    }

    pub_mower_set_home(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.mower_set_home_topic.publish(msg);
    }

    pub_mower_set_motor_on(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.mower_set_motor_on_topic.publish(msg);
    }

    pub_mower_set_cmd(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.mower_set_cmd_topic.publish(msg);
    }
}


class PowerModule {
    constructor(ros) {
        this.span_supply_volts = document.getElementById("span_supply_volts");
        this.span_supply_amps = document.getElementById("span_supply_amps");
        this.span_batt_volts = document.getElementById("span_batt_volts");
        this.span_batt_amps = document.getElementById("span_batt_amps");
        this.span_nuc_volts = document.getElementById("span_nuc_volts");
        this.span_nuc_amps = document.getElementById("span_nuc_amps");
        this.span_batt_capacity = document.getElementById("span_batt_capacity");
        this.span_supply_status = document.getElementById("span_supply_status");
        this.span_batt_status = document.getElementById("span_batt_status");
        this.span_curr_pcb_temp = document.getElementById("span_curr_pcb_temp");
        this.span_pcb_rpm = document.getElementById("span_pcb_rpm");
        this.span_curr_ext_temp = document.getElementById("span_curr_ext_temp");
        this.span_ext_rpm = document.getElementById("span_ext_rpm");
        this.ico_nuc_conf = document.getElementById("ico_nuc_conf");
        this.ico_motor_conf = document.getElementById("ico_motor_conf");
        this.ico_mower_conf = document.getElementById("ico_mower_conf");
        this.progress_batt_capacity = document.getElementById("progress_batt_capacity");
        this.span_run_charge = document.getElementById("span_run_charge");
        this.span_run_cutoff = document.getElementById("span_run_cutoff");
        this.span_standby_charge = document.getElementById("span_standby_charge");
        this.span_standby_cutoff = document.getElementById("span_standby_cutoff");
        this.span_pcb_temp = document.getElementById("span_pcb_temp");
        this.span_ext_temp = document.getElementById("span_ext_temp");
        this.btn_run_charge = document.getElementById("btn_run_charge");
        this.btn_run_cutoff = document.getElementById("btn_run_cutoff");
        this.btn_standby_charge = document.getElementById("btn_standby_charge");
        this.btn_standby_cutoff = document.getElementById("btn_standby_cutoff");
        this.btn_pcb_temp = document.getElementById("btn_pcb_temp");
        this.btn_ext_temp = document.getElementById("btn_ext_temp");
        this.btn_mower_on_pm = document.getElementById("btn_mower_on_pm");
        this.btn_mower_off_pm = document.getElementById("btn_mower_off_pm");
        this.btn_motor_on_pm = document.getElementById("btn_motor_on_pm");
        this.btn_motor_off_pm = document.getElementById("btn_motor_off_pm");
        this.input_run_charge = document.getElementById("input_run_charge");
        this.input_run_cutoff = document.getElementById("input_run_cutoff");
        this.input_standby_charge = document.getElementById("input_standby_charge");
        this.input_standby_cutoff = document.getElementById("input_standby_cutoff");
        this.input_pcb_temp = document.getElementById("input_pcb_temp");
        this.input_ext_temp = document.getElementById("input_ext_temp");

        this.power_status_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/pm/power_status',
            messageType: 'vitulus_ups/power_status'
        });
        this.set_charge_current_running_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/pm/set_charge_current_running',
            messageType : 'std_msgs/Int16'
        });
        this.set_precharge_current_running_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/pm/set_precharge_current_running',
            messageType : 'std_msgs/Int16'
        });
        this.set_charge_current_standby_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/pm/set_charge_current_standby',
            messageType : 'std_msgs/Int16'
        });
        this.set_precharge_current_standby_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/pm/set_precharge_current_standby',
            messageType : 'std_msgs/Int16'
        });
        this.set_temp_setpoint_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/pm/set_temp_setpoint',
            messageType : 'std_msgs/Float64'
        });
        this.set_temp2_setpoint_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/pm/set_temp2_setpoint',
            messageType : 'std_msgs/Float64'
        });
        this.set_bat_out_switch_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/pm/set_bat_out_switch',
            messageType : 'std_msgs/Bool'
        });
        this.set_motor_switch_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/pm/set_motor_switch',
            messageType : 'std_msgs/Bool'
        });

        this.init();
    }

    init(){
        this.set_charge_current_running_topic.advertise();
        this.set_precharge_current_running_topic.advertise();
        this.set_charge_current_standby_topic.advertise();
        this.set_precharge_current_standby_topic.advertise();
        this.set_temp_setpoint_topic.advertise();
        this.set_temp2_setpoint_topic.advertise();
        this.set_bat_out_switch_topic.advertise();
        this.set_motor_switch_topic.advertise();
    }

    status_data(message){
        this.span_supply_volts.innerHTML = message.input_voltage.toFixed(2);;
        this.span_supply_amps.innerHTML = message.input_current.toFixed(2);
        this.span_batt_volts.innerHTML = message.battery_voltage.toFixed(2);
        this.span_batt_amps.innerHTML = message.battery_current.toFixed(2);
        this.span_nuc_volts.innerHTML = message.out19_voltage.toFixed(2);
        this.span_nuc_amps.innerHTML = message.out19_current.toFixed(2);
        this.span_batt_capacity.innerHTML = message.battery_capacity.toFixed(0);
        this.span_curr_pcb_temp.innerHTML = message.temp2.toFixed(2);
        this.span_pcb_rpm.innerHTML = message.fan2_rpm;
        this.span_curr_ext_temp.innerHTML = message.temp.toFixed(2);
        this.span_ext_rpm.innerHTML = message.fan_rpm;
        this.span_supply_status.innerHTML = message.supply_status;
        switch (message.supply_status) {
            case 'OFFLINE':
                this.span_supply_status.style.setProperty('color', 'var(--bs-warning)');
                break;
            case 'ONLINE':
                this.span_supply_status.style.setProperty('color', 'var(--bs-success)');
                break;
            case 'FAIL':
                this.span_supply_status.style.setProperty('color', 'var(--bs-danger)');
                break;
        }
        this.span_batt_status.innerHTML = message.charger_status;
        switch (message.charger_status) {
            case 'CHARGED':
                this.span_batt_status.style.setProperty('color', 'var(--bs-success)');
                break;
            case 'CHARGING':
                this.span_batt_status.style.setProperty('color', 'var(--bs-warning)');
                break;
            case 'DISCHARGING':
                this.span_batt_status.style.setProperty('color', 'var(--bs-warning)');
                break;
        }
        if (message.out19v_switch === true) {
            this.ico_nuc_conf.src = "/assets/img/robot_icons/ico_nuc_green.png";
        }else{
            this.ico_nuc_conf.src = "/assets/img/robot_icons/ico_nuc_grey.png";
        }
        if (message.motor_out_switch === true) {
            this.ico_motor_conf.src = "/assets/img/robot_icons/ico_motor_green.png";
        }else{
            this.ico_motor_conf.src = "/assets/img/robot_icons/ico_motor_grey.png";
        }
        if (message.bat_out_switch === true) {
            this.ico_mower_conf.src = "/assets/img/robot_icons/Nextion_ico_mower_green.png";
        }else{
            this.ico_mower_conf.src = "/assets/img/robot_icons/Nextion_ico_mower_grey.png";
        }
        span_batt_capacity.textContent = message.battery_capacity;

        this.progress_batt_capacity.style.width = message.battery_capacity + '%';
        this.progress_batt_capacity.ariaValueNow = message.battery_capacity;
        this.progress_batt_capacity.ariaValueMin = 0;
        this.progress_batt_capacity.ariaValueMax = 100;
        var color_state = 'success';
        if (message.battery_capacity < 50){
            color_state = 'warning'
        }
        if (message.battery_capacity < 20){
            color_state = 'danger'
        }
        this.progress_batt_capacity.className = 'progress-bar bg-' + color_state +'';
        this.span_run_charge.innerHTML = message.charge_current_setpoint_run;
        this.span_run_cutoff.innerHTML = message.precharge_current_setpoint_run;
        this.span_standby_charge.innerHTML = message.charge_current_setpoint_standby;
        this.span_standby_cutoff.innerHTML = message.precharge_current_setpoint_standby;
        this.span_pcb_temp.innerHTML = message.temp2_setpoint;
        this.span_ext_temp.innerHTML = message.temp_setpoint;
    }

    pub_set_charge_current_running(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.set_charge_current_running_topic.publish(msg);
    }

    pub_set_precharge_current_running(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.set_precharge_current_running_topic.publish(msg);
    }

    pub_set_charge_current_standby(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.set_charge_current_standby_topic.publish(msg);
    }

    pub_set_precharge_current_standby(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.set_precharge_current_standby_topic.publish(msg);
    }

    pub_set_temp_setpoint(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.set_temp_setpoint_topic.publish(msg);
    }

    pub_set_temp2_setpoint(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.set_temp2_setpoint_topic.publish(msg);
    }

    pub_set_bat_out_switch(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.set_bat_out_switch_topic.publish(msg);
    }

    pub_set_motor_switch(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.set_motor_switch_topic.publish(msg);
    }
}


class Programs {
    constructor(ros, map_menu, paths_visualization) {
        this.map_menu = map_menu;
        this.paths_visualization = paths_visualization;
        this.program_list_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/web_plan/program_list',
            messageType : 'vitulus_msgs/PlannerProgramList'
        });
        this.reload_planner_data_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/web_plan/reload',
            messageType : 'std_msgs/Bool'
        });
        this.smach_stop_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/mower_smach/stop',
            messageType : 'std_msgs/Bool'
        });
        this.smach_status_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/mower_smach/status',
            messageType : 'std_msgs/String'
        });
        this.program_to_show_marker_Topic = new ROSLIB.Topic({
            ros : ros,
            name : '/web_plan/program_to_show_marker',
            messageType : 'vitulus_msgs/PlannerProgram'
        });
        this.program_list_Topic.subscribe((message) => {
            this.process_program_list(message);
        });
        this.smach_status_Topic.subscribe((message) => {
            this.map_menu.span_menu_program_status.innerText = message.data;
        });
        this.program_list_msg = new ROSLIB.Message({
            program_list: []
        });
        // Publish selected program to run
        this.topic_program_select = new ROSLIB.Topic({
            ros: ros,
            name: '/web_plan/program_select',
            messageType: 'std_msgs/String'
        });
        this.program_list = [];
        this.selected_program = null;
        this.init();
    }

    init(){
        this.reload_planner_data_Topic.advertise();
        this.program_to_show_marker_Topic.advertise();
        this.topic_program_select.advertise();
        this.smach_stop_Topic.advertise();
        this.reload_planner_data();
    }
    reload_planner_data(){
        let msg = new ROSLIB.Message({
            data: true
        });
        this.reload_planner_data_Topic.publish(msg);
    }
    process_program_list(message){
        this.program_list_msg = message;
        // console.log(message);
        this.draw_program_list();
    }
    draw_program_list() {
        let prog_list = [];
        this.program_list_msg.program_list.forEach(async (program, index) => {
            prog_list.push(new ProgramListItemTemplate(program, index));
        });
        this.program_list = prog_list;
        this.map_menu.div_menu_program_items_row.innerHTML = this.get_html();
    }
    get_html(){
        let prog_elements = "";
        this.program_list.forEach((program) => {
            prog_elements += program.element;
        });
        return prog_elements;
    }
    show_program(id){
        // console.log(id);
        const program = this.program_list_msg.program_list[id];
        this.map_menu.btn_menu_program_show.innerText = 'Show';
        this.map_menu.span_menu_program_name.innerText = program.name.split(' (')[0];
        this.map_menu.span_menu_program_length.innerText = program.length;
        this.map_menu.span_menu_program_area.innerText = program.area;
        this.map_menu.span_menu_program_duration.innerText = program.last_duration_minutes;
        const map_name = program.map_name.split('***env*')[0];
        const map_env = program.map_name.split('***env*')[1];
        this.map_menu.span_menu_program_env.innerText = map_env;
        this.map_menu.span_menu_program_map.innerText = map_name;
        this.map_menu.row_menu_program_detail_zones.innerHTML = "";
        program.zone_list.forEach((zone) => {
            const zone_item= new ProgramZoneItemTemplate(zone);
            this.map_menu.row_menu_program_detail_zones.innerHTML += zone_item.element;
        });
        this.selected_program = program;
        //remove all markers
        Object.keys(this.paths_visualization.markerArrayClient.markers).forEach((key) => {
            this.paths_visualization.markerArrayClient.removeMarker(key);
        });

        this.map_menu.div_menu_program_detail_row.style.display = "flex";
    }
    show_program_in_map(){
        if (this.map_menu.btn_menu_program_show.innerText === 'Show'){
            Object.keys(this.paths_visualization.markerArrayClient.markers).forEach((key) => {
                this.paths_visualization.markerArrayClient.removeMarker(key);
            });
            this.program_to_show_marker_Topic.publish(this.selected_program);
            this.map_menu.btn_menu_program_show.innerText = 'Hide';
        }
        // OR Hide marker
        else {
            this.program_to_show_marker_Topic.publish(new ROSLIB.Message({
                name: 'none'
            }));
            Object.keys(this.paths_visualization.markerArrayClient.markers).forEach((key) => {
                this.paths_visualization.markerArrayClient.removeMarker(key);
            });
            this.map_menu.btn_menu_program_show.innerText = 'Show';
        }
    }
    runProgram(program_name) {
        const msg = new ROSLIB.Message({
            data: program_name,
        });
        this.topic_program_select.publish(msg);
        // console.log(msg);
    }

    stopProgram() {
        const msg = new ROSLIB.Message({
            data: true,
        });
        this.smach_stop_Topic.publish(msg);
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

    tf_client = new TfClient(ros, viewer.viewer);
    tf_client.tfClientMap.subscribe('base_link', function(tf) {
        tf_client.follow_robot_set(viewer.viewer, tf);
    });

    laser_scan = new LaserScan(ros, tf_client.tfClientMap, viewer.viewer);

    viewer_grid = new ViewerGrid(viewer);

    interactive_markers = new InteractiveMarkers(ros.ros, tf_client.tfClientMap, viewer.viewer);
    viewer.viewer.cameraControls.addEventListener('touchstart', function(event3d) {
        interactive_markers.new_marker(event3d);
    });

    viewer.viewer.cameraControls.addEventListener('mousedown', function(event3d) {
        interactive_markers.new_marker(event3d);
    });

    clouds = new Clouds(ros.ros, tf_client.tfClientMap, viewer.viewer);

    robot_visualization = new RobotVisualization(ros.ros, tf_client.tfClientMap, viewer.viewer);



    /**
     *  Paths
     */

    paths_visualization = new PathsPointsVisualization(ros.ros, tf_client.tfClientMap, viewer.viewer);

    /**
     *  Robot control
     */

    icon_status = new IconStatus(ros);
    icon_status.icon_status_topic.subscribe(function (message) {
        icon_status.icon_data(message);
    });

    /// Motors
    motors_control = new MotorControl(ros.ros);
    motors_control.btn_motors_on.onclick = function() {
        motors_control.motors_on();
    };
    motors_control.btn_motors_off.onclick = function() {
        motors_control.motors_off();
    };
    motors_control.btn_motor_torque.onclick = function() {
        motors_control.pub_set_torque(value = parseFloat(motors_control.input_motor_torque.value));
        motors_control.input_motor_torque.value = "";
    };
    motors_control.get_torque_set_topic.subscribe(function (message) {
        motors_control.span_motor_torque.textContent = message.data.toFixed(2);
    });
    motors_control.front_left_wheel_state_topic.subscribe(function (message) {
        motors_control.motor1_data(message)
    });
    motors_control.rear_right_wheel_state_topic.subscribe(function (message) {
        motors_control.motor4_data(message)
    });
    motors_control.front_right_wheel_state_topic.subscribe(function (message) {
        motors_control.motor2_data(message)
    });
    motors_control.rear_left_wheel_state_topic.subscribe(function (message) {
        motors_control.motor3_data(message)
    });
    motors_control.motorPowerStateTopic.subscribe(function (message) {
        motors_control.motor_state_data(message)
    });

    lidar_control = new LidarControl(ros.ros);
    lidar_control.btn_menu_lidar_on.onclick = function() {
        lidar_control.start_lidar();
    };
    lidar_control.btn_menu_lidar_off.onclick = function() {
        lidar_control.stop_lidar();
    };
    lidar_control.icon_status_topic.subscribe(function (message) {
        lidar_control.status_data(message);
    });

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
     *  Occupancy maps
     */

    maps = new Maps(ros.ros, tf_client.tfClientMap, viewer.viewer);


    /**
     *  Menu
     */

    map_menu = new MapMenu(ros.ros, maps, status_bar);

    /**
     *  Rtabmap
     */

    rtabmap = new RtabMap(ros.ros);
    rtabmap.rtabmap_status_topic.subscribe(function(message) {
         // console.log(message);
        if (message.data){
            rtabmap.div_rtabmap.style.display = "grid";
            rtabmap.is_rtabmap = true;
            rtabmap.rtabmap_loc_map_buttons_state();
        }
        else {
            rtabmap.div_rtabmap.style.display = "none";
            rtabmap.is_rtabmap = false;
            rtabmap.rtabmap_loc_map_buttons_state();
        }
    });
    rtabmap.rtabmap_info_Topic.subscribe(function(message) {
        rtabmap.set_info(message);
        rtabmap.rtabmap_loc_map_buttons_state();
        // console.log(message);
    });
    rtabmap.btn_menu_map_rtabmap_mapping.onclick = function () {
        rtabmap.set_rtabmap_mapping();

    }
    rtabmap.btn_menu_map_rtabmap_localization.onclick = function () {
        rtabmap.set_rtabmap_localization();
    }



     /**
     *  Programs
     */

    programs = new Programs(ros.ros, map_menu, paths_visualization);
    programs.reload_planner_data();



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
    map_menu.btn_menu_lidar_on.onclick = function () {
        map_menu.btn_menu_lidar_on_onclick(lidar_control, true);
    };
    map_menu.btn_menu_lidar_off.onclick = function () {
        map_menu.btn_menu_lidar_on_onclick(lidar_control, false);
    };
    map_menu.btn_menu_rtabmap_lidar.onclick = function () {
        map_menu.rtabmap_sensor = "0";
        map_menu.rtabmap_apply();
    };
    map_menu.btn_menu_rtabmap_camera.onclick = function () {
        map_menu.rtabmap_sensor = "1";
        map_menu.rtabmap_apply();

    };
    map_menu.btn_menu_rtabmap_both.onclick = function () {
        map_menu.rtabmap_sensor = "2";
        map_menu.rtabmap_apply();
    };
    map_menu.input_range_rtabmap_distance.oninput = function() {
        map_menu.span_menu_rtabmap_distance_apply.innerText = map_menu.input_range_rtabmap_distance.value;
    };


    /**
     *  Points submenu
     */

    map_menu.btn_points.onclick = function () {
        map_menu.btn_points_onclick(interactive_markers);
    };
    map_menu.btn_menu_point_new_save.onclick = function () {
        map_menu.save_point();
    };
    map_menu.btn_menu_point_clear.onclick = function () {
        // console.log("btn_menu_point_clear");
        for (const [key, value] of Object.entries(paths_visualization.mapMarker.markers)) {
          value.visible = false;
        }
    };

    /**
     *  Programs submenu
     */

    map_menu.btn_programs.onclick = function () {
        map_menu.btn_programs_onclick(interactive_markers);
    };

    map_menu.btn_menu_program_show.onclick = function () {
        programs.show_program_in_map();
    };

    map_menu.btn_menu_program_run.onclick = function () {
        programs.runProgram(programs.selected_program.name);
    };

    map_menu.btn_menu_program_stop.onclick = function () {
        programs.stopProgram();
    };



    /**
     *  Paths submenu
     */

    map_menu.btn_paths.onclick = function () {
        map_menu.btn_paths_onclick(interactive_markers);
    };
    map_menu.btn_menu_path_new_save.onclick = function () {
        map_menu.save_path();
    };
    map_menu.btn_menu_path_clear.onclick = function () {
        // console.log("btn_menu_path_clear");
        map_menu.path_clicked_show('');
        paths_visualization.mapPath.sn.visible = false;
    };

    /**
     *  Map submenu
     */

    map_menu.btn_map.onclick = function () {
        map_menu.btn_map_onclick(interactive_markers);
    };
    map_menu.btn_menu_map_new_indoor.onclick = function () {
        map_menu.new_map('indoor');
        map_menu.hide_all_submenu_divs();
    }
    map_menu.btn_menu_map_new_outdoor.onclick = function () {
        map_menu.new_map('outdoor');
        map_menu.hide_all_submenu_divs();
    }

    map_menu.btn_menu_map_new_save.onclick = function () {
        map_menu.save_map();
    }
    map_menu.btn_menu_map_rtabmap_show.onclick = function () {
        map_menu.map_to_show = 'rtabmap';
        map_menu.show_rtabmap_map();
    }
    map_menu.btn_menu_map_planner_show.onclick = function () {
        map_menu.map_to_show = 'planner';
        map_menu.show_planner_map();
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


    /**
     *  Move base control
     */

    move_base_control = new MoveBaseControl(ros.ros, joy_teleop);
    map_menu.btn_stop_all.onclick = function () {
        move_base_control.pub_cancel_goal();
        motors_control.motors_off();
        update_status_bar_info("Emergency stop");
    }

    move_base_control.checkbox_keyboard.onclick = function() {
        move_base_control.keyboard_teleop.working = !!this.checked;
    };

    move_base_control.pub_set_speed('moderate');
    move_base_control.btn_menu_speed_low.style.color = "#ffffff";
    move_base_control.btn_menu_speed_moderate.style.color = "#446de5";
    move_base_control.btn_menu_speed_fast.style.color = "#ffffff";
    move_base_control.btn_menu_speed_low_sm.style.color = "#ffffff";
    move_base_control.btn_menu_speed_moderate_sm.style.color = "#446de5";
    move_base_control.btn_menu_speed_fast_sm.style.color = "#ffffff";

    joy_teleop.speed_lin = move_base_control.speed_lin_current;
    joy_teleop.speed_ang = move_base_control.speed_ang_current;

    move_base_control.btn_menu_speed_fast.onclick = function () {
        move_base_control.btn_speed_fast_onclick();
    };
    move_base_control.btn_menu_speed_moderate.onclick = function () {
        move_base_control.btn_speed_moderate_onclick();
    };
    move_base_control.btn_menu_speed_low.onclick = function () {
        move_base_control.btn_speed_slow_onclick();
    };
    move_base_control.btn_menu_speed_fast_sm.onclick = function () {
        move_base_control.btn_speed_fast_onclick();
    };
    move_base_control.btn_menu_speed_moderate_sm.onclick = function () {
        move_base_control.btn_speed_moderate_onclick();
    };
    move_base_control.btn_menu_speed_low_sm.onclick = function () {
        move_base_control.btn_speed_slow_onclick();
    };


    function resize() {
        document.getElementById("div_container").style.width = window.innerWidth + 'px';
        document.getElementById("div_container").style.height = window.innerHeight + 'px';
        // console.log("resize w :", window.innerWidth, " h :", window.innerHeight);
        layout_man.set_layout();
    }
    window.addEventListener('resize', function(event){
            resize();
    });
    resize();

    /**
     *  Log
     */

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

    /**
     *  Maps, paths, points
     */
    map_list = new MapList(ros.ros, map_menu);
    point_list = new ItemList(ros.ros, map_menu, 'point');
    path_list = new ItemList(ros.ros, map_menu, 'path');

    /**
     *  Diagnostics
     */

    diag = new Diag(ros);
    diag.diag_topic.subscribe(function (message) {
        diag.diag_data(message, diag.diag_arr);
    });

    /**
     *  Mower
     */

    mower = new Mower(ros);
    mower.mower_status_topic.subscribe(function (message) {
        mower.mower_status(message);
    });

    mower.btn_mower_on.onclick = function() {
        mower.pub_mower_set_power(value = true)
    };

    mower.btn_mower_off.onclick = function() {
        mower.pub_mower_set_power(value = false)
    };

    mower.btn_mower_left.onclick = function() {
        mower.pub_mower_set_dir(value = 'LEFT')
    };

    mower.btn_mower_right.onclick = function() {
        mower.pub_mower_set_dir(value = 'RIGHT')
    };

    mower.btn_mower_set_height.onclick = function() {
        mower.pub_mower_set_cut_height(value = parseFloat(mower.input_mower_cut_height.value));
        mower.input_mower_cut_height.value = "";
    };

    mower.btn_mower_set_rpm.onclick = function() {
        mower.pub_mower_set_motor_rpm(value = parseFloat(mower.input_mower_rpm.value));
        mower.input_mower_rpm.value = "";
    };

    mower.btn_mower_calibration.onclick = function() {
        mower.pub_mower_set_calibrate(value = true);
    };

    mower.btn_mower_home.onclick = function() {
        mower.pub_mower_set_home(value = true);
    };

    mower.btn_mower_start_motor.onclick = function() {
        mower.pub_mower_set_motor_on(value = true);
    };

    mower.btn_mower_stop_motor.onclick = function() {
        mower.pub_mower_set_motor_on(value = false);
    };

    mower.btn_mower_cmd1_send.onclick = function() {
        mower.pub_mower_set_cmd(value = mower.input_mower_cmd1.value);
    };

    mower.btn_mower_cmd2_send.onclick = function() {
        mower.pub_mower_set_cmd(value = mower.input_mower_cmd2.value);
    };

    mower.btn_mower_cmd3_send.onclick = function() {
        mower.pub_mower_set_cmd(value = mower.input_mower_cmd3.value);
    };

    mower.btn_mower_cmd4_send.onclick = function() {
        mower.pub_mower_set_cmd(value = mower.input_mower_cmd4.value);
    };


    /**
     *  Power module
     */

    power_module = new PowerModule(ros);
    power_module.power_status_topic.subscribe(function(message) {
        power_module.status_data(message);
    });

    power_module.btn_run_charge.onclick = function() {
        power_module.pub_set_charge_current_running(value = parseInt(power_module.input_run_charge.value),
        power_module.input_run_charge.value = ""
    )};

    power_module.btn_run_cutoff.onclick = function() {
        power_module.pub_set_precharge_current_running(value = parseInt(power_module.input_run_cutoff.value),
        power_module.input_run_cutoff.value = ""
    )};

    power_module.btn_standby_charge.onclick = function() {
        power_module.pub_set_charge_current_standby(value = parseInt(power_module.input_standby_charge.value),
        power_module.input_standby_charge.value = ""
    )};

    power_module.btn_standby_cutoff.onclick = function() {
        power_module.pub_set_precharge_current_standby(value = parseInt(power_module.input_standby_cutoff.value),
        power_module.input_standby_cutoff.value = ""
    )};

    power_module.btn_ext_temp.onclick = function() {
        power_module.pub_set_temp_setpoint(value = parseInt(power_module.input_ext_temp.value),
        power_module.input_ext_temp.value = ""
    )};

    power_module.btn_pcb_temp.onclick = function() {
        power_module.pub_set_temp2_setpoint(value = parseInt(power_module.input_pcb_temp.value),
        power_module.input_pcb_temp.value = ""
    )};

    power_module.btn_motor_on_pm.onclick = function() {power_module.pub_set_motor_switch(value = true)};
    power_module.btn_motor_off_pm.onclick = function() {power_module.pub_set_motor_switch(value = false)};
    power_module.btn_mower_on_pm.onclick = function() {power_module.pub_set_bat_out_switch(value = true)};
    power_module.btn_mower_off_pm.onclick = function() {power_module.pub_set_bat_out_switch(value = false)};



    /**
     *  orientation control
     */


    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
        const portrait = e.matches;
        layout_man.is_portrait = portrait;
        layout_man.set_layout();
    });

    function post_load() {

        maps.local_costmap = new ROS3D.OccupancyGridClient({
            ros : ros.ros,
            tfClient: tf_client.tfClientMap,
            rootObject : viewer.viewer.scene,
            continuous: true,
            compression: 'cbor',
            // topic: 'navi_manager/local_costmap',
            topic: '/move_base_flex/local_costmap/costmap_slow',
            color: {r:255,g:0,b:255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
            opacity: 0.3,
            offsetPose: maps.local_costmap_offset,
        });
        maps.map = new ROS3D.OccupancyGridClient({
            ros : ros.ros,
            tfClient: tf_client.tfClientMap,
            rootObject : viewer.viewer.scene,
            continuous: true,
            topic: '/navi_manager/map',
            color: {r:0,g:255,b:255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
            opacity: 0.7,
            offsetPose: maps.map_offset,
        });

        // Reload planner
        programs.reload_planner_data();

    }
    // programs.reload_planner_data();

    window.setTimeout(function(){post_load();}, 1000);

}