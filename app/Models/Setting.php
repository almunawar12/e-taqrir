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

    private static array $schoolKeys = [
        'school_name', 'school_foundation', 'school_address',
        'school_city', 'school_postal_code', 'school_phone',
        'school_email', 'school_website', 'school_logo_path',
        'school_opening_text',
    ];

    public static function schoolProfile(): array
    {
        $rows = static::whereIn('key', static::$schoolKeys)->pluck('value', 'key');
        return [
            'name'         => $rows['school_name']         ?? '',
            'foundation'   => $rows['school_foundation']   ?? '',
            'address'      => $rows['school_address']      ?? '',
            'city'         => $rows['school_city']         ?? '',
            'postal_code'  => $rows['school_postal_code']  ?? '',
            'phone'        => $rows['school_phone']        ?? '',
            'email'        => $rows['school_email']        ?? '',
            'website'      => $rows['school_website']      ?? '',
            'logo_path'    => $rows['school_logo_path']    ?? null,
            'opening_text' => $rows['school_opening_text'] ?? '',
        ];
    }

    public static function setSchoolProfile(array $data): void
    {
        $map = [
            'name'         => 'school_name',
            'foundation'   => 'school_foundation',
            'address'      => 'school_address',
            'city'         => 'school_city',
            'postal_code'  => 'school_postal_code',
            'phone'        => 'school_phone',
            'email'        => 'school_email',
            'website'      => 'school_website',
            'opening_text' => 'school_opening_text',
        ];
        foreach ($map as $field => $key) {
            if (array_key_exists($field, $data)) {
                static::updateOrCreate(['key' => $key], ['value' => $data[$field] ?? '']);
            }
        }
    }
}
