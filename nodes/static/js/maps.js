
window.onload = function() {
//    var ip = location.hostname;
////    alert(ip);
//    var robot_IP = ip;
    console.log("START");
    var ros;
    ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});


///////////////////////////////////////////////////////////////////////  VARIABLES DECLARATION    //////////////////////////////////////////////////
    const LOG_VIEW_LENGTH = 300;
    const LOG_LENGTH = 20000;

    let id_ros_log = document.getElementById("ros_log");
    let id_scroll_down = document.getElementById("scroll_down");
    var id_scroll_down_text = document.getElementById("scroll_down_text");
    var id_ros_log_full_screen = document.getElementById("ros_log_full_screen");
    var id_ros_log_panel = document.getElementById("ros_log_panel");
    var ros_log_panel_full_screen_text = document.getElementById("ros_log_panel_full_screen_text");
    var goal_btn = document.getElementById('goal_btn')
    var hide_marker_btn = document.getElementById('hide_marker');
    var cancel_goal_btn = document.getElementById('cancel_goal_btn');
    var rtabmap_proximity_span = document.getElementById('rtabmap_proximity_span');
    var rtabmap_loop_closure_span = document.getElementById('rtabmap_loop_closure_span');
    var rtabmap_refid_span = document.getElementById('rtabmap_refid_span');
    var rtabmap_state = document.getElementById('rtabmap_state');

    var gnss_heading_fix_span = document.getElementById('gnss_heading_fix_span');
    var gnss_heading_fixstat_span = document.getElementById('gnss_heading_fixstat_span');
    var gnss_heading_state = document.getElementById('gnss_heading_state');

    var gnss_fix_span = document.getElementById('gnss_fix_span');
    var gnss_fixstat_span = document.getElementById('gnss_fixstat_span');
    var gnss_state = document.getElementById('gnss_state');
    var stop_btn = document.getElementById("stop_btn");


    let log_current_level = 1;
    let log_current_node = "";
    let auto_scroll = true;
    let last_auto_scroll = true;
    let log_view_start = 0;
    let log_view_end = 0;
    let view_log_arr;
    let log_filter_event = false;

    var throttle = 0.52; // max robot's speed for keyboard teleop

///////////////////////////////////////////////////////////////////////  GET STATUS LOG    ///////////////////////////////////////////////////////////////////////
    var lastLog = "";
    var map_log_item = "";

    var statusLoglistener = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/status',
        messageType : 'std_msgs/String'
    });

    statusLoglistener.subscribe(function(message) {
//    		 console.log(message);
        if (message.data != lastLog){
            map_log_item = message.data;
        }
        lastLog = message.data;
        document.getElementById("log").innerHTML = map_log_item + '</br>' + document.getElementById("log").innerHTML;
    });

///////////////////////////////////////////////////////////////////////  GET GNSS STATUS    ///////////////////////////////////////////////////////////////////////

    var GnssLiteStatuslistener = new ROSLIB.Topic({
        ros : ros,
        name : '/gnss/navstatus',
        messageType : 'ublox_msgs/NavSTATUS'
    });

    //            uint8 GPS_NO_FIX = 0
    //            uint8 GPS_DEAD_RECKONING_ONLY = 1
    //            uint8 GPS_2D_FIX = 2
    //            uint8 GPS_3D_FIX = 3
    //            uint8 GPS_GPS_DEAD_RECKONING_COMBINED = 4
    //            uint8 GPS_TIME_ONLY_FIX = 5

    GnssLiteStatuslistener.subscribe(function(message) {
//    		 console.log(message);
    		 if (message.gpsFix == 0){
    		    gnss_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-danger";
    		    gnss_fix_span.textContent = "NO_FIX";
    		 }
    		 if (message.gpsFix == 1){
    		    gnss_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-danger";
    		    gnss_fix_span.textContent = "DEAD_RECKONING_ONLY";
    		 }
    		 if (message.gpsFix == 2){
    		    gnss_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-warning";
    		    gnss_fix_span.textContent = "2D_FIX";
    		 }

    		 if (message.gpsFix == 3){
    		    gnss_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-success";
    		    gnss_fix_span.textContent = "3D_FIX";
    		 }
    		 if (message.gpsFix == 4){
    		    gnss_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-danger";
    		    gnss_fix_span.textContent = "DEAD_RECKONING_COMBINED";
    		 }
    		 if (message.gpsFix == 5){
    		    gnss_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-danger";
    		    gnss_fix_span.textContent = "GPS_TIME_ONLY_FIX";
    		 }
    });

///////////////////////////////////////////////////////////////////////  GET GNSS LITE FIX    ///////////////////////////////////////////////////////////////////////

    var GnssLiteFixlistener = new ROSLIB.Topic({
        ros : ros,
        name : '/gnss/fix',
        messageType : 'sensor_msgs/NavSatFix'
    });

//    int8 STATUS_NO_FIX =  -1        # unable to fix position
//    int8 STATUS_FIX =      0        # unaugmented fix
//    int8 STATUS_SBAS_FIX = 1        # with satellite-based augmentation
//    int8 STATUS_GBAS_FIX = 2        # with ground-based augmentation

    GnssLiteFixlistener.subscribe(function(message) {
//    		 console.log(message);
    		 if (message.status.status == -1){
    		    gnss_fixstat_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-danger";
    		    gnss_fixstat_span.textContent = "NO_FIX";
    		 }
    		 if (message.status.status == 0){
    		    gnss_fixstat_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-warning";
    		    gnss_fixstat_span.textContent = "FIX";
    		 }
    		 if (message.status.status == 1){
    		    gnss_fixstat_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-success";
    		    gnss_fixstat_span.textContent = "SBAS_FIX";
    		 }
    		 if (message.status.status == 2){
    		    gnss_fixstat_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-success";
    		    gnss_fixstat_span.textContent = "GBAS_FIX";
    		 }

    });

///////////////////////////////////////////////////////////////////////  GET GNSS FIX    ///////////////////////////////////////////////////////////////////////

    var GnssFixlistener = new ROSLIB.Topic({
        ros : ros,
        name : '/gnss_heading/fix',
        messageType : 'sensor_msgs/NavSatFix'
    });

//    int8 STATUS_NO_FIX =  -1        # unable to fix position
//    int8 STATUS_FIX =      0        # unaugmented fix
//    int8 STATUS_SBAS_FIX = 1        # with satellite-based augmentation
//    int8 STATUS_GBAS_FIX = 2        # with ground-based augmentation

    GnssFixlistener.subscribe(function(message) {
//    		 console.log(message);
    		 if (message.status.status == -1){
    		    gnss_heading_fixstat_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-danger";
    		    gnss_heading_fixstat_span.textContent = "NO_FIX";
    		 }
    		 if (message.status.status == 0){
    		    gnss_heading_fixstat_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-warning";
    		    gnss_heading_fixstat_span.textContent = "FIX";
    		 }
    		 if (message.status.status == 1){
    		    gnss_heading_fixstat_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-success";
    		    gnss_fixstat_span.textContent = "SBAS_FIX";
    		 }
    		 if (message.status.status == 2){
    		    gnss_heading_fixstat_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-success";
    		    gnss_heading_fixstat_span.textContent = "GBAS_FIX";
    		 }

    });

///////////////////////////////////////////////////////////////////////  GET GNSS STATUS    ///////////////////////////////////////////////////////////////////////

    var GnssStatuslistener = new ROSLIB.Topic({
        ros : ros,
        name : '/gnss_heading/navstatus',
        messageType : 'ublox_msgs/NavSTATUS'
    });

    //            uint8 GPS_NO_FIX = 0
    //            uint8 GPS_DEAD_RECKONING_ONLY = 1
    //            uint8 GPS_2D_FIX = 2
    //            uint8 GPS_3D_FIX = 3
    //            uint8 GPS_GPS_DEAD_RECKONING_COMBINED = 4
    //            uint8 GPS_TIME_ONLY_FIX = 5

    GnssStatuslistener.subscribe(function(message) {
//    		 console.log(message);
    		 if (message.gpsFix == 0){
    		    gnss_heading_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-danger";
    		    gnss_heading_fix_span.textContent = "NO_FIX";
    		 }
    		 if (message.gpsFix == 1){
    		    gnss_heading_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-danger";
    		    gnss_heading_fix_span.textContent = "DEAD_RECKONING_ONLY";
    		 }
    		 if (message.gpsFix == 2){
    		    gnss_heading_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-warning";
    		    gnss_heading_fix_span.textContent = "2D_FIX";
    		 }

    		 if (message.gpsFix == 3){
    		    gnss_heading_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-success";
    		    gnss_heading_fix_span.textContent = "3D_FIX";
    		 }
    		 if (message.gpsFix == 4){
    		    gnss_heading_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-danger";
    		    gnss_heading_fix_span.textContent = "DEAD_RECKONING_COMBINED";
    		 }
    		 if (message.gpsFix == 5){
    		    gnss_heading_fix_span.className = "text-center d-xl-flex justify-content-xl-center align-items-xl-center bg-danger";
    		    gnss_heading_fix_span.textContent = "GPS_TIME_ONLY_FIX";
    		 }
    });

///////////////////////////////////////////////////////////////////////  GET RTABMAP INFO    ///////////////////////////////////////////////////////////////////////

    var RtabmapInfolistener = new ROSLIB.Topic({
        ros : ros,
        name : '/rtabmap/info',
        messageType : 'rtabmap_msgs/Info'
    });

    RtabmapInfolistener.subscribe(function(message) {
//    		 console.log(message);
    		 if (message.proximityDetectionId > 0){
    		    rtabmap_proximity_span.style.background = "#f9e814";
    		 }else {
    		    rtabmap_proximity_span.style.background = "#000000";
    		 }
    		 rtabmap_proximity_span.textContent = "Proximity "+ message.proximityDetectionId;

    		 if (message.loopClosureId > 0){
    		    rtabmap_loop_closure_span.style.background = "var(--green)";
    		 }else {
    		    rtabmap_loop_closure_span.style.background = "#000000";
    		 }
    		 rtabmap_loop_closure_span.textContent = "Loop Closure  "+ message.loopClosureId;

    		 rtabmap_refid_span.textContent = "Ref ID "+ message.refId;

    		 if (message.statsValues[47] == 0){  // key: Memory/Short_time_memory_size
    		    rtabmap_state.textContent = "Localization";
    		 }else{
    		    rtabmap_state.textContent = "Mapping";
    		 }

//    		 console.log(message.statsValues[47]);

    //		    refId: 641
    //            loopClosureId: 0
    //            proximityDetectionId: 73
    //            landmarkId: 0
    });


