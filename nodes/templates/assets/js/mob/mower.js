// Desc: Motors for Vitulus WebUI


class ROS {
    constructor() {
        this.ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});
        console.log("Connected to ROS.");
    }
}


class Mower {
    constructor(ros) {
        this.mower_status_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/mower/status',
            messageType: 'vitulus_msgs/Mower'
        });
        this.subscribe = this.mower_status_topic.subscribe(function (message) {
            span_mower_status.textContent = message.status;
            span_mower_direction.textContent = message.moto_dir;
            span_mower_cut_height.textContent = message.current_height + "/" + message.max_height + " cm";
            span_mower_rpm.textContent = message.moto_rpm + "/" + message.setpoint_rpm + " rpm";
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


window.onload = function () {
    ros = new ROS();
    mower = new Mower(ros);

    btn_mower_on.onclick = function() {
        mower.pub_mower_set_power(value = true)
    };

    btn_mower_off.onclick = function() {
        mower.pub_mower_set_power(value = false)
    };

    btn_mower_left.onclick = function() {
        mower.pub_mower_set_dir(value = 'LEFT')
    };

    btn_mower_right.onclick = function() {
        mower.pub_mower_set_dir(value = 'RIGHT')
    };

    btn_mower_set_height.onclick = function() {
        mower.pub_mower_set_cut_height(value = parseFloat(input_mower_cut_height.value));
        input_mower_cut_height.value = "";
    };

    btn_mower_set_rpm.onclick = function() {
        mower.pub_mower_set_motor_rpm(value = parseFloat(input_mower_rpm.value));
        input_mower_rpm.value = "";
    };

    btn_mower_calibration.onclick = function() {
        mower.pub_mower_set_calibrate(value = true);
    };

    btn_mower_home.onclick = function() {
        mower.pub_mower_set_home(value = true);
    };

    btn_mower_start_motor.onclick = function() {
        mower.pub_mower_set_motor_on(value = true);
    };

    btn_mower_stop_motor.onclick = function() {
        mower.pub_mower_set_motor_on(value = false);
    };

    btn_mower_cmd1_send.onclick = function() {
        mower.pub_mower_set_cmd(value = input_mower_cmd1.value);
    };

    btn_mower_cmd2_send.onclick = function() {
        mower.pub_mower_set_cmd(value = input_mower_cmd2.value);
    };

    btn_mower_cmd3_send.onclick = function() {
        mower.pub_mower_set_cmd(value = input_mower_cmd3.value);
    };

    btn_mower_cmd4_send.onclick = function() {
        mower.pub_mower_set_cmd(value = input_mower_cmd4.value);
    };

} /// end of on.load()




