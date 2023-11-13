// Desc: MobIMU for Vitulus WebUI

class ROS {
    constructor() {
        this.ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});
        console.log("Connected to ROS.");
    }
}


class Diag {
    constructor(ros) {
        var diag_arr = [];

        this.diag_topic = new ROSLIB.Topic({
            ros: ros.ros,
            name: '/diagnostics',
            messageType: 'diagnostic_msgs/DiagnosticArray'
        });

        this.subscribe = this.diag_topic.subscribe(function (message) {
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
            div_diag_all.innerHTML = diag_html_content;
            });
    }
}


window.onload = function () {
    ros = new ROS();
    imu_diag = new Diag(ros);
}