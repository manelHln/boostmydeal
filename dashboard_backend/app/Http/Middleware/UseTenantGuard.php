<?php

namespace App\Http\Middleware;

class UseTenantGuard
{
    public function handle($request, \Closure $next)
    {
        auth()->shouldUse('sanctum');
        return $next($request);
    }
}