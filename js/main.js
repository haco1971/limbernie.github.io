function debounce(e,t,o){var i;return function(){var n=this,s=arguments,c=function(){i=null,o||e.apply(n,s)},l=o&&!i;clearTimeout(i),i=setTimeout(c,t),l&&e.apply(n,s)}}function backToTop(e){if(0!==$("h3").length){var t=$(document).height()/4;$(window).scroll(function(){$(this).scrollTop()>t?btt.show():btt.hide()}),btt.click(function(){$("html, body").animate({scrollTop:0},"fast",function(){$(this).finish()})})}}function draw(){sb.toggle("slide",{direction:"left"},"fast"),overlay(),toggle()}function overlay(){"hidden"===ol.css("visibility")?(ol.css({visibility:"visible",opacity:0}).animate({opacity:1},"fast"),ol.on("click",function(){draw()}),b.css("overflow-y","hidden"),document.body.addEventListener("touchmove",noScroll,{passive:!1})):(ol.css({visibility:"hidden",opacity:1}).animate({opacity:0},"fast"),ol.off("click"),b.css("overflow-y","auto"),document.body.removeEventListener("touchmove",noScroll,{passive:!1}))}function noScroll(e){e.preventDefault(),e.stopPropagation()}function toggle(){var e="fa-ellipsis-",t="fas "+i,o=e+"h",i=e+"v";ic.attr("class")===t?ic.toggleClass(i+" "+o):ic.toggleClass(o+" "+i)}var btt=$(".back-to-top"),sb=$(".sidebar"),mn=$(".menu"),btn=$(".btn"),ph=$(".post-header"),fi=$(".feature-image"),no=$(".notice"),ol=$(".overlay"),b=$("body"),ic=mn.find("i");$(document).ready(function(){$("img[usemap]").rwdImageMaps(),backToTop($(window).width()),mn.click(function(){draw()}),$("#results-container").on("DOMNodeInserted","li",function(e){var t=$("#results-container li"),o=t.length,i=0,n=0;$("#search-input").on("keydown",function(e){38!=e.keyCode&&40!=e.keyCode||e.preventDefault()}),$("#search-input").on("keyup",function(e){var s=e.which;40==s?(n++,1===n&&0===i?t.eq(i).css("background","#eee").siblings().removeAttr("style"):(i++,i%=o,t.eq(i).css("background","#eee").siblings().removeAttr("style"))):38==s?(i--,-1===i&&(i=o-1),t.eq(i).css("background","#eee").siblings().removeAttr("style")):13==s&&t.eq(i).children().get(0).click()}),$("#results-container li").on("mouseover",function(e){$(this).css("cursor","pointer"),$(this).css("background","#eee").siblings().removeAttr("style"),i=$(this).index(),n++}),$("#results-container li").on("click",function(e){$(this).children().get(0).click()})})}),$(window).resize(debounce(function(){backToTop($(window).width()),"none"==sb.css("display")&&sb.removeAttr("style")},500));