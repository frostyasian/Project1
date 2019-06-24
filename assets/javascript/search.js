var queryString = "https://api.edamam.com/search?q=";
var searchTerm = "";

$("#search-button").on("click", function() {
  searchTerm = $("#search-input")
    .val()
    .trim();

  $.ajax({
    url: queryString + "chicken" + apiKey,
    method: "GET"
  }).then(function(response) {
    var url = response.hits[0].recipe.url;
    //$("#iframe").attr("src", url);
    console.clear();
  });
});
