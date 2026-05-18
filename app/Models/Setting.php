<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $primaryKey = 'key';
    protected $keyType    = 'string';
    public    $incrementing = false;

    protected $fillable = ['key', 'value'];

    /** Bobot defaults: harian 40, uts 30, uas 30 */
    public static function weights(): array
    {
        $rows = static::whereIn('key', ['bobot_harian', 'bobot_uts', 'bobot_uas'])
            ->pluck('value', 'key');

        return [
            'harian' => (float) ($rows['bobot_harian'] ?? 40),
            'uts'    => (float) ($rows['bobot_uts']    ?? 30),
            'uas'    => (float) ($rows['bobot_uas']    ?? 30),
        ];
    }

    public static function setWeights(float $harian, float $uts, float $uas): void
    {
        foreach (['bobot_harian' => $harian, 'bobot_uts' => $uts, 'bobot_uas' => $uas] as $key => $value) {
            static::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
