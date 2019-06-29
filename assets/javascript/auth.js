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
var userDatabaseRef;
var userProfileRef;
var userRecipeBoxRef;

//Define login functions to be called when a user signs up / logs in

function createNewUser(email, password, userName) {
  //call firebase auth to generate the new user
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .catch(function(err) {
      console.log("ERROR -" + err.code + ": " + err.message);
      var email = $("#sign-up-email");
      var password = $("#sign-up-password");
      var alert = $("#auth-alert-up");
      if (err.code.includes("email")) {
        alert
          .text(err.message)
          .toggleClass("hidden")
          .toggleClass("bad");
        email.toggleClass("error");
        setTimeout(function() {
          email.toggleClass("error");
          alert.toggleClass("hidden").toggleClass("bad");
        }, 3000);
      } else if (err.code.includes("password")) {
        alert
          .text(err.message)
          .toggleClass("hidden")
          .toggleClass("bad");
        password.toggleClass("error");
        setTimeout(function() {
          password.toggleClass("error");
          alert.toggleClass("hidden").toggleClass("bad");
        }, 3000);
      } else if (err.code == "auth/user-not-found") {
        alert
          .text("No account associated with this email. Please try again.")
          .toggleClass("hidden")
          .toggleClass("bad");
        password.toggleClass("error");
        email.toggleClass("error");
        setTimeout(function() {
          password.toggleClass("error");
          email.toggleClass("error");
          alert.toggleClass("hidden").toggleClass("bad");
        }, 3000);
      }
    })
    .then(function() {
      //at this point, the user is logged in
      //grab the user pointer and store it in the global variable defined above
      flowPastLogin($("#auth-modal-up"));
      currentUser = firebase.auth().currentUser;
      //update the user profile to include their name
      currentUser
        .updateProfile({
          displayName: userName
        })
        .then(function() {
          $("#box-click").text(currentUser.displayName);
        })
        .catch(function(err) {
          console.log("ERROR -" + err.code + ": " + err.message);
        });

      //set up a database directory for the user
      userDatabaseRef = database.ref("/users/" + currentUser.uid);
      //set up a database directory for the user's profile
      userProfileRef = database.ref("/users/" + currentUser.uid + "/profile");
      //set up a database directory for the user's recipe box
      userRecipeBoxRef = database.ref("/users/" + currentUser.uid + "/recipe_box");
      //Great! our new user now has a custom name, a profile, and a place to store recipes
      //At this point we haven't written anything to the databse. We've just set up database references

      //set up the user's profile directory
      setProfileData(userProfileRef);
    });
}

function login(email, password) {
  //the sign in function links the global user variable and directory paths to the current user
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(function() {
      //at this point, the user is logged in
      //grab the user pointer and store it in the global variable defined above
      currentUser = firebase.auth().currentUser;
      //link to the database directory for the user
      userDatabaseRef = database.ref("/users/" + currentUser.uid);
      //link to the database directory for the user's profile
      userProfileRef = database.ref("/users/" + currentUser.uid + "/profile");
      //link to the database directory for the user's recipe box
      userRecipeBoxRef = database.ref("/users/" + currentUser.uid + "/recipe_box");
      //TODO - load the user's recipe box and profile information, if any
      $("#box-click").text(currentUser.displayName);
      flowPastLogin($("#auth-modal-in"));
    })
    .catch(function(err) {
      console.log("ERROR - " + err.code + ": " + err.message);
      var email = $("#sign-in-email");
      var password = $("#sign-in-password");
      var alert = $("#auth-alert-in");
      if (err.code.includes("email")) {
        alert
          .text(err.message)
          .toggleClass("hidden")
          .toggleClass("bad");
        email.toggleClass("error");
        setTimeout(function() {
          email.toggleClass("error");
          alert.toggleClass("hidden").toggleClass("bad");
        }, 3000);
      } else if (err.code.includes("password")) {
        alert
          .text(err.message)
          .toggleClass("hidden")
          .toggleClass("bad");
        password.toggleClass("error");
        setTimeout(function() {
          password.toggleClass("error");
          alert.toggleClass("hidden").toggleClass("bad");
        }, 3000);
      } else if (err.code == "auth/user-not-found") {
        alert
          .text("No account associated with this email. Please try again.")
          .toggleClass("hidden")
          .toggleClass("bad");
        password.toggleClass("error");
        email.toggleClass("error");
        setTimeout(function() {
          password.toggleClass("error");
          email.toggleClass("error");
          alert.toggleClass("hidden").toggleClass("bad");
        }, 3000);
      }
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
      flowPastLogin($($("#box").children()));
      currentUser = firebase.auth().currentUser;
      //update the user profile to include their name
      currentUser
        .updateProfile({
          displayName: "guest"
        })
        .then(function() {
          //any actions that needs to happed after the display name is updated goes here
          $("#box-click").text(currentUser.displayName);
        })
        .catch(function(err) {
          console.log("ERROR -" + err.code + ": " + err.message);
        });
      //set up a database directory for the guest
      userDatabaseRef = database.ref("/users/" + currentUser.uid);
      //set up a database directory for the guest's profile
      userProfileRef = database.ref("/users/" + currentUser.uid + "/profile");
      //set up a database directory for the guest's recipe box
      userRecipeBoxRef = database.ref("/users/" + currentUser.uid + "/recipe_box");
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
          $("#box-click").text(currentUser.displayName);
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

    //TODO - populate the recipe box from the user's database directory
    currentUser = firebase.auth().currentUser;
    //a redundancy in the code that ensures that the database references are made for users who refresh the page or chose to stay logged in
    userDatabaseRef = database.ref("/users/" + currentUser.uid);
    userProfileRef = database.ref("/users/" + currentUser.uid + "/profile");
    userRecipeBoxRef = database.ref("/users/" + currentUser.uid + "/recipe_box");
    fetchRecipes();
    fetchRecipeTabs();
    //update the UI with user profile data
    $("#box-click").text(currentUser.displayName);
    $("#user-data").append("<span id='logout'>sign out</span>");
    $("#recipe-box")
      .detach()
      .appendTo($("#box"));
  } else {
    //this block is reached when the poage loads without a user logged in, or a user signs out, or navigates away from the page, or the tab/window is closed
    //I am unsure of how this code block behaves when the latter of the four conditions is undertaken. Testing is required.

    //on page load - if there is no user, display the sign-in modal
    $($("#box").children())
      .detach()
      .appendTo($("#storage"));
    var modal = $("#auth-modal-in");
    modal.detach().appendTo($("#box"));
    //best practices dictate that the instance of the user is reset to prevent any other functions from accessing
    //data or methods attached to the user that left.
    currentUser = undefined;
    storedRecipeCache = [];
    storedRecipeKeys = [];
    searchResults = [];
    $("#logout").remove();
    $("#box-click").text("Welcome");
    //there are other things to add to this list.
  }
});
