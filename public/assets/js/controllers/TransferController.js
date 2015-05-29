'use strict';

MetronicApp.controller('TransferController', function ($http, $scope, $sanitize, CSRF_TOKEN) {
    $scope.info = {};
    var baseUrl = '/api/v1/auth';

    // validation
    angular.element('.transfer-money').focusout(function() {
        Metronic.blockUI({boxed:true});
        $http.post(baseUrl + '/get-user-money', {csrf_token: CSRF_TOKEN})
            .success(function(response) {
                var value = response.data[0].meta_value;
                if(value !== '') {
                    if(parseInt(value) < parseInt(angular.element('.transfer-money').val())) {
                        angular.element('.transferMoney-help-block').text('Số tiền của bạn không đủ để thực hiện giao dịch');
                        angular.element('.transferMoney-help-block').show();
                    } else {
                        console.log('lon');
                        angular.element('.transferMoney-help-block').text('');
                        angular.element('.transferMoney-help-block').hide();
                    }
                }
                Metronic.unblockUI();
            })
            .error(function() {

            })
    });


    $scope.transfer = function() {
        var sanitizeInformation = function (info) {
            return {
                receiveEmail: $sanitize(info.receiveEmail),
                transferMoney: $sanitize(info.transferMoney),
                message: $sanitize(info.message),
                csrf_token: CSRF_TOKEN
            }
        };

        $http.post(baseUrl + '/transfer-money', sanitizeInformation($scope.info))
            .success(function(response) {
                console.log(response);

                if(response.message === 'invalid_money') {
                    angular.element('.alert').hide();
                    angular.element('.alert-warning').text('Số tiền hiện có không đủ để thực hiện giao dịch này');
                    angular.element('.alert-warning').show();
                } else if(response.message === 'not_found_user') {
                    angular.element('.alert').hide();
                    angular.element('.alert-warning').text('Email người nhận không có trong dữ liệu');
                    angular.element('.alert-warning').show();
                } else if(response.message === 'error') {
                    angular.element('.alert').hide();
                    angular.element('.alert-danger').text('Đã xảy ra lỗi, vui lòng thử lại');
                    angular.element('.alert-danger').show();
                } else if(response.message === 'success') {
                    angular.element('.alert').hide();
                    angular.element('.alert-success').text('Chuyển tiền thành công');
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