///////////////////////////////////////////////////////////////////////  GET ROSOUT LOG    ///////////////////////////////////////////////////////////////////////



    id_scroll_down.onclick = function() {
    //    console.log("LogBtn click");
        if (id_scroll_down_text.textContent == "Pause view"){
            auto_scroll = false;
            id_scroll_down_text.textContent = "Auto scroll";
        }else{
            auto_scroll = true;
            id_scroll_down_text.textContent = "Pause view";
        }
    };

    id_ros_log_full_screen.onclick = function() {
        if (ros_log_panel_full_screen_text.textContent == "Full screen"){
            id_ros_log.style.height = (window.innerHeight - 80) + 'px';
            id_ros_log.style.width = '100%';
            id_ros_log_panel.style.position = "fixed";
            id_ros_log_panel.style.left = 0;
            id_ros_log_panel.style.top = '35px';
            id_ros_log_panel.style.width = '100%';
            id_ros_log_panel.style.height = (window.innerHeight - 80) + 'px';
            id_ros_log_panel.style.zIndex = 10;
            ros_log_panel_full_screen_text.textContent = "Docked";
        }else{
            id_ros_log.style.height = 110 + 'px';
            id_ros_log.style.width = '100%';
            id_ros_log_panel.style.position = "relative";
            id_ros_log_panel.style.left = 0;
            id_ros_log_panel.style.top = 0;
            id_ros_log_panel.style.width = '100%';
            id_ros_log_panel.style.height = 'auto';
            id_ros_log_panel.style.zIndex = 1;
            ros_log_panel_full_screen_text.textContent = "Full screen";
        }
    };

    function stopScroll(){
        auto_scroll = false;
    }

    var RosOutLoglistener = new ROSLIB.Topic({
        ros : ros,
        name : '/rosout_agg',
        messageType : 'rosgraph_msgs/Log'
    });

    var log_arr = [];
    log_current_level_select = document.getElementById("level_select");
    log_current_level_select.onchange = function() {
        log_current_level = log_current_level_select.value;
        log_filter_event = true;
    };

    RosOutLoglistener.subscribe(function(message) {
    //        console.log(message);
        const NONE=0; //  color: #7a8288;
        const DEBUG=1; //  color: #7a8288;
        const INFO=2;  //  color: #0268b4;
        const WARN=4;  //  color: #fc7e14;
        const ERROR=8;  //  color: #e83e8c;
        const FATAL=16;  //  color: #e83e8c;

        var log_item = {
            level: NONE,
            name: "",
            element: "",
        }

        log_item.element = "</br>";
        if (message.level == DEBUG){
            log_item.element += '<span style="display: inline;color: #7a8288;">';
        }
        if (message.level == INFO){
            log_item.element += '<span style="display: inline;color: #0268b4;">';
        }
        if (message.level == WARN){
            log_item.element += '<span style="display: inline;color: #fc7e14;">';
        }
        if (message.level == ERROR){
            log_item.element += '<span style="display: inline;color: #e83e8c;">';
        }
        if (message.level == FATAL){
            log_item.element += '<span style="display: inline;color: #e83e8c;">';
        }

        log_item.element += message.header.stamp.secs;
        log_item.element += " [";
        switch (message.level) {
            case 1: log_item.element += "DEBUG";
            break;
            case 2: log_item.element += "INFO";
            break;
            case 4: log_item.element += "WARN";
            break;
            case 8: log_item.element += "ERROR";
            break;
            case 16: log_item.element += "FATAL";
            break;
        };

        log_item.element += "] [<b>";
        log_item.element += message.name;
        log_item.element += "</b>]: ";
        log_item.element += message.msg;
        log_item.element += "</span>";
        log_item.level = message.level;
        log_item.name = message.name;
        log_arr.push(log_item)
//        document.getElementById("log_counter").innerHTML = log_arr.length;
        if (log_arr.length > LOG_LENGTH){
        log_arr.shift();
        };

        var div_content = ""
        const functionToFilterLevels = function(item){
            if (item.level >= log_current_level){
                if (log_current_node != ""){
                    if (item.name == log_current_node){
                        return item;
                    }
                }else{
                    return item;
                }
            }
        }

         if (log_arr.length <= LOG_VIEW_LENGTH){
            view_log_arr = log_arr;
         }else{
            if (auto_scroll == true){
                log_view_start = log_arr.length-LOG_VIEW_LENGTH;
                log_view_end = log_arr.length;
                view_log_arr = log_arr.slice(log_view_start, log_view_end);
            }else{
                view_log_arr = log_arr;
            }

         }

         let filtered_array = view_log_arr.filter(functionToFilterLevels)
    //		 console.log(filtered_array);
         filtered_array.forEach(item => div_content +=item.element);

         if (auto_scroll == true){
            id_ros_log.innerHTML = div_content;
            id_ros_log.scrollTop = id_ros_log.scrollHeight;
         }else{
            if (log_filter_event){
                id_ros_log.innerHTML = div_content;
                log_filter_event = false;
            }
            if (last_auto_scroll != auto_scroll){
                id_ros_log.innerHTML = div_content;
            }
         }
         last_auto_scroll = auto_scroll;


    });


///////////////////////////////////////////////////////////////////////  GET LIST OF NODES FOR LOG  ///////////////////////////////////////////////////////////////////////
    var nodes_message = "";

    function getNodes() {
        node_select = document.getElementById('node_select');
        var opt = document.createElement('option');
        opt.value = "";
        opt.innerHTML = "All nodes";
        node_select.appendChild(opt);
        nodes_message.nodes.forEach( function(item){
            var opt = document.createElement('option');
            opt.value = item;
            opt.innerHTML = item;
            node_select.appendChild(opt);
        });
    };

    var nodesClient = new ROSLIB.Service({
        ros : ros,
        name : '/rosapi/nodes',
        serviceType : 'rosapi/Nodes'
    });

    var request = new ROSLIB.ServiceRequest();
    nodesClient.callService(request, function(result) {
//        console.log("Getting nodes...");
//        console.log(result.nodes);
        nodes_message = result;
        getNodes();

    });

    log_current_node_select = document.getElementById("node_select");
    log_current_node_select.onchange = function() {
        log_current_node = log_current_node_select.value;
        log_filter_event = true;
    };


///////////////////////////////////////////////////////////////////////  LOAD SELECTED MAP    ///////////////////////////////////////////////////////////////////////

    var loadMapTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/load_map',
        messageType : 'std_msgs/String'
    });
    loadMapTopic.advertise();

    this.loadMap = function(load_name){
        var loadMapMsg = new ROSLIB.Message({
            data : load_name
        });
        loadMapTopic.publish(loadMapMsg)
    }

    var loadMapRtabmapTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/load_map_rtabmap',
        messageType : 'std_msgs/String'
    });
    loadMapRtabmapTopic.advertise();

    this.loadMapRtabmap = function(load_name){
        var loadRtabmapMsg = new ROSLIB.Message({
            data : load_name
        });
        loadMapRtabmapTopic.publish(loadRtabmapMsg)
    }

///////////////////////////////////////////////////////////////////////  REMOVE SELECTED MAP    ///////////////////////////////////////////////////////////////////////

    var removeMapTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/remove_map',
        messageType : 'std_msgs/String'
    });
    removeMapTopic.advertise();

    this.removeMap = function (remove_name){
        var removeMapMsg = new ROSLIB.Message({
            data : remove_name
        });
        removeMapTopic.publish(removeMapMsg);
    }

///////////////////////////////////////////////////////////////////////  GET LIST OF MAPS    ///////////////////////////////////////////////////////////////////////
    var map_listener_message = false;
    var map_listener_message_last = false;
    var maplistlistener = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/map_list',
        messageType : 'std_msgs/String'
    });

    maplistlistener.subscribe(function(message) {
        if (message.data != ''){
            map_listener_message = message;
        };
    });

    function getMapList() {
//        console.log(map_listener_message)
        var html_content = '';
        if (map_listener_message){
            if (map_listener_message.data != map_listener_message_last.data){
                var map_arr = String(map_listener_message.data).split('---');
                for (let n in map_arr){
                    var map_item_arr = String(map_arr[n]).split(' (');
                    var map_name = map_item_arr[0];
                    var map_size = map_item_arr[1].replace(')', '');
                    var columns = `<div class="d-flex align-items-center" style="border-bottom: 1px solid #444444 ;">
                                        <div class="d-flex" style="width: 100%;padding-left: 6px;"><span>${map_name}</span></div>
                                        <div class="d-flex ml-auto" style="width: 68.6562px;"><span style="width: 47px;">${map_size}</span></div>
                                        <div class="btn-group btn-group-sm d-flex ml-auto" role="group">
                                        <button class="btn btn-outline-info" type="button" onClick="loadMap('${map_name}')">Load</button>
                                        <button class="btn btn-outline-info" type="button" onClick="loadMapRtabmap('${map_name}')">RtabMap</button>
                                        <button class="btn btn-outline-danger" type="button" onClick="removeMap('${map_name}')">Remove</button>
                                        </div>
                                    </div>`;
                    html_content = html_content + columns;
                };
                document.getElementById("maplist").innerHTML = html_content;
            }
            map_listener_message_last = map_listener_message;
        }else {
            document.getElementById("maplist").innerHTML = '';
        }
    }

    setInterval(getMapList, 500);

///////////////////////////////////////////////////////////////////////  MAPPING    //////////////////////////////////////////////////////////////////////

    var mappingTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/edit_map',
        messageType : 'std_msgs/String'
    });
    mappingTopic.advertise();

//    document.getElementById('mapping').onclick = function() {
//        var mappingMapMsg = new ROSLIB.Message({
//            data : 'edit'
//        });
//        mappingTopic.publish(mappingMapMsg);
//    };


///////////////////////////////////////////////////////////////////////  LOCALIZATION    ///////////////////////////////////////////////////////////////////////

    var localizationTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/edit_map',
        messageType : 'std_msgs/String'
    });
    localizationTopic.advertise();

//    document.getElementById('localization').onclick = function() {
//        var localizationMapMsg = new ROSLIB.Message({
//            data : 'localize'
//        });
//        localizationTopic.publish(localizationMapMsg);
//    };


///////////////////////////////////////////////////////////////////////  SAVE MAP    ///////////////////////////////////////////////////////////////////////

    var saveMapTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/save_map',
        messageType : 'std_msgs/String'
    });
    saveMapTopic.advertise();


    document.getElementById('save_map').onclick = function() {
        var saveMapMsg = new ROSLIB.Message({
            data : document.getElementById('map_name_input').value,
        });
        saveMapTopic.publish(saveMapMsg);
    };

///////////////////////////////////////////////////////////////////////  NEW MAP    ///////////////////////////////////////////////////////////////////////

    var newMapTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/new_map',
        messageType : 'std_msgs/String'
    });
    newMapTopic.advertise();

    document.getElementById('new_map').onclick = function() {
        var newMapMsg = new ROSLIB.Message({
            data : 'new'
        });
        newMapTopic.publish(newMapMsg);
    };



