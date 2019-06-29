// This file holds listeners for click and key events only

//document level events are events triggered on the document
//the event listeners that follow are organized by document level execution
//events triggerd and handled by the document come first. Events triggered by the document
//that are filtered down to the element level come second

//an enter key listener that allows a user to use the enter key to trigger form submission
//or advance through authenticaion flow
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

//A listener to handle clicks on dynamicalyy populated tab dropwdowns for the recipe-box
$(document).on("click", ".tab-option", function() {
  var index = parseInt($(this).attr("value"));
  $("#tab-label").text(recipeTabs[index]);
  $("#tab-select").attr("value", index + "");
  updateRecipeBox();
});

//A listener to handle clicks on dynamicalyy populated tab dropwdowns for the recipe-display modal
$(document).on("click", ".card-tab-option", function() {
  var index = parseInt($(this).attr("value"));
  $("#card-tab-label").text(recipeTabs[index]);
  $("#card-tab-select").attr("value", index + "");
});

//The following click events are a subset of filtered events on the DOM that deal exclusively with
//authentication modal layout and submission

//swap the auth-in and auth-up modals on the fly when a user clicks the divs. This filter is needed
//because the div exists in two different modals with unique ids
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

//A click listener that filters down to search result cards or stored recipe cards. When either of these
//elements are clicked, the recipe is displayed in a modal.
$(document).on("click", ".card,.recipe-card-insert", function() {
  //get the index of the recipe and pull the data object from searchResults array
  var index = parseInt($(this).attr("data-index"));
  //data-source points to the array where the recipe information is stored
  var source = parseInt($(this).attr("data-source"));
  var element = $(this);
  //console.log(source);
  switch (source) {
    case 0:
      displayRecipe(index, searchResults, source, element);
      break;
    case 1:
      displayRecipe(index, storedRecipeCache, source, element);
      break;
    default:
      console.log("defualt at logic.js:194");
  }
});

//a click listener to log a user out. This listener is filtered because the logout link is not always displayed
// on the page.
$(document).on("click", "#logout", function() {
  firebase
    .auth()
    .signOut()
    .then(function() {
      console.log("user signed out");
      //Any action to perform if a user signs out
    });
});

//a listener to log a user in anonymously. This filter is needed
//because the div exists in two different modals with unique ids
$(document).on("click", "#guest-auth-in,#guest-auth-up", function() {
  guestSignIn();
});

//element level click events are events that are assigned directly to elements in the DOM
//if the elements are removed from the DOM, the event listeners are destroyed.

//An authenticaion listener to sign in a user
$("#sign-in").on("click", function(event) {
  event.preventDefault();
  var email = $("#sign-in-email")
    .val()
    .trim();
  var password = $("#sign-in-password")
    .val()
    .trim();
  login(email, password);
});

//An authenticaion listener to sign up a user - this method should only be reachable for
//anonymous user present or no user present states. A logged in user should never reach this function.
$("#sign-up").on("click", function(event) {
  event.preventDefault();

  var userName = $("#sign-up-name")
    .val()
    .trim();
  if (userName.length === 0) {
    var alert = $("#auth-alert-up");
    var uNameField = $("#sign-up-name");
    alert
      .text("you must provide a user name")
      .toggleClass("hidden")
      .toggleClass("bad");
    uNameField.toggleClass("error");
    setTimeout(function() {
      uNameField.toggleClass("error");
      alert.toggleClass("hidden").toggleClass("bad");
    }, 3000);
    return;
  }
  var email = $("#sign-up-email")
    .val()
    .trim();
  var password = $("#sign-up-password")
    .val()
    .trim();

  if (currentUser && currentUser.isAnonymous) {
    linkGuestToAccount(email, password, userName);
  } else {
    createNewUser(email, password, userName);
  }
});

//#box-click is area of the page where "welcome" or the user name appears
//clicking on this element with expand / collapse the sidebar div with identifier #box
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

//the tab-plus-icon is within the recipe-box modal. When clicked, a dialogue is displayed
//that alows users to add a custom tab. If the dialogue is showing, this click function hides the dialogue
$("#tab-plus-icon").on("click", function() {
  var dialogue = $("#custom-tab-dialogue");
  var isShowing = parseInt(dialogue.attr("data-state"));
  if (isShowing) {
    dialogue.css("display", "none").attr("data-state", "0");
  } else {
    dialogue.css("display", "flex").attr("data-state", "1");
  }
});

//the tab-okay-icon lives within the cutom tab dialog. When clicked, a custom tab is added
//to the tab dropdown menus and the custom tab dialogue is closed
$("#tab-okay-icon").on("click", function() {
  //we'll add a new tab string to the recipeTabs array, then build a new tab and append it to the div
  var tabname = $("#custom-tab-input")
    .val()
    .trim();
  $("#custom-tab-input").val("");
  recipeTabs.push(tabname);
  updateData(userProfileRef, { tabs: recipeTabs });
  layoutCustomTabs();
  $("#tab-plus-icon").trigger("click");
});

//the tab cancel icon lives in the custom tab dialog. When clicked, the add custom tab dialogue
//input is cleared, the dialogue is closed and no action is performed.
$("#tab-cancel-icon").on("click", function() {
  //we'll add a new tab string to the recipeTabs array, then build a new tab and append it to the div
  $("#custom-tab-input").val("");
  $("#tab-plus-icon").trigger("click");
});

//the tab-select element lives in the recipe-box modal and contains a label as its first child
//followed by a list of available tabs (both default and custom). Clicking on the tab expands a
//dropdown of clickable divs for the user to select a new tab. Clicking on the tab with the dropdown
//showing will close the dropdown.
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

//the card-tab-select element lives on the recipe details modal
//the element contains a label as its first child followed by a list of abailable tabs (both default and custom)
//Clicking on the tab expands the dropdown div contaiing all of the avialalbe tabs stored in the recipeTabs array
//Clicking on the expanded div will collapse the dropdown.
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

//The card-tab-cancel-icon lives on the recipe details modal. Clicking on the icon closes the modal.
$("#card-tab-cancel-icon").on("click", function() {
  $("#recipe-display-modal")
    .detach()
    .appendTo($("#storage"));
});

//the save-recipe-button element lives on the recipe deisplay modal. CLicking it will assign
//the current recipe to the selected tab on the card. The modal will also close.
$("#save-recipe-button").on("click", function() {
  var source = parseInt($(this).attr("data-source"));
  var newRecipe;
  switch (source) {
    case 0:
      newRecipe = searchResults[parseInt($(this).attr("data-index"))];
      break;
    case 1:
      newRecipe = storedRecipeCache[parseInt($(this).attr("data-index"))];
      break;
    default:
      console.log("defualt at logic.js:194");
  }

  var label = recipeTabs[parseInt($("#card-tab-select").attr("value"))];
  //save the newRecipe to the local cache and the server using saveRecipe in data.js
  saveRecipe(newRecipe, label);
  $("#content").empty();
  $("#recipe-display-modal")
    .detach()
    .appendTo($("#storage"));
  var index = recipeTabs.indexOf(newRecipe.tab);
  $("#tab-label").text(recipeTabs[index]);
  $("#tab-select").attr("value", index + "");
  updateRecipeBox();
});
