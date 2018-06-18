<apex:page showHeader="false" standardStylesheets="false" contentType="text/cache-manifest" controller="mobilecaddy1.StartPageCacheCtrl001_mc">CACHE MANIFEST

NETWORK:
*

CACHE:

#SECTION 1A MOBILECADDY CACHED PAGES

#The page below is a Tmp2 page to cause the cache to fail and check the behaviour and logging uncomment to test
#/pagetofailcache


#SECTION 1B MOBILECADDY CACHED JS

{!vfremotepath}
/static/111213/js/perf/stub.js
{!URLFOR($Resource.cordovaSF3v1)}


#SECTION 1C MOBILECADDY CACHED CSS


#SECTION 1D MOBILECADDY CACHED IMAGES


#SECTION 2A MOBILE APPLICATION CACHED PAGES / JS / ASSETS

{!URLFOR($Resource.<MY_APP_RESOURCE>, 'build/main.css')}
{!URLFOR($Resource.<MY_APP_RESOURCE>, 'assets/fonts/ionicons.woff2')}
{!URLFOR($Resource.<MY_APP_RESOURCE>, 'assets/fonts/roboto-regular.woff2')}
{!URLFOR($Resource.<MY_APP_RESOURCE>, 'assets/fonts/roboto-medium.woff2')}
{!URLFOR($Resource.<MY_APP_RESOURCE>, 'assets/fonts/roboto-bold.woff2')}


{!URLFOR($Resource.<MY_APP_RESOURCE>, 'build/vendor.js')}
{!URLFOR($Resource.<MY_APP_RESOURCE>, 'build/main.js')}
{!URLFOR($Resource.<MY_APP_RESOURCE>, 'build/polyfills.js')}

#FOLLOWING COMMENT IS REPLACED WITH RELEVANT FILES FROM THE WWW/BUILD DIR
<!-- BUILD-SCRIPTS-DO-NOT-REMOVE -->



#sessionid to force reload cache everytime the app is online:{!GETSESSIONID()}

#This is done as a work around to a limitation of JS Remoting that causes remoting actions to fail on subsequent app login.

</apex:page>