////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////   POINTS    //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////  GET LIST OF POINTS    ///////////////////////////////////////////////////////////////////////


    var point_listener_message = false;
    var point_listener_message_last = false;
    var pointlistlistener = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/map_point_list',
        messageType : 'std_msgs/String'
    });

    pointlistlistener.subscribe(function(message) {
//		 console.log(message);
		 if (message.data != ''){
		    point_listener_message = message;
		 }
    });

    function getPointList() {
        if (point_listener_message){
            if (point_listener_message.data != point_listener_message_last.data){
                var html_content = '';
                var point_arr = String(point_listener_message.data).split('|||');
                for (let n in point_arr){
                    var point_name = String(point_arr[n]);
                    if (point_name != ''){
                        var columns = `<div class="d-flex align-items-center" style="border-bottom: 1px solid #444444 ;">
                                            <div class="d-flex" style="width: 100%;padding-left: 6px;"><span>${point_name}</span></div>
                                            <div class="btn-group btn-group-sm d-flex ml-auto" role="group">
                                                <button class="btn btn-outline-info" type="button" onClick="sendGoal('${point_name}')">Goal</button>
                                                <button class="btn btn-outline-info" type="button" onClick="publishPoint('${point_name}')">Publish</button>
                                                <button class="btn btn-outline-danger" type="button" onClick="removePoint('${point_name}')">Remove</button></div>
                                        </div>`
                        html_content = html_content + columns;
                    }
                };
                document.getElementById("point_list").innerHTML = html_content;
            }
            point_listener_message_last = point_listener_message;
        }else{
            document.getElementById("point_list").innerHTML = '';
        }
    };

    setInterval(getPointList, 1000);

///////////////////////////////////////////////////////////////////////  NEW POINT    ///////////////////////////////////////////////////////////////////////

    var newPointTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/save_waypoint',
        messageType : 'std_msgs/String'
    });
    newPointTopic.advertise();

    newPoint = function(){
        console.log("ggggggggggggggggggggggggggggggggggggggggg")
        var newPointMsg = new ROSLIB.Message({
            data : document.getElementById('point_name_input').value,
        });
        newPointTopic.publish(newPointMsg);
    }

    document.getElementById('new_point').onclick = function() {
        newPoint();
    };


///////////////////////////////////////////////////////////////////////  PUBLISH POINT    ///////////////////////////////////////////////////////////////////////

    var publishPointTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/publish_point',
        messageType : 'std_msgs/String'
    });
    publishPointTopic.advertise();

    this.publishPoint = function(name){
        var publishPointMsg = new ROSLIB.Message({
            data : name,
        });
        publishPointTopic.publish(publishPointMsg);
    }

///////////////////////////////////////////////////////////////////////  PUBLISH GOAL POINT    ///////////////////////////////////////////////////////////////////////

    var sendGoalTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/goal_point',
        messageType : 'std_msgs/String'
    });
    sendGoalTopic.advertise();

    this.sendGoal = function(name){
        var sendGoalMsg = new ROSLIB.Message({
            data : name,
        });
        sendGoalTopic.publish(sendGoalMsg);
    }



////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////    PATHS     //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////  NEW PATH  ///////////////////////////////////////////////////////////////////////

    var newPathTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/save_path',
        messageType : 'std_msgs/String'
    });
    newPathTopic.advertise();

    document.getElementById('new_path').onclick = function() {
        var newPathMsg = new ROSLIB.Message({
            data : document.getElementById('path_name_input').value,
        });
        newPathTopic.publish(newPathMsg);
    };


///////////////////////////////////////////////////////////////////////  GET PATH LIST OF POINTS    ///////////////////////////////////////////////////////////////////////
    var path_listener_message = false;
    var path_listener_message_last = false;

    var getPathlistener = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/map_path_list',
        messageType : 'std_msgs/String'
    });

    getPathlistener.subscribe(function(message) {
        //console.log(message);
        if (message.data != ''){
            path_listener_message = message;
        }
    });

    function getPathList() {
        if (path_listener_message){
            if (path_listener_message.data != path_listener_message_last.data){
                var html_content = '';
                var path_arr = String(path_listener_message.data).split('|||');
                for (let n in path_arr){
                    var path_name = String(path_arr[n]);
                    if (path_name != ''){
                        var columns = `<div class="d-flex align-items-center" style="border-bottom: 1px solid #444444 ;">
                                            <div class="d-flex" style="width: 100%;padding-left: 6px;"><span>${path_name}</span></div>
                                            <div class="btn-group btn-group-sm d-flex ml-auto" role="group">
                                                <button class="btn btn-outline-info text-nowrap" type="button" onClick="executePath('${path_name}')">Execute</button>
                                                <button class="btn btn-outline-info text-nowrap" type="button" onClick="publishPath('${path_name}')">Publish</button>
                                                <button class="btn btn-outline-info text-nowrap" type="button" onClick="addPathPoint('${path_name}')">Add point</button>
                                                <button class="btn btn-outline-danger text-nowrap" type="button" onClick="removePath('${path_name}')">Remove</button>
                                            </div>
                                        </div>`
                        html_content = html_content + columns;
                    }
                }
                document.getElementById("path_list").innerHTML = html_content;
            };
            path_listener_message_last = path_listener_message;
        }else{
            document.getElementById("path_list").innerHTML = '';
        };
    };

    setInterval(getPathList, 500);


///////////////////////////////////////////////////////////////////////  NEW PATH  ///////////////////////////////////////////////////////////////////////

    var newPathPointTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/save_path_point',
        messageType : 'std_msgs/String'
    });
    newPathPointTopic.advertise();

    this.addPathPoint = function(name){
        var newPathPointMsg = new ROSLIB.Message({
            data : name,
        });
        newPathPointTopic.publish(newPathPointMsg);
    }


///////////////////////////////////////////////////////////////////////  PUBLISH PATH    ///////////////////////////////////////////////////////////////////////

    var publishPathTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/publish_path',
        messageType : 'std_msgs/String'
    });
    publishPathTopic.advertise();

    this.publishPath = function(name){
        var publishPathMsg = new ROSLIB.Message({
            data : name,
        });
        publishPathTopic.publish(publishPathMsg);
    }

///////////////////////////////////////////////////////////////////////  EXECUTE MAP PATH    ///////////////////////////////////////////////////////////////////////

    var executePathTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/execute_path',
        messageType : 'std_msgs/String'
    });
    executePathTopic.advertise();

    this.executePath = function(name){
        var executePathMsg = new ROSLIB.Message({
            data : name,
        });
        executePathTopic.publish(executePathMsg);
    }






/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////   3D MAP VIEW      ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Create the main viewer.
    var viewer = new ROS3D.Viewer({
        divID : '3d_view',
        width : 600,
        height : 200,
        near : 10,
        far : 100000,
        antialias : true,
        intensity : 0.6,
        alpha : 1.0,
        background : '#1e2f38',  // 1e2f38
        cameraPose : {  x : 0, y : 0, z : 200 },
        displayPanAndZoomFrame : false
    });

    console.log(viewer);
    viewer.camera.fov = 1;


    function changeViewerSize(){
        var width = document.getElementById("3d_view").clientWidth;
        var height = document.getElementById("3d_view").clientHeight;
        var padding = parseInt((document.getElementById("3d_view").style.padding).replace('px', ''));
        viewer.resize(width-(padding*2), height-(padding*2));
    };
    new ResizeObserver(changeViewerSize).observe(document.getElementById("3d_view"));

    function updateCam(){
        viewer.cameraControls.rotateDown();
    }





/////////////////////////////////////////////////////// MAP TF /////////////////////////////////////////////////////////////
    var tfClientMap = new ROSLIB.TFClient({
      ros : ros,
      angularThres : 0.01,
      transThres : 0.01,
      rate : 10.0,
      fixedFrame : '/map'
    });

    var follow_robot = false;

    tfClientMap.subscribe('base_link', function(tf) {
        if (follow_robot){
            viewer.cameraControls.center.x = tf.translation.x;
            viewer.cameraControls.center.y = tf.translation.y;
            viewer.cameraControls.center.z = tf.translation.z;
            viewer.camera.rotation.x = tf.rotation.x;
            viewer.camera.rotation.y = tf.rotation.y;
            viewer.camera.rotation.z = tf.rotation.z;
            viewer.camera.rotation.w = tf.rotation.w;
        };
    });

    var follow_target_btn = document.getElementById('follow_target');
    follow_target_btn.onclick = function() {
    console.log(follow_target_btn.textContent);
        if (follow_target_btn.textContent == 'Follow robot'){
            follow_robot = true;
            follow_target_btn.textContent = 'Follow map';
        }else{
            follow_robot = false;
            follow_target_btn.textContent = 'Follow robot';
        }
    };


/////////////////////////////////////////////////////// T265_POSE TF /////////////////////////////////////////////////////////////
//    var tfClientRobot_t265_pose_frame = new ROSLIB.TFClient({
//      ros : ros,
//      angularThres : 0.01,
//      transThres : 0.01,
//      rate : 10.0,
//      fixedFrame : '/t265_pose_frame'
//    });


/////////////////////////////////////////////////////// D435 TF /////////////////////////////////////////////////////////////
//    var tfClient_d435_link = new ROSLIB.TFClient({
//      ros : ros,
//      angularThres : 0.01,
//      transThres : 0.01,
//      rate : 10.0,
//      fixedFrame : '/d435_link'
////      fixedFrame : '/d435_color_optical_frame'
//    });




/////////////////////////////////////////////////////// POSE SCENE /////////////////////////////////////////////////////////////
//    var robot_pose_scene = new ROS3D.SceneNode({
//      frameID : '/t265_pose_frame',
//      tfClient : tfClientMap,
//      object : new ROS3D.Axes({})
////      object : new ROS3D.Grid()
//    });
//    viewer.scene.add(robot_pose_scene);

/////////////////////////////////////////////////////// D435 SCENE /////////////////////////////////////////////////////////////
//    var d435_pose_scene = new ROS3D.SceneNode({
//      frameID : '/d435_link',
//      tfClient : tfClientMap,
//      object : new ROS3D.Axes({})
//    });
//    viewer.scene.add(d435_pose_scene);

/////////////////////////////////////////////////////// MAP SCENE /////////////////////////////////////////////////////////////
//    var map_scene = new ROS3D.SceneNode({
//      frameID : '/map',
//      tfClient : tfClientMap,
////      object : new ROS3D.Axes({})
////      object : new ROS3D.Grid({num_cells : 50, color: "#333333"})
//    });
//    viewer.scene.add(map_scene);


/////////////////////////////////////////////////////// WHOLE CLOUD /////////////////////////////////////////////////////////////
//    var cloudClientVoxelZLight = new ROS3D.PointCloud2({
//        ros: ros,
//        tfClient: tfClient_d435_link,
//        rootObject: d435_pose_scene,
////        rootObject: viewer.scene,
//        topic: '/voxel_grid/output_z_light',
//        material: { size: 0.01, color: 0xffffff },
////        material: { size: 0.05},
////        colorsrc: 'rgb',
//        max_pts: 500000
//    });


/////////////////////////////////////////////////////// OBSTACLE CLOUD /////////////////////////////////////////////////////////////
    var cloudClient = new ROS3D.PointCloud2({
        ros: ros,
        tfClient: tfClientMap,
        rootObject: viewer.scene,
        topic: '/obstacles_cloud',
        material: { size: 0.05, color: 0xfb0202 }
    });
    console.log(cloudClient);

