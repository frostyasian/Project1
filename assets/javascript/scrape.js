function scrape() {
  fetch("https://www.seriouseats.com/recipes/2011/12/print/chicken-vesuvio-recipe.html", {
    headers: new Headers({
      "User-agent": "Mozilla/4.0 Custom User Agent"
    })
  })
    .then(function(response) {
      console.log(response);
    })
    .catch(function(err) {
      console.log(err.code);
    });
}

scrape();
