<?php

use Knuckles\Scribe\Config\AuthIn;
use Knuckles\Scribe\Config\Defaults;
use Knuckles\Scribe\Extracting\Strategies;

use function Knuckles\Scribe\Config\configureStrategy;
use function Knuckles\Scribe\Config\removeStrategies;

// Only the most common configs are shown. See the docs for all.
return [
    // The HTML <title> for the generated documentation.
    'title' => 'BoostMyDeal API Documentation',

    // A short description of your API. Will be included in docs webpage, Postman collection and OpenAPI spec.
    'description' => 'The BoostMyDeal API provides endpoints for managing agents, phone numbers, calls, workflows, payments, invoices, and more. This is a multi-tenant application requiring an X-Tenant-ID header for all API requests.',

    // Text to place in the "Introduction" section, right after the `description`. Markdown and HTML are supported.
    'intro_text' => <<<'INTRO'
            This documentation provides comprehensive information for working with the BoostMyDeal API.

            <aside>As you scroll, you'll see code examples for working with the API in different programming languages in the dark area to the right (or as part of content on mobile).
            You can switch the language used with the tabs at the top right (or from the nav menu at the top left on mobile).</aside>

            ## Authentication

            This API uses Laravel Sanctum for authentication. You need to provide an authentication token in the `Authorization` header:

            ```
            Authorization: Bearer {your_token}
            ```

            ## Multi-Tenancy

            This is a multi-tenant application. All API requests (except tenant registration and webhooks) require an `X-Tenant-ID` header to identify the tenant context:

            ```
            X-Tenant-ID: {your_tenant_id}
            ```

            The tenant ID is provided when you register as a tenant.
        INTRO,

    // The base URL displayed in the docs.
    'base_url' => config('app.url'),

    // Routes to include in the docs
    'routes' => [
        [
            'match' => [
                'prefixes' => ['api/*'],
                'domains' => ['*'],
            ],
            'exclude' => [
                // Exclude webhook routes from docs as they require external authentication
                'POST /api/v1/payments/webhook',
                'GET /docs*',
                'GET /sanctum/*',
                'GET /_ignition*',
            ],
        ],
    ],

    // The type of documentation output to generate.
    'type' => 'laravel',

    'theme' => 'default',

    'static' => [
        'output_path' => 'public/docs',
    ],

    'laravel' => [
        'add_routes' => false,
        'docs_url' => '/docs',
        'assets_directory' => null,
        'middleware' => [],
    ],

    'external' => [
        'html_attributes' => [],
    ],

    'try_it_out' => [
        'enabled' => true,
        'base_url' => null,
        'use_csrf' => false,
        'csrf_url' => '/sanctum/csrf-cookie',
    ],

    // How is your API authenticated?
    'auth' => [
        'enabled' => true,
        'default' => true,
        'in' => AuthIn::BEARER->value,
        'name' => 'Authorization',
        'use_value' => env('SCRIBE_AUTH_KEY'),
        'placeholder' => '{YOUR_AUTH_TOKEN}',
        'extra_info' => 'You can retrieve your API token by visiting your dashboard and clicking <b>Generate API token</b>.',
    ],

    'example_languages' => [
        'bash',
        'javascript',
        'php',
        'python',
    ],

    'postman' => [
        'enabled' => true,
        'overrides' => [
            // 'info.version' => '2.0.0',
        ],
    ],

    'openapi' => [
        'enabled' => true,
        'version' => '3.0.3',
        'overrides' => [
            // 'info.version' => '2.0.0',
        ],
        'generators' => [],
    ],

    'groups' => [
        'default' => 'Others',
        'order' => [],
    ],

    'logo' => false,

    'last_updated' => 'Last updated: {date:F j, Y}',

    'examples' => [
        'faker_seed' => 1234,
        'models_source' => ['factoryCreate', 'factoryMake', 'databaseFirst'],
    ],

    'strategies' => [
        'metadata' => [
            ...Defaults::METADATA_STRATEGIES,
        ],
        'headers' => [
            ...Defaults::HEADERS_STRATEGIES,
            Strategies\StaticData::withSettings(data: [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'X-Tenant-ID' => '{YOUR_TENANT_ID}',
            ]),
        ],
        'urlParameters' => [
            ...Defaults::URL_PARAMETERS_STRATEGIES,
        ],
        'queryParameters' => [
            ...Defaults::QUERY_PARAMETERS_STRATEGIES,
        ],
        'bodyParameters' => [
            ...Defaults::BODY_PARAMETERS_STRATEGIES,
        ],
        'responses' => configureStrategy(
            Defaults::RESPONSES_STRATEGIES,
            Strategies\Responses\ResponseCalls::withSettings(
                only: ['GET *'],
                config: [
                    'app.debug' => false,
                ]
            )
        ),
        'responseFields' => [
            ...Defaults::RESPONSE_FIELDS_STRATEGIES,
        ],
    ],

    'database_connections_to_transact' => [],

    'fractal' => [
        'serializer' => null,
    ],
];
