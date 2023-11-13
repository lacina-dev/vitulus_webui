// Desc: Motors for Vitulus WebUI


class ROS {
    constructor() {
        this.ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});
        console.log("Connected to ROS.");
    }
}


class IconStatusMotors {
    constructor(ros) {
        this.icon_status_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/device_state_pub/icon_status',
            messageType: 'vitulus_msgs/Device_icon_status'
        });
        this.subscribe = this.icon_status_topic.subscribe(function (message) {
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
        });
    }
}


class MotorFrontLeft {
    constructor(ros) {
        this.front_left_wheel_state_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/base/front_left_wheel_state',
            messageType: 'vitulus_msgs/Moteus_controller_state'
        });
        this.subscribe = this.front_left_wheel_state_topic.subscribe(function (message) {
            span_motor1_status.textContent = message.fault;
            if (message.fault === "OK") {
                span_motor1_status.className = 'text-success';
            }else {
                span_motor1_status.className = 'text-danger';
            }
            span_motor1_torque.textContent = message.torque.toFixed(2);
            let torque_color = 'text-success';
            if (Math.abs(message.torque) >= 10){
                torque_color = 'text-warning';
            }
            if (Math.abs(message.torque) >= 15){
                torque_color = 'text-danger';
            }
            span_motor1_torque.className = torque_color;
            span_motor1_temp.textContent = message.temperature;
            let temp_color = 'text-success';
            if (message.temperature >= 50){
                temp_color = 'text-warning';
            }
            if (message.temperature >= 60){
                temp_color = 'text-danger';
            }
            span_motor1_temp.className = temp_color;
            span_motor1_velocity.textContent = message.velocity.toFixed(2);
            span_motor1_position.textContent = message.position.toFixed(2);
            span_motor1_volts.textContent = message.voltage;
            span_motor1_mode.textContent = message.mode;
            if (message.mode === "POSITION") {
                span_motor1_mode.className = 'text-success';
            }else {
                span_motor1_mode.className = 'text-danger';
            }
            span_motor1_id.textContent = message.id;
        });
    }
}


class MotorFrontRight {
    constructor(ros) {
        this.front_right_wheel_state_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/base/front_right_wheel_state',
            messageType: 'vitulus_msgs/Moteus_controller_state'
        });
        this.subscribe = this.front_right_wheel_state_topic.subscribe(function (message) {
            span_motor2_status.textContent = message.fault;
            if (message.fault === "OK") {
                span_motor2_status.className = 'text-success';
            }else {
                span_motor2_status.className = 'text-danger';
            }
            span_motor2_torque.textContent = message.torque.toFixed(2);
            let torque_color = 'text-success';
            if (Math.abs(message.torque) >= 10){
                torque_color = 'text-warning';
            }
            if (Math.abs(message.torque) >= 15){
                torque_color = 'text-danger';
            }
            span_motor2_torque.className = torque_color;
            span_motor2_temp.textContent = message.temperature;
            let temp_color = 'text-success';
            if (message.temperature >= 50){
                temp_color = 'text-warning';
            }
            if (message.temperature >= 60){
                temp_color = 'text-danger';
            }
            span_motor2_temp.className = temp_color;
            span_motor2_velocity.textContent = message.velocity.toFixed(2);
            span_motor2_position.textContent = message.position.toFixed(2);
            span_motor2_volts.textContent = message.voltage;
            span_motor2_mode.textContent = message.mode;
            if (message.mode === "POSITION") {
                span_motor2_mode.className = 'text-success';
            }else {
                span_motor2_mode.className = 'text-danger';
            }
            span_motor2_id.textContent = message.id;
        });
    }
}


class MotorRearLeft {
    constructor(ros) {
        this.rear_left_wheel_state_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/base/rear_left_wheel_state',
            messageType: 'vitulus_msgs/Moteus_controller_state'
        });
        this.subscribe = this.rear_left_wheel_state_topic.subscribe(function (message) {
            span_motor3_status.textContent = message.fault;
            if (message.fault === "OK") {
                span_motor3_status.className = 'text-success';
            }else {
                span_motor3_status.className = 'text-danger';
            }
            span_motor3_torque.textContent = message.torque.toFixed(2);
            let torque_color = 'text-success';
            if (Math.abs(message.torque) >= 10){
                torque_color = 'text-warning';
            }
            if (Math.abs(message.torque) >= 15){
                torque_color = 'text-danger';
            }
            span_motor3_torque.className = torque_color;
            span_motor3_temp.textContent = message.temperature;
            let temp_color = 'text-success';
            if (message.temperature >= 50){
                temp_color = 'text-warning';
            }
            if (message.temperature >= 60){
                temp_color = 'text-danger';
            }
            span_motor3_temp.className = temp_color;
            span_motor3_velocity.textContent = message.velocity.toFixed(2);
            span_motor3_position.textContent = message.position.toFixed(2);
            span_motor3_volts.textContent = message.voltage;
            span_motor3_mode.textContent = message.mode;
            if (message.mode === "POSITION") {
                span_motor3_mode.className = 'text-success';
            }else {
                span_motor3_mode.className = 'text-danger';
            }
            span_motor3_id.textContent = message.id;
        });
    }
}


