<apex:page applyHtmlTag="true" applyBodyTag="false" showHeader="false" docType="html-5.0" standardStylesheets="false"  manifest="{!cacheUrlPrefix}/apex/<MY_CACHE_RESOURCE>"  controller="mobilecaddy1.MobileCaddyStartPageController001_mc">

<head>
  <script data-ionic="inject">
    (function(w){var i=w.Ionic=w.Ionic||{};i.version='3.9.2';i.angular='5.0.3';i.staticDir='build/';})(window);
  </script>
  <meta charset="UTF-8" />
  <title>I3AccContacts</title>
  <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="msapplication-tap-highlight" content="no" />

  <meta name="theme-color" content="#4e8ef7" />

  <script src="https://localhost/cordova.js"></script>
  <script src="{!URLFOR($Resource[cordovaLocalResource])}" type="text/javascript"></script>

  <link href="{!URLFOR($Resource.<MY_APP_RESOURCE>, 'build/main.css')}" rel="stylesheet"/>

</head>
<body>

<!--
// Code can be added here for loading page content
// This page will be shown for a brief moment between the redirect from local and
//   Angular loading.
-->

  <!-- Ionic's root component and where the app will load -->
  <ion-app></ion-app>

  <!-- The polyfills js is generated during the build process -->
  <script src="{!URLFOR($Resource.<MY_APP_RESOURCE>, 'build/polyfills.js')}"></script>

  <!-- The vendor js is generated during the build process
       It contains all of the dependencies in node_modules -->
  <script src="{!URLFOR($Resource.<MY_APP_RESOURCE>, 'build/vendor.js')}"></script>

  <!-- The main bundle js is generated during the build process -->
  <script src="{!URLFOR($Resource.<MY_APP_RESOURCE>, 'build/main.js')}"></script>

</body>

</apex:page>
