var queryString = "https://api.edamam.com/search?q=";
var searchTerm = "";

var searchResults = [];

$("#search-icon").on("click", function() {
  console.log("searching");
  for (var i = 0; i < 25; i++) {
    $(".results").append(buildCard("Some Long Ass Title For A Recipe", "https://via.placeholder.com/150", "2 days 23 hours 59 minutes"));
  }

  // searchTerm = $("#recipe-search")
  //   .val()
  //   .trim();

  // $.ajax({
  //   url: queryString + "chicken" + apiKey,
  //   method: "GET"
  // }).then(function(response) {
  //   //lay out the recipe card and put it in the results div

  // });
});

function buildCard(title, url, time, index) {
  //index points to the recipe object in search results
  var card = $("<div>")
    .addClass("card")
    .attr("data-index", index + "");
  var cardtitle = $("<div>")
    .attr("id", "card-title")
    .text(title);
  var imgDiv = $("<div>").attr("id", "card-img-box");
  var img = $("<img>").attr("src", url);
  var preptime = $("<div>")
    .attr("id", "card-time")
    .text(time);

  imgDiv.append(img);
  card.append(cardtitle, imgDiv, preptime);
  return card;
}
