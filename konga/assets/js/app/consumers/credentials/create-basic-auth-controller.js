/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.consumers')
    .controller('CreateBasicAuthController', [
      '$scope', '$rootScope', '$log', 'ConsumerService', 'MessageService', '$uibModalInstance', '_consumer', '_cred',
      function controller($scope, $rootScope, $log, ConsumerService, MessageService, $uibModalInstance, _consumer, _cred) {

        $scope.consumer = _consumer;
        $scope.manage = manage;
        $scope.close = function () {
          $uibModalInstance.dismiss()
        }

        if (_cred) {
          $scope.credentials = _cred
        } else {
          $scope.credentials = {
            username: '',
            password: ''
          }
        }

        function manage() {
          if (_cred) {
            return update()
          } else {
            return create()
          }
        }

        function create() {
          ConsumerService
            .addCredential($scope.consumer.id, 'basic-auth', $scope.credentials).then(function (resp) {
            $log.debug("Credentials generated", resp)
            $rootScope.$broadcast('consumer.basic-auth.created')
            $uibModalInstance.dismiss()
          }).catch(function (err) {
            $log.error(err)
            $scope.errors = err.data.body || err.data.customMessage || {}
          })
        }

        function update() {
          ConsumerService
            .updateCredential($scope.consumer.id, 'basic-auth', _cred.id, $scope.credentials).then(function (resp) {
            $log.debug("Credentials generated", resp)
            $rootScope.$broadcast('consumer.basic-auth.created')
            MessageService.success("Updated successfully!")
            $uibModalInstance.dismiss()
          }).catch(function (err) {
            $log.error(err)
            $scope.errors = err.data.body || err.data.customMessage || {}
          })
        }

      }
    ])
}());
