
window.onload = function() {
//    var ip = location.hostname;
////    alert(ip);
//    var robot_IP = ip;
    console.log("START");
    var ros;
    ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////   REMOTE CONTROL      /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////  CMD_VEL PUBLISHER  //////////////////////////////////////////////////////////////////////





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



//
/////////////////////////////////////////////////////////////////////////  GET POWER MODULE STATUS    ///////////////////////////////////////////////////////////////////////
//
//    var pmStatuslistenerTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/pm/power_status',
//        messageType : 'vitulus_ups/power_status'
//    });
//
//    pmStatuslistenerTopic.subscribe(function(message) {
//        var color_state = 'success';
//        if (message.battery_capacity < 40){
//            color_state = 'warning'
//        }
//        if (message.battery_capacity < 20){
//            color_state = 'danger'
//        }
////        console.log(message);
//        document.getElementById("battery_capacity").textContent = message.battery_capacity + '%';
//        document.getElementById("battery_capacity").style.width = message.battery_capacity + '%';
//        document.getElementById("battery_capacity").ariaValueNow = message.battery_capacity;
//        document.getElementById("battery_capacity").ariaValueMin = 0;
//        document.getElementById("battery_capacity").ariaValueMax = 100;
//        document.getElementById("battery_state").textContent = message.charger_status;
//        document.getElementById("battery_tool").style.border = '1px solid var(--' + color_state +')';
//        document.getElementById("battery_tool_dot").style.color = 'var(--' + color_state +')';
//        document.getElementById("battery_capacity").className = 'progress-bar bg-' + color_state +'';
//
//        var ups_html_content = '';
//        ups_html_content += '<div>' + message.version + '</div>';
//        ups_html_content += '<div>Supply: ' + message.supply_status + '</div>';
//        ups_html_content += '<div>Input voltage: ' + message.input_voltage.toFixed(2) + ' V </div>';
//        ups_html_content += '<div>Input current: ' + message.input_current.toFixed(2) + ' A </div>';
//
//        ups_html_content += '<div>Charger: ' + message.charger_status + '</div>';
//        ups_html_content += '<div>Battery capacity: ' + message.battery_capacity + ' % </div>';
//        ups_html_content += '<div>Battery voltage: ' + message.battery_voltage.toFixed(2) + ' V </div>';
//        ups_html_content += '<div>Battery current: ' + message.battery_current.toFixed(2) + ' A </div>';
//        ups_html_content += '<div>Battery current in: ' + message.battery_charge_current.toFixed(2) + ' A </div>';
//        ups_html_content += '<div>Battery current out: ' + message.battery_discharge_current.toFixed(2) + 'A </div>';
//        ups_html_content += '<div>NUC voltage: ' + message.out19_voltage.toFixed(2) + ' V </div>';
//        ups_html_content += '<div>NUC current: ' + message.out19_current.toFixed(2) + ' A </div>';
//
//        ups_html_content += '<div>&nbsp;</div>';
//
//        ups_html_content += '<div>Charge setpoint run: ' + message.charge_current_setpoint_run + ' mA </div>';
//        ups_html_content += '<div>Precharge setpoint run: ' + message.precharge_current_setpoint_run + ' mA </div>';
//        ups_html_content += '<div>Charge setpoint stanby: ' + message.charge_current_setpoint_standby + ' mA </div>';
//        ups_html_content += '<div>Precharge setpoint stanby: ' + message.precharge_current_setpoint_standby + ' mA </div>';
//
//        ups_html_content += '<div>&nbsp;</div>';
//
//        ups_html_content += '<div>Temp ext: ' + message.temp.toFixed(1) + ' °C (' + message.temp_setpoint + ') </div>';
//        ups_html_content += '<div>Fan ext: ' + message.fan_rpm + ' rpm </div>';
//        ups_html_content += '<div>Temp PCB: ' + message.temp2.toFixed(1) + ' °C (' + message.temp2_setpoint + ') </div>';
//        ups_html_content += '<div>Fan PCB: ' + message.fan2_rpm + ' rpm </div>';
//
//        ups_html_content += '<div>&nbsp;</div>';
//
//        ups_html_content += '<div>Charge switch: ' + message.charge_switch + ' </div>';
//        ups_html_content += '<div>Discharge switch: ' + message.discharge_switch + ' </div>';
//        ups_html_content += '<div>Battery out switch: ' + message.bat_out_switch + ' </div>';
//        ups_html_content += '<div>Motors switch: ' + message.motor_out_switch + ' </div>';
//        ups_html_content += '<div>NUC switch: ' + message.out19v_switch + ' </div>';
//
//        document.getElementById("ups_info").innerHTML = ups_html_content;
//
//
////        document.getElementById("log").innerHTML = map_log_item + '</br>' + document.getElementById("log").innerHTML;
//    });
//
//
/////////////////////////////////////////////////////////////////////////  MOTORS TORQUE ON/OFF    ///////////////////////////////////////////////////////////////////////
//
//
//    var motorPowerTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/base/motor_power',
//        messageType : 'std_msgs/Bool'
//    });
//    motorPowerTopic.advertise();
//
//    var motor_power = new ROSLIB.Message({
//        data : false
//    });
//
//    // Motor switch on power module
//    var pmMotorSwitchTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/set_motor_switch',
//        messageType : 'std_msgs/Bool'
//    });
//    pmMotorSwitchTopic.advertise();
//
//    var pmMotorSwitchMsg = new ROSLIB.Message({
//        data : false
//    });
//
////    function sleep(ms) {
////        return new Promise(resolve => setTimeout(resolve, ms));
////    }
//    document.getElementById('motors_on_btn').onclick = function() {
//        console.log('motON');
////        pmMotorSwitchMsg.data = true;
////        pmMotorSwitchTopic.publish(pmMotorSwitchMsg);
////        sleep(1000);
//        motor_power.data = true;
//        motorPowerTopic.publish(motor_power);
//
//    };
//    document.getElementById('motors_off_btn').onclick = function() {
//        console.log('motOFF');
//        motor_power.data = false;
//        motorPowerTopic.publish(motor_power);
////        pmMotorSwitchMsg.data = false;
////        pmMotorSwitchTopic.publish(pmMotorSwitchMsg);
//    };
//
//    var listenerMotorPower = new ROSLIB.Topic({
//        ros : ros,
//        name : '/base/motor_power_state',
//        messageType : 'std_msgs/Bool'
//    });
//
//
//    listenerMotorPower.subscribe(function(message) {
//        if (message.data) {
//            document.getElementById("motors_tool_dot").style.color = 'var(--success)';
//            document.getElementById("motors_tool").style.border = '1px solid var(--success)';
//        } else {
//            document.getElementById("motors_tool_dot").style.color = 'var(--danger)';
//            document.getElementById("motors_tool").style.border = '1px solid var(--danger)';
//        };
//    });
//
//
//
////////////////////////////////////////////////////////////////////////  EMERGENCY STOP   //////////////////////////////////////
//
//    document.getElementById('stop_btn').onclick = function() {
//        console.log('motOFF');
//        motor_power.data = false;
//        motorPowerTopic.publish(motor_power);
//        console.log('Cancel goal.');
//        var cancelGoalMsg = new ROSLIB.Message({
////            data : 'interactiveGoal',
//        });
//        cancelGoalTopic.publish(cancelGoalMsg);
//    };
//
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////   MOWER      /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//    mower_height_slider_value = document.getElementById("mower_height_slider_value");
//    mower_height_slider = document.getElementById("mower_height_slider");
//    mower_current_height = document.getElementById("mower_current_height");
//    var init_cut_height = true;
//    mower_motor_rpm_slider_value = document.getElementById("mower_motor_rpm_slider_value");
//    mower_motor_rpm_slider = document.getElementById("mower_motor_rpm_slider");
//    mower_current_motor_rpm = document.getElementById("mower_current_motor_rpm");
//    mower_motor_rpm_setpoint = document.getElementById("mower_motor_rpm_setpoint");
//    var init_cut_rpm = true;
//    mower_motor_start_btn = document.getElementById("mower_motor_start_btn");
//    mower_motor_stop_btn = document.getElementById("mower_motor_stop_btn");
//    mower_on_btn = document.getElementById("mower_on_btn");
//    mower_off_btn = document.getElementById("mower_off_btn");
//    mower_cali_btn = document.getElementById("mower_cali_btn");
//    mower_home_btn = document.getElementById("mower_home_btn");
//    mower_dir_right_btn = document.getElementById("mower_dir_right_btn");
//    mower_dir_left_btn = document.getElementById("mower_dir_left_btn");
//    mower_set_cmd_btn = document.getElementById("mower_set_cmd_btn");
//    mower_cmd_input = document.getElementById("mower_cmd_input");
//    mower_status_span = document.getElementById("mower_status");
//    mower_direction_span = document.getElementById("mower_direction");
//
//
///////////////////////////////////////////////////  MOWER STATUS SUBSCRIBER  //////////////////////////////////////////////////////////////////////
//
//    var listener_mower_status = new ROSLIB.Topic({
//            ros : ros,
//            name : '/mower/status',
//            messageType : 'vitulus_msgs/Mower'
//    });
//
//    listener_mower_status.subscribe(function(message) {
//        mower_status_span.textContent = message.status;
//        mower_direction_span.textContent = message.moto_dir;
//        mower_current_motor_rpm.textContent = message.moto_rpm;
//        if (init_cut_height){
//            mower_height_slider.value = message.current_height;
//            mower_height_slider.max = message.max_height;
//            mower_height_slider_value.textContent = message.current_height;
//            init_cut_height = false;
//        }
//        mower_current_height.textContent = message.current_height;
//        if (init_cut_rpm){
//            mower_motor_rpm_slider.value = message.setpoint_rpm;
////            mower_motor_rpm_slider.max = message.max_height;
//            mower_motor_rpm_slider_value.textContent = message.setpoint_rpm;
//            init_cut_rpm = false;
//        }
//
//        mower_current_motor_rpm.textContent = message.moto_rpm;
//        mower_motor_rpm_setpoint.textContent = message.setpoint_rpm;
//    });
//
///////////////////////////////////////////////////  MOWER COMMAND PUBLISHER  //////////////////////////////////////////////////////////////////////
//
//
//    var mower_set_cmdTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/mower/set_cmd',
//        messageType : 'std_msgs/String'
//    });
//    mower_set_cmdTopic.advertise();
//
//    mower_set_cmd_btn.onclick = function() {
//        var mower_set_cmdMsg = new ROSLIB.Message({
//            data : mower_cmd_input.value,
//        });
//        console.log("CMD SEND");
//        mower_set_cmdTopic.publish(mower_set_cmdMsg);
//    };
//
///////////////////////////////////////////////////  MOWER POWER PUBLISHER  //////////////////////////////////////////////////////////////////////
//
//
//    var mower_set_powerTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/mower/set_power',
//        messageType : 'std_msgs/Bool'
//    });
//    mower_set_powerTopic.advertise();
//
//    mower_on_btn.onclick = function() {
//        var mower_set_powerMsg = new ROSLIB.Message({
//            data : true,
//        });
//        mower_set_powerTopic.publish(mower_set_powerMsg);
//    };
//
//    mower_off_btn.onclick = function() {
//        var mower_set_powerMsg = new ROSLIB.Message({
//            data : false,
//        });
//        mower_set_powerTopic.publish(mower_set_powerMsg);
//    };
//
///////////////////////////////////////////////////  MOWER CALIBRATION PUBLISHER  //////////////////////////////////////////////////////////////////////
//
//
//    var mower_set_caliTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/mower/set_calibrate',
//        messageType : 'std_msgs/Bool'
//    });
//    mower_set_caliTopic.advertise();
//
//    mower_cali_btn.onclick = function() {
//        var mower_set_caliMsg = new ROSLIB.Message({
//            data : true,
//        });
//        mower_set_caliTopic.publish(mower_set_caliMsg);
//    };
//
///////////////////////////////////////////////////  MOWER HOME PUBLISHER  //////////////////////////////////////////////////////////////////////
//
//
//    var mower_set_homeTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/mower/set_home',
//        messageType : 'std_msgs/Bool'
//    });
//    mower_set_homeTopic.advertise();
//
//    mower_home_btn.onclick = function() {
//        var mower_set_homeMsg = new ROSLIB.Message({
//            data : true,
//        });
//        mower_set_homeTopic.publish(mower_set_homeMsg);
//    };
//
///////////////////////////////////////////////////  MOWER DIRECTION PUBLISHER  //////////////////////////////////////////////////////////////////////
//
//
//    var mower_set_motor_dirTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/mower/set_motor_dir',
//        messageType : 'std_msgs/String'
//    });
//    mower_set_motor_dirTopic.advertise();
//
//    mower_dir_right_btn.onclick = function() {
//        var mower_set_motor_dirMsg = new ROSLIB.Message({
//            data : "RIGHT",
//        });
//        mower_set_motor_dirTopic.publish(mower_set_motor_dirMsg);
//    };
//
//    mower_dir_left_btn.onclick = function() {
//        var mower_set_motor_dirMsg = new ROSLIB.Message({
//            data : "LEFT",
//        });
//        mower_set_motor_dirTopic.publish(mower_set_motor_dirMsg);
//    };
//
//
//
///////////////////////////////////////////////////  MOWER CUT HEIGHT PUBLISHER  //////////////////////////////////////////////////////////////////////
//
//
//    var mower_set_heightTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/mower/set_cut_height',
//        messageType : 'std_msgs/Int16'
//    });
//    mower_set_heightTopic.advertise();
//
//    mower_height_slider.oninput = function() {
//        mower_height_slider_value.textContent = mower_height_slider.value;
//        var mower_set_heightMsg = new ROSLIB.Message({
//            data : parseInt(mower_height_slider.value),
//        });
//        mower_set_heightTopic.publish(mower_set_heightMsg);
//
//    };
//
///////////////////////////////////////////////////  MOWER MOTOR RPM PUBLISHER  //////////////////////////////////////////////////////////////////////
//
//
//    var mower_set_rpmTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/mower/set_motor_rpm',
//        messageType : 'std_msgs/Int16'
//    });
//    mower_set_rpmTopic.advertise();
//
//    mower_motor_rpm_slider.oninput = function() {
//        mower_motor_rpm_slider_value.textContent = mower_motor_rpm_slider.value;
//        var mower_set_rpmMsg = new ROSLIB.Message({
//            data : parseInt(mower_motor_rpm_slider.value),
//        });
//        mower_set_rpmTopic.publish(mower_set_rpmMsg);
//
//    };
//
//
//
//
///////////////////////////////////////////////////  RPM PUBLISHER  //////////////////////////////////////////////////////////////////////
//
//
//    var mower_set_rpmTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/mower/set_motor_rpm',
//        messageType : 'std_msgs/Int32'
//    });
//    mower_set_rpmTopic.advertise();
//
//    mower_motor_rpm_slider.oninput = function() {
//        mower_motor_rpm_slider_value.textContent = mower_motor_rpm_slider.value;
//        var mower_set_rpmMsg = new ROSLIB.Message({
//            data : parseInt(mower_motor_rpm_slider.value),
//        });
//        mower_set_rpmTopic.publish(mower_set_rpmMsg);
//
//    };
//
//
///////////////////////////////////////////////////  MOWER MOTOR PUBLISHER  //////////////////////////////////////////////////////////////////////
//
//
//    var mower_set_motorTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/mower/set_motor_on',
//        messageType : 'std_msgs/Bool'
//    });
//    mower_set_motorTopic.advertise();
//
//    mower_motor_start_btn.onclick = function() {
//        var mower_set_motorMsg = new ROSLIB.Message({
//            data : true,
//        });
//        mower_set_motorTopic.publish(mower_set_motorMsg);
//    };
//
//    mower_motor_stop_btn.onclick = function() {
//        var mower_set_motorMsg = new ROSLIB.Message({
//            data : false,
//        });
//        mower_set_motorTopic.publish(mower_set_motorMsg);
//    };
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////   MOTORS INFO      /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//
///////////////////////////////////////////////////  FRONT LEFT MOTOR SUBSCRIBER  //////////////////////////////////////////////////////////////////////
//
//
//
//    var listener_front_left_wheel_state = new ROSLIB.Topic({
//            ros : ros,
//            name : '/base/front_left_wheel_slow_state',
//            messageType : 'vitulus_msgs/Moteus_controller_state'
//    });
//
//    motor_1_fault = document.getElementById("motor_1_fault");
//    motor_1_torque = document.getElementById("motor_1_torque");
//    motor_1_temp = document.getElementById("motor_1_temp");
//    motor_1_vel = document.getElementById("motor_1_vel");
//    motor_1_pos = document.getElementById("motor_1_pos");
//    motor_1_volts = document.getElementById("motor_1_volts");
//    motor_1_mode = document.getElementById("motor_1_mode");
//    motor_1_id = document.getElementById("motor_1_id");
//
//    listener_front_left_wheel_state.subscribe(function(message) {
//        motor_1_fault.textContent = message.fault;
//        motor_1_torque.textContent = message.torque.toFixed(2);
//        motor_1_temp.textContent = message.temperature;
//        motor_1_vel.textContent = message.velocity.toFixed(2);
//        motor_1_pos.textContent = message.position.toFixed(2);
//        motor_1_volts.textContent = message.voltage;
//        motor_1_mode.textContent = message.mode;
//        motor_1_id.textContent = message.id;
//    });
//
///////////////////////////////////////////////////  FRONT RIGHT MOTOR SUBSCRIBER  //////////////////////////////////////////////////////////////////////
//
//    var listener_front_right_wheel_state = new ROSLIB.Topic({
//            ros : ros,
//            name : '/base/front_right_wheel_slow_state',
//            messageType : 'vitulus_msgs/Moteus_controller_state'
//    });
//
//    motor_2_fault = document.getElementById("motor_2_fault");
//    motor_2_torque = document.getElementById("motor_2_torque");
//    motor_2_temp = document.getElementById("motor_2_temp");
//    motor_2_vel = document.getElementById("motor_2_vel");
//    motor_2_pos = document.getElementById("motor_2_pos");
//    motor_2_volts = document.getElementById("motor_2_volts");
//    motor_2_mode = document.getElementById("motor_2_mode");
//    motor_2_id = document.getElementById("motor_2_id");
//
//    listener_front_right_wheel_state.subscribe(function(message) {
//        motor_2_fault.textContent = message.fault;
//        motor_2_torque.textContent = message.torque.toFixed(2);
//        motor_2_temp.textContent = message.temperature;
//        motor_2_vel.textContent = message.velocity.toFixed(2);
//        motor_2_pos.textContent = message.position.toFixed(2);
//        motor_2_volts.textContent = message.voltage;
//        motor_2_mode.textContent = message.mode;
//        motor_2_id.textContent = message.id;
//    });
//
///////////////////////////////////////////////////  REAR LEFT MOTOR SUBSCRIBER  //////////////////////////////////////////////////////////////////////
//
//    var listener_rear_left_wheel_state = new ROSLIB.Topic({
//            ros : ros,
//            name : '/base/rear_left_wheel_slow_state',
//            messageType : 'vitulus_msgs/Moteus_controller_state'
//    });
//
//    motor_3_fault = document.getElementById("motor_3_fault");
//    motor_3_torque = document.getElementById("motor_3_torque");
//    motor_3_temp = document.getElementById("motor_3_temp");
//    motor_3_vel = document.getElementById("motor_3_vel");
//    motor_3_pos = document.getElementById("motor_3_pos");
//    motor_3_volts = document.getElementById("motor_3_volts");
//    motor_3_mode = document.getElementById("motor_3_mode");
//    motor_3_id = document.getElementById("motor_3_id");
//
//    listener_rear_left_wheel_state.subscribe(function(message) {
//        motor_3_fault.textContent = message.fault;
//        motor_3_torque.textContent = message.torque.toFixed(2);
//        motor_3_temp.textContent = message.temperature;
//        motor_3_vel.textContent = message.velocity.toFixed(2);
//        motor_3_pos.textContent = message.position.toFixed(2);
//        motor_3_volts.textContent = message.voltage;
//        motor_3_mode.textContent = message.mode;
//        motor_3_id.textContent = message.id;
//    });
//
//    /////////////////////////////////////////////////  REAR LEFT MOTOR SUBSCRIBER  //////////////////////////////////////////////////////////////////////
//
//    var listener_rear_right_wheel_state = new ROSLIB.Topic({
//            ros : ros,
//            name : '/base/rear_right_wheel_slow_state',
//            messageType : 'vitulus_msgs/Moteus_controller_state'
//    });
//
//    motor_4_fault = document.getElementById("motor_4_fault");
//    motor_4_torque = document.getElementById("motor_4_torque");
//    motor_4_temp = document.getElementById("motor_4_temp");
//    motor_4_vel = document.getElementById("motor_4_vel");
//    motor_4_pos = document.getElementById("motor_4_pos");
//    motor_4_volts = document.getElementById("motor_4_volts");
//    motor_4_mode = document.getElementById("motor_4_mode");
//    motor_4_id = document.getElementById("motor_4_id");
//
//    listener_rear_right_wheel_state.subscribe(function(message) {
//        motor_4_fault.textContent = message.fault;
//        motor_4_torque.textContent = message.torque.toFixed(2);
//        motor_4_temp.textContent = message.temperature;
//        motor_4_vel.textContent = message.velocity.toFixed(2);
//        motor_4_pos.textContent = message.position.toFixed(2);
//        motor_4_volts.textContent = message.voltage;
//        motor_4_mode.textContent = message.mode;
//        motor_4_id.textContent = message.id;
//    });
//
///////////////////////////////////////////////////////  MOTOR TORQUE  /////////////////////////////////////////////////
//
//    //// get
//    var listener_get_torque_set = new ROSLIB.Topic({
//            ros : ros,
//            name : '/base/get_torque_set',
//            messageType : 'std_msgs/Float32'
//    });
//
//    listener_get_torque_set.subscribe(function(message) {
//        running_torque = document.getElementById("running_torque");
//        running_torque.textContent = message.data.toFixed(2) + " Nm";
//    });
//
//    //// set
//    var pub_base_set_torqueTopic = new ROSLIB.Topic({
//        ros : ros,
//        name : '/base/set_torque',
//        messageType : 'std_msgs/Float32'
//    });
//    pub_base_set_torqueTopic.advertise();
//
//    torque_input = document.getElementById("torque_input");
//    set_torque_btn = document.getElementById("set_torque_btn");
//
//    set_torque_btn.onclick = function() {
//        var base_set_torqueMsg = new ROSLIB.Message({
//            data : parseFloat(torque_input.value),
//        });
//        pub_base_set_torqueTopic.publish(base_set_torqueMsg);
//    };

} /// end of on.load()




