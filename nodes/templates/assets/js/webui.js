const btns = document.querySelectorAll('button[id^=btn]')

btns.forEach(btn => {

   btn.addEventListener('click', event => {
       setTimeout(function () {
          console.log("Button");
           console.log(btn.className)
           
           btn.blur();
           btn.classList.remove("active");
           console.log(btn.className)
           // if (btn.hasClass('active')) {
           //    btn.removeClass('active');
           //  }
        }, 100);
       // console.log( event.target.id );
   });

});


