<?php 
declare(strict_types=1);

namespace App\Interfaces;

use Domains\Auth\Exceptions\OneTimePasswordGenertionException;
use Infrastructure\Auth\Generators\GeneratorContract;
use Throwable;
interface GeneratorInterface
{
    public function generate(): string;
}