import { BootstrapConsole } from 'nestjs-console';
import { CliModule } from './cli/cli.module';

const bootstrap = new BootstrapConsole({
    module: CliModule,
    useDecorators: true
});
bootstrap.init().then(async (app) => {
    try {
        await app.init();
        await bootstrap.boot();
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
});