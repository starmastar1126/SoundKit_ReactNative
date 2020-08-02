export const  trackSchema = {
    name : 'track_download',
    primaryKey: 'id',
    properties: {
        id:    'int',    // primary key
        details: 'string',
        jobid : 'int',
        file: 'string?'
    }
}

export const offlineSchema = {
    name : 'offline_schema',
    primaryKey: 'id',
    properties: {
        id: 'string',
        value: 'string'
    }
};