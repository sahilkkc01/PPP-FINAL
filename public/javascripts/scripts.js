(function () {
   "use strict";

   // Toggle Left Menu
   jQuery('.menu-list > a').click(function () {

      var parent = jQuery(this).parent();
      var sub = parent.find('> ul');

      if (!jQuery('body').hasClass('sidebar-menu-collapsed')) {
         if (sub.is(':visible')) {
            sub.slideUp(200, function () {
               parent.removeClass('nav-active');
               jQuery('.main-content').css({
                  height: ''
               });
               mainContentHeightAdjust();
            });
         } else {
            visibleSubMenuClose();
            parent.addClass('nav-active');
            sub.slideDown(200, function () {
               mainContentHeightAdjust();
            });
         }
      }
      return false;
   });

   function visibleSubMenuClose() {
      jQuery('.menu-list').each(function () {
         var t = jQuery(this);
         if (t.hasClass('nav-active')) {
            t.find('> ul').slideUp(200, function () {
               t.removeClass('nav-active');
            });
         }
      });
   }

   function mainContentHeightAdjust() {
      // Adjust main content height
      var docHeight = jQuery(document).height();
      if (docHeight > jQuery('.main-content').height())
         jQuery('.main-content').height(docHeight);
   }

   //  class add mouse hover
   jQuery('.custom-nav > li').hover(function () {
      jQuery(this).addClass('nav-hover');
   }, function () {
      jQuery(this).removeClass('nav-hover');
   });

   //  class add mouse hover
   jQuery('.mail-nav > li').hover(function () {
      jQuery(this).addClass('nav-hover');
   }, function () {
      jQuery(this).removeClass('nav-hover');
   });


   //? Menu Toggle

   //?------------------------------------------------------ 
   // jQuery('.toggle-btn').click(function () {
   //    $(".sidebar-menu").getNiceScroll().hide();

   //    if ($('body').hasClass('sidebar-menu-collapsed')) {
   //       $(".sidebar-menu").getNiceScroll().hide();
   //    }
   //    var body = jQuery('body');
   //    var bodyposition = body.css('position');

   //    if (bodyposition != 'relative') {

   //       if (!body.hasClass('sidebar-menu-collapsed')) {
   //          body.addClass('sidebar-menu-collapsed');
   //          jQuery('.custom-nav ul').attr('style', '');

   //          jQuery(this).addClass('menu-collapsed');

   //       } else {
   //          body.removeClass('sidebar-menu-collapsed chat-view');
   //          jQuery('.custom-nav li.active ul').css({
   //             display: 'block'
   //          });

   //          jQuery(this).removeClass('menu-collapsed');

   //       }
   //    } else {

   //       if (body.hasClass('sidebar-menu-show'))
   //          body.removeClass('sidebar-menu-show');
   //       else
   //          body.addClass('sidebar-menu-show');

   //       mainContentHeightAdjust();
   //    }

   // });







   // searchform_reposition();

   // jQuery(window).resize(function () {

   //    if (jQuery('body').css('position') == 'relative') {

   //       jQuery('body').removeClass('sidebar-menu-collapsed');

   //    } else {

   //       jQuery('body').css({
   //          left: '',
   //          marginRight: ''
   //       });
   //    }

   //    searchform_reposition();

   // });




   jQuery(document).ready(function () {
      // Initially hide fa-star elements
      jQuery('.fa-star').hide();
      jQuery('.collapse-sidebar-text').hide();
      jQuery('.Menu_Top').css('display', 'none');
      jQuery('.toggle-btn').css('width', '2.8rem');


      jQuery('.toggle-btn').click(function () {
         $(".sidebar-menu").getNiceScroll().hide();

         var body = jQuery('body');
         var bodyposition = body.css('position');

         if (bodyposition != 'relative') {

            if (!body.hasClass('sidebar-menu-collapsed')) {
               body.addClass('sidebar-menu-collapsed');
               jQuery('.custom-nav ul').attr('style', '');

               jQuery(this).addClass('menu-collapsed');

               // Show fa-star elements when the sidebar is expanded
               jQuery('.fa-star').hide();
               jQuery('.collapse-sidebar-text').hide();
               jQuery('.Menu_Top').hide();
               jQuery('.Menu-Box-Icon').show()

               jQuery('.Menu_Top').css('display', 'none');
               jQuery('.toggle-btn').css('width', '2.8rem');

            } else {
               body.removeClass('sidebar-menu-collapsed chat-view');
               jQuery('.custom-nav li.active ul').css({
                  display: 'block'
               });

               jQuery(this).removeClass('menu-collapsed');

               // Hide fa-star elements when the sidebar is collapsed
               jQuery('.fa-star').show();
               jQuery('.collapse-sidebar-text').show();
               jQuery('.Menu_Top').show();
               jQuery('.Menu-Box-Icon').hide()

               jQuery('.Menu_Top').css('display', 'flex');

               jQuery('.toggle-btn').css('width', '17.3rem');


            }
         } else {

            if (body.hasClass('sidebar-menu-show'))
               body.removeClass('sidebar-menu-show');
            else
               body.addClass('sidebar-menu-show');

            mainContentHeightAdjust();
         }
      });

      searchform_reposition();

      jQuery(window).resize(function () {

         if (jQuery('body').css('position') == 'relative') {

            jQuery('body').removeClass('sidebar-menu-collapsed');

            // Ensure fa-star is hidden when body is in 'relative' position
            jQuery('.fa-star').hide();

         } else {

            jQuery('body').css({
               left: '',
               marginRight: ''
            });

            // Show fa-star elements when body is not in 'relative' position
            jQuery('.fa-star').hide();
         }

         searchform_reposition();
      });
   });





   //?----------------------------------------------------------------------------- 


   function searchform_reposition() {
      if (jQuery('.searchform').css('position') == 'relative') {
         jQuery('.searchform').insertBefore('.sidebar-menu-inner .logged-user');
      } else {
         jQuery('.searchform').insertBefore('.menu-right');
      }
   }
})(jQuery);

// Dropdowns Script
// $(document).ready(function () {
//    $(document).on('click', function (ev) {
//       ev.stopImmediatePropagation();
//       $(".dropdown-toggle").dropdown("active");
//    });
// });



/************** Search ****************/
$(function () {
   var button = $('#loginButton');
   var box = $('#loginBox');
   var form = $('#loginForm');
   button.removeAttr('href');
   button.mouseup(function (login) {
      box.toggle();
      button.toggleClass('active');
   });
   form.mouseup(function () {
      return false;
   });
   $(this).mouseup(function (login) {
      if (!($(login.target).parent('#loginButton').length > 0)) {
         button.removeClass('active');
         box.hide();
      }
   });
});






$(document).ready(function () {
  // Dropdown toggle
  $(".dropdown-toggle").click(function (e) {
    var $el = $(this).next(".dropdown-menu");
    var isVisible = $el.is(":visible");

    // Close all open dropdowns
    $(".dropdown-menu").slideUp("400");

    // Toggle current dropdown
    if (!isVisible) {
      $el.stop(true, true).slideDown("400");
    }
  });

  // Close the dropdown if clicked outside
  $(document).click(function (e) {
    if (!$(e.target).closest(".dropdown").length) {
      $(".dropdown-menu").slideUp("400");
    }
  });

  // Prevent dropdown menu from closing when clicked inside
  $(".dropdown").click(function (e) {
    e.stopPropagation();
  });
});


