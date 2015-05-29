<?php namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\User;
use App\UserMeta;
use Illuminate\Auth\Guard;
use Illuminate\Contracts\Auth\Registrar;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Input;

class AuthController extends Controller {

	/*
	|--------------------------------------------------------------------------
	| Registration & Login Controller
	|--------------------------------------------------------------------------
	|
	| This controller handles the registration of new users, as well as the
	| authentication of existing users. By default, this controller uses
	| a simple trait to add these behaviors. Why don't you explore it?
	|
	*/

	use AuthenticatesAndRegistersUsers;

	/**
	 * Create a new authentication controller instance.
	 *
	 * @param  \Illuminate\Contracts\Auth\Guard  $auth
	 * @param  \Illuminate\Contracts\Auth\Registrar  $registrar
	 * @return void
	 */
	public function __construct(Guard $auth, Registrar $registrar)
	{
		$this->auth = $auth;
		$this->registrar = $registrar;
	}

	public function login()
	{
		if (Auth::attempt(['email' => Input::get('email'), 'password' => Input::get('password')]))
		{
			return response()->json(['message' => 'success', 'data' => Auth::user()]);
		}

		return response()->json(['message' => 'failed']);
	}

	public function checkLogin()
	{
		if(Auth::check()) {
			return response()->json(['message' => 'logged_in']);
		}
		return response()->json(['message' => 'not_yet']);
	}

	public function logout()
	{
		if(!Auth::logout())
			return response()->json(['message' => 'logged_out']);
		return response()->json(['message' => 'failed']);
	}

	public function register()
	{
		$user = array(
			'name' => Input::get('name'),
			'email' => Input::get('email'),
			'password' => Hash::make(Input::get('password'))
		);
		$userId = User::newUser($user);

		$meta = array(
			'meta_key' => 'phone_number',
			'meta_value' => Input::get('phoneNum')
		);
		UserMeta::addKey($userId, $meta);

		$meta = array(
			'meta_key' => 'address',
			'meta_value' => Input::get('address')
		);
		UserMeta::addKey($userId, $meta);

		$meta = array(
			'meta_key' => 'money',
			'meta_value' => 0
		);
		UserMeta::addKey($userId, $meta);

		return response()->json(['message' => 'success']);
	}

	public function transfer()
	{
		$userId = $this->auth->user()->getAttributes()['id'];

		// tru tien
		$userMeta = UserMeta::where(['meta_key'=> 'money', 'user_id' => $userId])->first();
		if($userMeta->meta_value > Input::get('transferMoney')) {
			$money = $userMeta->meta_value;
			$money = $userMeta->meta_value - Input::get('transferMoney');

			$userMeta->update(['meta_value' => $money]);

			// cong tien
			$receiveUser = User::where('email', Input::get('receiveEmail'));
			if($receiveUser->count() > 0) {
				$meta = UserMeta::where(['user_id' => $receiveUser->first()->id, 'meta_key' => 'money']);
				$update = $meta->update(['meta_value' => $meta->first()->meta_value + Input::get('transferMoney')]);
				if($update) {
					return response()->json(['message' => 'success']);
				} else {
					return response()->json(['message' => 'error']);
				}
			} else {
				return response()->json(['message' => 'not_found_user']);
			}
		} else {
			return response()->json(['message' => 'invalid_money']);
		}
	}

	public function withdraw()
	{
		$userId = $this->auth->user()->getAttributes()['id'];
		$userMeta = UserMeta::where(['meta_key'=> 'money', 'user_id' => $userId])->first();
		if($userMeta->meta_value > Input::get('withdrawMoney')) {
			$money = $userMeta->meta_value;
			$money = $userMeta->meta_value - Input::get('withdrawMoney');

			$update = $userMeta->update(['meta_value' => $money]);
			if($update) {
				return response()->json(['message' => 'success']);
			} else {
				return response()->json(['message' => 'error']);
			}
		} else {
			return response()->json(['message' => 'invalid_money']);
		}
	}

	public function getUserMoney()
	{
		$userId = $this->auth->user()->getAttributes()['id'];
		$usermeta = UserMeta::where(['meta_key'=> 'money', 'user_id' => $userId])->get();
		return response()->json(['data' => $usermeta]);
	}

}
