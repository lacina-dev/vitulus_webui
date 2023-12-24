
window.onload = function() {

    console.log("START");
    var ros;
    ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});

    let active_map_file_name = "";


    // 2D view  ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var viewer;
    var gridClient;
    var wait_for_map = true;
    var width = 700;
    var height = 700;
    scale_plus_btn = document.getElementById("scale_plus");
    scale_minus_btn = document.getElementById("scale_minus");
    div_map = document.getElementById("map");
    div_map_frame = document.getElementById("map_frame");
    div_map_width = div_map.offsetWidth;
    div_map_height = div_map.offsetHeight;
    var initiate = true;
    // console.log(div_map_width);
    // console.log(div_map_height);

    // Create the main viewer.
    viewer = new ROS2D.Viewer({
      divID : 'map',
      width : div_map_width,
      height : div_map_height,
      background: '#232f37'
    });

    // Add zoom to the viewer.
    zoomView = new ROS2D.ZoomView({
        rootObject : viewer.scene
    });
    // Add panning to the viewer.
    panView = new ROS2D.PanView({
        rootObject : viewer.scene
    });

    // Grid client.
    gridClient = new ROS2D.OccupancyGridClient({
      ros : ros,
      topic: '/web_plan/map_show',
      rootObject : viewer.scene,
      continuous: true
    });

    // Add coverage path
    var coveragePath = new ROS2D.PathShape({
        // ros : ros,
        // rootObject : viewer.scene,
        strokeSize : 0.03,
        strokeColor : createjs.Graphics.getRGB(255, 0, 0),
    });
    gridClient.rootObject.addChild(coveragePath);


    // Grid client on change
    gridClient.on('change', function() {
        if (initiate){
            resize();
            initiate = false;
        }
    });

    function resize() {
        // console.log("RESIZE");
        div_map_width = div_map.offsetWidth;
        div_map_height = div_map.offsetHeight;
        viewer.width = div_map_width;
        viewer.height = div_map_height;
        viewer.scene.canvas.width = div_map_width;
        viewer.scene.canvas.height = div_map_height;
        if (initiate) {
            panView.startPan(viewer.scene.x, viewer.scene.y);
            panView.pan(div_map_width/2, div_map_height/2);
            zoomView.startZoom(div_map_width/2, div_map_height/2);
            zoomView.zoom(40);
            initiate = false;
        }
    }


    window.addEventListener('resize', function(event){
        resize();
    });


    // Polygons ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var polygon_enabled = false
    var clickedPolygon = false;
    var selectedPointIndex = null;
    // Callback functions when there is mouse interaction with the polygon
    var pointCallBack = function(type, event, index) {
        if (polygon_enabled == false){
          if (type === 'mousedown') {
            if (event.nativeEvent.shiftKey === true) {
              polygon.remPoint(index);
            }
            else {
              selectedPointIndex = index;
            }
          }
          clickedPolygon = true;
        }
    };

    var lineCallBack = function(type, event, index) {
      if (type === 'mousedown') {
        if (event.nativeEvent.shiftKey === true) {
          polygon.splitLine(index);
        }
      }
      clickedPolygon = true;
    }

    // Create the polygon
    var polygon = new ROS2D.PolygonMarker({
      lineColor : createjs.Graphics.getRGB(100, 100, 255, 1),
      pointSize : 0.2,
      lineSize : 0.1,
      pointCallBack : pointCallBack,
      lineCallBack : lineCallBack
    });

    // Add the polygon to the viewer
    viewer.scene.addChild(polygon);
    viewer.scene.removeChild(polygon);

    // Event listeners for mouse interaction with the stage
    viewer.scene.mouseMoveOutside = false; // doesn't seem to work

    function registerMouseHandlers() {
        // Setup mouse event handlers
			var mouseDown = false;
			var zoomKey = false;
			var panKey = false;
			var startPos = new ROSLIB.Vector3();

        viewer.scene.addEventListener('stagemousedown', function(event) {
            if (event.nativeEvent.altKey === true) {
                zoomKey = true;
                zoomView.startZoom(event.stageX, event.stageY);
            }
            else if (event.nativeEvent.ctrlKey === true) {
                panKey = true;
                panView.startPan(event.stageX, event.stageY);
            }
            startPos.x = event.stageX;
            startPos.y = event.stageY;
            mouseDown = true;
        });

        viewer.scene.addEventListener('stagemousemove', function(event) {
          // Move point when it's dragged
          if (selectedPointIndex !== null) {
            var pos = viewer.scene.globalToRos(event.stageX, event.stageY);
            polygon.movePoint(selectedPointIndex, pos);

          } else {
              if (mouseDown === true) {
					if (zoomKey === true) {
						var dy = event.stageY - startPos.y;
						var zoom = 1 + 10*Math.abs(dy) / viewer.scene.canvas.clientHeight;
						if (dy < 0)
							zoom = 1 / zoom;
						zoomView.zoom(zoom);
					}
					else if (panKey === true) {
						panView.pan(event.stageX, event.stageY);
                        // console.log("viewer.scene.children[0].x: " + viewer.scene.children[0].x + " viewer.scene.children[0].y: " + viewer.scene.children[0].y);
                        // console.log("wiever.scene.x: " + viewer.scene.x + " viewer.scene.y: " + viewer.scene.y);
					}
				}
          }
        });

        viewer.scene.addEventListener('stagemouseup', function(event) {
          // Add point when not clicked on the polygon
          //   console.log("zoomKey: " + zoomKey + " panKey: " + panKey + " mouseDown: " + mouseDown + " clickedPolygon: " + clickedPolygon + " selectedPointIndex: " + selectedPointIndex + " mouseInBounds: " + viewer.scene.mouseInBounds);
          if (selectedPointIndex !== null) {
            selectedPointIndex = null;
            if (mouseDown === true) {
					if (zoomKey === true) {
						zoomKey = false;
					}
					else if (panKey === true) {
						panKey = false;
					}
					mouseDown = false;
				}
          }
          else if (viewer.scene.mouseInBounds === true && clickedPolygon === false && zoomKey === false && panKey === false) {
            var pos = viewer.scene.globalToRos(event.stageX, event.stageY);
            polygon.addPoint(pos);
            // console.log("point added");
          } else {
              if (mouseDown === true) {
					if (zoomKey === true) {
						zoomKey = false;
					}
					else if (panKey === true) {
						panKey = false;
					}
					mouseDown = false;
				}
          }
          clickedPolygon = false;
        });
    }

    registerMouseHandlers();


    // Map tools ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Map edit log
    var div_log = document.getElementById("div_log")
    var logTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/web_plan/log',
        messageType: 'std_msgs/String'
    });
    logTopic.subscribe(function (message) {
        // console.log("MapEdit log:" + message.data);
        div_log.textContent = message.data;
    });

    input_obstacle_margin = document.getElementById("input_obstacle_margin");
    input_fill_free = document.getElementById("input_fill_free");
    input_fill_shape = document.getElementById("input_fill_shape");
    btn_assemble_map = document.getElementById("btn_assemble_map");


    // get map data
    function get_map_data() {
        var topic_map_data = new ROSLIB.Topic({
            ros: ros,
            name: '/web_plan/map_data',
            messageType: 'vitulus_msgs/MapEditMap'
        });
        topic_map_data.subscribe(function (message) {
            input_obstacle_margin.value = message.margin;
            input_fill_free.value = message.fill;
            input_fill_shape.value = message.shape;
        });
    }
    get_map_data();

    // assembly map
    function assemble_map() {
        var topic_assemble_map = new ROSLIB.Topic({
            ros: ros,
            name: '/web_plan/assemble_map',
            messageType: 'vitulus_msgs/MapEditMap'
        });
        topic_assemble_map.advertise();

        btn_assemble_map.onclick = function () {
            var msg = new ROSLIB.Message({
                // data : parseInt(input_draw_coverage.value),
                name: "",
                fill: parseInt(input_fill_free.value),
                margin: parseFloat(input_obstacle_margin.value),
                shape: input_fill_shape.value,
            });
            // console.log(msg)
            topic_assemble_map.publish(msg);
        };
    };
    assemble_map();


    // Map show ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function show_map() {
        var topic_show_fill_map = new ROSLIB.Topic({
            ros: ros,
            name: '/web_plan/show_map_layer',
            messageType: 'std_msgs/String'
        });
        topic_show_fill_map.advertise();

        // show free fill
        btn_show_fill = document.getElementById("btn_show_fill");
        btn_show_fill.onclick = function () {
            var msg = new ROSLIB.Message({
                data: "filled",
            });
            topic_show_fill_map.publish(msg);
        }

        // show free poly
        btn_show_free_poly = document.getElementById("btn_show_free_poly");
        btn_show_free_poly.onclick = function () {
            var msg = new ROSLIB.Message({
                data: "free_poly",
            });
            topic_show_fill_map.publish(msg);
        }

        // show obstacle poly
        btn_show_obstacles_poly = document.getElementById("btn_show_obstacles_poly");
        btn_show_obstacles_poly.onclick = function () {
            var msg = new ROSLIB.Message({
                data: "obstacles_poly",
            });
            topic_show_fill_map.publish(msg);
        }

        // show assembled_lite
        btn_show_assembled_lite = document.getElementById("btn_show_assembled_lite");
        btn_show_assembled_lite.onclick = function () {
            var msg = new ROSLIB.Message({
                data: "assembled_lite",
            });
            topic_show_fill_map.publish(msg);
        }

        // show original
        btn_show_original = document.getElementById("btn_show_original");
        btn_show_original.onclick = function () {
            var msg = new ROSLIB.Message({
                data: "original",
            });
            topic_show_fill_map.publish(msg);
        }

        // show assembled
        btn_show_assembled = document.getElementById("btn_show_assembled");
        btn_show_assembled.onclick = function () {
            var msg = new ROSLIB.Message({
                data: "assembled",
            });
            topic_show_fill_map.publish(msg);
        }

        // show zone map
        btn_show_zone_map = document.getElementById("btn_show_zone_map");
        btn_show_zone_map.onclick = function () {
            var msg = new ROSLIB.Message({
                data: "zone_map",
            });
            topic_show_fill_map.publish(msg);
        }

        // show zone_border_path map
        btn_show_zone_border_path = document.getElementById("btn_show_zone_border_path");
        btn_show_zone_border_path.onclick = function () {
            var msg = new ROSLIB.Message({
                data: "zone_border_path",
            });
            topic_show_fill_map.publish(msg);
        }

        // show zone_navi map
        btn_show_zone_navi = document.getElementById("btn_show_zone_navi");
        btn_show_zone_navi.onclick = function () {
            var msg = new ROSLIB.Message({
                data: "zone_navi",
            });
            topic_show_fill_map.publish(msg);
        }

    }
    show_map();


    // Polygons  ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function map_polygons() {

        // Polygon elements
        var input_poly_template_name = document.getElementById("input_poly_template_name");
        var input_poly_template_type = document.getElementById("input_poly_template_type");
        var div_poly_list = document.getElementById("div_poly_list");
        div_poly_list.innerHTML = '';
        var btn_new_poly = document.getElementById("btn_new_poly");
        var btn_poly_template_save = document.getElementById("btn_poly_template_save");
        var btn_poly_template_cancel = document.getElementById("btn_poly_template_cancel");
        var div_poly_template = document.getElementById("div_poly_template");
        var div_poly_template_style_attr = div_poly_template.getAttribute('style');
        div_poly_template.setAttribute('style', div_poly_template_style_attr + 'display:none !important');

        // New polygon
        btn_new_poly.onclick = function() {
            div_poly_template.setAttribute('style', div_poly_template_style_attr + 'display:flex');
            viewer.scene.addChild(polygon);
        }

        // Cancel polygon
        btn_poly_template_cancel.onclick = function() {
            div_poly_template.setAttribute('style', div_poly_template_style_attr + 'display:none !important');
            viewer.scene.removeChild(polygon);
            polygon.pointContainer.children = [];
            polygon.lineContainer.children = [];
            polygon.fillShape.graphics._instructions = [];
            polygon.fillShape.graphics._oldInstructions = [];
        }

        // Save polygon
        var topic_save_poly = new ROSLIB.Topic({
                ros : ros,
                name : '/web_plan/save_polygon',
                messageType : 'vitulus_msgs/MapEditPolygon'
        });
        topic_save_poly.advertise();

        btn_poly_template_save.onclick = function() {
            // console.log(polygon.pointContainer.children.length);
            if (polygon.pointContainer.children.length > 0){
                var points = [];
                for (i in polygon.pointContainer.children){
                    points.push({x: polygon.pointContainer.children[i].x, y: polygon.pointContainer.children[i].y * -1});
                }
                // console.log(points);
                var msgPoly = new ROSLIB.Message({
                    header : {
                        frame_id : "map"
                    },
                    polygon : {
                        points : points
                    }
                });
                // console.log(msgPoly);
                var msg = new ROSLIB.Message({
                    header : {
                        frame_id : "map"
                    },
                    name: input_poly_template_name.value,
                    area: 0,
                    type: input_poly_template_type.value,
                    polygon : msgPoly
                });
                topic_save_poly.publish(msg);
                // console.log(msg);

                // clean up
                div_poly_template.setAttribute('style', div_poly_template_style_attr + 'display:none !important');
                viewer.scene.removeChild(polygon);
                polygon.pointContainer.children = [];
                polygon.lineContainer.children = [];
                polygon.fillShape.graphics._instructions = [];
                polygon.fillShape.graphics._oldInstructions = [];
            }else{
                div_log.textContent = "Draw the polygon on the map!";
            }
        }

        // Remove polygon from list by name
        var topic_remove_poly = new ROSLIB.Topic({
            ros : ros,
            name : '/web_plan/remove_polygon',
            messageType : 'std_msgs/String'
        });
        topic_remove_poly.advertise();

        this.removePoly = function(poly_name){
            let msg = new ROSLIB.Message({
                data : poly_name,
            });
            topic_remove_poly.publish(msg);
        }

        // Edit polygon from list by name
        this.editPoly = function(poly_name){
            for (let i in current_poly_list){
                if (current_poly_list[i].name === poly_name){
                    let poly = current_poly_list[i];
                    // console.log(poly);
                    div_poly_template.setAttribute('style', div_poly_template_style_attr + 'display:flex');
                    viewer.scene.removeChild(polygon);
                    polygon.pointContainer.children = [];
                    polygon.lineContainer.children = [];
                    polygon.fillShape.graphics._instructions = [];
                    polygon.fillShape.graphics._oldInstructions = [];
                    viewer.scene.addChild(polygon);
                    for (let point in poly.polygon.polygon.points){
                        // console.log("Point:");
                        // console.log(poly.polygon.polygon.points[point]);
                        polygon.addPoint(poly.polygon.polygon.points[point]);
                    }
                    input_poly_template_name.value = poly.name;
                    input_poly_template_type.value = poly.type;
                }
            }
        }

        // load polygon list
        var polyListTopic = new ROSLIB.Topic({
            ros : ros,
            name : '/web_plan/polygon_list',
            messageType : 'vitulus_msgs/MapEditPolygonList'
        });

        var current_poly_list = [];
        polyListTopic.subscribe(function(message) {
            current_poly_list = message.polygon_list;
            var html_poly_list ='';
            for (let poly in message.polygon_list){
                let poly_name = message.polygon_list[poly].name;
                let poly_type = message.polygon_list[poly].type;
                html_poly_list += `
                    <div id="div_poly" class="d-flex align-items-center" style="border-bottom: 1px solid #444444;padding-right: 2px;padding-left: 6px;padding-bottom: 2px;padding-top: 2px;">
                        <div class="d-flex">
                            <span id="span_poly_name" style="margin-right: 6px;width: 155px;font-size: 13.2px;">
                                ${poly_name}
                            </span>
                            <span id="span_poly_type" class="text-nowrap" style="margin-right: 12px;font-size: 13.2px;">
                                ${poly_type}
                            </span>
                        </div>
                        <div class="btn-group btn-group-sm d-flex ms-auto" role="group">
                            <button id="btn_poly_edit" class="btn btn-outline-info d-inline-flex btn-sm-s" type="button" onclick="editPoly(&#39;${poly_name}&#39;)">Edit</button>
                            <button id="btn_poly_remove" class="btn btn-outline-danger d-inline-flex btn-sm-s" type="button" onclick="removePoly(&#39;${poly_name}&#39;)">Remove</button>
                        </div>
                    </div>
    `;
                div_poly_list.innerHTML = html_poly_list;
            }
            if (message.polygon_list.length == 0){
                div_poly_list.innerHTML = "";
            }
        });
        }
    map_polygons();


    // Zones     ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Zone elements
    var input_zone_template_name = document.getElementById("input_zone_template_name");
    var input_zone_template_cut_height = document.getElementById("input_zone_template_cut_height");
    var input_zone_template_rpm = document.getElementById("input_zone_template_rpm");
    var input_zone_template_border_path = document.getElementById("input_zone_template_border_path");
    var input_zone_template_coverage_path = document.getElementById("input_zone_template_coverage_path");
    var input_zone_template_path_distance = document.getElementById("input_zone_template_path_distance");
    var input_zone_template_simplify = document.getElementById("input_zone_template_simplify");
    var btn_new_zone = document.getElementById("btn_new_zone");
    var btn_zone_template_save = document.getElementById("btn_zone_template_save");
    var btn_zone_template_cancel = document.getElementById("btn_zone_template_cancel");
    var div_zone_template = document.getElementById("div_zone_template");
    var header_zone_template_coverage_path = document.getElementById("header_zone_template_coverage_path");
    var header_zone_template_border_path = document.getElementById("header_zone_template_border_path");
    var header_zone_template_path_list = document.getElementById("header_zone_template_path_list");
    var div_zone_list = document.getElementById("div_zone_list");

    // Init zone template
    var zone_template_style_attr = div_zone_template.getAttribute('style');
    var header_zone_template_coverage_path_style_attr = header_zone_template_coverage_path.getAttribute('style');
    var header_zone_template_border_path_style_attr = header_zone_template_border_path.getAttribute('style');
    div_zone_template.setAttribute('style', 'display:none !important');
    div_zone_list.innerHTML = "";
    var current_zone = null;


    // Zone ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // New zone
    btn_new_zone.onclick = function () {
        div_zone_template.setAttribute('style', zone_template_style_attr);
        input_zone_template_name.value = "Zone";
        input_zone_template_rpm.value = 3300;
        input_zone_template_cut_height.value = 45;
        input_zone_template_border_path.value = 2;
        input_zone_template_coverage_path.value = 160;
        input_zone_template_path_distance.value = 0.2;
        input_zone_template_simplify.value = 0.1;
        polygon.pointContainer.children = [];
        polygon.lineContainer.children = [];
        polygon.fillShape.graphics._instructions = [];
        polygon.fillShape.graphics._oldInstructions = [];
        viewer.scene.addChild(polygon);
    }

    // Selected zone topic
    var topic_selected_zone = new ROSLIB.Topic({
        ros: ros,
        name: '/web_plan/selected_zone',
        messageType: 'std_msgs/String'
    });
    topic_selected_zone.advertise();

    // Cancel zone
    btn_zone_template_cancel.onclick = function () {
        div_zone_template.setAttribute('style', 'display:none !important');
        viewer.scene.removeChild(polygon);
        polygon.pointContainer.children = [];
        polygon.lineContainer.children = [];
        polygon.fillShape.graphics._instructions = [];
        polygon.fillShape.graphics._oldInstructions = [];
        let msg = new ROSLIB.Message({
            data: "cancel**cancel**"
        });
        topic_selected_zone.publish(msg);
    }

    // Save zone topic
    var topic_save_zone = new ROSLIB.Topic({
        ros: ros,
        name: '/web_plan/save_zone',
        messageType: 'vitulus_msgs/MapEditZone'
    });
    topic_save_zone.advertise();

    // Save zone
    btn_zone_template_save.onclick = function () {
        // console.log(polygon.pointContainer.children.length);
        if (polygon.pointContainer.children.length > 0) {
            var points = [];
            for (i in polygon.pointContainer.children) {
                points.push({
                    x: polygon.pointContainer.children[i].x,
                    y: polygon.pointContainer.children[i].y * -1
                });
            }
            // console.log(points);
            var msgPoly = new ROSLIB.Message({
                header: {
                    frame_id: "map"
                },
                polygon: {
                    points: points
                }
            });
            // console.log(msgPoly);
            var msg = new ROSLIB.Message({
                header: {
                    frame_id: "map"
                },
                name: input_zone_template_name.value,
                area: 0,
                type: 'normal',
                cut_height: parseInt(input_zone_template_cut_height.value),
                rpm: parseInt(input_zone_template_rpm.value),
                border_paths: parseInt(input_zone_template_border_path.value),
                coverage_angle: parseInt(input_zone_template_coverage_path.value),
                paths_distance: parseFloat(input_zone_template_path_distance.value),
                simplify: parseFloat(input_zone_template_simplify.value),
                polygon: msgPoly,
                paths: []
            });
            topic_save_zone.publish(msg);
            // console.log(msg);

            // clean up
            div_zone_template.setAttribute('style', 'display:none !important');
            viewer.scene.removeChild(polygon);
            polygon.pointContainer.children = [];
            polygon.lineContainer.children = [];
            polygon.fillShape.graphics._instructions = [];
            polygon.fillShape.graphics._oldInstructions = [];
        } else {
            div_log.textContent = "Draw the polygon on the map!";
        }
    }

    // Get zone list
    var zoneListTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/web_plan/zone_list',
        messageType: 'vitulus_msgs/MapEditZoneList'
    });

    var current_zone_list = [];
    zoneListTopic.subscribe(function (message) {
        // console.log("Zone list:");
        current_zone_list = message.zone_list;
        var html_zone_list = '';
        for (let zone in message.zone_list) {
            // console.log(message.zone_list[zone]);
            let zone_name = message.zone_list[zone].name;
            let zone_type = message.zone_list[zone].type;
            let zone_area = message.zone_list[zone].area;
            let zone_height = message.zone_list[zone].cut_height;
            let zone_rpm = message.zone_list[zone].rpm;
            html_zone_list += `
                <div id="div_zone" class="d-flex align-items-center" style="border-bottom: 1px solid #444444;padding-right: 4px;padding-left: 6px;padding-bottom: 2px;padding-top: 2px;">
                    <div class="d-flex"><span id="span_zone_name" style="margin-right: 6px;width: 155px;font-size: 13.2px;">${zone_name}</span><span id="span_zone_height" class="text-nowrap" style="margin-right: 12px;font-size: 13.2px;overflow: hidden;width: 45px;">${zone_height} mm</span><span id="span_zone_rpm" class="text-nowrap" style="margin-right: 12px;font-size: 13.2px;overflow: hidden;width: 62px;">${zone_rpm} rpm</span><span id="span_zone_area" class="text-nowrap" style="margin-right: 12px;font-size: 13.2px;overflow: hidden;width: 62px;">${zone_area} m2</span></div>
                    <div class="btn-group btn-group-sm d-flex ms-auto" role="group"><button id="btn_zone_edit" class="btn btn-outline-info d-inline-flex btn-sm-s" type="button" onclick="editZone(&#39;${zone_name}&#39;)">Edit</button><button id="btn_zone_remove" class="btn btn-outline-danger d-inline-flex btn-sm-s" type="button" onclick="removeZone(&#39;${zone_name}&#39;)">Remove</button></div>
                </div>
            `;
            div_zone_list.innerHTML = html_zone_list;
        }
        if (message.zone_list.length === 0) {
            div_zone_list.innerHTML = "";
        }
    });


    // Edit zone from list by name
    this.editZone = function (zone_name) {
        for (let i in current_zone_list) {
            if (current_zone_list[i].name === zone_name) {
                let zone = current_zone_list[i];
                // console.log(zone);
                div_zone_template.setAttribute('style', zone_template_style_attr);
                viewer.scene.removeChild(polygon);
                polygon.pointContainer.children = [];
                polygon.lineContainer.children = [];
                polygon.fillShape.graphics._instructions = [];
                polygon.fillShape.graphics._oldInstructions = [];
                viewer.scene.addChild(polygon);
                for (let point in zone.polygon.polygon.points) {
                    // console.log("Point:");
                    // console.log(zone.polygon.polygon.points[point]);
                    polygon.addPoint(zone.polygon.polygon.points[point]);
                }
                input_zone_template_name.value = zone.name;
                input_zone_template_rpm.value = zone.rpm;
                input_zone_template_cut_height.value = zone.cut_height;
                input_zone_template_border_path.value = zone.border_paths;
                input_zone_template_coverage_path.value = zone.coverage_angle;
                input_zone_template_path_distance.value = zone.paths_distance;
                let msg = new ROSLIB.Message({
                    data: zone_name
                });
                topic_selected_zone.publish(msg);
            }
        }
    }

    // Remove zone from list by name
    var topic_remove_zone = new ROSLIB.Topic({
        ros: ros,
        name: '/web_plan/remove_zone',
        messageType: 'std_msgs/String'
    });
    topic_remove_zone.advertise();

    this.removeZone = function (zone_name) {
        let msg = new ROSLIB.Message({
            data: zone_name,
        });
        topic_remove_zone.publish(msg);
    }



    // Programs     ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Program elements
    var div_program_template = document.getElementById("div_program_template");
    var div_program_list = document.getElementById("div_program_list");
    var btn_program_new = document.getElementById("btn_program_new");
    var input_program_add_zone = document.getElementById("input_program_add_zone");
    var btn_program_add_zone = document.getElementById("btn_program_add_zone");
    var btn_program_template_save = document.getElementById("btn_program_template_save");
    var input_program_template_name = document.getElementById("input_program_template_name");
    var span_program_template_zones = document.getElementById("span_program_template_zones");
    var btn_program_template_cancel = document.getElementById("btn_program_template_cancel");

    // Init program template
    var program_template_style_attr = div_program_template.getAttribute('style');
    div_program_template.setAttribute('style', 'display:none !important');
    div_program_list.innerHTML = "";
    let selected_program_msg = new ROSLIB.Message({});

    // New program template show in initial state
    btn_program_new.onclick = function () {
        div_program_template.setAttribute('style', 'display:block !important');
        input_program_add_zone.innerHTML = '';
        for (let i in current_zone_list) {
            var option = document.createElement("option");
            option.value = i;
            option.innerHTML = current_zone_list[i].name;
            input_program_add_zone.appendChild(option);
        }
        selected_program_msg = new ROSLIB.Message({
            area: 0,
            fri: false,
            last_duration_minutes: 0,
            last_result: "",
            length: 0,
            map_name: "",
            mon: false,
            name: "",
            sat: false,
            start_hour: 0,
            start_minute: 0,
            sun: false,
            thu: false,
            tue: false,
            wed: false,
            zone_list: [],
        });
        span_program_template_zones.innerHTML = "";
    }

    // Add selected zone to program
    btn_program_add_zone.onclick = function () {
        console.log("Add zone to program");
        selected_program_msg.zone_list.push(current_zone_list[input_program_add_zone.value]);
        zones_el = "";
        for (let i in selected_program_msg.zone_list) {
            // console.log(selected_program_msg.zone_list[i]);
            const zone_name = selected_program_msg.zone_list[i].name;
            zones_el += `
                <span style="background: var(--bs-gray-dark);padding: 2px;border-radius: 5px;padding-right: 4px;padding-left: 4px;margin-left: 2px;"><span style="margin-right: 3px;"><i class="fa fa-remove text-danger" onclick="removeProgramTemplateZone(&#39;${zone_name}&#39;)"></i></span><span>${zone_name}</span></span>
            `;
        }
        span_program_template_zones.innerHTML = zones_el;
        // console.log(selected_program_msg);
    }

    // Remove zone from program template
    this.removeProgramTemplateZone = function (zone_name) {
        console.log("Remove zone from program template");
        for (let i in selected_program_msg.zone_list) {
            if (selected_program_msg.zone_list[i].name === zone_name) {
                selected_program_msg.zone_list.splice(i, 1);
            }
        }
        zones = "";
        for (let i in selected_program_msg.zone_list) {
            // console.log(selected_program_msg.zone_list[i]);
            const zone_name = selected_program_msg.zone_list[i].name;
            zones += `
                <span style="background: var(--bs-gray-dark);padding: 2px;border-radius: 5px;padding-right: 4px;padding-left: 4px;margin-left: 2px;"><span style="margin-right: 3px;"><i class="fa fa-remove text-danger" onclick="removeProgramTemplateZone(&#39;${zone_name}&#39;)"></i></span><span>${zone_name}</span></span>
            `;
        }
        span_program_template_zones.innerHTML = zones;
        // console.log(selected_program_msg);
    }

    // Cancel program template
    btn_program_template_cancel.onclick = function () {
        div_program_template.setAttribute('style', 'display:none !important');
        input_program_template_name.value = "";
        selected_program_msg = new ROSLIB.Message({});
        span_program_template_zones.innerHTML = "";
    }

    // Save new program
    var topic_new_program = new ROSLIB.Topic({
        ros: ros,
        name: '/web_plan/program_new',
        messageType: 'vitulus_msgs/PlannerProgram'
    });
    topic_new_program.advertise();
    btn_program_template_save.onclick = function () {
        console.log("Save program");
        let ready = true;
        if (input_program_template_name.value === "") {
            ready = false;
            div_log.innerHTML = "<span class='text-danger'>Program name is empty!</span>";
        };
        if (selected_program_msg.zone_list.length === 0) {
            ready = false;
            div_log.innerHTML = "<span class='text-danger'>Program has no zones!</span>";
        }
        if (ready) {
            selected_program_msg.name = input_program_template_name.value + ' (' + active_map_file_name.split("***env*")[0] + ')';
            selected_program_msg.map_name = active_map_file_name;
            for (let i in selected_program_msg.zone_list) {
                selected_program_msg.area += selected_program_msg.zone_list[i].area;
                selected_program_msg.length += selected_program_msg.zone_list[i].length;
            }
            // console.log(selected_program_msg);
            topic_new_program.publish(selected_program_msg);
            input_program_template_name.value = "";
            div_program_template.setAttribute('style', 'display:none !important');
            div_log.innerHTML = "<span class='text-info'>Saving program " + selected_program_msg.name + "...</span>";
        }
    }

    // Get program list
    var programListTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/web_plan/program_list',
        messageType: 'vitulus_msgs/PlannerProgramList'
    });
    programListTopic.subscribe(function (message) {
        var html_program_list = '';
        for (let program in message.program_list) {
            let program_name = message.program_list[program].name;
            let program_duration = message.program_list[program].last_duration_minutes;
            let program_area = message.program_list[program].area;
            let program_length = message.program_list[program].length;
            let program_map = message.program_list[program].map_name.split("***env*")[0];
            let program_env = message.program_list[program].map_name.split("***env*")[1];
            let program_zones = "";
            for (let zone in message.program_list[program].zone_list) {
                program_zones += '<span>' + message.program_list[program].zone_list[zone].name + '</span>, ';
            }
            program_zones = program_zones.slice(0, -2);
            html_program_list += `
                <div id="div_program" style="border-bottom: 1px solid #444444;padding-right: 4px;padding-left: 6px;padding-bottom: 2px;padding-top: 2px;">
                    <div><span class="text-info" style="margin-right: 6px;width: 155px;font-size: 13.2px;overflow: hidden;display: inline-flex;">${program_name}</span><span class="text-nowrap" style="margin-right: 4px;font-size: 13.2px;width: auto;overflow: hidden;max-width: 62px;display: inline-flex;">${program_length} m</span><span class="text-nowrap" style="margin-right: 4px;font-size: 13.2px;overflow: hidden;max-width: 62px;display: inline-flex;">${program_area} m2</span>
                        <div class="d-xxl-flex align-items-xxl-center float-end" style="display: inline-flex;height: 24px;"><span class="text-nowrap" style="margin-right: 4px;font-size: 13.2px;overflow: hidden;max-width: 98px;display: inline-flex;">${program_map}</span><span class="text-nowrap" style="margin-right: 4px;font-size: 13.2px;overflow: hidden;max-width: 62px;display: inline-flex;">${program_env}</span></div>
                    </div>
                    <div style="margin-top: 3px;margin-bottom: 1px;"><span style="font-size: 13px;">Zones: </span><span style="color: var(--bs-gray-600);font-size: 12px;">${program_zones}</span>
                        <div class="btn-group btn-group-sm float-end" role="group"><button class="btn btn-outline-success d-inline-flex btn-sm-s" type="button" onclick="runProgram(&#39;${program_name}&#39;)">Run</button><button class="btn btn-outline-danger d-inline-flex btn-sm-s" type="button" onclick="removeProgram(&#39;${program_name}&#39;)">Remove</button></div>
                    </div>
                </div>
            `;
            div_program_list.innerHTML = html_program_list;
        }
        if (message.program_list.length === 0) {
            div_program_list.innerHTML = "";
        }
    });

    // Publish selected program to run
    var topic_program_select = new ROSLIB.Topic({
        ros: ros,
        name: '/web_plan/program_select',
        messageType: 'std_msgs/String'
    });
    topic_program_select.advertise();

    this.runProgram = function (program_name) {
        let msg = new ROSLIB.Message({
            data: program_name,
        });
        topic_program_select.publish(msg);
        // console.log(msg);
    }

    // Remove program from list by name
    var topic_remove_program = new ROSLIB.Topic({
        ros: ros,
        name: '/web_plan/program_remove',
        messageType: 'std_msgs/String'
    });
    topic_remove_program.advertise();

    this.removeProgram = function (name) {
        let msg = new ROSLIB.Message({
            data: name,
        });
        topic_remove_program.publish(msg);
    }


    // Paths  //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var pathCoverageTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/web_plan/path_show',
        messageType : 'nav_msgs/Path'
    });


    pathCoverageTopic.subscribe(function(message) {
        // console.log("Path:");
        coveragePath.setPath(message);
    });


    // Active map ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Program elements
    var btn_save_planner_data = document.getElementById("btn_save_planner_data");
    var btn_load_planner_data = document.getElementById("btn_load_planner_data");
    var btn_reload_map = document.getElementById("btn_reload_map");
    var active_map_name = document.getElementById("active_map_name");

    // Display map name
    var active_map_Topic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/active_map',
        messageType : 'std_msgs/String'
    });

    active_map_Topic.subscribe(function(message) {
        active_map_name.textContent = message.data.split("***env*")[0] + ' (' + message.data.split("***env*")[1] + ')';
        if (message.data !== active_map_file_name){
            console.log("Map changed");
            let msg = new ROSLIB.Message({
                data : true,
            });
            topic_publish_reload.publish(msg);
            initiate = true;
            viewer.scene.scaleX = 1;
            viewer.scene.scaleY = 1;

        }
        active_map_file_name = message.data;
    });

    // Load planner data
    var load_planner_data_Topic = new ROSLIB.Topic({
        ros : ros,
        name : '/web_plan/load_planner_data',
        messageType : 'std_msgs/Bool'
    });
    load_planner_data_Topic.advertise();

    btn_load_planner_data.onclick = function () {
        let msg = new ROSLIB.Message({
            data: true,
        });
        load_planner_data_Topic.publish(msg)
    }

    // Save planner data
    var save_planner_data_Topic = new ROSLIB.Topic({
        ros : ros,
        name : '/web_plan/save_planner_data',
        messageType : 'std_msgs/Bool'
    });
    save_planner_data_Topic.advertise();

    btn_save_planner_data.onclick = function () {
        let msg = new ROSLIB.Message({
            data: true,
        });
        save_planner_data_Topic.publish(msg)
    }

    // Reload map
    var reload_map_Topic = new ROSLIB.Topic({
        ros : ros,
        name : '/web_plan/reload_map',
        messageType : 'std_msgs/Bool'
    });
    reload_map_Topic.advertise();

    btn_reload_map.onclick = function () {
        let msg = new ROSLIB.Message({
            data: true,
        });
        reload_map_Topic.publish(msg)
    }









    // Request initial data from backend  //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var topic_publish_reload = new ROSLIB.Topic({
        ros : ros,
        name : '/web_plan/reload',
        messageType : 'std_msgs/Bool'
    });
    topic_publish_reload.advertise();
    var msg = new ROSLIB.Message({
        data : true
    });
    window.setTimeout(function(){topic_publish_reload.publish(msg);}, 800);

} /// end of on.load()




