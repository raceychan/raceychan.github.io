import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  wikiSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Welcome',
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: true,
      items: [
        'how-do-i/create-a-new-lihil-project-layout',
        'how-do-i/run-a-dev-server-and-enable-auto-reload',
      ],
    },
    {
      type: 'category',
      label: 'Routing & Endpoints',
      collapsed: true,
      items: [
        'how-do-i/define-get-post-put-delete-endpoints',
        'how-do-i/organize-a-modular-route-structure-for-features',
        'how-do-i/structure-a-larger-app-routes-modules-packages',
      ],
    },
    {
      type: 'category',
      label: 'Requests',
      collapsed: true,
      items: [
        'how-do-i/use-path-query-header-and-cookie-parameters',
        'how-do-i/parse-json-and-form-data-bodies',
        'how-do-i/access-request-context-and-client-info',
        'how-do-i/upload-and-handle-files',
      ],
    },
    {
      type: 'category',
      label: 'Responses',
      collapsed: true,
      items: [
        'how-do-i/return-json-text-and-custom-status-codes',
        'how-do-i/set-headers-and-cookies-on-responses',
        'how-do-i/handle-redirects-and-204-304-responses',
        'how-do-i/handle-file-downloads-and-static-files',
        'how-do-i/paginate-results-and-return-metadata',
        'how-do-i/stream-large-responses-or-server-sent-events',
      ],
    },
    {
      type: 'category',
      label: 'Auth & Security',
      collapsed: true,
      items: [
        'how-do-i/add-jwt-authentication',
        'how-do-i/protect-routes-with-role-permission-checks',
        'how-do-i/handle-sessions-or-api-keys',
        'how-do-i/add-rate-limiting-throttling',
        'how-do-i/enable-cors-correctly-for-browsers',
      ],
    },
    {
      type: 'category',
      label: 'Middleware & DI',
      collapsed: true,
      items: [
        'how-do-i/add-middleware-for-cors-compression-or-auth',
        'how-do-i/register-dependencies-for-injection',
      ],
    },
    {
      type: 'category',
      label: 'Observability',
      collapsed: true,
      items: [
        'how-do-i/enable-logging-and-set-log-levels',
        'how-do-i/implement-request-response-logging-and-timing',
        'how-do-i/monitor-trace-and-collect-metrics',
      ],
    },
    {
      type: 'category',
      label: 'WebSockets',
      collapsed: true,
      items: [
        'how-do-i/add-a-websocket-endpoint',
        'how-do-i/broadcast-messages-to-multiple-clients',
        'how-do-i/handle-backpressure-and-disconnects',
      ],
    },
    {
      type: 'category',
      label: 'State & Lifespan',
      collapsed: true,
      items: [
        'how-do-i/manage-per-request-vs-application-wide-state',
        'how-do-i/run-code-on-startup-shutdown-lifespan-hooks',
        'how-do-i/share-resources-across-routes-safely-async-cleanup',
        'how-do-i/run-background-tasks-or-scheduled-jobs',
      ],
    },
    {
      type: 'category',
      label: 'Data & DB',
      collapsed: true,
      items: [
        'how-do-i/connect-to-a-database-sqlalchemy-async-engines',
        'how-do-i/run-database-migrations',
      ],
    },
    {
      type: 'category',
      label: 'Deployment & Ops',
      collapsed: true,
      items: [
        'how-do-i/containerize-the-app-with-docker',
        'how-do-i/deploy-with-uvicorn-gunicorn-in-production',
        'how-do-i/serve-behind-nginx-or-a-load-balancer',
        'how-do-i/configure-health-checks-and-readiness-probes',
        'how-do-i/configure-environment-variables-and-settings-per-environment',
      ],
    },
    {
      type: 'category',
      label: 'Errors & Validation',
      collapsed: true,
      items: [
        'how-do-i/validate-inputs-and-provide-helpful-error-messages',
        'how-do-i/define-and-return-custom-error-types',
        'how-do-i/set-global-error-handlers-and-fallbacks',
      ],
    },
    {
      type: 'category',
      label: 'Testing',
      collapsed: true,
      items: [
        'how-do-i/write-unit-and-integration-tests-for-endpoints',
        'how-do-i/test-async-code-and-dependency-injected-services',
        'how-do-i/mock-external-services-http-db',
      ],
    },
    {
      type: 'category',
      label: 'API Docs & Versioning',
      collapsed: true,
      items: [
        'how-do-i/generate-or-publish-api-docs',
        'how-do-i/version-my-api-v1-v2',
      ],
    },
    {
      type: 'category',
      label: 'Reference/Meta',
      collapsed: true,
      items: [
        'how-do-i/index',
        'how-do-i/answers',
        'how-do-i/missing-info',
      ],
    },
  ],
};

export default sidebars;