//    var obstacles_btn = document.getElementById('obstacles_btn');
//    obstacles_btn.className = 'btn btn-primary text-muted'
//    cloudClient.points.visible = false;
//    cloudClient.visible = false;
//    cloudClient.userData.visible = false;
//    obstacles_btn.onclick = function() {
//        console.log(cloudClient);
//        if (obstacles_btn.className == 'btn btn-primary text-muted'){ // if hidden
//            obstacles_btn.className = 'btn btn-primary';
//            cloudClient.points.visible = true;
//        }else{
//            obstacles_btn.className = 'btn btn-primary text-muted'
//            cloudClient.points.visible = false;
//        };
//    }

/////////////////////////////////////////////////////// GROUND CLOUD /////////////////////////////////////////////////////////////
    var cloudClientground = new ROS3D.PointCloud2({
        ros: ros,
        tfClient: tfClientMap,
        rootObject: viewer.scene,
        topic: '/ground_cloud',
        material: { size: 0.05, color: 0x71ff02 }
    });


//    console.log(cloudClientVoxelZLight)

/////////////////////////////////////////////////////// MAP /////////////////////////////////////////////////////////////


////////// Overwrite getColor() of OccupancyGrid for custom coloring of maps depends on type. It's control thru the color attr of OccupancyGridClient

    ROS3D.OccupancyGrid.prototype.getColor = function(index, row, col, value) {

        //  Occupancy identifiers in color attribute of OccupancyGridClient
        //  {r:0,g:255,b:255} gridmap,
        //  {r:255,g:0,b:255} loc costmap,
        //  {r:255,g:255,b:0} glob costmap
//        console.log(this.color.b);
        // If map is not costmap.
        if (this.color.r == 0 && this.color.g == 255 && this.color.b == 255){
            if (value == 100){   // obstacle
                return [0,0,0,255];
            };

            if (value == 0){    // free space
                return [149,149,149,150];
            };

            if (value <= 99 && value >= 1){  // probably obstacle
                return [149-value,149-value,149-value,150];
            };

            if (value == -1){  // unknown
                return [0,0,0,25];
                console.log(value);
            };
        };

        // If map is local costmap.
        if (this.color.r == 255 && this.color.g == 0 && this.color.b == 255){
            if (value == 100){   // obstacle
                return [255,0,0,255];
            };

            if (value == 0){    // free space
                return [0,0,0,40];
            };

            if (value <= 99 && value >= 1){  // probably obstacle
                return [149,149-value,149-value,255];
            };

            if (value == -1){  // unknown
                return [0,0,0,0];
                console.log(value);
            };
        };

        // If map is global costmap.
        if (this.color.r == 255 && this.color.g == 255 && this.color.b == 0){
            if (value == 100){   // obstacle
                return [0,0,0,255];
            };

            if (value == 0){    // free space
                return [149,149,149,0];
            };

            if (value <= 99 && value >= 1){  // probably obstacle
                return [149,149-value,149,125];
            };

            if (value == -1){  // unknown
                return [0,0,0,0];
                console.log(value);
            };
        };

        return [
	      (value * this.color.r) / 255,
	      (value * this.color.g) / 255,
	      (value * this.color.b) / 255,
	      255
	    ];

	  };
//////////////////////////////////////////////////////////////////

  var v0 = new ROSLIB.Vector3({ x : 0, y : 0, z : -0.083 });
  var v1 = new ROSLIB.Vector3({ x : 0, y : 0, z : -0.082 });
  var v2 = new ROSLIB.Vector3({ x : 0, y : 0, z : -0.081 });
  var v3 = new ROSLIB.Vector3({ x : 0, y : 0, z : -0.08 });
  var q1 = new ROSLIB.Quaternion({ x : 0.0, y : 0.0, z : 0.0, w : 0.0 });
  var z_offset_map = new ROSLIB.Pose({ position : v1, orientation : q1 });
  var z_offset_map2 = new ROSLIB.Pose({ position : v0, orientation : q1 });
  var z_offset_glob_cost = new ROSLIB.Pose({ position : v2, orientation : q1 });
  var z_offset_loc_cost = new ROSLIB.Pose({ position : v3, orientation : q1 });


    var gridClient = new ROS3D.OccupancyGridClient({
        ros : ros,
        tfClient: tfClientMap,
        rootObject : viewer.scene,
        continuous: true,
        // topic: '/rtabmap/grid_map',
        // topic: '/map_assembled',
        topic: '/web_plan/map_edited',
        color: {r:0,g:255,b:255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
        opacity: 0.99,
        offsetPose: z_offset_map
    });

    var gridClientRtabmap = new ROS3D.OccupancyGridClient({
        ros : ros,
        tfClient: tfClientMap,
        rootObject : viewer.scene,
        continuous: true,
        topic: '/rtabmap/grid_map',
        color: {r:0,g:255,b:255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
        opacity: 0.99,
        offsetPose: z_offset_map2
    });

    console.log(gridClient)
    console.log(gridClientRtabmap)
    // gridClientRtabmap.rootObject.visible = false;
    // gridClientRtabmap.currentGrid.visible = false;

    // let parentScene = object3D.points.object.parent;
    // //this.viewer.scene.remove(parentScene);
    // this.viewer.scene.children = this.viewer.scene.children.filter(function(value, index, arr){
    //     if(value.uuid === parentScene.uuid){
    //         console.log(value.uuid)
    //     };
    // });


    btn_map_view_rtabmap = document.getElementById("btn_map_view_rtabmap");
    btn_map_view_rtabmap.onclick = function() {
        gridClient.currentGrid.visible = false;
        gridClient.unsubscribe();
        gridClientRtabmap.currentGrid.visible = true;
        // gridClientRtabmap.subscribe();
        // console.log(gridClient);
        // console.log(viewer.scene);
        // gridClient.unsubscribe();
        // viewer.scene.remove(gridClient);
        gridClient = new ROS3D.OccupancyGridClient({
            ros : ros,
            tfClient: tfClientMap,
            rootObject : viewer.scene,
            continuous: true,
            topic: '/rtabmap/grid_map',
            // topic: '/map_assembled',
            // topic: '/web_plan/map_edited',
            color: {r:0,g:255,b:255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
            opacity: 0.99,
            offsetPose: z_offset_map
        });

        // gridClient.topicName = '/rtabmap/grid_map';
        // gridClient.rootObject.remove(gridClient.currentGrid);
        // gridClient.sceneNode.remove(gridClient.currentGrid);
        console.log(gridClient);
        console.log(viewer.scene);
        // gridClient.subscribe();

    }

    btn_map_view_planner_map = document.getElementById("btn_map_view_planner_map");
    btn_map_view_planner_map.onclick = function() {
        gridClient.currentGrid.visible = true;
        // gridClient.subscribe();
        gridClientRtabmap.currentGrid.visible = false;
        gridClientRtabmap.unsubscribe();
        // console.log(gridClient);
        // console.log(viewer);
        // gridClient.unsubscribe();
        // gridClient.topicName = '/web_plan/map_edited';
        // gridClient.rootObject.remove(gridClient.currentGrid);
        // gridClient.sceneNode.remove(gridClient.currentGrid);
        // console.log(gridClient);
        // gridClient.subscribe();
        // console.log(gridClient);
        // console.log(viewer.scene);
        // gridClient.unsubscribe();
        // viewer.scene.remove(gridClient);
        gridClient = new ROS3D.OccupancyGridClient({
            ros : ros,
            tfClient: tfClientMap,
            rootObject : viewer.scene,
            continuous: true,
            // topic: '/rtabmap/grid_map',
            // topic: '/map_assembled',
            topic: '/web_plan/map_edited',
            color: {r:0,g:255,b:255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
            opacity: 0.99,
            offsetPose: z_offset_map
        });
        console.log(gridClient);
        console.log(viewer.scene);
    }


/////////////////////////////////////////////////////// GLOBAL COSTMAP /////////////////////////////////////////////////////////////
//     var globalCostmapClient = new ROS3D.OccupancyGridClient({
//         ros : ros,
//         tfClient: tfClientMap,
//         rootObject : viewer.scene,
//         continuous: true,
//         topic: '/move_base_flex/global_costmap/costmap',
//         color: {r:255,g:255,b:0},
//         opacity: 0.99,
//         offsetPose: z_offset_glob_cost
//     });

/////////////////////////////////////////////////////// LOCAL COSTMAP /////////////////////////////////////////////////////////////
    var localCostmapClient = new ROS3D.OccupancyGridClient({
        ros : ros,
        tfClient: tfClientMap,
        rootObject : viewer.scene,
        continuous: true,
        topic: '/move_base_flex/local_costmap/costmap',
        color: {r:255,g:0,b:255},
        opacity: 0.99,
        offsetPose: z_offset_loc_cost
    });





/////////////////////////////////////////////////////// ROBOT NAV POLYGON /////////////////////////////////////////////////////////////
    var robotPolygon = new ROS3D.Polygon({
        ros : ros,
        tfClient: tfClientMap,
        rootObject : viewer.scene,
        topic: '/move_base_flex/local_costmap/footprint',
        color: 0xffffff,
    });

/////////////////////////////////////////////////////// PATH TO GO /////////////////////////////////////////////////////////////
    var mapPath = new ROS3D.Path({
        ros : ros,
        tfClient: tfClientMap,
        rootObject : viewer.scene,
        topic: '/navi_manager/map_path',
        color: 0x020cf9,
    });

/////////////////////////////////////////////////////// MOW PATH  /////////////////////////////////////////////////////////////
    var mapPath = new ROS3D.Path({
        ros : ros,
        tfClient: tfClientMap,
        rootObject : viewer.scene,
        topic: 'waypoint_list',
        color: 0x020cf9,
    });

/////////////////////////////////////////////////////// GLOBAL PLAN /////////////////////////////////////////////////////////////
    var globalPlan = new ROS3D.Path({
        ros : ros,
        tfClient: tfClientMap,
        rootObject : viewer.scene,
        topic: '/move_base_flex/TebLocalPlannerROS/global_plan',
        color: 0xffffff,
    });


/////////////////////////////////////////////////////// LOCAL PLAN /////////////////////////////////////////////////////////////
    var localPlan = new ROS3D.Path({
        ros : ros,
        tfClient: tfClientMap,
        rootObject : viewer.scene,
        topic: '/move_base_flex/TebLocalPlannerROS/local_plan',
        color: 0xff00ff,
    });


///////////////////////////////////////////////////// MARKER /////////////////////////////////////////////////////////////
    var mapMarker = new ROS3D.MarkerClient({
        ros : ros,
        tfClient: tfClientMap,
        rootObject : viewer.scene,
        topic: '/navi_manager/map_point',
        color: 0x020cf9,
    })


/////////////////////////////////////////////////  MARKER ARRAY       //////////////////////////////////////////////////////////////////////
       var markerArrayClient = new ROS3D.MarkerArrayClient({
          ros: ros,
          rootObject: viewer.scene,
          tfClient: tfClientMap,
          topic: "/zone_path_lines",
       });

/////////////////////////////////////////////////  INTERACTIVE  MARKER //////////////////////////////////////////////////////////////////////

    var imClient = new ROS3D.InteractiveMarkerClient({
      ros : ros,
      tfClient : tfClientMap,
      topic : '/interactive_marker',
      camera : viewer.camera,
      rootObject : viewer.selectableObjects
    });



    ////////// send interactive marker goal
    var interactiveMarkerGoalTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/interactive_marker_goal',
        messageType : 'std_msgs/String'
    });

    interactiveMarkerGoalTopic.advertise();
    goal_btn.disabled = true;
    goal_btn.onclick = function() {
        console.log('Sending interactive marker goal.');
        var interactiveMarkerGoalMsg = new ROSLIB.Message({
            data : 'interactiveGoal',
        });
        interactiveMarkerGoalTopic.publish(interactiveMarkerGoalMsg);
    };

    ////////// send cancel goal
    var cancelGoalTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/move_base_flex/move_base/cancel',
        messageType : 'actionlib_msgs/GoalID'
    });

    cancelGoalTopic.advertise();

    cancel_goal_btn.onclick = function() {
        console.log('Cancel goal.');
        var cancelGoalMsg = new ROSLIB.Message({
//            data : 'interactiveGoal',
        });
        cancelGoalTopic.publish(cancelGoalMsg);
    };



    hide_marker_btn.textContent = 'Show marker';
    imClient.rootObject.visible = false;



    hide_marker_btn.onclick = function() {
        if (hide_marker_btn.textContent == 'Hide marker'){
            imClient.rootObject.visible = false;
            hide_marker_btn.textContent = 'Show marker'
        }else{
            imClient.rootObject.visible = true;
            hide_marker_btn.textContent = 'Hide marker'
        }
        console.log(imClient);
        imClient.rootObject.visible = false;
    };

    ////////// click on map publisher
    var newInteractiveMarkerTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/new_interactive_marker',
        messageType : 'geometry_msgs/Pose'
    });
    newInteractiveMarkerTopic.advertise();

    viewer.cameraControls.addEventListener('mousedown', function(event3d) {
       if (hide_marker_btn.textContent == 'Hide marker'){
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
            goal_btn.disabled = false;
        };
    });



