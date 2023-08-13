
window.onload = function() {

    console.log("START");
    var ros;
    ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});

     var listenerMapMeta = new ROSLIB.Topic({
        ros : ros,
        name : '/map_metadata',
        messageType : 'nav_msgs/MapMetaData'
    });

    listenerMapMeta.subscribe(function(message) {
        console.log(message);
    });

    var viewer;
    var gridClient;
    var wait_for_map = true;
    var width = 700;
    var height = 700;
    scale_plus_btn = document.getElementById("scale_plus");
    scale_minus_btn = document.getElementById("scale_minus");
    div_map = document.getElementById("map");
    console.log(div_map);
    width = (div_map.clientWidth-4);
    height = (div_map.clientHeight-8);
    var initiate = true;
    console.log(width);
    console.log(height);


    // Create the main viewer.  ////////////////////////////////////////////////////////////////////////////////////////
    viewer = new ROS2D.Viewer({
      divID : 'map',
      width : width,
      height : height
    });

    // Add zoom to the viewer.
    zoomView = new ROS2D.ZoomView({
        rootObject : viewer.scene
    });
    // Add panning to the viewer.
    panView = new ROS2D.PanView({
        rootObject : viewer.scene
    });




    // Setup the map client.  //////////////////////////////////////////////////////////////////////////////////////////
    gridClient = new ROS2D.OccupancyGridClient({
      ros : ros,
      topic: '/map_show',
      rootObject : viewer.scene,
      // Use this property in case of continuous updates
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


    gridClient.on('change', function() {
        if (initiate){
            if (gridClient.currentGrid.width > gridClient.currentGrid.height){
               viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.width);
            }else{
               viewer.scaleToDimensions(gridClient.currentGrid.height, gridClient.currentGrid.height);
            }
            viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
            initiate = false;
        }

      // registerMouseHandlers();
      // console.log(viewer);
      // console.log(gridClient);
      // console.log(viewer.scene.children[1]);
    });


    // Callback functions when there is mouse interaction with the polygon  ////////////////////////////////////////////
    var polygon_enabled = false
    var clickedPolygon = false;
    var selectedPointIndex = null;

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

    // Create the polygon  /////////////////////////////////////////////////////////////////////////////////////////////
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

    // Event listeners for mouse interaction with the stage  ///////////////////////////////////////////////////////////
    viewer.scene.mouseMoveOutside = false; // doesn't seem to work

    function registerMouseHandlers() {
        // Setup mouse event handlers
			var mouseDown = false;
			var zoomKey = false;
			var panKey = false;
			var startPos = new ROSLIB.Vector3();

        viewer.scene.addEventListener('stagemousedown', function(event) {
            if (event.nativeEvent.altKey === true) {
                console.log("alt pressed")
                zoomKey = true;
                zoomView.startZoom(event.stageX, event.stageY);
            }
            else if (event.nativeEvent.ctrlKey === true) {
                console.log("ctrl pressed")
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
					}
				}
          }
        });

        viewer.scene.addEventListener('stagemouseup', function(event) {
          // Add point when not clicked on the polygon
            console.log("zoomKey: " + zoomKey + " panKey: " + panKey + " mouseDown: " + mouseDown + " clickedPolygon: " + clickedPolygon + " selectedPointIndex: " + selectedPointIndex + " mouseInBounds: " + viewer.scene.mouseInBounds);
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
            // console.log(pos);
            polygon.addPoint(pos);
            console.log("point added");
            // console.log(polygon);
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

    // Map edit log  ///////////////////////////////////////////////////////////////////////////////////////////////////
    var div_log = document.getElementById("div_log")
    var logTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/log',
        messageType : 'std_msgs/String'
    });
    logTopic.subscribe(function(message) {
        console.log("MapEdit log:" + message.data);
        div_log.textContent = message.data;
    });

    input_obstacle_margin = document.getElementById("input_obstacle_margin");
    input_fill_free = document.getElementById("input_fill_free");
    input_fill_shape = document.getElementById("input_fill_shape");
    btn_assemble_map = document.getElementById("btn_assemble_map");

    // get map data  ////////////////////////////////////////////////////////////////////////////////////////////////////
    var topic_map_data = new ROSLIB.Topic({
        ros : ros,
        name : '/map_data',
        messageType : 'vitulus_msgs/MapEditMap'
    });
    topic_map_data.subscribe(function(message) {
        input_obstacle_margin.value = message.margin;
        input_fill_free.value = message.fill;
        input_fill_shape.value = message.shape;
    });

    // assembly map  ///////////////////////////////////////////////////////////////////////////////////////////////////
    var topic_assemble_map = new ROSLIB.Topic({
        ros : ros,
        name : '/assemble_map',
        messageType : 'vitulus_msgs/MapEditMap'
    });
    topic_assemble_map.advertise();

    btn_assemble_map.onclick = function() {
        var msg = new ROSLIB.Message({
            // data : parseInt(input_draw_coverage.value),
            name : "",
            fill : parseInt(input_fill_free.value),
            margin : parseFloat(input_obstacle_margin.value),
            shape : input_fill_shape.value,
        });
        console.log(msg)
        topic_assemble_map.publish(msg);
    };

    // Map show ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var topic_show_fill_map = new ROSLIB.Topic({
        ros : ros,
        name : '/show_map_layer',
        messageType : 'std_msgs/String'
    });
    topic_show_fill_map.advertise();

    // show fee fill  //////////////////////////////////////////////////////////////////////////////////////////////////
    btn_show_fill = document.getElementById("btn_show_fill");
    btn_show_fill.onclick = function() {
        var msg = new ROSLIB.Message({
            data : "filled",
        });
        topic_show_fill_map.publish(msg);
    }
    // show free poly  /////////////////////////////////////////////////////////////////////////////////////////////////
    btn_show_free_poly = document.getElementById("btn_show_free_poly");
    btn_show_free_poly.onclick = function() {
        var msg = new ROSLIB.Message({
            data : "free_poly",
        });
        topic_show_fill_map.publish(msg);
    }
    // show obstacle poly  /////////////////////////////////////////////////////////////////////////////////////////////
    btn_show_obstacles_poly = document.getElementById("btn_show_obstacles_poly");
    btn_show_obstacles_poly.onclick = function() {
        var msg = new ROSLIB.Message({
            data : "obstacles_poly",
        });
        topic_show_fill_map.publish(msg);
    }
    // show obstacle margin  ///////////////////////////////////////////////////////////////////////////////////////////
    btn_show_obstacle_margin = document.getElementById("btn_show_obstacle_margin");
    btn_show_obstacle_margin.onclick = function() {
        var msg = new ROSLIB.Message({
            data : "obstacle_margin",
        });
        topic_show_fill_map.publish(msg);
    }
    // show assembled_lite   ///////////////////////////////////////////////////////////////////////////////////////////////
    btn_show_assembled_lite = document.getElementById("btn_show_assembled_lite");
    btn_show_assembled_lite.onclick = function() {
        var msg = new ROSLIB.Message({
            data : "assembled_lite",
        });
        topic_show_fill_map.publish(msg);
    }
    // // show coverage path  /////////////////////////////////////////////////////////////////////////////////////////////
    // btn_show_coverage_path = document.getElementById("btn_show_coverage_path");
    // btn_show_coverage_path.onclick = function() {
    //     var msg = new ROSLIB.Message({
    //         data : "coverage_path",
    //     });
    //     topic_show_fill_map.publish(msg);
    // }
    // show original  //////////////////////////////////////////////////////////////////////////////////////////////////
    btn_show_original = document.getElementById("btn_show_original");
    btn_show_original.onclick = function() {
        var msg = new ROSLIB.Message({
            data : "original",
        });
        topic_show_fill_map.publish(msg);
    }
    // show assembled  /////////////////////////////////////////////////////////////////////////////////////////////////
    btn_show_assembled = document.getElementById("btn_show_assembled");
    btn_show_assembled.onclick = function() {
        var msg = new ROSLIB.Message({
            data : "assembled",
        });
        topic_show_fill_map.publish(msg);
    }
    // show zone map  /////////////////////////////////////////////////////////////////////////////////////////////////
    btn_show_zone_map = document.getElementById("btn_show_zone_map");
    btn_show_zone_map.onclick = function() {
        var msg = new ROSLIB.Message({
            data : "zone_map",
        });
        topic_show_fill_map.publish(msg);
    }
    // show zone_border_path map  /////////////////////////////////////////////////////////////////////////////////////////////////
    btn_show_zone_border_path = document.getElementById("btn_show_zone_border_path");
    btn_show_zone_border_path.onclick = function() {
        var msg = new ROSLIB.Message({
            data : "zone_border_path",
        });
        topic_show_fill_map.publish(msg);
    }
    // show zone_navi map  /////////////////////////////////////////////////////////////////////////////////////////////////
    btn_show_zone_navi = document.getElementById("btn_show_zone_navi");
    btn_show_zone_navi.onclick = function() {
        var msg = new ROSLIB.Message({
            data : "zone_navi",
        });
        topic_show_fill_map.publish(msg);
    }


    // Polygons  ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // // Publish current polygon  ////////////////////////////////////////////////////////////////////////////////////////
    // var topic_publish_polygon = new ROSLIB.Topic({
    //     ros : ros,
    //     name : '/publish_polygon',
    //     messageType : 'geometry_msgs/PolygonStamped'
    // });
    // topic_publish_polygon.advertise();
    // btn_pub_polygon = document.getElementById("btn_pub_polygon");
    //
    // btn_pub_polygon.onclick = function() {
    //     // console.log(polygon.pointContainer.children.length);
    //     if (polygon.pointContainer.children.length > 0){
    //         var points = [];
    //         for (i in polygon.pointContainer.children){
    //             points.push({x: polygon.pointContainer.children[i].x, y: polygon.pointContainer.children[i].y * -1});
    //         }
    //         var msg = new ROSLIB.Message({
    //             header : {
    //                 frame_id : "map"
    //             },
    //             polygon : {
    //                 points : points
    //             }
    //         });
    //         topic_publish_polygon.publish(msg);
    //     }
    // };

    // Polygon elements  ///////////////////////////////////////////////////////////////////////////////////////////////
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

    // New map polygon  ////////////////////////////////////////////////////////////////////////////////////////////////
    btn_new_poly.onclick = function() {
        div_poly_template.setAttribute('style', div_poly_template_style_attr + 'display:flex');
        viewer.scene.addChild(polygon);
    }

    // Cancel polygon  /////////////////////////////////////////////////////////////////////////////////////////////////
    btn_poly_template_cancel.onclick = function() {
        div_poly_template.setAttribute('style', div_poly_template_style_attr + 'display:none !important');
        viewer.scene.removeChild(polygon);
        polygon.pointContainer.children = [];
        polygon.lineContainer.children = [];
        polygon.fillShape.graphics._instructions = [];
        polygon.fillShape.graphics._oldInstructions = [];
    }

    // Save polygon ////////////////////////////////////////////////////////////////////////////////////////////////////
    var topic_save_poly = new ROSLIB.Topic({
            ros : ros,
            name : '/save_polygon',
            messageType : 'vitulus_msgs/MapEditPolygon'
    });
    topic_save_poly.advertise();

    btn_poly_template_save.onclick = function() {
        console.log(polygon.pointContainer.children.length);
        if (polygon.pointContainer.children.length > 0){
            var points = [];
            for (i in polygon.pointContainer.children){
                points.push({x: polygon.pointContainer.children[i].x, y: polygon.pointContainer.children[i].y * -1});
            }
            console.log(points);
            var msgPoly = new ROSLIB.Message({
                header : {
                    frame_id : "map"
                },
                polygon : {
                    points : points
                }
            });
            console.log(msgPoly);
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
            console.log(msg);

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

    // Remove polygon from list by name  ///////////////////////////////////////////////////////////////////////////////
    var topic_remove_poly = new ROSLIB.Topic({
        ros : ros,
        name : '/remove_polygon',
        messageType : 'std_msgs/String'
    });
    topic_remove_poly.advertise();

    this.removePoly = function(poly_name){
        let msg = new ROSLIB.Message({
            data : poly_name,
        });
        topic_remove_poly.publish(msg);
    }

    // Edit polygon from list by name //////////////////////////////////////////////////////////////////////////////////
    this.editPoly = function(poly_name){
        for (let i in current_poly_list){
            if (current_poly_list[i].name === poly_name){
                let poly = current_poly_list[i];
                console.log(poly);
                div_poly_template.setAttribute('style', div_poly_template_style_attr + 'display:flex');
                viewer.scene.removeChild(polygon);
                polygon.pointContainer.children = [];
                polygon.lineContainer.children = [];
                polygon.fillShape.graphics._instructions = [];
                polygon.fillShape.graphics._oldInstructions = [];
                viewer.scene.addChild(polygon);
                for (let point in poly.polygon.polygon.points){
                    console.log("Point:");
                    console.log(poly.polygon.polygon.points[point]);
                    polygon.addPoint(poly.polygon.polygon.points[point]);
                }
                input_poly_template_name.value = poly.name;
                input_poly_template_type.value = poly.type;
            }
        }
    }

    // load polygon list ///////////////////////////////////////////////////////////////////////////////////////////////
    var polyListTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/polygon_list',
        messageType : 'vitulus_msgs/MapEditPolygonList'
    });

    var current_poly_list = [];
    polyListTopic.subscribe(function(message) {
        console.log("Poly list:");
        current_poly_list = message.polygon_list;
        var html_poly_list ='';
        for (let poly in message.polygon_list){
            console.log(message.polygon_list[poly]);
            let poly_name = message.polygon_list[poly].name;
            let poly_type = message.polygon_list[poly].type;
            html_poly_list += `<div class="d-flex align-items-center" id="div_poly" style="border-bottom: 1px solid #444444;padding-right: 2px;padding-left: 6px;padding-bottom: 2px;padding-top: 2px;">
                                    <div class="d-flex" style="">
                                        <span id="span_poly_name_${poly_name}" style="margin-right: 6px;width: 155px;">${poly_name}</span>
                                        <span class="text-nowrap_${poly_name}" id="span_poly_type" style="margin-right: 12px;">${poly_type}</span>
                                    </div>
                                    <div class="btn-group btn-group-sm d-flex ml-auto" role="group">
                                        <button class="btn btn-outline-info d-inline-flex btn-sm-s" id="btn_poly_edit_${poly_name}" onClick="editPoly('${poly_name}')" type="button">Edit</button>
                                        <button class="btn btn-outline-danger  d-inline-flex btn-sm-s" id="btn_poly_remove"_${poly_name} onClick="removePoly('${poly_name}')"="button">Remove</button>
                                    </div>
                                </div>`;
            div_poly_list.innerHTML = html_poly_list;


        }
        if (message.polygon_list.length == 0){
            div_poly_list.innerHTML = "";
        }
    });



    // Zones     ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Polygon elements  ///////////////////////////////////////////////////////////////////////////////////////////////
    var input_zone_template_name = document.getElementById("input_zone_template_name");
    var input_zone_template_cut_height = document.getElementById("input_zone_template_cut_height");
    var input_zone_template_rpm = document.getElementById("input_zone_template_rpm");
    var input_zone_template_border_path = document.getElementById("input_zone_template_border_path");
    var input_zone_template_coverage_path = document.getElementById("input_zone_template_coverage_path");
    var input_zone_template_path_distance = document.getElementById("input_zone_template_path_distance");
    var input_zone_template_simplify = document.getElementById("input_zone_template_simplify");
    var span_path_name = document.getElementById("span_path_name");
    var span_path_type = document.getElementById("span_path_type");
    var span_zone_name = document.getElementById("span_zone_name");
    var span_zone_height = document.getElementById("span_zone_height");
    var span_zone_rpm = document.getElementById("span_zone_rpm");
    var span_zone_area = document.getElementById("span_zone_area");
    var btn_new_zone = document.getElementById("btn_new_zone");
    var btn_zone_template_save = document.getElementById("btn_zone_template_save");
    var btn_zone_template_cancel = document.getElementById("btn_zone_template_cancel");
    var btn_zone_draw_border_path = document.getElementById("btn_zone_draw_border_path");
    var btn_zone_draw_coverage_path = document.getElementById("btn_zone_draw_coverage_path");
    var btn_path_publish = document.getElementById("btn_path_publish");
    var btn_path_remove = document.getElementById("btn_path_remove");
    var btn_zone_edit = document.getElementById("btn_zone_edit");
    var btn_zone_remove = document.getElementById("btn_zone_remove");
    var panel_zones = document.getElementById("panel_zones");
    var div_zone_template = document.getElementById("div_zone_template");
    var div_path_list = document.getElementById("div_path_list");
    var header_zone_template_coverage_path = document.getElementById("header_zone_template_coverage_path");
    var header_zone_template_border_path = document.getElementById("header_zone_template_border_path");
    var header_zone_template_path_list = document.getElementById("header_zone_template_path_list");
    var div_zone_list = document.getElementById("div_zone_list");

    // Init zone template //////////////////////////////////////////////////////////////////////////////////////////////
    var zone_template_style_attr = div_zone_template.getAttribute('style');
    var header_zone_template_coverage_path_style_attr = header_zone_template_coverage_path.getAttribute('style');
    var header_zone_template_border_path_style_attr = header_zone_template_border_path.getAttribute('style');
    var header_zone_template_path_list_style_attr = header_zone_template_path_list.getAttribute('style');
    div_zone_template.setAttribute('style', 'display:none !important');
    div_zone_list.innerHTML = "";

    var current_zone = null;


    // Zone ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // New zone ///////////////////////////////////////////////////////////////////////////////////////////////////////
    btn_new_zone.onclick = function(){
        div_zone_template.setAttribute('style', zone_template_style_attr);
        input_zone_template_name.value = "Zone";
        input_zone_template_rpm.value = 3300;
        input_zone_template_cut_height.value = 45;
        input_zone_template_border_path.value = 2;
        input_zone_template_coverage_path.value = 160;
        input_zone_template_path_distance.value = 0.2;
        input_zone_template_simplify.value = 0.1;
        // header_zone_template_coverage_path.setAttribute('style', 'display:none !important');
        // header_zone_template_border_path.setAttribute('style', 'display:none !important');
        // header_zone_template_path_list.setAttribute('style', 'display:none !important');
        div_path_list.innerHTML = "";
        polygon.pointContainer.children = [];
        polygon.lineContainer.children = [];
        polygon.fillShape.graphics._instructions = [];
        polygon.fillShape.graphics._oldInstructions = [];
        viewer.scene.addChild(polygon);
    }

    // Selected zone topic /////////////////////////////////////////////////////////////////////////////////////////////////
    var topic_selected_zone = new ROSLIB.Topic({
            ros : ros,
            name : '/selected_zone',
            messageType : 'std_msgs/String'
    });
    topic_selected_zone.advertise();

    // Cancel zone ////////////////////////////////////////////////////////////////////////////////////////////////////
    btn_zone_template_cancel.onclick = function(){
        div_zone_template.setAttribute('style', 'display:none !important');
        viewer.scene.removeChild(polygon);
        polygon.pointContainer.children = [];
        polygon.lineContainer.children = [];
        polygon.fillShape.graphics._instructions = [];
        polygon.fillShape.graphics._oldInstructions = [];
        let msg = new ROSLIB.Message({
                    data : "cancel**cancel**"
                });
                topic_selected_zone.publish(msg);
    }

    // Save zone topic /////////////////////////////////////////////////////////////////////////////////////////////////
    var topic_save_zone = new ROSLIB.Topic({
            ros : ros,
            name : '/save_zone',
            messageType : 'vitulus_msgs/MapEditZone'
    });
    topic_save_zone.advertise();

    // Save zone //////////////////////////////////////////////////////////////////////////////////////////////////////
    btn_zone_template_save.onclick = function(){
        console.log(polygon.pointContainer.children.length);
        if (polygon.pointContainer.children.length > 0){
            var points = [];
            for (i in polygon.pointContainer.children){
                points.push({x: polygon.pointContainer.children[i].x, y: polygon.pointContainer.children[i].y * -1});
            }
            console.log(points);
            var msgPoly = new ROSLIB.Message({
                header : {
                    frame_id : "map"
                },
                polygon : {
                    points : points
                }
            });
            console.log(msgPoly);
            var msg = new ROSLIB.Message({
                header : {
                    frame_id : "map"
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
            console.log(msg);

            // clean up
            div_zone_template.setAttribute('style', 'display:none !important');
            viewer.scene.removeChild(polygon);
            polygon.pointContainer.children = [];
            polygon.lineContainer.children = [];
            polygon.fillShape.graphics._instructions = [];
            polygon.fillShape.graphics._oldInstructions = [];

        } else{
            div_log.textContent = "Draw the polygon on the map!";
        }
    }

    // Get zone list //////////////////////////////////////////////////////////////////////////////////////////////////
    var zoneListTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/zone_list',
        messageType : 'vitulus_msgs/MapEditZoneList'
    });

    var current_zone_list = [];
    zoneListTopic.subscribe(function(message) {
        console.log("Zone list:");
        current_zone_list = message.zone_list;
        var html_zone_list ='';
        for (let zone in message.zone_list){
            console.log(message.zone_list[zone]);
            let zone_name = message.zone_list[zone].name;
            let zone_type = message.zone_list[zone].type;
            let zone_area = message.zone_list[zone].area;
            let zone_height = message.zone_list[zone].cut_height;
            let zone_rpm = message.zone_list[zone].rpm;
            html_zone_list += `<div class="d-flex align-items-center" id="div_zone_${zone_name}" style="border-bottom: 1px solid #444444;padding-right: 2px;padding-left: 6px;padding-bottom: 2px;padding-top: 2px;">
                                    <div class="d-flex">
                                        <span id="span_zone_name_${zone_name}" style="margin-right: 6px;width: 155px;font-size: 13.2px;">${zone_name}</span>
                                        <span class="text-nowrap" id="span_zone_height_${zone_name}" style="margin-right: 12px;font-size: 13.2px;">${zone_height} mm</span>
                                        <span class="text-nowrap" id="span_zone_rpm_${zone_name}" style="margin-right: 12px;font-size: 13.2px;">${zone_rpm} rpm</span>
                                        <span class="text-nowrap" id="span_zone_area_${zone_name}" style="margin-right: 12px;font-size: 13.2px;">${zone_area} m2</span>
                                    </div>
                                    <div class="btn-group btn-group-sm d-flex ml-auto" role="group">
                                        <button class="btn btn-outline-info d-inline-flex btn-sm-s" id="btn_zone_edit_${zone_name}" onClick="editZone('${zone_name}')" type="button">Edit </button>
                                        <button class="btn btn-outline-danger d-inline-flex btn-sm-s" id="btn_zone_remove_${zone_name}" onClick="removeZone('${zone_name}')" type="button">Remove </button>
                                    </div>
                                </div>`;
            div_zone_list.innerHTML = html_zone_list;


        }
        if (message.zone_list.length === 0){
            div_zone_list.innerHTML = "";
        }
    });




    // Edit zone from list by name /////////////////////////////////////////////////////////////////////////////////////
    this.editZone = function(zone_name){
        for (let i in current_zone_list){
            if (current_zone_list[i].name === zone_name){
                let zone = current_zone_list[i];
                console.log(zone);
                div_zone_template.setAttribute('style', zone_template_style_attr);
                // header_zone_template_coverage_path.setAttribute('style', header_zone_template_coverage_path_style_attr);
                // header_zone_template_border_path.setAttribute('style', header_zone_template_border_path_style_attr);
                // header_zone_template_path_list.setAttribute('style', header_zone_template_path_list_style_attr);
                viewer.scene.removeChild(polygon);
                polygon.pointContainer.children = [];
                polygon.lineContainer.children = [];
                polygon.fillShape.graphics._instructions = [];
                polygon.fillShape.graphics._oldInstructions = [];
                viewer.scene.addChild(polygon);
                for (let point in zone.polygon.polygon.points){
                    console.log("Point:");
                    console.log(zone.polygon.polygon.points[point]);
                    polygon.addPoint(zone.polygon.polygon.points[point]);
                }
                input_zone_template_name.value = zone.name;
                input_zone_template_rpm.value = zone.rpm;
                input_zone_template_cut_height.value = zone.cut_height;
                input_zone_template_border_path.value = zone.border_paths;
                input_zone_template_coverage_path.value = zone.coverage_angle;
                input_zone_template_path_distance.value = zone.paths_distance;
                let msg = new ROSLIB.Message({
                    data : zone_name
                });
                topic_selected_zone.publish(msg);
            }
        }
    }

    // Remove zone from list by name  /////////////////////////////////////////////////////////////////////////////////
    var topic_remove_zone = new ROSLIB.Topic({
        ros : ros,
        name : '/remove_zone',
        messageType : 'std_msgs/String'
    });
    topic_remove_zone.advertise();

    this.removeZone = function(zone_name){
        let msg = new ROSLIB.Message({
            data : zone_name,
        });
        topic_remove_zone.publish(msg);
    }

    // Paths  //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var pathCoverageTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/path_show',
        messageType : 'nav_msgs/Path'
    });


    pathCoverageTopic.subscribe(function(message) {
        console.log("Path:");
        coveragePath.setPath(message);
    });








    // Request initial data from backend  //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var topic_publish_reload = new ROSLIB.Topic({
        ros : ros,
        name : '/reload',
        messageType : 'std_msgs/Bool'
    });
    topic_publish_reload.advertise();
    var msg = new ROSLIB.Message({
        data : true
    });
    window.setTimeout(function(){topic_publish_reload.publish(msg);}, 500);

} /// end of on.load()




