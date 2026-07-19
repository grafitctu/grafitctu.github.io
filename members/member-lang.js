(function () {
  "use strict";

  var pageLanguage = document.documentElement.lang === "en" ? "en" : "cs";
  var params = new URLSearchParams(window.location.search);
  var explicitLanguage = params.get("lang");
  var storedLanguage = null;

  try {
    storedLanguage = window.localStorage.getItem("grafitLang");
  } catch (error) {
    storedLanguage = null;
  }

  if (pageLanguage === "cs" && storedLanguage === "en" && explicitLanguage !== "cs") {
    window.location.replace("./en/");
    return;
  }

  if (pageLanguage === "en" && storedLanguage === "cs" && explicitLanguage !== "en") {
    window.location.replace("../");
    return;
  }

  document.querySelectorAll("[data-language-link]").forEach(function (link) {
    link.addEventListener("click", function () {
      var language = link.getAttribute("data-language-link");
      try {
        window.localStorage.setItem("grafitLang", language);
      } catch (error) {
        /* The link itself remains a complete fallback. */
      }
    });
  });
}());