/////////////////////////////////////////////////  LASER SCAN //////////////////////////////////////////////////////////////////////

    var laser = new ROS3D.LaserScan({
      ros : ros,
      tfClient: tfClientMap,
      rootObject : viewer.scene,
      topic: '/scan',
      material: { size: 4, color: 0x007bff }
    });



    viewer.scene.add(new ROS3D.Grid({num_cells : 50, color: "#333333"}));


//    viewer.resize(100, 100)



/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////   3D FRONT VIEW      /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////  VIEWER  //////////////////////////////////////////////////////////////////////
    var frontViewer = new ROS3D.Viewer({
        divID : '3d_front_view',
        width : 200,
        height : 200,
        antialias : true,
        intensity : 1.0,
        alpha : 0.0,
        background : '#1e2f38',  // 1e2f38
        cameraPose : {    x : 0.3,
                        y : 0.00,
                        z : 0.0
                      },
//      displayPanAndZoomFrame : false

    });


    frontViewer.cameraControls.rotateLeft(3.14);



    function changeViewerSize_front_view(){
        var width = document.getElementById("3d_front_view").clientWidth;
        var height = document.getElementById("3d_front_view").clientHeight;
        var padding = parseInt((document.getElementById("3d_front_view").style.padding).replace('px', ''));
        frontViewer.resize(width-(padding*2), height-(padding*2));
    };
    new ResizeObserver(changeViewerSize_front_view).observe(document.getElementById("3d_front_view"));

/////////////////////////////////////////////////  D435 TF  //////////////////////////////////////////////////////////////////////
    var frontTFClient_d435_link = new ROSLIB.TFClient({
      ros : ros,
      angularThres : 0.01,
      transThres : 0.01,
      rate : 10.0,
      fixedFrame : 'd435_link'
//      fixedFrame : '/d435_color_optical_frame'
    });


/////////////////////////////////////////////////  T265_POSE_FRAME TF  //////////////////////////////////////////////////////////////////////
    var frontTFClient_base_link_frame = new ROSLIB.TFClient({
      ros : ros,
      angularThres : 0.01,
      transThres : 0.01,
      rate : 10.0,
      fixedFrame : '/base_link'
    });

/////////////////////////////////////////////////  SCAN_LINK TF  //////////////////////////////////////////////////////////////////////
//    var frontTFClient_base_scan = new ROSLIB.TFClient({
//      ros : ros,
//      angularThres : 0.01,
//      transThres : 0.01,
//      rate : 10.0,
//      fixedFrame : '/base_scan'
//    });

/////////////////////////////////////////////////  BASE_LINK TF  //////////////////////////////////////////////////////////////////////
//    var frontTFClient_base_link = new ROSLIB.TFClient({
//      ros : ros,
//      angularThres : 0.01,
//      transThres : 0.01,
//      rate : 10.0,
//      fixedFrame : '/base_link'
//    });


/////////////////////////////////////////////////  D435 SCENE  //////////////////////////////////////////////////////////////////////
//    var frontSceneD435 = new ROS3D.SceneNode({
//      frameID : '/d435_link',
//      tfClient : frontTFClient_base_link,
////      object : new ROS3D.Grid()
//    });
//    frontViewer.scene.add(frontSceneD435);

/////////////////////////////////////////////////  SCAN SCENE  //////////////////////////////////////////////////////////////////////
//    var frontSceneScan = new ROS3D.SceneNode({
//      frameID : '/base_scan',
//      tfClient : frontTFClient_base_link,
////      object : new ROS3D.Grid()
//    });
//    frontViewer.scene.add(frontSceneScan);


/////////////////////////////////////////////////  POSE SCENE  //////////////////////////////////////////////////////////////////////
    var frontScenePose = new ROS3D.SceneNode({
      frameID : '/base_link',
      tfClient : frontTFClient_d435_link,
//      object : new ROS3D.Grid()
    });
    frontViewer.scene.add(frontScenePose);

/////////////////////////////////////////////////  BASE_LINK SCENE  //////////////////////////////////////////////////////////////////////
//    var frontSceneBaseLink = new ROS3D.SceneNode({
//      frameID : '/base_link',
//      tfClient : frontTFClient_t265_pose_frame,
//      object : new ROS3D.Grid()
//    });
//    frontViewer.scene.add(frontSceneBaseLink);


/////////////////////////////////////////////////  GROUND CLOUD  //////////////////////////////////////////////////////////////////////
    var groundCloud = new ROS3D.PointCloud2({
        ros: ros,
        tfClient: frontTFClient_base_link_frame,
        rootObject: frontScenePose,
        topic: '/ground_cloud',
        material: { size: 0.05, color: 0x71ff02 }
    });

/////////////////////////////////////////////////  OBSTACLES CLOUD  //////////////////////////////////////////////////////////////////////
    var obstaclesCloud = new ROS3D.PointCloud2({
        ros: ros,
        tfClient: frontTFClient_base_link_frame,
        rootObject: frontScenePose,
        topic: '/obstacles_cloud',
        material: { size: 0.05, color: 0xfb0202 }
    });

/////////////////////////////////////////////////  WHOLE CLOUD  //////////////////////////////////////////////////////////////////////
//    var wholeCloud = new ROS3D.PointCloud2({
//        ros: ros,
//        tfClient: frontTFClient_base_link_frame,
//        rootObject: frontScenePose,
//        topic: '/voxel_grid/output_z_light',
//        material: { size: 0.01, color: 0xffffff },
////        material: { size: 0.05},
////        colorsrc: 'rgb',
//        max_pts: 10000
//    });


/////////////////////////////////////////////////  LASER SCAN  //////////////////////////////////////////////////////////////////////
    var laser = new ROS3D.LaserScan({
      ros : ros,
      tfClient: frontTFClient_base_link_frame,
      rootObject : frontScenePose,
      topic: '/scan',
      material: { size: 0.05, color: 0x007bff }
    });




/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////   REMOTE CONTROL      /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////  CMD_VEL PUBLISHER  //////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////////  KEYBOARD TELEOP  //////////////////////////////////////////////////////////////////////


    // Use w, s, a, d keys to drive your robot

    // Check if keyboard controller was aready created
    var teleop;
    // Initialize the teleop.

    teleop = new KEYBOARDTELEOP.Teleop({
        ros: ros,
        topic: "/cmd_vel",
        throttle: throttle
    });
    teleop.scale = document.getElementById("keyboard_slider").value / 100;
    document.getElementById("keyboard_speed").textContent = (teleop.scale * throttle).toFixed(2);
    teleop.working = false;
    // console.log('scale: ' + teleop.scale);
    // console.log(teleop.scale);
    // console.log('throttle: ' + throttle);
    // console.log(throttle);


    // Add event listener for slider moves
    robotSpeedRange = document.getElementById("keyboard_slider");
    robotSpeedRange.oninput = function() {
        teleop.scale = robotSpeedRange.value / 100;
        document.getElementById("keyboard_speed").textContent = (teleop.scale * throttle).toFixed(2);
    };



    document.getElementById('keyboard_check').onclick = function() {
    if ( this.checked ) {
		teleop.working = true;
//        document.getElementById("keyboard-label").textContent = "On";
    } else {
		teleop.working = false;
//		document.getElementById("keyboard-label").textContent = "Off";
    }
};


/////////////////////////////////////////////////  JOYSTICK TELEOP  //////////////////////////////////////////////////////////////////////
    function moveAction(linear, angular) {
        if (linear !== undefined && angular !== undefined) {
            twist.linear.x = linear;
            twist.angular.z = angular;
        } else {
            twist.linear.x = 0;
            twist.angular.z = 0;
        }
        cmdVel.publish(twist);
    }


    twist = new ROSLIB.Message({
        linear: {
            x: 0,
            y: 0,
            z: 0
        },
        angular: {
            x: 0,
            y: 0,
            z: 0
        }
    });

    cmdVel = new ROSLIB.Topic({
        ros: ros,
        name: "/cmd_vel",
        messageType: "geometry_msgs/Twist"
    });

    cmdVel.advertise();


    var publishImmidiately = true;
    var lin;
    var ang;
    var publish_joy = false;
    var joysize = 172;
    joystickContainer = document.getElementById("joy_view");

    var options = {
        zone: joystickContainer,
        position: { left: 50 + "%", top: 50 + "%" },
        mode: "dynamic",
//        catchDistance: 1,
        size: joysize,
        color: "#0066ff",
        dynamicPage: true,
//        restJoystick: true
    };

    manager = nipplejs.create(options);
    manager.on("move", function(evt, nipple) {
        var direction = nipple.angle.degree - 90;
        if (direction > 180) {
            direction = -(450 - nipple.angle.degree);
        }
        nip_distance = (nipple.distance/(joysize/2));
        lin = Math.cos(direction / 57.29) * nip_distance * 2.0; // 0.52
        ang = Math.sin(direction / 57.29) * nip_distance * 1.5;
        publish_joy = true;

    });

    manager.on("end", function() {
//        moveAction(0, 0);
            publish_joy = false;
           lin = 0;
           ang = 0;
    });

    var pub_end_published = false;
    function joy_pub_speed(){
        if (publish_joy){
            moveAction(lin, ang);
            pub_end_published = false;
        }else{
            if (pub_end_published == false){
                moveAction(0, 0);
                pub_end_published = true;
            }
        }
    }
    setInterval(joy_pub_speed, 50)




