/***
 Metronic AngularJS App Main Script
 ***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize"
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function ($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        layoutImgPath: Metronic.getAssetsPath() + 'admin/layout/img/',
        layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/'
    };

    $rootScope.settings = settings;

    return settings;
}]);


MetronicApp.factory('SessionService', function () {
    return {
        get: function (key) {
            return sessionStorage.getItem(key);
        },
        set: function (key, val) {
            return sessionStorage.setItem(key, val);
        },
        unset: function (key) {
            return sessionStorage.removeItem(key);
        }
    }
});

/* Authentication Service */
MetronicApp.factory('AuthenticationService', function ($rootScope, $http, $sanitize, CSRF_TOKEN, SessionService) {

    var baseUrl = '/api/v1/auth';
    var sanitizeCredential = function (credential) {
        return {
            email: $sanitize(credential.email),
            password: $sanitize(credential.password),
            csrf_token: CSRF_TOKEN
        }
    };
    var sanitizeNewUser = function (user) {
        return {
            name: $sanitize(user.name),
            email: $sanitize(user.email),
            password: $sanitize(user.password),
            phoneNum: $sanitize(user.phoneNum),
            address: $sanitize(user.address)
        }
    };
    return {
        login: function (credential) {
            var login = $http.post(baseUrl + '/login', sanitizeCredential(credential));
            login.success(function (response) {
                // set session key
                SessionService.set('authenticated', true);
                SessionService.set('auth', response.data);
            });
            return login;
        },
        register: function(newUser) {
            var register = $http.post(baseUrl + '/register', sanitizeNewUser(newUser));
            return register;
        },
        isLogin: function () {
            if (SessionService.get('authenticated')) {
                return true;
            }
            return false;
        }
    }
});

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', 'AuthenticationService', '$state', function ($scope, $rootScope, AuthenticationService, $state) {
    $scope.$on('$viewContentLoaded', function () {
        Metronic.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive

        console.log('AppController loaded');
        if (!AuthenticationService.isLogin()) {
            console.log('DENY');
            $state.go('guest');
        }
        else {
            if ( $state.current.name === 'guest' ) {
                console.log('ALLOW');
                $state.go('dashboard');
            } else {
                console.log('ALLOW');
            }
        }
    });
}]);

/***
 Layout Partials.
 By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
 initialization can be disabled and Layout.init() should be called on page load complete as explained above.
 ***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', '$http', '$state', 'SessionService', 'AuthenticationService',
    function ($scope, $http, $state, SessionService, AuthenticationService) {
        $scope.$on('$includeContentLoaded', function () {
            Layout.initHeader(); // init header
        });

        $scope.logout = function () {
            Metronic.blockUI();
            var baseUrl = '/api/v1/auth';
            $http.get(baseUrl + '/logout')
                .success(function (response) {
                    if (response.message === 'logged_out') {
                        $state.go('guest');
                        SessionService.unset('authenticated');
                        SessionService.unset('auth');
                        Metronic.unblockUI();
                    }
                })
        };

        $scope.isLogin = function () {
            return AuthenticationService.isLogin();
        }
    }
]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope', 'AuthenticationService', function ($scope, AuthenticationService) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initSidebar(); // init sidebar
    });

    $scope.isLogin = function () {
        return AuthenticationService.isLogin();
    }
}]);

/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initFooter(); // init footer
    });
}]);

MetronicApp.run(
    ['$rootScope', '$state', '$stateParams', 'AuthenticationService',
        function ($rootScope, $state, $stateParams, AuthenticationService) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }
    ]
);

/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/dashboard.html");

    $stateProvider

        // Dashboard
        .state('dashboard', {
            url: "/dashboard.html",
            templateUrl: "assets/views/dashboard.html",
            data: {pageTitle: 'Admin Dashboard Template'},
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '../../../assets/global/plugins/morris/morris.css',
                            '../../../assets/admin/pages/css/tasks.css',

                            '../../../assets/global/plugins/morris/morris.min.js',
                            '../../../assets/global/plugins/morris/raphael-min.js',
                            '../../../assets/global/plugins/jquery.sparkline.min.js',

                            '../../../assets/admin/pages/scripts/index3.js',
                            '../../../assets/admin/pages/scripts/tasks.js',

                            '/assets/js/controllers/DashboardController.js'
                        ]
                    });
                }]
            }
        })
        .state('guest', {
            url: '/guest.html',
            templateUrl: 'assets/template/guest.html',
            data: {pageTitle: 'Trang chủ'},
            controller: 'GuestController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '/assets/js/controllers/GuestController.js'
                        ]
                    });
                }]
            }
        })
        .state('transfer', {
            url: '/transfer.html',
            templateUrl: 'assets/template/transfer.html',
            data: {pageTitle: 'Chuyển tiền'},
            controller: 'TransferController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '/assets/js/controllers/TransferController.js'
                        ]
                    });
                }]
            }
        })
        .state('withdraw', {
            url: '/withdraw.html',
            templateUrl: 'assets/template/withdraw.html',
            data: {pageTitle: 'Rút tiền'},
            controller: 'WithdrawController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '/assets/js/controllers/WithdrawController.js'
                        ]
                    });
                }]
            }
        })
        .state('profile', {
            url: '/profile.html',
            templateUrl: 'assets/template/profile.html',
            data: {pageTitle: 'Trang cá nhân'},
            controller: 'GuestController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '/assets/js/controllers/GuestController.js'
                        ]
                    });
                }]
            }
        })
}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", function ($rootScope, settings, $state) {
    $rootScope.$state = $state; // state to be accessed from view
}]);