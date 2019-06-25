var queryString = "https://api.edamam.com/search?q=";
var searchTerm = "";
var key = "&app_id=3f5ead16&app_key=c225ae2c7c6a61ce84c5a6514777dbd2";

$("#search-button").on("click", function() {
  searchTerm = $("#search-input")
    .val()
    .trim();

  $.ajax({
    url: queryString + searchTerm + key,
    method: "GET"
  }).then(function(response) {
    $("#search-term").text(searchTerm);
    var hits = response.hits;
    $("#results").empty();
    console.log(hits[0].recipe);
    $.each(hits, function(index, value) {
      var recipe = hits[index].recipe;
      //display the search result
      var div = $("<div>");
      var image = $("<img>").attr("src", recipe.image);
      var label = $("<a>")
        .text(recipe.label)
        .attr("href", recipe.url);
      var source = $("<p>").text(recipe.source);

      div.append(label, source, image).appendTo($("#results"));
    });
  });
});
