'use strict';

MetronicApp.controller('WithdrawController', function($scope, $http, CSRF_TOKEN) {

    $scope.info = {};
    var baseUrl = '/api/v1/auth';

    $scope.withdraw = function() {

        $http.post(baseUrl + '/withdraw-money', {
            withdrawMoney: $scope.info.withdrawMoney,
            csrf_token: CSRF_TOKEN
        })
            .success(function(response) {
                if(response.message === 'invalid_money') {
                    angular.element('.alert').hide();
                    angular.element('.alert-warning').text('Số tiền hiện có không đủ để thực hiện giao dịch này');
                    angular.element('.alert-warning').show();
                } else if(response.message === 'error') {
                    angular.element('.alert').hide();
                    angular.element('.alert-danger').text('Đã xảy ra lỗi, vui lòng thử lại');
                    angular.element('.alert-danger').show();
                } else if(response.message === 'success') {
                    angular.element('.alert').hide();
                    angular.element('.alert-success').text('Rút tiền thành công');
                    angular.element('.alert-success').show();
                }
            })
            .error(function(response) {
                angular.element('.alert').hide();
                angular.element('.alert-danger').text('Đã xảy ra lỗi, vui lòng thử lại');
                angular.element('.alert-danger').show();
            })
    }
});
