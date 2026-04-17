<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;

#[Hidden('password', 'remember_token')]
#[Guarded('id')]
class Admin extends Authenticatable implements FilamentUser
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $casts = ['password' => 'hashed'];

    public function canAccessPanel(Panel $panel): bool
    {
        return true;
    }
}
