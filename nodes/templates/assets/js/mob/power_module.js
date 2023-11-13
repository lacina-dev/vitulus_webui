// Desc: Dashboard for Vitulus WebUI

class ROS {
    constructor() {
        this.ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});
        console.log("Connected to ROS.");
    }
}



class IconStatusPM {
    constructor(ros) {
        this.icon_status_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/device_state_pub/icon_status',
            messageType: 'vitulus_msgs/Device_icon_status'
        });
        this.subscribe = this.icon_status_topic.subscribe(function (message) {
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

class PowerModule {
    constructor(ros) {
        this.power_status_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/pm/power_status',
            messageType: 'vitulus_ups/power_status'
        });
        this.subscribe = this.power_status_topic.subscribe(function (message) {
            // message.battery_capacity = 5;
            span_supply_volts.innerHTML = message.input_voltage.toFixed(2);;
            span_supply_amps.innerHTML = message.input_current.toFixed(2);
            span_batt_volts.innerHTML = message.battery_voltage.toFixed(2);
            span_batt_amps.innerHTML = message.battery_current.toFixed(2);
            span_nuc_volts.innerHTML = message.out19_voltage.toFixed(2);
            span_nuc_amps.innerHTML = message.out19_current.toFixed(2);
            // span_batt_capacity.innerHTML = message.battery_capacity.toFixed(2);
            span_supply_status.innerHTML = message.supply_status;
            span_batt_status.innerHTML = message.charger_status;
            span_curr_pcb_temp.innerHTML = message.temp2.toFixed(2);
            span_pcb_rpm.innerHTML = message.fan2_rpm;
            span_curr_ext_temp.innerHTML = message.temp.toFixed(2);
            span_ext_rpm.innerHTML = message.fan_rpm;
            if (message.out19v_switch === true) {
                ico_nuc.src = "/assets/img/robot_icons/ico_nuc_green.png";
            }else{
                ico_nuc.src = "/assets/img/robot_icons/ico_nuc_grey.png";
            }
            if (message.motor_out_switch === true) {
                ico_motor.src = "/assets/img/robot_icons/ico_motor_green.png";
            }else{
                ico_motor.src = "/assets/img/robot_icons/ico_motor_grey.png";
            }
            if (message.bat_out_switch === true) {
                ico_mower.src = "/assets/img/robot_icons/Nextion_ico_mower_green.png";
            }else{
                ico_mower.src = "/assets/img/robot_icons/Nextion_ico_mower_grey.png";
            }
            // span_batt_capacity.textContent = message.battery_capacity;

            progress_batt_capacity.textContent = message.battery_capacity + '%';
            progress_batt_capacity.style.width = message.battery_capacity + '%';
            progress_batt_capacity.ariaValueNow = message.battery_capacity;
            progress_batt_capacity.ariaValueMin = 0;
            progress_batt_capacity.ariaValueMax = 100;
            var color_state = 'success';
            if (message.battery_capacity < 50){
                color_state = 'warning'
            }
            if (message.battery_capacity < 20){
                color_state = 'danger'
            }
            progress_batt_capacity.className = 'progress-bar bg-' + color_state +'';


            span_run_charge.innerHTML = message.charge_current_setpoint_run;
            span_run_cutoff.innerHTML = message.precharge_current_setpoint_run;
            span_standy_charge.innerHTML = message.charge_current_setpoint_standby;
            span_standy_cutoff.innerHTML = message.precharge_current_setpoint_standby;
            span_pcb_temp.innerHTML = message.temp2_setpoint;
            span_ext_temp.innerHTML = message.temp_setpoint;
        });
    }
}

class PmButtons{

    constructor(ros) {
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


window.onload = function () {
    ros = new ROS();
    icon_statuspm = new IconStatusPM(ros);
    power_module = new PowerModule(ros);
    pm_buttons = new PmButtons(ros);

    btn_run_charge.onclick = function() {
        pm_buttons.pub_set_charge_current_running(value = parseInt(input_run_charge.value),
        input_run_charge.value = ""
    )};

    btn_run_cutoff.onclick = function() {
        pm_buttons.pub_set_precharge_current_running(value = parseInt(input_run_cutoff.value),
        input_run_cutoff.value = ""
    )};

    btn_standy_charge.onclick = function() {
        pm_buttons.pub_set_charge_current_standby(value = parseInt(input_standy_charge.value),
        input_standy_charge.value = ""
    )};

    btn_standy_cutoff.onclick = function() {
        pm_buttons.pub_set_precharge_current_standby(value = parseInt(input_standy_cutoff.value),
        input_standy_cutoff.value = ""
    )};

    btn_ext_temp.onclick = function() {
        pm_buttons.pub_set_temp_setpoint(value = parseInt(input_ext_temp.value),
        input_ext_temp.value = ""
    )};

    btn_pcb_temp.onclick = function() {
        pm_buttons.pub_set_temp2_setpoint(value = parseInt(input_pcb_temp.value),
        input_pcb_temp.value = ""
    )};

    btn_motor_on.onclick = function() {pm_buttons.pub_set_motor_switch(value = true)};
    btn_motor_off.onclick = function() {pm_buttons.pub_set_motor_switch(value = false)};
    btn_mower_on.onclick = function() {pm_buttons.pub_set_bat_out_switch(value = true)};
    btn_mower_off.onclick = function() {pm_buttons.pub_set_bat_out_switch(value = false)};



} /// end of on.load()