/////////////////////////////////////////////////  CAMERA VIEW  //////////////////////////////////////////////////////////////////////
    var width = 640;
    var height = 480;
    var camViewer = new MJPEGCANVAS.Viewer({
      divID : 'camera_view',
//      host : robot_IP,
      host : location.hostname,
      port: 8080,
      quality: 15,
      refreshRate: 15,
      width : width,
      height : height,
      topic : '/d435/color/image_raw',
//      interval : 200
    });

    function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return { width: srcWidth*ratio, height: srcHeight*ratio };
     }

    function changeViewerSize_cam_view(){
        var width_el = document.getElementById("camera_view").clientWidth;
        var height_el = document.getElementById("camera_view").clientHeight;
        var padding_el = parseInt((document.getElementById("camera_view").style.padding).replace('px', ''));

        camViewer.width = width_el-(padding_el*2);
        camViewer.height = height_el-(padding_el*2);
        canvas_size = calculateAspectRatioFit(width, height, camViewer.width, camViewer.height);

        let content = document.getElementById('camera_view');
        content.firstChild.width = canvas_size.width;
        content.firstChild.height = canvas_size.height;
    };
    new ResizeObserver(changeViewerSize_cam_view).observe(document.getElementById("camera_view"));

///////////////////////////////////////////////////////////////////////  GET POWER MODULE STATUS    ///////////////////////////////////////////////////////////////////////

    var pmStatuslistenerTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/pm/power_status',
        messageType : 'vitulus_ups/power_status'
    });

    pmStatuslistenerTopic.subscribe(function(message) {
        var color_state = 'success';
        if (message.battery_capacity < 40){
            color_state = 'warning'
        }
        if (message.battery_capacity < 20){
            color_state = 'danger'
        }
//        console.log(message);
        document.getElementById("battery_capacity").textContent = message.battery_capacity + '%';
        document.getElementById("battery_capacity").style.width = message.battery_capacity + '%';
        document.getElementById("battery_capacity").ariaValueNow = message.battery_capacity;
        document.getElementById("battery_capacity").ariaValueMin = 0;
        document.getElementById("battery_capacity").ariaValueMax = 100;
        document.getElementById("battery_state").textContent = message.charger_status;
        document.getElementById("battery_tool").style.border = '1px solid var(--' + color_state +')';
        document.getElementById("battery_tool_dot").style.color = 'var(--' + color_state +')';
        document.getElementById("battery_capacity").className = 'progress-bar bg-' + color_state +'';

        var ups_html_content = '';
        ups_html_content += '<div>' + message.version + '</div>';
        ups_html_content += '<div>Supply: ' + message.supply_status + '</div>';
        ups_html_content += '<div>Input voltage: ' + message.input_voltage.toFixed(2) + ' V </div>';
        ups_html_content += '<div>Input current: ' + message.input_current.toFixed(2) + ' A </div>';

        ups_html_content += '<div>Charger: ' + message.charger_status + '</div>';
        ups_html_content += '<div>Battery capacity: ' + message.battery_capacity + ' % </div>';
        ups_html_content += '<div>Battery voltage: ' + message.battery_voltage.toFixed(2) + ' V </div>';
        ups_html_content += '<div>Battery current: ' + message.battery_current.toFixed(2) + ' A </div>';
        ups_html_content += '<div>Battery current in: ' + message.battery_charge_current.toFixed(2) + ' A </div>';
        ups_html_content += '<div>Battery current out: ' + message.battery_discharge_current.toFixed(2) + 'A </div>';
        ups_html_content += '<div>NUC voltage: ' + message.out19_voltage.toFixed(2) + ' V </div>';
        ups_html_content += '<div>NUC current: ' + message.out19_current.toFixed(2) + ' A </div>';

        ups_html_content += '<div>&nbsp;</div>';

        ups_html_content += '<div>Charge setpoint run: ' + message.charge_current_setpoint_run + ' mA </div>';
        ups_html_content += '<div>Precharge setpoint run: ' + message.precharge_current_setpoint_run + ' mA </div>';
        ups_html_content += '<div>Charge setpoint stanby: ' + message.charge_current_setpoint_standby + ' mA </div>';
        ups_html_content += '<div>Precharge setpoint stanby: ' + message.precharge_current_setpoint_standby + ' mA </div>';

        ups_html_content += '<div>&nbsp;</div>';

        ups_html_content += '<div>Temp ext: ' + message.temp.toFixed(1) + ' °C (' + message.temp_setpoint + ') </div>';
        ups_html_content += '<div>Fan ext: ' + message.fan_rpm + ' rpm </div>';
        ups_html_content += '<div>Temp PCB: ' + message.temp2.toFixed(1) + ' °C (' + message.temp2_setpoint + ') </div>';
        ups_html_content += '<div>Fan PCB: ' + message.fan2_rpm + ' rpm </div>';

        ups_html_content += '<div>&nbsp;</div>';

        ups_html_content += '<div>Charge switch: ' + message.charge_switch + ' </div>';
        ups_html_content += '<div>Discharge switch: ' + message.discharge_switch + ' </div>';
        ups_html_content += '<div>Battery out switch: ' + message.bat_out_switch + ' </div>';
        ups_html_content += '<div>Motors switch: ' + message.motor_out_switch + ' </div>';
        ups_html_content += '<div>NUC switch: ' + message.out19v_switch + ' </div>';

        document.getElementById("ups_info").innerHTML = ups_html_content;


//        document.getElementById("log").innerHTML = map_log_item + '</br>' + document.getElementById("log").innerHTML;
    });


///////////////////////////////////////////////////////////////////////  GET UPS    ///////////////////////////////////////////////////////////////////////
//
//    var upslistenerTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/pm/ups',
//        messageType : 'vitulus_ups/vitulus_ups'
//    });
//
//    upslistenerTopic.subscribe(function(message) {
////        var color_state = 'success';
////        if (message.battery_capacity < 40){
////            color_state = 'warning'
////        }
////        if (message.battery_capacity < 20){
////            color_state = 'danger'
////        }
//////        console.log(message);
////        document.getElementById("battery_capacity").textContent = message.battery_capacity + '%';
////        document.getElementById("battery_capacity").style.width = message.battery_capacity + '%';
////        document.getElementById("battery_capacity").ariaValueNow = message.battery_capacity;
////        document.getElementById("battery_capacity").ariaValueMin = 0;
////        document.getElementById("battery_capacity").ariaValueMax = 100;
////        document.getElementById("battery_state").textContent = message.battery_status;
////        document.getElementById("battery_tool").style.border = '1px solid var(--' + color_state +')';
////        document.getElementById("battery_tool_dot").style.color = 'var(--' + color_state +')';
////        document.getElementById("battery_capacity").className = 'progress-bar bg-' + color_state +'';
//
//        var ups_html_content = '';
//        ups_html_content += '<div>' + message.driver + '</div>';
//        ups_html_content += '<div>UPS status: ' + message.ups_status + '</div>';
//        ups_html_content += '<div>Battery status: ' + message.battery_status + '</div>';
//        ups_html_content += '<div>Battery voltage: ' + message.battery_voltage/1000 + 'V </div>';
//        ups_html_content += '<div>Battery current: ' + message.battery_current/1000 + 'A </div>';
//        ups_html_content += '<div>Battery capacity: ' + message.battery_capacity + '% </div>';
//        ups_html_content += '<div>Input voltage: ' + message.input_voltage/1000 + 'V </div>';
//        ups_html_content += '<div>Input current: ' + message.input_current/1000 + 'A </div>';
//        ups_html_content += '<div>Output voltage: ' + message.output_voltage/1000 + 'V </div>';
//        ups_html_content += '<div>Output current: ' + message.output_current/1000 + 'A </div>';
//        ups_html_content += '<div>Cell1 voltage: ' + message.cell1_voltage/1000 + 'V </div>';
//        ups_html_content += '<div>Cell2 voltage: ' + message.cell2_voltage/1000 + 'V </div>';
//        ups_html_content += '<div>Cell3 voltage: ' + message.cell3_voltage/1000 + 'V </div>';
//        ups_html_content += '<div>Cell4 voltage: ' + message.cell4_voltage/1000 + 'V </div>';
//        ups_html_content += '<div>Cell5 voltage: ' + message.cell5_voltage/1000 + 'V </div>';
//        ups_html_content += '<div>Cell6 voltage: ' + message.cell6_voltage/1000 + 'V </div>';
//        document.getElementById("ups_info").innerHTML = ups_html_content;
//
//
////        document.getElementById("log").innerHTML = map_log_item + '</br>' + document.getElementById("log").innerHTML;
//    });





///////////////////////////////////////////////////////////////////////  LIDAR ON/OFF    ///////////////////////////////////////////////////////////////////////


    function callStopLds() {
        var stopMotorClient = new ROSLIB.Service({
            ros : ros,
            name : '/stop_motor',
//            serviceType : 'std_srvs/Empty'
            serviceType : 'std_srvs/EmptyRequest'
        });

        var request = new ROSLIB.ServiceRequest({
        });

        stopMotorClient.callService(request, function(result) {
            console.log('Result for service call on ' + stopMotorClient.name + ': ' + result.sum);
        });
    }

    function callStartLds() {
        var startMotorClient = new ROSLIB.Service({
            ros : ros,
            name : '/start_motor',
            serviceType : 'std_srvs/EmptyRequest'
        });

        var request = new ROSLIB.ServiceRequest({
        });

        startMotorClient.callService(request, function(result) {
            console.log('Result for service call on ' + startMotorClient.name + ': ' + result.sum);
        });
    }

    document.getElementById('lidar_off_btn').onclick = function() {
        callStopLds();
    };

    document.getElementById('lidar_on_btn').onclick = function() {
        callStartLds();
    };


