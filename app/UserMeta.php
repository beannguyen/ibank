<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class UserMeta extends Model {

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'user_metas';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id', 'meta_key', 'meta_value'];

    public static function addKey($userId, $meta)
    {
        $m = new UserMeta();
        $m->user_id = $userId;
        $m->meta_key = $meta['meta_key'];
        $m->meta_value = $meta['meta_value'];
        $m->save();
    }

}
