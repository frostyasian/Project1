var queryString = "https://api.edamam.com/search?q=";
var searchTerm = "";
var range = 25;
var current = 0;
var max = 25;
//the search method performs an ajax get request to the API and returns the results to
//the searchResults array.
$("#search-icon").on("click", function() {
  searchTerm = $("#recipe-search")
    .val()
    .trim();
  var resultRange = "&from=0&to=100";
  $.ajax({
    url: queryString + searchTerm + apiKey + resultRange,
    method: "GET"
  })
    .then(function(response) {
      searchResults = [];
      for (var i = 0; i < response.hits.length; i++) {
        searchResults.push(response.hits[i].recipe);
      }
      console.log("your search returned " + searchResults.length + " results");
      displayResults(true);
      //increment the database ref for the user if a search is successful - i.e. only count successful searches
      if (currentUser !== undefined) {
        userProfileRef
          .once("value", function(snapshot) {
            var searches = parseInt(snapshot.val().searches);
            searches++;
            updateData(userProfileRef, { searches: searches });
          })
          .catch(function(err) {
            console.log("ERROR -" + err.code + ": " + err.message);
          });
      }
    })
    .catch(function(err) {
      //handle api call errors here

      console.log("ERROR -" + err.code + ": " + err.message);
    });
});

//once the results are stored in the searchResults array, this function is called.
//loop over the array and build the cards for each search result.
//TODO - remove the method that pushes test data to the array
function displayResults(clear = true) {
  if (clear) {
    $(".results").empty();
    range = 25;
    current = 0;
    max = 25;
  } else {
    $(".load-more").remove();
  }
  //check for range vs. number of results
  if (max > searchResults.length) {
    max = searchResults.length;
  }

  for (var i = current; i < max; i++) {
    var recipe = searchResults[i];
    var title = recipe.label;
    if (title.length > 20) {
      var truncatedTitle = title.substring(0, 18) + "...";
      title = truncatedTitle;
    }
    var imageUrl = recipe.image;
    var time = recipe.totalTime; //DEBUG - not all recipes have total time
    var index = i.toString();

    var card = buildCard(title, imageUrl, time, index);
    card.appendTo($(".results"));
  }
  current = max;
  max += range;
  //the api will return a max of 100 results per query. if range >100, dont't display the
  //load more card
  if (max <= searchResults.length) {
    //make a card that will display the next bulk set of results
    $("<div>")
      .addClass("load-more")
      .text("show " + range + " more")
      .appendTo(".results");
  }
}

function buildCard(title, imgUrl, time, index) {
  //index points to the recipe object in search results
  var card = $("<div>")
    .addClass("card")
    .attr("data-index", index + "")
    .attr("data-source", "0")
    .attr("dragable", "true")
    .attr("ondragstart", "drag(event)");
  var cardtitle = $("<div>")
    .addClass("card-title")
    .text(title);
  var imgDiv = $("<div>").addClass("card-img-box");

  var img = $("<img>")
    .attr("src", imgUrl)
    .addClass("recipe-card-small");
  var preptime = $("<div>")
    .addClass("card-time")
    .text(formatTime(time));

  imgDiv.append(img);
  card.append(cardtitle, imgDiv, preptime);
  return card;
}
