# Browser Log Collection

Send logs to Motadata from web browser pages with the browser logs SDK.

See the [dedicated motadata documentation][1] for more details.

## Usage

After adding [`@motadata365/browser-logs`][2] to your `package.json` file, initialize it with:

```javascript
import { motadataLogs } from '@motadata365/browser-logs'

motadataLogs.init({
  clientToken: '<MOTADATA_CLIENT_TOKEN>',
  site: '<MOTADATA_SITE>',
  forwardErrorsToLogs: true,
  sessionSampleRate: 100,
})
```

After the Datadog browser logs SDK is initialized, send custom log entries directly to Datadog:

```javascript
import { motadataLogs } from '@motadata365/browser-logs'

motadataLogs.logger.info('Button clicked', { name: 'buttonName', id: 123 })

try {
  ...
  throw new Error('Wrong behavior')
  ...
} catch (ex) {
  motadataLogs.logger.error('Error occurred', { team: 'myTeam' }, ex)
}
```

<!-- Note: all URLs should be absolute -->

[1]: https://docs.datadoghq.com/logs/log_collection/javascript
[2]: https://www.npmjs.com/package/@motadata365/browser-logs