/////////////////////////////////////////////////////////////////////////  MOTORS TORQUE ON/OFF  DYNAMIXEL  ///////////////////////////////////////////////////////////////////////
//
//
//    var motorPowerTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/motor_power',
//        messageType : 'std_msgs/Bool'
//    });
//    motorPowerTopic.advertise();
//
//    var motor_power = new ROSLIB.Message({
//        data : true
//    });
//
//    document.getElementById('motors_on_btn').onclick = function() {
//        console.log('motON');
//        motor_power.data = true;
//        motorPowerTopic.publish(motor_power);
//    };
//    document.getElementById('motors_off_btn').onclick = function() {
//        console.log('motOFF');
//        motor_power.data = false;
//        motorPowerTopic.publish(motor_power);
//    };
//
//    var listenerSensor = new ROSLIB.Topic({
//        ros : ros,
//        name : '/sensor_state',
//        messageType : 'turtlebot3_msgs/SensorState'
//    });
//
//    var mot_torque = "init";
//    listenerSensor.subscribe(function(message) {
//        if (mot_torque != message.torque){
//            if (message.torque) {
//                document.getElementById("motors_tool_dot").style.color = 'var(--success)';
//                document.getElementById("motors_tool").style.border = '1px solid var(--success)';
//            } else {
//                document.getElementById("motors_tool_dot").style.color = 'var(--danger)';
//                document.getElementById("motors_tool").style.border = '1px solid var(--danger)';
//            };
//        };
//    });

///////////////////////////////////////////////////////////////////////  MOTORS TORQUE ON/OFF    ///////////////////////////////////////////////////////////////////////


    var motorPowerTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/base/motor_power',
        messageType : 'std_msgs/Bool'
    });
    motorPowerTopic.advertise();

    var motor_power = new ROSLIB.Message({
        data : false
    });

    // Motor switch on power module
    var pmMotorSwitchTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/set_motor_switch',
        messageType : 'std_msgs/Bool'
    });
    pmMotorSwitchTopic.advertise();

    var pmMotorSwitchMsg = new ROSLIB.Message({
        data : false
    });

//    function sleep(ms) {
//        return new Promise(resolve => setTimeout(resolve, ms));
//    }
    document.getElementById('motors_on_btn').onclick = function() {
        console.log('motON');
//        pmMotorSwitchMsg.data = true;
//        pmMotorSwitchTopic.publish(pmMotorSwitchMsg);
//        sleep(1000);
        motor_power.data = true;
        motorPowerTopic.publish(motor_power);

    };
    document.getElementById('motors_off_btn').onclick = function() {
        console.log('motOFF');
        motor_power.data = false;
        motorPowerTopic.publish(motor_power);
//        pmMotorSwitchMsg.data = false;
//        pmMotorSwitchTopic.publish(pmMotorSwitchMsg);
    };

    var listenerMotorPower = new ROSLIB.Topic({
        ros : ros,
        name : '/base/motor_power_state',
        messageType : 'std_msgs/Bool'
    });


    listenerMotorPower.subscribe(function(message) {
        if (message.data) {
            document.getElementById("motors_tool_dot").style.color = 'var(--success)';
            document.getElementById("motors_tool").style.border = '1px solid var(--success)';
        } else {
            document.getElementById("motors_tool_dot").style.color = 'var(--danger)';
            document.getElementById("motors_tool").style.border = '1px solid var(--danger)';
        };
    });



//////////////////////////////////////////////////////////////////////  EMERGENCY STOP   //////////////////////////////////////

    document.getElementById('stop_btn').onclick = function() {
        console.log('motOFF');
        motor_power.data = false;
        motorPowerTopic.publish(motor_power);
        console.log('Cancel goal.');
        var cancelGoalMsg = new ROSLIB.Message({
//            data : 'interactiveGoal',
        });
        cancelGoalTopic.publish(cancelGoalMsg);
    };


///////////////////////////////////////////////////////////////////////  PUBLISH SPEED    ///////////////////////////////////////////////////////////////////////

    var SpeedTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/speed',
        messageType : 'std_msgs/String'
    });
    SpeedTopic.advertise();

    function publishSpeed(name){
        var SpeedMsg = new ROSLIB.Message({
            data : name,
        });
        SpeedTopic.publish(SpeedMsg);
    }

    document.getElementById('speed_slow').onclick = function() {
        publishSpeed("SLOW");
    };

    document.getElementById('speed_medium').onclick = function() {
        publishSpeed("MEDIUM");
    };

    document.getElementById('speed_fast').onclick = function() {
        publishSpeed("FAST");
    };


///////////////////////////////////////////////////////////////////////  DIAGNOSTICS    ///////////////////////////////////////////////////////////////////////


    var listenerDiag = new ROSLIB.Topic({
        ros : ros,
        name : '/diagnostics',
        messageType : 'diagnostic_msgs/DiagnosticArray'
    });

    var diag_arr = [];
    listenerDiag.subscribe(function(message) {
//        console.log(message.header);
//        message.status.forEach(element => console.log(element));

        message.status.forEach(function(element){
            var contains_element = false;
            diag_arr.forEach(function(item){
                if (item.name == element.name){
                    item.message = element.message;
                    item.level = element.level;
                    contains_element = true;
                }
            });
            if (contains_element == false){
                diag_arr.push(element);
            };

        });
        var diag_html_content = '';
        diag_arr.forEach(function(item){
            var diag_html_item = '<div>';
            diag_html_item += '<span>' + item.name + ': </span> ';
            if (item.level == 0){ diag_html_item += '<span style="color: var(--success);">' + item.message + '</span>';};
            if (item.level == 1){ diag_html_item += '<span style="color: var(--warning);">' + item.message + '</span>';}
            if (item.level == 2){ diag_html_item += '<span style="color: var(--danger);">' + item.message + '</span>';}

            diag_html_item += '</div>';
            diag_html_content += diag_html_item;
        });
        document.getElementById("diag_content").innerHTML = diag_html_content;
//        console.log(diag_arr);
    });



///////////////////////////////////////////////////////////////////////  RTABMAP LOCALIZATION MAPPING    ///////////////////////////////////////////////////////////////////////


    function callRtabmapLocalization() {
        var rtabmapLocalizationClient = new ROSLIB.Service({
            ros : ros,
            name : '/rtabmap/set_mode_localization',
            serviceType : 'std_srvs/EmptyRequest'
        });

        var request = new ROSLIB.ServiceRequest({
        });

        rtabmapLocalizationClient.callService(request, function(result) {
            console.log('Result for service call on ' + rtabmapLocalizationClient.name + ': ' + result.sum);
        });
    }

    function callRtabmapMapping() {
        var rtabmapMappingClient = new ROSLIB.Service({
            ros : ros,
            name : '/rtabmap/set_mode_mapping',
            serviceType : 'std_srvs/EmptyRequest'
        });

        var request = new ROSLIB.ServiceRequest({
        });

        rtabmapMappingClient.callService(request, function(result) {
            console.log('Result for service call on ' + rtabmapMappingClient.name + ': ' + result.sum);
        });
    }

    document.getElementById('localization').onclick = function() {
        callRtabmapLocalization();
    };

    document.getElementById('mapping').onclick = function() {
        callRtabmapMapping();
    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////   MOWER      /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

    mower_height_slider_value = document.getElementById("mower_height_slider_value");
    mower_height_slider = document.getElementById("mower_height_slider");
    mower_current_height = document.getElementById("mower_current_height");
    var init_cut_height = true;
    mower_motor_rpm_slider_value = document.getElementById("mower_motor_rpm_slider_value");
    mower_motor_rpm_slider = document.getElementById("mower_motor_rpm_slider");
    mower_current_motor_rpm = document.getElementById("mower_current_motor_rpm");
    mower_motor_rpm_setpoint = document.getElementById("mower_motor_rpm_setpoint");
    var init_cut_rpm = true;
    mower_motor_start_btn = document.getElementById("mower_motor_start_btn");
    mower_motor_stop_btn = document.getElementById("mower_motor_stop_btn");
    mower_on_btn = document.getElementById("mower_on_btn");
    mower_off_btn = document.getElementById("mower_off_btn");
    mower_cali_btn = document.getElementById("mower_cali_btn");
    mower_home_btn = document.getElementById("mower_home_btn");
    mower_dir_right_btn = document.getElementById("mower_dir_right_btn");
    mower_dir_left_btn = document.getElementById("mower_dir_left_btn");
    mower_set_cmd_btn = document.getElementById("mower_set_cmd_btn");
    mower_cmd_input = document.getElementById("mower_cmd_input");
    mower_status_span = document.getElementById("mower_status");
    mower_direction_span = document.getElementById("mower_direction");


/////////////////////////////////////////////////  MOWER STATUS SUBSCRIBER  //////////////////////////////////////////////////////////////////////

    var listener_mower_status = new ROSLIB.Topic({
            ros : ros,
            name : '/mower/status',
            messageType : 'vitulus_msgs/Mower'
    });

    listener_mower_status.subscribe(function(message) {
        mower_status_span.textContent = message.status;
        mower_direction_span.textContent = message.moto_dir;
        mower_current_motor_rpm.textContent = message.moto_rpm;
        if (init_cut_height){
            mower_height_slider.value = message.current_height;
            mower_height_slider.max = message.max_height;
            mower_height_slider_value.textContent = message.current_height;
            init_cut_height = false;
        }
        mower_current_height.textContent = message.current_height;
        if (init_cut_rpm){
            mower_motor_rpm_slider.value = message.setpoint_rpm;
//            mower_motor_rpm_slider.max = message.max_height;
            mower_motor_rpm_slider_value.textContent = message.setpoint_rpm;
            init_cut_rpm = false;
        }

        mower_current_motor_rpm.textContent = message.moto_rpm;
        mower_motor_rpm_setpoint.textContent = message.setpoint_rpm;
    });

/////////////////////////////////////////////////  MOWER COMMAND PUBLISHER  //////////////////////////////////////////////////////////////////////


    var mower_set_cmdTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/mower/set_cmd',
        messageType : 'std_msgs/String'
    });
    mower_set_cmdTopic.advertise();

    mower_set_cmd_btn.onclick = function() {
        var mower_set_cmdMsg = new ROSLIB.Message({
            data : mower_cmd_input.value,
        });
        console.log("CMD SEND");
        mower_set_cmdTopic.publish(mower_set_cmdMsg);
    };
    mower_set_cmd2_btn.onclick = function() {
        var mower_set_cmd2Msg = new ROSLIB.Message({
            data : mower_cmd2_input.value,
        });
        console.log("CMD2 SEND");
        mower_set_cmdTopic.publish(mower_set_cmd2Msg);
    };

    mower_set_cmd3_btn.onclick = function() {
        var mower_set_cmd3Msg = new ROSLIB.Message({
            data : mower_cmd3_input.value,
        });
        console.log("CMD3 SEND");
        mower_set_cmdTopic.publish(mower_set_cmd3Msg);
    };

    mower_set_cmd4_btn.onclick = function() {
        var mower_set_cmd4Msg = new ROSLIB.Message({
            data : mower_cmd4_input.value,
        });
        console.log("CMD4 SEND");
        mower_set_cmdTopic.publish(mower_set_cmd4Msg);
    };


/////////////////////////////////////////////////  MOWER POWER PUBLISHER  //////////////////////////////////////////////////////////////////////


    var mower_set_powerTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/mower/set_power',
        messageType : 'std_msgs/Bool'
    });
    mower_set_powerTopic.advertise();

    mower_on_btn.onclick = function() {
        var mower_set_powerMsg = new ROSLIB.Message({
            data : true,
        });
        mower_set_powerTopic.publish(mower_set_powerMsg);
    };

    mower_off_btn.onclick = function() {
        var mower_set_powerMsg = new ROSLIB.Message({
            data : false,
        });
        mower_set_powerTopic.publish(mower_set_powerMsg);
    };

