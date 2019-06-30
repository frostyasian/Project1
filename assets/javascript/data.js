//global variables for recipes
//store the names of the user tabs in an array. This array is mirrored on the server
var recipeTabs = [];
//an array of saved recipe objects which maps 1 to 1 with the recipes stored on the server
var storedRecipeCache = [];
//an indexed array of recipe keys which maps 1 to 1 with the recipe objects
var storedRecipeKeys = [];
//an indexed array of search results
var searchResults = [];
//a function called when a new user is created
function setProfileData(profileObject) {
  var timeInMilis = new Date().getTime(); //this is a time string in miliseconds since Jan 1, 1970
  userProfileRef.set(profileObject).catch(function(err) {
    console.log("ERROR -" + err.code + ": " + err.message);
  });
}

//a function to call when updating a user's profile. dataObject
//is an object that must contain keys already present in the user
//profile directory! Only pass keys that are being updated, otherwise data may be lost.
function updateData(databaseRef, dataObject = {}) {
  databaseRef.update(dataObject).catch(function(err) {
    console.log("ERROR -" + err.code + ": " + err.message);
  });
}

//a function to store a recipe in the recipe box and on the server
function saveRecipe(recipeObject, tab) {
  if (currentUser === undefined) {
    //expand the box div and display the sign-in modal
    var isShowing = parseInt($("#box").attr("data-showing"));
    var box = $("#box");
    $("#auth-modal-in")
      .detach()
      .appendTo(box);
    if (!isShowing) {
      $("#box-click").trigger("click");
    }
    return;
  }
  //add the recipe to the tab directory on the server.
  userRecipeBoxRef
    .child(tab)
    .push(recipeObject)
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    })
    .then(function() {
      //then we update the recipe box loaclly.
      loadRecipes(tab);
    })
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    });
}

//a function to delete a recipe - TODO - update this function!!!!!
function deleteRecipe(tab, key) {
  userRecipeBoxRef
    .child(tab)
    .child(key)
    .remove()
    .then(function() {
      console.log("recipe deleted from " + tab);
    })
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    });
}

function fetchRecipeTabs() {
  userProfileRef
    .once("value", function(snapshot) {
      //store the snapshot value in a variable. The value is formatted as a JSON object

      var obj = snapshot.val();
      //if the user has nothing stored in their database, obj will be null
      if (obj === null) {
        console.log("no recipes to load");
        return;
      }

      recipeTabs = obj.tabs;
      layoutTabs(recipeTabs, 0);
      loadRecipes(recipeTabs[0]);
    })
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    });
}
