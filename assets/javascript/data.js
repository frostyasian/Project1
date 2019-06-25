//global variables for recipes
//an array of saved recipe objects which maps 1 to 1 with the recipes stored on the server
var storedRecipeCache = [];
//an indexed array of recipe keys which maps 1 to 1 with the recipe objects
var storedRecipeKeys = [];
//a function called when a new user is created
function setProfileData() {
  var timeInMilis = new Date().getTime(); //this is a time string in miliseconds since Jan 1, 1970
  console.log(timeInMilis);
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
//is an object that must contain keys alerady present in the user
//profile directory! Only pass keys that are being updated, otherwise data may be lost.
function updateProfileData(userProfileRef, dataObject = {}) {
  userProfileRef.update(dataObject).catch(function(err) {
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
      //Use the built in data type methd Object.key() to get the keys of the object as an array
      var keys = Object.keys(obj);
      //looping over the keys is equivalent to looping through the object data
      for (var i = 0; i < keys.length; i++) {
        if (!storedRecipeKeys.includes(keys[i])) {
          storedRecipeKeys.push(keys[i]);
          storedRecipeCache.push(obj[keys[i]]);
        }
      }
    })
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    });
}

//a function to store a recipe in the recipe box
function saveRecipe(r, label) {
  if (currentUser === undefined) {
    console.log("you must be logged in to use this feature");
    return;
  }

  //for indexing purposes, store the key of the recipe in the recipe object
  var key = userRecipeBoxRef.push().key; //when new data is pushed to the database, a random hash key is generated

  //Parse out the data we want to keep and use from the recipe object
  //the MVP won't use any digestive data or cautions, daily nutrition or nutrients data
  //these are added features which can be added later by modifying this object
  var recipeObject = {
    key: key,
    title: r.label,
    ingredients: r.ingredients, //an array of objects that contain the ingredient name and the weight in grams !!!the ingredients list may contain doubles!!!
    source: r.source, //the name of the website where the recipe is located
    image: r.image, //the image for the recipe
    url: r.url, //the link to the recipe content on 3rd party site
    dietLabels: r.dietLabels,
    time: r.totalTime, //the total time to make the recipe
    yield: r.yield, //the number of servings
    calories: r.calories, //the total Caloires per serving
    boxLabel: label //the user defined location in their recipe-box
  };
  storedRecipeCache.push(recipeObject);
  storedRecipeKeys.push(key);

  console.log(key);
  sampleKey = key;
  userRecipeBoxRef
    .child(key) //this is how to access sub directories. THis only works if the key exists, which is why the code on line 61 is so important.
    .set(recipeObject) //this method fials for any object key that takes a value of undefined
    .then(function() {
      console.log("recipe stored");
    })
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    });
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

//Automated User Gen and test data
//this method will fail if you did not link your database to the project in the firebase-config.js file
//or if you did not set up authentication in your database
var sampleKey;
$(document).ready(function() {
  guestSignIn();

  setTimeout(function() {
    setProfileData();
  }, 1000);

  setTimeout(function() {
    var queryString = "https://api.edamam.com/search?q=";
    var key = "&app_id=3f5ead16&app_key=c225ae2c7c6a61ce84c5a6514777dbd2";

    $.ajax({
      url: queryString + "chicken" + key,
      method: "GET"
    }).then(function(response) {
      saveRecipe(response.hits[0].recipe, "meat");
      saveRecipe(response.hits[1].recipe, "salad");
      saveRecipe(response.hits[2].recipe, "eggs");
    });
  }, 2000);

  setTimeout(function() {
    fetchRecipes();
  }, 5000);
  setTimeout(function() {
    console.log("deleting " + sampleKey);
    deleteRecipe(sampleKey);
  }, 10000);
});
