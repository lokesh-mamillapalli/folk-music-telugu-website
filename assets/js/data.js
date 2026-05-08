(function () {
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";

  window.FolkSiteConfig = {
    API_BASE: isLocal ? "" : "https://folk-music-telugu-website.onrender.com",
    AUTH_TOKEN_KEY: "folkSite.adminToken"
  };
})();
