import {configure, getConsoleSink} from '@logtape/logtape'
import { getFileSink } from '@logtape/file'

await configure({
    sinks: {
        console: getConsoleSink(),
        file: getFileSink('info.log'),
        errorFile: getFileSink('error.log')
    },
    loggers: [
        {
            category: 'login',
            lowestLevel: 'debug',
            sinks: ['console', 'file']
        },
        {
            category: 'app',
            lowestLevel: 'debug',
            sinks: ['console', 'file']
        }
    ]
})