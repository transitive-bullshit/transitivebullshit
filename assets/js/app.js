/**
 * Angular CMS application initialization
 */

var modules = [
  'ngAnimate',
  'ngMaterial',
  'ui.router',
  'infinite-scroll',
  'angular-flash.service',
  'angular-flash.flash-alert-directive',
  'angular-loading-bar'
]

var mobileModules = [ 'ngTouch' ]

if (window.IS_MOBILE) {
  modules = modules.concat(mobileModules)
}

var app = angular.module('transitivebullshit', modules)

app.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/")

  $stateProvider

    // ------------------------------------------------------------------------
    // Public
    // ------------------------------------------------------------------------

    .state('index', {
      abstract: true,
      url: "/",
      templateUrl: "/assets/html/index.html",
      controller: "IndexCtrl"
    })
    .state('index.home', {
      url: "",
      templateUrl: "/assets/html/home.html",
      controller: "IndexHomeCtrl"
    })

  $locationProvider.html5Mode(true)
})

app.config(function ($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('orange')
    .backgroundPalette('grey', {
      'default': '50',
      'hue-1': '100',
      'hue-2': '100',
      'hue-3': '200'
    })
})

app.run(function ($rootScope) {
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState){
    console.log('$stateChangeStart', fromState.name, "=>", toState.name)
  })

  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    console.error('$stateChangeError', fromState.name, "=>", toState.name, error)
  })

  $rootScope.$on('$stateChangeSuccess', function (event, toState) {
    console.log('$stateChangeSuccess', toState.name)
  })

  $rootScope.$on('$stateNotFound', function (event, toState, fromState) {
    console.error('$stateChangeSuccess', fromState.name, "=>", toState.name)
  })

  $rootScope.$on("$stateChangeError", console.log.bind(console))
})
