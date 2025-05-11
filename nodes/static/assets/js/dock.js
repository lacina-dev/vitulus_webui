/**
 * dock.js - Docking functionality for the Vitulus robot
 */

// Initialize ROS connection
var ros;

// Keep track of the current map
var currentMap = "";

// Initialize when document is ready
$(document).ready(function() {
    // Connect to the rosbridge WebSocket server when the window is loaded
    // This is usually handled by webui.js, so we can access the 'ros' instance

    // Wait for ROS connection to be established by webui.js
    var rosReadyCheck = setInterval(function() {
        if (typeof ros !== 'undefined' && ros !== null) {
            clearInterval(rosReadyCheck);
            initDockFunctionality();
        }
    }, 500);

    // If needed, we could initialize ROS here instead
    // ros = new ROSLIB.Ros({
    //     url: 'ws://' + window.location.hostname + ':9090'
    // });

    // Listen for ROS connection events
    document.addEventListener('ros_connected', function (e) {
        ros = e.detail.ros;
        initDockFunctionality();
    });
});

/**
 * Initialize docking functionality once ROS is connected
 */
function initDockFunctionality() {
    // Create publisher for dock program messages
    var dockProgramPublisher = new ROSLIB.Topic({
        ros: ros,
        name: '/dock_smach/start_docking',
        messageType: 'vitulus_msgs/DockProgram'
    });

    // Get current map from the map selector - this would be implementation-dependent
    // The actual map name will be set by the webui.js

    // Handle dock program execute button
    $('#program_dock_btn_execute').click(function() {
        var useMap = $('#program_dock_check_map').prop('checked');
        var useDockMap = $('#program_dock_check_lidar_map').prop('checked');
        var dockPath = $('#program_dock_select_lidar_path').val();
        var useIntensity = $('#program_dock_check_intensity').prop('checked');
        var intensityAction = $('#program_dock_select_intesity_action').val();

        // Create the message
        var dockProgramMsg = new ROSLIB.Message({
            header: {
                stamp: {
                    secs: Math.floor(Date.now() / 1000),
                    nsecs: (Date.now() % 1000) * 1000000
                },
                frame_id: ''
            },
            use_map: useMap,
            map: currentMap,
            map_dock_point: "dock",
            use_dock_map: useDockMap,
            path: dockPath,
            use_intensity: useIntensity,
            action: intensityAction
        });

        // Publish the message
        dockProgramPublisher.publish(dockProgramMsg);
        
        // Update status
        $('#program_dock_div_status').html('<span style="color: #5bc0de;">Dock program started</span>');
    });

    // Handle undock program execute button
    $('#program_predock_btn_execute').click(function() {
        var useMap = $('#program_predock_check_map').prop('checked');
        var useDockMap = $('#program_predock_check_lidar_map').prop('checked');
        var dockPath = $('#program_predock_select_lidar_path').val();
        var useIntensity = $('#program_predock_check_intensity').prop('checked');
        var intensityAction = $('#program_predock_select_intesity_action').val();

        // Create the message
        var dockProgramMsg = new ROSLIB.Message({
            header: {
                stamp: {
                    secs: Math.floor(Date.now() / 1000),
                    nsecs: (Date.now() % 1000) * 1000000
                },
                frame_id: ''
            },
            use_map: useMap,
            map: currentMap,
            map_dock_point: "undock",
            use_dock_map: useDockMap,
            path: dockPath,
            use_intensity: useIntensity,
            action: intensityAction
        });

        // Publish the message
        dockProgramPublisher.publish(dockProgramMsg);
        
        // Update status
        $('#program_predock_div_status').html('<span style="color: #5bc0de;">Undock program started</span>');
    });
}

// Listen for map changes from other scripts
document.addEventListener('map_changed', function(e) {
    if (e.detail && e.detail.mapName) {
        currentMap = e.detail.mapName;
    }
});