//global variables
var box = $("#box"); //add items with .append();
var storage = $("#storage"); //store hidden items here - modals and dialouges
var alert = $("#alert");

//global arrays
//store the names of the user tabs in an array. This array is mirrored on the server
//TODO - include the tab names in the user profile section of the database (as an array)
var recipeTabs = [];

//A function that handles css class designation for the active tab in the recipe box
function toggleActiveTab(tab) {
  $("#tab-all").removeClass("active-tab");
  $("#tab-select").removeClass("active-tab");

  tab.addClass("active-tab");
}

function displayRecipe(index, sourceArray, source, element) {
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
  if (ingredients.length === 1) {
    //handle single string of ingredients here
  }
  ingredients.forEach(ingredient => {
    list.append("<li>" + ingredient + "</li>");
  });
  //update the recipe external link
  var link = $("#recipe-modal-link");
  link.attr("href", rec.url);
  var host = rec.url.split("/")[2];
  link.text(host + " - " + rec.label);
  $("#save-recipe-button").attr("data-source", source + "");
  //index tells me where the div should go in the results pane
  //the goal here is a google-image-like experience

  if (!source) {
    modal.detach().insertAfter(element);
  } else {
    modal.detach().prependTo($(".results"));
  }

  //refresh the recipe-box modal tabs
  updateRecipeBox();
  //buggy?
}

function updateRecipeBox() {
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
    if (hours === 0) {
      return minutes + "minutes";
    }
    return hours + " hours " + minutes + " minutes";
  }
  return "- minutes";
}

//a function that loads the recipe box for a user / guest and closes the box modal after login
function flowPastLogin(self) {
  console.log(self);
  self.detach().appendTo($("#storage"));
  $("#recipe-box")
    .detach()
    .appendTo($("#box"));
  $("#box-click").trigger("click");
}

// a lot of this function is copied from the above code (consider refactoring)
function saveRecipeToCurrentTab(searchResultIndex) {
  var newRecipe;
  newRecipe = searchResults[searchResultIndex];
  var label = recipeTabs[parseInt($("#card-tab-select").attr("value"))];
  saveRecipe(newRecipe, label);
  // copied from above
  $("#content").empty();
  $("#recipe-display-modal")
    .detach()
    .appendTo($("#storage"));
  var index = recipeTabs.indexOf(newRecipe.tab);
  $("#tab-label").text(recipeTabs[index]);
  $("#tab-select").attr("value", index + "");
  updateRecipeBox();
}

function allowDrop(ev) {
  ev.preventDefault();
}

// see also buildCard in search.js
function drag(ev) { // set what gets passed to target
//  ev.dataTransfer.setData("text", ev.target.id); // original example code
  ev.dataTransfer.setData("text", ev.target.getAttribute("data-index"));  // data-index is the index of this card in the search results 
}

function drop(ev) {  
  ev.preventDefault();
  var searchResultIndex = ev.dataTransfer.getData("text");
  console.log("drop event handler - searchResultIndex: '" + searchResultIndex + "'");
  saveRecipeToCurrentTab(searchResultIndex);
}

