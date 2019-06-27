//global variables
var box = $("#box"); //add items with .append();
var storage = $("#storage"); //store hidden items here - modals and dialouges
var alert = $("#alert");

//global arrays
//store the names of the user tabs in an array. This array is mirrored on the server
//TODO - include the tab names in the user profile section of the database (as an array)
var recipeTabs = ["tab 0", "tab 1", "tab 2", "tab 3", "tab 4", "tab 5", "tab 6"];

$("#box-click").on("click", function() {
  var isShowing = parseInt(box.attr("data-showing"));
  if (isShowing) {
    box.css("width", "0px").attr("data-showing", "0");
  } else {
    box.css("width", "405px").attr("data-showing", "1");
  }
});

$("#tab-all").on("click", function() {
  toggleActiveTab($(this));
});

$("#tab-select").on("click", function() {
  var isShowing = parseInt($(this).attr("data-state"));
  var max = $(window).height() - 93;
  var height =
    36 *
    $(this)
      .children()
      .toArray().length;
  if (isShowing) {
    $(this)
      .css("height", "36px")
      .attr("data-state", "0");
    toggleActiveTab($(this));
  } else {
    if ($(this).hasClass("active-tab")) {
      $(this).removeClass("active-tab");
    }
    if (height < max) {
      $(this)
        .css("height", height + "px")
        .attr("data-state", "1");
    } else {
      $(this)
        .css("height", max + "px")
        .attr("data-state", "1");
    }
  }
});

$(document).on("click", ".tab-option", function() {
  var index = parseInt($(this).attr("value"));
  $("#tab-label").text(recipeTabs[index]);
  $("#tab-select").attr("value", index + "");
});

$("#tab-plus-icon").on("click", function() {
  var dialogue = $("#custom-tab-dialogue");
  var isShowing = parseInt(dialogue.attr("data-state"));
  if (isShowing) {
    dialogue.css("display", "none").attr("data-state", "0");
  } else {
    dialogue.css("display", "flex").attr("data-state", "1");
  }
});

$("#tab-okay-icon").on("click", function() {
  //we'll add a new tab string to the recipeTabs array, then build a new tab and append it to the div
  var tabname = $("#custom-tab-input")
    .val()
    .trim();
  $("#custom-tab-input").val("");
  recipeTabs.push(tabname);
  layoutCustomTabs();
  $("#tab-plus-icon").trigger("click");
});

function layoutCustomTabs() {
  var label = $("#tab-label");
  label.detach();
  var tabDiv = $("#tab-select");
  tabDiv.empty();
  recipeTabs.sort();
  recipeTabs.forEach(function(value, index) {
    var tab = $("<div>")
      .addClass("tab-option")
      .attr("value", index + "")
      .text(value);
    tabDiv.append(tab);
  });
  tabDiv.prepend(label);
}

$("#tab-cancel-icon").on("click", function() {
  //we'll add a new tab string to the recipeTabs array, then build a new tab and append it to the div
  $("#custom-tab-input").val("");
  $("#tab-plus-icon").trigger("click");
});

function toggleActiveTab(tab) {
  $("#tab-all").removeClass("active-tab");
  $("#tab-select").removeClass("active-tab");

  tab.addClass("active-tab");
}

$("#card-tab-select").on("click", function() {
  var isShowing = parseInt($(this).attr("data-state"));
  if (isShowing) {
    $(this)
      .css("height", "24px")
      .attr("data-state", "0");
  } else {
    $(this)
      .css("height", "auto")
      .attr("data-state", "1");
  }
});

$(document).on("click", ".card-tab-option", function() {
  var index = parseInt($(this).attr("value"));
  $("#card-tab-label").text(recipeTabs[index]);
  $("#card-tab-select").attr("value", index + "");
});

$("#card-tab-cancel-icon").on("click", function() {
  //close the recipe card
});

$("#save-recipe-button").on("click", function() {
  //movethe recipe to the recipe-box, index the recipe accordingly, push to server, etc.
});

$(document).on("click", ".card", function() {});
