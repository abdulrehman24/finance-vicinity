<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="csrf-token" content="{{ csrf_token() }}"/>
    @php($s = \App\Models\Setting::current())
    <title>{{ $s->site_title ?? 'Vicinity Finance Portal' }}</title>
    <link rel="icon" href="{{ $s->faviconUrl() }}" sizes="32x32" />
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    @inertiaHead
  </head>
  <body class="antialiased">
    @inertia
  </body>
</html>
