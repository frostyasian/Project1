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
    $("#box-gap").css("width", "0px");
  } else {
    box.css("width", "405px").attr("data-showing", "1");
    $("#box-gap").css("width", "405px");
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
  updateRecipeBox();
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

function displayRecipe(index, sourceArray) {
  var rec = sourceArray[index];
  //grab the modal stored in the storage div and make a copy of it.
  var modal = $("#recipe-display-modal");
  $("#save-recipe-button").attr("data-index", index.toString());
  //populate the recipe-specific data to the modal
  $("#recipe-modal-image").attr("src", rec.image);
  //populate the user tabs from the recipe-tabs array
  var dropdownLabel = $("#card-tab-label");
  dropdownLabel.detach();
  $("#card-tab-select").empty();
  for (var i = 0; i < recipeTabs.length; i++) {
    var option = $("<div>")
      .addClass("card-tab-option")
      .attr("value", i.toString())
      .text(recipeTabs[i]);
    $("#card-tab-select").append(option);
  }
  dropdownLabel.prependTo($("#card-tab-select"));
  //label the dropdown with help text
  $("#card-tab-label").text("save recipe to...");
  //update the recipe title
  $("#recipe-modal-title").text(rec.label);
  //update the recipe time

  $("#recipe-modal-time").text(formatTime(rec.totalTime));
  //update the recipe ingredients
  var ingredients = rec.ingredientLines;
  var list = $("#recipe-modal-ingredients");
  list.empty();
  ingredients.forEach(ingredient => {
    list.append("<li>" + ingredient + "</li>");
  });
  //update the recipe external link
  var link = $("#recipe-modal-link");
  link.attr("href", rec.url);
  var host = rec.url.split("/")[2];
  link.text(host + " - " + rec.label);

  modal.detach().appendTo($(".results"));
}

$(document).on("click", ".card,.recipe-card-insert", function() {
  //get the index of the recipe and pull the data object from searchResults array
  var index = parseInt($(this).attr("data-index"));
  //data-source points to the array where the recipe information is stored
  var source = parseInt($(this).attr("data-source"));
  switch (source) {
    case 0:
      displayRecipe(index, searchResults);
      break;
    case 1:
      displayRecipe(index, storedRecipeCache);
      break;
    default:
      console.log("defualt at logic.js:194");
  }
});

$("#card-tab-cancel-icon").on("click", function() {
  $("#recipe-display-modal")
    .detach()
    .appendTo($("#storage"));
});

$("#save-recipe-button").on("click", function() {
  var newRecipe = searchResults[parseInt($(this).attr("data-index"))];
  var label = recipeTabs[parseInt($("#card-tab-select").attr("value"))];
  //save the newRecipe to the local cache and the server using saveRecipe in data.js
  saveRecipe(newRecipe, label);

  $("#recipe-display-modal")
    .detach()
    .appendTo($("#storage"));
});

function updateRecipeBox() {
  $("#recipe-box")
    .detach()
    .appendTo($("#box")); //this is for testing...
  $("#content").empty();
  for (var i = 0; i < storedRecipeCache.length; i++) {
    var r = storedRecipeCache[i];
    //console.log(storedRecipeCache);
    var currentTab = $("#tab-label").text();
    if (currentTab == r.tab) {
      var insert = $("<div>")
        .addClass("recipe-card-insert")
        .attr("data-index", i.toString())
        .attr("data-source", "1");
      var imgURL = r.image;
      var image = $("<img>")
        .attr("src", imgURL)
        .addClass("recipe-image-tiny");
      var title = r.label;

      var timestring = formatTime(r.totalTime);
      var div = $("<div>")
        .addClass("recipe-insert-info")
        .append("<div>" + title + "</div>", "<div>" + timestring + "</div>");
      insert.append(image, div).appendTo($("#content"));
    }
  }
}

//a function that takes in a time string from the recipe object and retuns a formatted time string for display
//the formatted time string is <hours> 'hours' + <minutes> 'minutes'
function formatTime(time) {
  //turn the time string into an integer and compute the hours and minutes
  var timeInMinutes = parseInt(time);
  //only compute the hours and minutes if time is nonzero
  if (timeInMinutes !== 0) {
    var hours = Math.floor(timeInMinutes / 60);
    var minutes = Math.round(timeInMinutes % 60);
    return hours + " hours " + minutes + " minutes";
  }
  return "no time data exists for this recipe";
}

$(document).on("click", "#swap-auth-in,#swap-auth-up", function() {
  var inModal = $("#auth-modal-in");
  var upModal = $("#auth-modal-up");
  var storage = $("#storage");
  var box = $("#box");
  var swapTo = $(this)
    .attr("id")
    .split("-")
    .pop();
  if (swapTo === "up") {
    inModal.detach().appendTo(storage);
    upModal.detach().appendTo(box);
  } else {
    inModal.detach().appendTo(box);
    upModal.detach().appendTo(storage);
  }
});

$(document).on("keyup", function(event) {
  if (event.keyCode !== 13) return; //only perform the following code block if the enter key is pressed
  //get the object that has focus and determine what action needs to be taken
  var activeElement = $(document.activeElement);
  var targetId = activeElement.attr("id");
  console.log(targetId);

  if (targetId === "recipe-search") {
    $("#search-icon").trigger("click");
  } else if (targetId === "sign-in-email") {
    $("#sign-in-password").focus();
  } else if (targetId === "sign-in-password") {
    $("#sign-in").trigger("click");
  } else if (targetId === "custom-tab-input") {
    $("#tab-okay-icon").trigger("click");
  }
});
