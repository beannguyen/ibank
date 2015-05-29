MetronicApp.controller('GuestController', function($rootScope, $scope, AuthenticationService, $state) {
    $scope.$on('$viewContentLoaded', function() {
        // initialize core components
        Metronic.initAjax();

        // set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.credential = {};

    $scope.login = function () {
        Metronic.blockUI({boxed:true});
        AuthenticationService.login($scope.credential)
            .success(function(response) {
                if ( response.message === 'success' ) {
                    console.log(response);
                    $state.go('dashboard');
                    Metronic.unblockUI();
                } else {
                    angular.element('.alert-danger').text('Login Failed!');
                    angular.element('.alert-danger').show();
                    Metronic.unblockUI();
                }
            })
            .error(function(response) {
                angular.element('.alert-danger').text('Login Failed!');
                angular.element('.alert-danger').show();
                Metronic.unblockUI();
            });
    };

    $scope.check = function () {
        return AuthenticationService.isLogin();
    };

    $scope.newUser = {};

    $scope.registerClicked = function () {
        angular.element('.article-block').hide();
        angular.element('.register-block').show();
    };

    angular.element('.form_password').focusout(function() {
        var regularExpression  = /^(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,16}$/;
        var password = angular.element('.form_password').val();
        console.log(regularExpression.test(password));
        if ( (password.search(/[a-zA-Z]+/)==-1) || (password.search(/[0-9]+/)==-1) ) {
            angular.element('.custom-help').text('Mật khẩu phải chứa ít nhất 1 kí tự số');
            angular.element('.custom-help').show();
        } else if (!regularExpression.test(password)) {
            angular.element('.custom-help').text('Mật khẩu phải chứa ít nhất 1 kí tự đặc biệt');
            angular.element('.custom-help').show();
        } else {
            angular.element('.custom-help').text('');
            angular.element('.custom-help').hide();
        }
    });

    angular.element('.form_retype_password').focusout(function() {
        if($scope.newUser.password != $scope.newUser.repassword) {
            angular.element('.custom-help-repassword').text('Mật khẩu không khớp');
            angular.element('.custom-help-repassword').show();
        } else {
            angular.element('.custom-help-repassword').text('');
            angular.element('.custom-help-repassword').hide();
        }
    });

    angular.element('.phone_number').focusout(function() {
        var regex = /^(\([0-9]{3}\)|[0-9]{3})[0-9]{3}[0-9]{4}$/;
        if(!regex.test(angular.element('.phone_number').val())) {
            angular.element('.block-help-phone-num').text('Số điện thoại không hợp lệ');
            angular.element('.block-help-phone-num').show();
        } else {
            angular.element('.block-help-phone-num').text('');
            angular.element('.block-help-phone-num').hide();
        }
    });

    // submit register
    $scope.register = function() {
        Metronic.blockUI({boxed:true});
        var register = AuthenticationService.register($scope.newUser);
        register.success(function(response) {
            if(response.message == 'success') {
                $scope.newUser = {};
                angular.element('.note-success').show();
            }
            Metronic.unblockUI();
        })
            .error(function (response) {

                Metronic.unblockUI();
            })
    };

    // cancel register
    $scope.cancel = function() {
        $scope.newUser = {};
    }
});
