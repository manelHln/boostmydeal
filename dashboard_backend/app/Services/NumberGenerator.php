<?php 
declare(strict_types=1);

namespace App\Services;

use App\Exceptions\OneTimePasswordGenerationException;
use App\Interfaces\GeneratorInterface;
use Throwable;

final class NumberGenerator implements GeneratorInterface
{
    public function generate(): string
    {
        try {
            $number = random_int(
                min: 000_000,
                max: 999_999,
            );
        } catch (Throwable $exception) {
            throw new OneTimePasswordGenerationException(
                message: 'Failed to generate a random integer',
            );
        }

        return str_pad(
            string: strval($number),
            length: 6,
            pad_string: '0',
            pad_type: STR_PAD_LEFT,
        );
    }
}