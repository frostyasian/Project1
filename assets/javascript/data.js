//global variables for recipes
//an array of saved recipe objects which maps 1 to 1 with the recipes stored on the server
var storedRecipeCache = [];
//an indexed array of recipe keys which maps 1 to 1 with the recipe objects
var storedRecipeKeys = [];
//a function called when a new user is created
function setProfileData() {
  var timeInMilis = new Date().getTime(); //this is a time string in miliseconds since Jan 1, 1970
  userProfileRef
    .set({
      userName: currentUser.displayName,
      isLoggedIn: true,
      lastLogin: timeInMilis,
      profileImage: "" //not currently supported
    })
    .catch(function(err) {
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

//a method to load the local cache of recipes
//this method should only be called once, when a user logs in, from auth.js method : onAuthStateChanged
function fetchRecipes() {
  userRecipeBoxRef
    .once("value", function(snapshot) {
      //store the snapshot value in a variable. The value is formatted as a JSON object

      var obj = snapshot.val();
      //if the user has nothing stored in their database, obj will be null
      if (obj === null) {
        return;
      }
      //Use the built in data type methd Object.key() to get the keys of the object as an array
      var keys = Object.keys(obj);
      //looping over the keys is equivalent to looping through the object data
      for (var i = 0; i < keys.length; i++) {
        if (!storedRecipeKeys.includes(keys[i])) {
          storedRecipeKeys.push(keys[i]);
          storedRecipeCache.push(obj[keys[i]]);
        }
      }
      updateRecipeBox();
    })
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    });
}

//a function to store a recipe in the recipe box and on the server
function saveRecipe(recipeObject, label) {
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

  if (!storedRecipeCache.includes(recipeObject)) {
    //for indexing purposes, store the key of the recipe in the recipe object
    var key = userRecipeBoxRef.push().key; //when new data is pushed to the database, a random hash key is generated
    recipeObject.key = key;
    recipeObject.tab = label;
    //store the recipe locally;
    storedRecipeCache.push(recipeObject);
    storedRecipeKeys.push(key);
    //update the recipe box locally
    updateRecipeBox();
    //update the server
    userRecipeBoxRef
      .child(key) //this is how to access sub directories. This only works if the key exists, which is why the code on line 61 is so important.
      .set(recipeObject) //this method fails for any object key that takes a value of undefined
      .then(function() {
        console.log("recipe stored");
      })
      .catch(function(err) {
        console.log("ERROR -" + err.code + ": " + err.message);
      });
  } else {
    var key = recipeObject.key;
    recipeObject.tab = label;
    updateData(userRecipeBoxRef.child(key), { tab: label });
  }
}

//a function to delete a recipe - TODO - update this function!!!!!
function deleteRecipe(key) {
  var index = storedRecipeKeys.indexOf(key);
  var tempCache = [];
  var tempKeys = [];
  //pull items from the recipe key and cach arrays until the item to be deleted is in the 0th position in the array, store the data that is pulled in a temp location -- this can be made more efficient
  for (var i = 0; i < index; i++) {
    tempCache.push(storedRecipeCache.shift());
    tempKeys.push(storedRecipeKeys.shift());
  }
  //shift out the key and cache for the item to be deleted
  storedRecipeCache.shift();
  storedRecipeKeys.shift();
  //add back the stored data by pushing. The order doesn't matter because the key and recipe object will have the same index location in the arrays
  for (var j = 0; j < tempCache.length; j++) {
    storedRecipeCache.push(tempCache.shift());
    storedRecipeKeys.push(tempKeys.shift());
  }
  //update the recipe box
  updateRecipeBox();
  //great. we've removed the local reference to the recipe and it's key and preserved the mapping between recipes and keys in the storedRecipe arrays
  //now lets get rid of the recipe on firebase
  userRecipeBoxRef
    .child(key)
    .remove()
    .then(function() {
      console.log("recipe deleted from firebase");
    })
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    });
}
