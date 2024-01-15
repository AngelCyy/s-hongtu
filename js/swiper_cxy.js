$(function () {

  var wheight = $(window).innerHeight();

  $(window).resize(function () {
    wheight = $(window).innerHeight();
  });

  $('.swiper-img-480').css({ "height": wheight + "px" });

});

















var swiper = new Swiper('.swiper-container', {
  pagination: '.swiper-pagination',
  //设置轮播的循环方式
  loop: true,
  //设置自动播放间隔时间
  autoplay: 3500,
  // 轮播效果,默认为平滑轮播
  effect: "slide",
  paginationClickable: true,

});
var swiper1 = new Swiper('.swiper-container1', {
  pagination: '.swiper-pagination',
  slidesPerView: 'auto',
  paginationClickable: true,
  spaceBetween: 30,
  loop: true,
  //设置自动播放间隔时间
  autoplay: 3500,
  // 轮播效果,默认为平滑轮播
  effect: "slide",

});
var swiper2 = new Swiper('.swiper-container2', {
  pagination: '.swiper-pagination',
  //设置轮播的循环方式
  loop: true,
  //设置自动播放间隔时间
  //设置自动播放间隔时间
  autoplay: 3500,
  // 轮播效果,默认为平滑轮播
  effect: "slide",
  paginationClickable: true,

});
var swiper3 = new Swiper('.swiper-container3', {
  pagination: '.swiper-pagination',
  //设置轮播的循环方式
  loop: true,
  //设置自动播放间隔时间
  //设置自动播放间隔时间
  // autoplay: 3500,
  // 轮播效果,默认为平滑轮播
  effect: "slide",
  paginationClickable: true,

});
