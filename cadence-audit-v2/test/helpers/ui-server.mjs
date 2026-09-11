import {createApp} from '../../src/server.mjs';
import {fileURLToPath} from 'node:url';
const app=await createApp({dataDir:process.env.UI_TEST_DATA_DIR||'/tmp/cadence-v2-ui-test',secure:false,managerOptions:{workerPath:fileURLToPath(new URL('./job-worker.mjs',import.meta.url)),timeoutMs:4000}});
app.server.listen(4320,'127.0.0.1',()=>console.log('Controlled UI test server: http://127.0.0.1:4320'));
process.on('SIGTERM',async()=>{await app.close();process.exit(0);});
