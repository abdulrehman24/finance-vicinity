<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureVerified
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->session()->has('verified') || !$request->session()->get('verified')) {
            return redirect('/email-verification');
        }
        return $next($request);
    }
}

