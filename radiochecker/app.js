angular.module('RadioCheckerApp', ['ngRoute', 'ngAnimate', 'appConfig'])

    .config(function($routeProvider, $locationProvider) {

        $routeProvider
            .when('/', {
                title: 'RadioChecker.com \u2014 Und was läuft bei dir so?',
                description: 'RadioChecker.com zeigt dir die meistgespielten Songs deines Lieblings-Radiosenders. ' +
                'Und was läuft bei dir so?',
                controller: 'StartController',
                templateUrl: 'radiochecker/start/startView.html'
            })

            .when('/toptracks', {
                title: 'Meistgespielte Songs \u2014 RadioChecker.com',
                description: 'set in topTracksController',
                controller: 'TopTracksController',
                templateUrl: 'radiochecker/toptracks/topTracksView.html'
            })

            .when('/search', {
                title: 'Songsuche \u2014 RadioChecker.com',
                description: 'set in searchController',
                controller: 'SearchController',
                templateUrl: 'radiochecker/search/searchView.html'
            })

            .when('/about/wtf', {
                title: 'Über RadioChecker \u2014 RadioChecker.com',
                description: 'RadioChecker.com ist ein kostenloser Online-Service, der dir die meistgespielten Songs ' +
                'deiner Lieblings-Radiosender präsentiert. Erfahre mehr darüber ...',
                templateUrl: 'radiochecker/about/wtfView.html'
            })

            .when('/about/imprint', {
                title: 'Impressum \u2014 RadioChecker.com',
                description: 'Impressum und rechtliche Hinweise zu RadioChecker.com.',
                templateUrl: 'radiochecker/about/imprintView.html'
            })

            .when('/about/privacy', {
                title: 'Datenschutz \u2014 RadioChecker.com',
                description: 'Erfahre mehr über den Datenschutz bei RadioChecker.com.',
                templateUrl: 'radiochecker/about/privacyView.html'
            })

            .otherwise({ redirectTo: '/' });

        // default hash-prefix used for $location hash-bang URLs has changed from the empty string ('') to
        // the bang ('!') in AngularJS 1.6.0 - resetting it to the previous default
        $locationProvider.hashPrefix('');

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    })

    .run(['$rootScope', '$route', '$location', '$window', function($rootScope, $route, $location, $window) {
        // intitialize Google Analytics
        $window.ga('create', 'UA-72083509-2', 'auto');
        $window.ga('set', 'anonymizeIp', true);

        $rootScope.$on('$routeChangeSuccess', function() {
            // scrolls to top of view if route has changed to prevent flickering
            window.scrollTo(0,0);

            document.title = $route.current.title;
            document.head.querySelector("[name=description]").content = $route.current.description;
            document.head.querySelector("[rel=canonical]").href = $location.$$absUrl;

            // track pageview on route change
            $window.ga('send', 'pageview', $location.path());
        });
    }]
);