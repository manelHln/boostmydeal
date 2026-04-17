<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;

Route::get('/openapi.yaml', function () {
    abort_unless(
        Storage::disk('local')->exists('scribe/openapi.yaml'),
        404
    );

    return Response::make(
        Storage::disk('local')->get('scribe/openapi.yaml'),
        200,
        [
            'Content-Type' => 'application/yaml',
        ]
    );
});
