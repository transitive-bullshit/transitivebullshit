angular.module('transitivebullshit').controller('RootCtrl', function (
  $rootScope, $state, $stateParams, $timeout, cfpLoadingBar)
{
  $rootScope.safeApply = function (fn) {
    var $root = this.$root
    if (!$root) return fn()

    var phase = $root.$$phase
    if (phase === '$apply' || phase === '$digest') {
      if (fn && typeof(fn) === 'function') fn()
    } else {
      this.$apply(fn)
    }
  }

  $rootScope.stringifyNestedObjects = function (o) {
    var r = {}
    o = typeof o === 'string' ? JSON.parse(o) : o
    _.each(o, function (value, key) {
      r[key] = typeof value === 'object' ? JSON.stringify(value) : value
    })
    return r
  }

  // Returns the version of Internet Explorer or a -1
  // (indicating the use of another browser).
  function getIsIE () {
    var ua = window.navigator.userAgent
    var msie = ua.indexOf("MSIE ")

    return (msie > 0 || !!ua.match(/Trident.*rv\:11\./))
  }

  var isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
  $rootScope.$state       = $state
  $rootScope.$stateParams = $stateParams
  $rootScope.isMobile     = window.IS_MOBILE || isMobile
  $rootScope.isIframe     = (window.parent !== window.top)
  $rootScope.isIOS        = isMobile && (/iPhone|iPad|iPod/i.test(navigator.userAgent))
  $rootScope.isIE         = getIsIE()
  $rootScope.isChromeIOS  = $rootScope.isMobile && navigator.userAgent.match('CriOS')
  $rootScope.location     = location

  // TODO: cacheBust should use deploy identifier from backend
  $rootScope.cacheBust    = location.hostname + '2'

  var loadingTimeoutP = null
  function cancelLoadingTimeout () {
    if (loadingTimeoutP) {
      $timeout.cancel(loadingTimeoutP)
      loadingTimeoutP = null
    }
  }

  $rootScope.$on('cfpLoadingBar:started', function () {
    cancelLoadingTimeout()
    loadingTimeoutP = $timeout(function () {
      cfpLoadingBar.complete()
      cancelLoadingTimeout()
    }, 8000)
  })

  $rootScope.$on('cfpLoadingBar:complete', function () {
    cancelLoadingTimeout()
  })

  $rootScope.$on('$stateChangeStart', function () {
    if ($rootScope.backWillTranition) {
      $rootScope.backTransition = true
      $rootScope.backWillTranition = false
    }
  })

  $rootScope.onBack = function (state, params) {
    $rootScope.safeApply(function () {
      $rootScope.backWillTranition = true
    })

    $timeout(function () {
      $state.go(state, params)
    })
  }

  $rootScope.backgroundIsBlurred = false

  $rootScope.blurBackground = function (blur) {
    $rootScope.safeApply(function () {
      $rootScope.backgroundIsBlurred = !!blur
    })
  }
});