/////////////////////////////////////////////////  MOWER CALIBRATION PUBLISHER  //////////////////////////////////////////////////////////////////////


    var mower_set_caliTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/mower/set_calibrate',
        messageType : 'std_msgs/Bool'
    });
    mower_set_caliTopic.advertise();

    mower_cali_btn.onclick = function() {
        var mower_set_caliMsg = new ROSLIB.Message({
            data : true,
        });
        mower_set_caliTopic.publish(mower_set_caliMsg);
    };

/////////////////////////////////////////////////  MOWER HOME PUBLISHER  //////////////////////////////////////////////////////////////////////


    var mower_set_homeTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/mower/set_home',
        messageType : 'std_msgs/Bool'
    });
    mower_set_homeTopic.advertise();

    mower_home_btn.onclick = function() {
        var mower_set_homeMsg = new ROSLIB.Message({
            data : true,
        });
        mower_set_homeTopic.publish(mower_set_homeMsg);
    };

/////////////////////////////////////////////////  MOWER DIRECTION PUBLISHER  //////////////////////////////////////////////////////////////////////


    var mower_set_motor_dirTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/mower/set_motor_dir',
        messageType : 'std_msgs/String'
    });
    mower_set_motor_dirTopic.advertise();

    mower_dir_right_btn.onclick = function() {
        var mower_set_motor_dirMsg = new ROSLIB.Message({
            data : "RIGHT",
        });
        mower_set_motor_dirTopic.publish(mower_set_motor_dirMsg);
    };

    mower_dir_left_btn.onclick = function() {
        var mower_set_motor_dirMsg = new ROSLIB.Message({
            data : "LEFT",
        });
        mower_set_motor_dirTopic.publish(mower_set_motor_dirMsg);
    };



/////////////////////////////////////////////////  MOWER CUT HEIGHT PUBLISHER  //////////////////////////////////////////////////////////////////////


    var mower_set_heightTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/mower/set_cut_height',
        messageType : 'std_msgs/Int16'
    });
    mower_set_heightTopic.advertise();

    mower_height_slider.oninput = function() {
        mower_height_slider_value.textContent = mower_height_slider.value;
        var mower_set_heightMsg = new ROSLIB.Message({
            data : parseInt(mower_height_slider.value),
        });
        mower_set_heightTopic.publish(mower_set_heightMsg);

    };

/////////////////////////////////////////////////  MOWER MOTOR RPM PUBLISHER  //////////////////////////////////////////////////////////////////////


    var mower_set_rpmTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/mower/set_motor_rpm',
        messageType : 'std_msgs/Int16'
    });
    mower_set_rpmTopic.advertise();

    mower_motor_rpm_slider.oninput = function() {
        mower_motor_rpm_slider_value.textContent = mower_motor_rpm_slider.value;
        var mower_set_rpmMsg = new ROSLIB.Message({
            data : parseInt(mower_motor_rpm_slider.value),
        });
        mower_set_rpmTopic.publish(mower_set_rpmMsg);

    };




/////////////////////////////////////////////////  RPM PUBLISHER  //////////////////////////////////////////////////////////////////////


    var mower_set_rpmTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/mower/set_motor_rpm',
        messageType : 'std_msgs/Int32'
    });
    mower_set_rpmTopic.advertise();

    mower_motor_rpm_slider.oninput = function() {
        mower_motor_rpm_slider_value.textContent = mower_motor_rpm_slider.value;
        var mower_set_rpmMsg = new ROSLIB.Message({
            data : parseInt(mower_motor_rpm_slider.value),
        });
        mower_set_rpmTopic.publish(mower_set_rpmMsg);

    };


/////////////////////////////////////////////////  MOWER MOTOR PUBLISHER  //////////////////////////////////////////////////////////////////////


    var mower_set_motorTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/mower/set_motor_on',
        messageType : 'std_msgs/Bool'
    });
    mower_set_motorTopic.advertise();

    mower_motor_start_btn.onclick = function() {
        var mower_set_motorMsg = new ROSLIB.Message({
            data : true,
        });
        mower_set_motorTopic.publish(mower_set_motorMsg);
    };

    mower_motor_stop_btn.onclick = function() {
        var mower_set_motorMsg = new ROSLIB.Message({
            data : false,
        });
        mower_set_motorTopic.publish(mower_set_motorMsg);
    };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////   MOTORS INFO      /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////  FRONT LEFT MOTOR SUBSCRIBER  //////////////////////////////////////////////////////////////////////



    var listener_front_left_wheel_state = new ROSLIB.Topic({
            ros : ros,
            name : '/base/front_left_wheel_state',
            messageType : 'vitulus_msgs/Moteus_controller_state'
    });

    motor_1_fault = document.getElementById("motor_1_fault");
    motor_1_torque = document.getElementById("motor_1_torque");
    motor_1_temp = document.getElementById("motor_1_temp");
    motor_1_vel = document.getElementById("motor_1_vel");
    motor_1_pos = document.getElementById("motor_1_pos");
    motor_1_volts = document.getElementById("motor_1_volts");
    motor_1_mode = document.getElementById("motor_1_mode");
    motor_1_id = document.getElementById("motor_1_id");

    listener_front_left_wheel_state.subscribe(function(message) {
        motor_1_fault.textContent = message.fault;
        motor_1_torque.textContent = message.torque.toFixed(2);
        motor_1_temp.textContent = message.temperature;
        motor_1_vel.textContent = message.velocity.toFixed(2);
        motor_1_pos.textContent = message.position.toFixed(2);
        motor_1_volts.textContent = message.voltage;
        motor_1_mode.textContent = message.mode;
        motor_1_id.textContent = message.id;
    });

/////////////////////////////////////////////////  FRONT RIGHT MOTOR SUBSCRIBER  //////////////////////////////////////////////////////////////////////

    var listener_front_right_wheel_state = new ROSLIB.Topic({
            ros : ros,
            name : '/base/front_right_wheel_state',
            messageType : 'vitulus_msgs/Moteus_controller_state'
    });

    motor_2_fault = document.getElementById("motor_2_fault");
    motor_2_torque = document.getElementById("motor_2_torque");
    motor_2_temp = document.getElementById("motor_2_temp");
    motor_2_vel = document.getElementById("motor_2_vel");
    motor_2_pos = document.getElementById("motor_2_pos");
    motor_2_volts = document.getElementById("motor_2_volts");
    motor_2_mode = document.getElementById("motor_2_mode");
    motor_2_id = document.getElementById("motor_2_id");

    listener_front_right_wheel_state.subscribe(function(message) {
        motor_2_fault.textContent = message.fault;
        motor_2_torque.textContent = message.torque.toFixed(2);
        motor_2_temp.textContent = message.temperature;
        motor_2_vel.textContent = message.velocity.toFixed(2);
        motor_2_pos.textContent = message.position.toFixed(2);
        motor_2_volts.textContent = message.voltage;
        motor_2_mode.textContent = message.mode;
        motor_2_id.textContent = message.id;
    });

/////////////////////////////////////////////////  REAR LEFT MOTOR SUBSCRIBER  //////////////////////////////////////////////////////////////////////

    var listener_rear_left_wheel_state = new ROSLIB.Topic({
            ros : ros,
            name : '/base/rear_left_wheel_state',
            messageType : 'vitulus_msgs/Moteus_controller_state'
    });

    motor_3_fault = document.getElementById("motor_3_fault");
    motor_3_torque = document.getElementById("motor_3_torque");
    motor_3_temp = document.getElementById("motor_3_temp");
    motor_3_vel = document.getElementById("motor_3_vel");
    motor_3_pos = document.getElementById("motor_3_pos");
    motor_3_volts = document.getElementById("motor_3_volts");
    motor_3_mode = document.getElementById("motor_3_mode");
    motor_3_id = document.getElementById("motor_3_id");

    listener_rear_left_wheel_state.subscribe(function(message) {
        motor_3_fault.textContent = message.fault;
        motor_3_torque.textContent = message.torque.toFixed(2);
        motor_3_temp.textContent = message.temperature;
        motor_3_vel.textContent = message.velocity.toFixed(2);
        motor_3_pos.textContent = message.position.toFixed(2);
        motor_3_volts.textContent = message.voltage;
        motor_3_mode.textContent = message.mode;
        motor_3_id.textContent = message.id;
    });

    /////////////////////////////////////////////////  REAR LEFT MOTOR SUBSCRIBER  //////////////////////////////////////////////////////////////////////

    var listener_rear_right_wheel_state = new ROSLIB.Topic({
            ros : ros,
            name : '/base/rear_right_wheel_state',
            messageType : 'vitulus_msgs/Moteus_controller_state'
    });

    motor_4_fault = document.getElementById("motor_4_fault");
    motor_4_torque = document.getElementById("motor_4_torque");
    motor_4_temp = document.getElementById("motor_4_temp");
    motor_4_vel = document.getElementById("motor_4_vel");
    motor_4_pos = document.getElementById("motor_4_pos");
    motor_4_volts = document.getElementById("motor_4_volts");
    motor_4_mode = document.getElementById("motor_4_mode");
    motor_4_id = document.getElementById("motor_4_id");

    listener_rear_right_wheel_state.subscribe(function(message) {
        motor_4_fault.textContent = message.fault;
        motor_4_torque.textContent = message.torque.toFixed(2);
        motor_4_temp.textContent = message.temperature;
        motor_4_vel.textContent = message.velocity.toFixed(2);
        motor_4_pos.textContent = message.position.toFixed(2);
        motor_4_volts.textContent = message.voltage;
        motor_4_mode.textContent = message.mode;
        motor_4_id.textContent = message.id;
    });

/////////////////////////////////////////////////////  MOTOR TORQUE  /////////////////////////////////////////////////

    //// get
    var listener_get_torque_set = new ROSLIB.Topic({
            ros : ros,
            name : '/base/get_torque_set',
            messageType : 'std_msgs/Float32'
    });

    listener_get_torque_set.subscribe(function(message) {
        running_torque = document.getElementById("running_torque");
        running_torque.textContent = message.data.toFixed(2) + " Nm";
    });

    //// set
    var pub_base_set_torqueTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/base/set_torque',
        messageType : 'std_msgs/Float32'
    });
    pub_base_set_torqueTopic.advertise();

    torque_input = document.getElementById("torque_input");
    set_torque_btn = document.getElementById("set_torque_btn");

    set_torque_btn.onclick = function() {
        var base_set_torqueMsg = new ROSLIB.Message({
            data : parseFloat(torque_input.value),
        });
        pub_base_set_torqueTopic.publish(base_set_torqueMsg);
    };

    gridClient.currentGrid.visible = false;
    gridClient.unsubscribe();
    gridClientRtabmap.currentGrid.visible = true;
    gridClientRtabmap.subscribe();

} /// end of on.load()




