// var goFS = document.getElementById("goFS");
// goFS.addEventListener("click", function() {

// const elem = document.documentElement;
// if (elem.requestFullscreen) {elem.requestFullscreen()}

// }, true);


const btns = document.querySelectorAll('button[id^=btn]')

btns.forEach(btn => {

   btn.addEventListener('click', event => {
       setTimeout(function () {
          console.log("Button");
           console.log(btn.className)           
           btn.blur();
           btn.classList.remove("active");
           console.log(btn.className)
        }, 100);
       // console.log( event.target.id );
   });

});

// changeViewerSize = function(){
//     let div_navbar_height = document.getElementById("div_navbar").clientHeight;
//     let div_buttons_height = document.getElementById("div_buttons").clientHeight;
//     let height_offset = div_navbar_height + div_buttons_height;
//     // height_offset = 0;
//     let width = document.getElementById("div_container").clientWidth;
//     let height = document.getElementById("div_container").clientHeight;
//     let padding = parseInt((document.getElementById("div_container").style.padding).replace('px', ''));
//     console.log('width: ' + width);
//     console.log('height: ' + height);
//     console.log('padding: ' + padding);
//     document.getElementById("div_content").style.width =  (width - (padding * 2)) + 'px';
//     document.getElementById("div_content").style.height = (height - height_offset - (padding * 2)) + 'px';
//     // document.getElementById("div_body_upper").style.width =  (width - (padding * 2)) + 'px';
//     // document.getElementById("div_body_upper").style.height = (height - height_offset - (padding * 2)) / 2 + 'px';
//     // document.getElementById("div_body_lower").style.width =  (width - (padding * 2)) + 'px';
//     // document.getElementById("div_body_lower").style.height = (height - height_offset - (padding * 2)) / 2 + 'px';
//     console.log("resize");
//     console.log(document.getElementById("div_body_lower"));
//     console.log(height);
// };

// changeViewerSize();

// const resizeObserver =  new ResizeObserver((entries) => {
//         for (const entry of entries) {
//             if (entry.target.id === "div_container") {
//                 changeViewerSize();
                
//             }
//         }
//     });
// resizeObserver.observe(document.getElementById("div_container"));


