<?php

namespace App\Utilities;

use Illuminate\Config\Repository;
use Illuminate\Contracts\Container\Container;
use Illuminate\Session\DatabaseSessionHandler;
use Illuminate\Session\SessionManager;
use Stancl\Tenancy\Contracts\TenancyBootstrapper;
use Stancl\Tenancy\Contracts\Tenant;


/**
 * This resets the database connection used by the database session driver.
 *
 * It also includes a mechanism to prevent session forgery when SESSION_CONNECTION is specified.
 *
 * It runs each time tenancy is initialized or ended.
 * That way the session driver always uses the current DB connection.
 */
class DatabaseSessionBootstrapper implements TenancyBootstrapper
{
    public function __construct(
        protected Repository $config,
        protected Container $container,
        protected SessionManager $session,
    ) {}

    protected string|null $originalConnection = null;
    protected string|null $originalCookie = null;

    public function bootstrap(Tenant $tenant): void
    {
        $this->originalConnection = $this->config->get('session.connection');
        $this->originalCookie = $this->config->get('session.cookie');

        if ($this->config->get('session.driver') === 'database') {
            // At first, this bootstrapper runs before the StartSession middleware, so
            // changing the session.connection here will affect what connection the session
            // driver will use. This is helpful to override the SESSION_CONNECTION that might
            // otherwise allow for session forgery in the tenant context.
            $this->config->set('session.connection', 'tenant_template');
            $this->config->set('session.cookie', 'tenant_session');

            $this->resetDatabaseHandler('tenant_template');
        }
        // Doing this because laravel caches the resolved guards, so we need to reset them when tenancy is initialized or ended to make sure the correct connection is used for the session driver.
        // This is important as we have an admin guard that uses the central database connection, and a web guard that uses the tenant database connection, and we don't want to mix them up.
        //Since mixing them up causes an error when for example a session_cookie already existed prior to an admin login through filament for example.
        auth()->forgetGuards();
        auth()->shouldUse('web');
    }

    public function revert(): void
    {
        if ($this->config->get('session.driver') === 'database') {
            $connection = $this->originalConnection ?? config('tenancy.database.central_connection');
            $cookie = $this->originalCookie ?? config('session.cookie');
            $this->config->set('session.cookie', $cookie);
            // When ending tenancy, this runs *before* the DatabaseTenancyBootstrapper, so DB tenancy
            // is still bootstrapped. For that reason, we have to explicitly use the central connection
            // instead of null for the default connection.
            $this->config->set('session.connection', $connection);
            $this->resetDatabaseHandler($connection);
        }
    }

    protected function resetDatabaseHandler(string $connection): void
    {
        $sessionDrivers = $this->session->getDrivers();

        if (isset($sessionDrivers['database'])) {
            /** @var \Illuminate\Session\Store $databaseDriver */
            $databaseDriver = $sessionDrivers['database'];

            $databaseDriver->setHandler($this->createDatabaseHandler($connection));
        }
    }

    protected function createDatabaseHandler(string $connection): DatabaseSessionHandler
    {
        // Based on SessionManager::createDatabaseDriver
        return new DatabaseSessionHandler(
            $this->container->make('db')->connection($connection),
            $this->config->get('session.table'),
            $this->config->get('session.lifetime'),
            $this->container,
        );
    }
}