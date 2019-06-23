//initialize the realtime database connetction
var database = firebase.database();

//configure the user login duration to session status
//Users stay logged in until the tab / browser is closed
//refreshing the page has no effect on user session status
firebase
  .auth()
  .setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .catch(function(err) {
    console.log("ERROR -" + err.code + ": " + err.message);
  });

// set global variables for the user that will:
//   1. hold an instance of the current user which allows for easy access to firebase.auth().currentUser
//
//   2. hold a reference to the root level of the user database directoy (the directory structure is of
//       the form '/user/<user-token>'), where <user-token> is a unique token generated by firebase.auth()
//       and accessible via firebase.auth().currentUser.uid
//
//   3. hold a reference to the user's profile directory ('/users/<user-token>/profile)
//      a. this directory will hold any extra information we may want to store for the user
//
//   4. hold a reference to the user's recipe directory ('/users/<user-token>/recipe_box)
var currentUser;
var userDatabase;
var userProfile;
var userRecipeBox;

//Define login functions to be called when a user signs up / logs in

function createNewUser(email, password, userName) {
  //call firebase auth to generate the new user
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    })
    .then(function() {
      //at this point, the user is logged in
      //grab the user pointer and store it in the global variable defined above
      currentUser = firebase.auth().currentUser;
      //update the user profile to include their name
      currentUser
        .updateProfile({
          displayName: userName
        })
        .then(function() {
          //TODO - actions to take when a user makes an account
          console.log(currentUser.uid + ": created account");
        })
        .catch(function(err) {
          console.log("ERROR -" + err.code + ": " + err.message);
        });

      //set up a database directory for the user
      userDatabase = database.ref("/users/" + currentUser.uid);
      //set up a database directory for the user's profile
      userProfile = database.ref("/users/" + currentUser.uid + "/profile");
      //set up a database directory for the user's recipe box
      userRecipeBox = database.ref("/users/" + currentUser.uid + "/recipe_box");
      //Great! our new user now has a custom name, a profile, and a place to store recipes
      //At this point we haven't written anything to the databse. We've just set up database references
    });
}

function login(email, password) {
  //the signin function links the global user variable and directory paths to the current user
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(function() {
      //at this point, the user is logged in
      //grab the user pointer and store it in the global variable defined above
      currentUser = firebase.auth().currentUser;
      //link to the database directory for the user
      userDatabase = database.ref("/users/" + currentUser.uid);
      //link to the database directory for the user's profile
      userProfile = database.ref("/users/" + currentUser.uid + "/profile");
      //link to the database directory for the user's recipe box
      userRecipeBox = database.ref("/users/" + currentUser.uid + "/recipe_box");
      //TODO - load the user's recipe box and profile information, if any
      console.log(currentUser.uid + ": signed into account");
    })
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    });
}

function guestSignIn() {
  //the guest sign in function allows users without profiles to interact with the site's full functionality
  firebase
    .auth()
    .signInAnonymously()
    .then(function() {
      //with anonymous logins, firebase.auth() creates a user token just as in the above functions.
      //we will use that token in the same way as we would for a regular user who just signed up for the first time
      //grab the user pointer and store it in the global variable defined above
      currentUser = firebase.auth().currentUser;
      //update the user profile to include their name
      currentUser
        .updateProfile({
          displayName: "guest"
        })
        .then(function() {
          //any actions that needs to happed after the display name is updated goes here
          console.log(currentUser.uid + ": is anonymous");
        })
        .catch(function(err) {
          console.log("ERROR -" + err.code + ": " + err.message);
        });
      //set up a database directory for the guest
      userDatabase = database.ref("/users/" + currentUser.uid);
      //set up a database directory for the guest's profile
      userProfile = database.ref("/users/" + currentUser.uid + "/profile");
      //set up a database directory for the guest's recipe box
      userRecipeBox = database.ref("/users/" + currentUser.uid + "/recipe_box");
      //Great! our new guest now has a custom name, a profile, and a place to store recipes
    })
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    });
}

//A function that will link guest user accounts with newly created email and password accounts
//TODO - there needs to be some logic behind the sign-up form that will catch exisiting anonymous users
function linkGuestToAccount(email, password, userName) {
  //to link accounts, we need to get a credential for the new email and password
  var credential = firebase.auth.EmailAuthProvider.credential(email, password);
  //we then pair that credential with the current user
  firebase
    .auth()
    .currentUser.linkAndRetrieveDataWithCredential(credential)
    .then(function(userCredential) {
      //at this point, the credential is paired with the guest. To finalize this step
      //we need to update our global variable which points to the current user
      currentUser = userCredential.user;
      //and that's that.
      //next, we update the user's displayName stored by firebase.auth()
      currentUser
        .updateProfile({
          displayName: userName
        })
        .then(function() {
          //TODO - update the UI to reflect the user name changes, because linking acounts
          //does not change the user status, and so the next function defined below will not fire
        })
        .catch(function(err) {
          console.log("ERROR -" + err.code + ": " + err.message);
        });
    })
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
    });
}

//In order to display content in the UI and track events linked to the user login/out
//we need a function which will fire when user status changes
firebase.auth().onAuthStateChanged(function(user) {
  //when a user logs in / out, this function will fire
  if (user) {
    //a user has signed in. Note - this block is reached when
    //  1. an existing user signs in
    //  2. a new user creates an account
    //  3. someone signs in anonymously (as a guest)
    //this block is NOT reached when an anonymous account is linked to a new account
    //TODO - populate the UI with profile data
    //TODO - populate the recipe box from the user's database directory
    currentUser = firebase.auth().currentUser;
    console.log(currentUser.uid + ": has fired the onAuthStateChanged event");
  } else {
    //this block is reached when the poage loads without a user logged in, or a user signs out, or navigates away from the page, or the tab/window is closed
    //I am unsure of how this code block behaves when the latter of the four conditions is undertaken. Testing is required.

    //best practices dictate that the instance of the user is reset to prevent any other functions from accessing
    //data or methods attached to the user that left.
    console.log("a user logged out");
    currentUser = undefined;
  }
});

//The following routines may or may not be needed for the UI - they were developed for testing but can be ported to the main project
function displayUserData(name, email) {
  $("#user-info-name").text(name);
  $("#user-info-email").text(email);
  $("#user-info-displayName").text(currentUser.displayName);
  $("#user-info-isAnonymous").text(currentUser.isAnonymous);
  $("#user-info-uid").text(currentUser.uid);
  //TODO - read from the database to pull the stored data keys and data
}

//sign up a user - this method should only be reachable for anonymous user present or no user present states.
//a logged in user should never reach this function.
$("#sign-up-button").on("click", function() {
  var userName = $("#sign-up-name")
    .val()
    .trim();
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

//sign in a user
$("#sign-in-button").on("click", function() {
  var email = $("#sign-in-email")
    .val()
    .trim();
  var password = $("#sign-in-password")
    .val()
    .trim();
  login(email, password);
});

//sign in a user anonymously
$("#anonymous-login").on("click", function() {
  guestSignIn();
});

//logging out a user
$("#logout").on("click", function() {
  firebase
    .auth()
    .signOut()
    .then(function() {
      console.log("user signed out");
      //Any action to perform if a user signs out
    });
});
