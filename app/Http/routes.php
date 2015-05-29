<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', function () {
	return view('app');
});

Route::group(['prefix' => 'api/v1'], function() {
	Route::group(['prefix' => 'auth'], function() {
		Route::post('login', 'Auth\AuthController@login');
		Route::post('check-login', 'Auth\AuthController@checkLogin');
		Route::get('logout', 'Auth\AuthController@logout');
		Route::get('check', 'Auth\AuthController@checkLogin');
		Route::post('register', 'Auth\AuthController@register');
		Route::post('transfer-money', 'Auth\AuthController@transfer');
		Route::post('withdraw-money', 'Auth\AuthController@withdraw');
		Route::post('get-user-money', 'Auth\AuthController@getUserMoney');
	});
});