class MotorRearRight {
    constructor(ros) {
        this.rear_right_wheel_state_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/base/rear_right_wheel_state',
            messageType: 'vitulus_msgs/Moteus_controller_state'
        });
        this.subscribe = this.rear_right_wheel_state_topic.subscribe(function (message) {
            span_motor4_status.textContent = message.fault;
            if (message.fault === "OK") {
                span_motor4_status.className = 'text-success';
            }else {
                span_motor4_status.className = 'text-danger';
            }
            span_motor4_torque.textContent = message.torque.toFixed(2);
            let torque_color = 'text-success';
            if (Math.abs(message.torque) >= 10){
                torque_color = 'text-warning';
            }
            if (Math.abs(message.torque) >= 15){
                torque_color = 'text-danger';
            }
            span_motor4_torque.className = torque_color;
            span_motor4_temp.textContent = message.temperature;
            let temp_color = 'text-success';
            if (message.temperature >= 50){
                temp_color = 'text-warning';
            }
            if (message.temperature >= 60){
                temp_color = 'text-danger';
            }
            span_motor4_temp.className = temp_color;
            span_motor4_velocity.textContent = message.velocity.toFixed(2);
            span_motor4_position.textContent = message.position.toFixed(2);
            span_motor4_volts.textContent = message.voltage;
            span_motor4_mode.textContent = message.mode;
            if (message.mode === "POSITION") {
                span_motor4_mode.className = 'text-success';
            }else {
                span_motor4_mode.className = 'text-danger';
            }
            span_motor4_id.textContent = message.id;
        });
    }
}


class MotorsTorque {
    constructor(ros) {
        this.get_torque_set_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/base/get_torque_set',
            messageType: 'std_msgs/Float32'
        });
        this.subscribe = this.get_torque_set_topic.subscribe(function (message) {
            span_motor_torque.textContent = message.data.toFixed(2);
        });
        this.set_torque_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/base/set_torque',
            messageType : 'std_msgs/Float32'
        });

        this.init();
    }

    init() {
        this.set_torque_topic.advertise();
    }

    pub_set_torque(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.set_torque_topic.publish(msg);
    }
}


class MotorsPower {
    constructor(ros) {
        this.motor_power_state_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/base/motor_power_state',
            messageType: 'std_msgs/Bool'
        });
        this.subscribe = this.motor_power_state_topic.subscribe(function (message) {
            if (message.data === true) {
                span_motors.className = 'text-success input-group-text';
            }else{
                span_motors.className = 'text-danger input-group-text';
            }
        });
        this.motor_power_topic = new ROSLIB.Topic({
            ros : ros.ros,
            name : '/base/motor_power',
            messageType : 'std_msgs/Bool'
        });

        this.init();
    }

    init() {
        this.motor_power_topic.advertise();
    }

    pub_power_topic(value) {
        let msg = new ROSLIB.Message({
            data: value
        });
        this.motor_power_topic.publish(msg);
    }
}


window.onload = function () {
    ros = new ROS();
    icon_status_motors = new IconStatusMotors(ros);
    motor_front_left = new MotorFrontLeft(ros);
    motor_front_right = new MotorFrontRight(ros);
    motor_rear_left = new MotorRearLeft(ros);
    motor_rear_right = new MotorRearRight(ros);

    motors_torque = new MotorsTorque(ros);
    btn_motor_torque.onclick = function() {
        motors_torque.pub_set_torque(value = parseFloat(intput_motor_torque.value));
        intput_motor_torque.value = "";
    };

    motors_power = new MotorsPower(ros);
    btn_motors_on.onclick = function() {
        motors_power.pub_power_topic(value = true)
    };
    btn_motors_off.onclick = function() {
        motors_power.pub_power_topic(value = false)
    };


} /// end of on.load()




