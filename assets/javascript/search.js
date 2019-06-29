var queryString = "https://api.edamam.com/search?q=";
var searchTerm = "";

var searchResults = [];
//the search method performs an ajax get request to the API and returns the results to
//the searchResults array.
$("#search-icon").on("click", function() {
  searchTerm = $("#recipe-search")
    .val()
    .trim();
  $.ajax({
    url: queryString + searchTerm + apiKey,
    method: "GET"
  }).then(function(response) {
    searchResults = [];
    for (var i = 0; i < response.hits.length; i++) {
      searchResults.push(response.hits[i].recipe);
    }
    displayResults();
  });
});

//once the results are stored in the searchResults array, this function is called.
//loop over the array and build the cards for each search result.
//TODO - remove the method that pushes test data to the array
function displayResults() {
  $(".results").empty();

  //remove the above loop before testing with live data
  for (var i = 0; i < searchResults.length; i++) {
    var recipe = searchResults[i];
    var title = recipe.label;
    var imageUrl = recipe.image;
    var time = recipe.totalTime; //DEBUG - not all recipes have total time
    var index = i.toString();

    var card = buildCard(title, imageUrl, time, index);
    card.appendTo($(".results"));
  }
}

function buildCard(title, imgUrl, time, index) {
  //index points to the recipe object in search results
  var card = $("<div>")
    .addClass("card")
    .attr("data-index", index + "")
    .attr("data-source", "0")
    .attr("draggable", "true")
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
