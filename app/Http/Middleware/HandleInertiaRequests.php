<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = \App\Models\Setting::current();
        return [
            ...parent::share($request),
            'auth' => [
                'email' => $request->session()->get('user_email'),
                'verified' => (bool) $request->session()->get('verified'),
            ],
            'settings' => [
                'finance_email' => $settings->finance_email,
                'logoUrl' => $settings->logoUrl(),
                'logo_url' => $settings->logoUrl(),
                'site_title' => $settings->site_title,
                'faviconUrl' => $settings->faviconUrl(),
                'favicon_url' => $settings->faviconUrl(),
                'payment_notification_title' => $settings->payment_notification_title,
                'payment_notification_text' => $settings->payment_notification_text,
                'adminBackgroundUrl' => $settings->adminBackgroundUrl(),
                'admin_background_url' => $settings->adminBackgroundUrl(),
                'financeBackgroundUrl' => $settings->financeBackgroundUrl(),
                'finance_background_url' => $settings->financeBackgroundUrl(),
            ],
        ];
    }
}
