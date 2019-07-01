//@ts-ignore
import orientjs = require("orientjs");
import * as dotenv from 'dotenv';
dotenv.load();

const dbserver = orientjs({
    host: 'orientdb',
    port: 2424
    });

const db = dbserver.use({
    name: process.env.ORIENTDB_DATABASE,
    username: process.env.ORIENTDB_USER,
    password: process.env.ORIENTDB_PASSWORD
    });

 class GraphAPI {

    /**
     * Returns tags associated with the specified media item.
     * 
     * @param rid The Record ID of the media item.
     * @param query_params Array of query parameters to be applied.
     * @param results_limit Limit the number of returned results. -1 returns all results.
     * @param results_offset Offset for the results. Useful for paging.
     */
    async get_media_tags(rid:string, query_params:any[], results_limit = -1, results_offset = 0){
        return new Promise(async (resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .query("SELECT FROM (TRAVERSE out('tagged_with') FROM (SELECT FROM #" + rid + ")) WHERE @class='tag'" + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Returns people associated with the specified media item.
     * 
     * @param rid The Record ID of the media item.
     * @param query_params Array of query parameters to be applied.
     * @param results_limit Limit the number of returned results. -1 returns all results.
     * @param results_offset Offset for the results. Useful for paging.
     */
    async get_media_people(rid:string, query_params:any[], results_limit = -1, results_offset = 0){
        return new Promise(async (resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .query("SELECT FROM (TRAVERSE out('features_person') FROM (SELECT FROM #" + rid + ")) WHERE @class='person'" + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Returns time objects associated with the specified media item.
     * 
     * @param rid The Record ID of the media item.
     * @param query_params Array of query parameters to be applied.
     * @param results_limit Limit the number of returned results. -1 returns all results.
     * @param results_offset Offset for the results. Useful for paging.
     */
    async get_media_times(rid:string, query_params:any[], results_limit = -1, results_offset = 0){
        return new Promise(async (resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .query("SELECT FROM (TRAVERSE out('has_time') FROM (SELECT FROM #" + rid + ")) WHERE @class='time'" + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Returns places associated with the specified media item.
     * 
     * @param rid The Record ID of the media item.
     * @param query_params Array of query parameters to be applied.
     * @param results_limit Limit the number of returned results. -1 returns all results.
     * @param results_offset Offset for the results. Useful for paging.
     */
    async get_media_places(rid:string, query_params:any[], results_limit = -1, results_offset = 0){
        return new Promise(async (resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .query("SELECT FROM (TRAVERSE out('features_place') FROM (SELECT FROM #" + rid + ")) WHERE @class='place'" + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Returns collections associated with the specified media item.
     * 
     * @param rid The Record ID of the media item.
     * @param query_params Array of query parameters to be applied.
     * @param results_limit Limit the number of returned results. -1 returns all results.
     * @param results_offset Offset for the results. Useful for paging.
     */
    async get_media_collections(rid:string, query_params:any[], results_limit = -1, results_offset = 0){
        return new Promise(async (resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .query("SELECT FROM (TRAVERSE in('has_media') FROM (SELECT FROM #" + rid + ")) WHERE @class='collection'" + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Get a list of accounts in the graph database
     * 
     * @param uuid UUID of account to return
     * @param query_params Accepts an array of query parameters and values
     * @param result_limit Allow limiting of number of results to return
     * @param results_offset Offset to use for returned results. Useful for paging.
     */
    async get_accounts(uuid:string, query_params:any, results_limit=-1, results_offset=0) {
        return new Promise((resolve, reject) => {
            var returning : any[] = [];

            try{  
                db.query("SELECT FROM account WHERE uuid = '" + uuid + "'" + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Get a list of media that belongs to a given user.
     * 
     * @param uuid UUID of account that media should belong to 
     * @param query_params Accepts an array of query parameters to narrow results
     * @param results_limit Limit number of returned results
     * @param results_offset Offset to use for returned results. Useful for paging.
     */
    async get_media(uuid:string, query_params:any[], results_limit=-1, results_offset = 0){
        return new Promise((resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .select()
                .from("SELECT FROM (TRAVERSE out('has_media') FROM (SELECT FROM (TRAVERSE out('owns') FROM (SELECT FROM account WHERE uuid='" + uuid +"') MAXDEPTH 1) WHERE @class='collection')) WHERE @class='media'" + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .group('@rid')
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach(async (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Get a list of tags that belongs to a given user.
     * 
     * @param uuid UUID of account that media should belong to 
     * @param query_params Accepts an array of query parameters to narrow results
     * @param results_limit Limit number of returned results
     * @param results_offset Offset to use for returned results. Useful for paging.
     */
    async get_tags(uuid:string, query_params:any[], results_limit=-1, results_offset = 0){
        return new Promise((resolve, reject) => {
            var returning : any[] = [];

            try{
                db
                .select()
                .from("SELECT FROM (TRAVERSE out('tagged_with') FROM (SELECT FROM (TRAVERSE out('has_media') FROM (SELECT FROM (TRAVERSE out('owns') FROM (SELECT FROM account WHERE uuid='" + uuid + "') MAXDEPTH 1) WHERE @class='collection')) WHERE @class='media')) WHERE @class='tag'"+ this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .group('@rid')
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Get a list of media that belongs to a given user & collection.
     * 
     * @param uuid UUID of account that media should belong to 
     * @param collection_name Name of collection to search for
     * @param query_params Accepts an array of query parameters to narrow results
     * @param results_limit Limit number of returned results
     * @param results_offset Offset to use for returned results. Useful for paging.
     */
    async get_collection_media(uuid:string, collection_name : string, query_params:any[], results_limit=-1, results_offset = 0){
        return new Promise((resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .query("SELECT FROM (TRAVERSE out('has_media') FROM (SELECT FROM (TRAVERSE out('owns') FROM (SELECT FROM account WHERE uuid = '" + uuid +"') MAXDEPTH 1) WHERE @class='collection' AND name ='"+ collection_name + "')) WHERE @class='media'")
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Get a list of collections that belongs to a given user.
     * 
     * @param uuid UUID of account that media should belong to 
     * @param query_params Accepts an array of query parameters to narrow results
     * @param results_limit Limit number of returned results
     * @param results_offset Offset to use for returned results. Useful for paging.
     */
    async get_collections(uuid:string, query_params:any[], results_limit=-1, results_offset = 0){
        return new Promise((resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .select()
                .from("SELECT FROM (TRAVERSE out('OWNS') FROM (SELECT FROM account WHERE uuid = '" + uuid +"') MAXDEPTH 1) WHERE @class = 'collection'" + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .group('@rid')
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Get a list of people objects that belong to a given user.
     * 
     * @param uuid UUID of account that media should belong to 
     * @param query_params Accepts an array of query parameters to narrow results
     * @param results_limit Limit number of returned results
     * @param results_offset Offset to use for returned results. Useful for paging.
     */
    async get_people(uuid:string, query_params:any[], results_limit=-1, results_offset = 0){
        return new Promise((resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .select()
                .from("SELECT FROM (TRAVERSE out('features_person') FROM (SELECT FROM (TRAVERSE out('has_media') FROM (SELECT FROM (TRAVERSE out('owns') FROM (SELECT FROM account WHERE uuid='" + uuid + "') MAXDEPTH 1) WHERE @class='collection')) WHERE @class='media')) WHERE @class='person'" + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .group('@rid')
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Get a list of place objects that belong to a given user.
     * 
     * @param uuid UUID of account that media should belong to 
     * @param query_params Accepts an array of query parameters to narrow results
     * @param results_limit Limit number of returned results
     * @param results_offset Offset to use for returned results. Useful for paging.
     */
    async get_places(uuid:string, query_params:any[], results_limit=-1, results_offset = 0){
        return new Promise((resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .select()
                .from("SELECT FROM (TRAVERSE out('features_place') FROM (SELECT FROM (TRAVERSE out('has_media') FROM (SELECT FROM (TRAVERSE out('owns') FROM (SELECT FROM account WHERE uuid='" + uuid + "') MAXDEPTH 1) WHERE @class='collection')) WHERE @class='media')) WHERE @class='place'" + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .group('@rid')
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Get a list of time objects that belong to a given user.
     * 
     * @param uuid UUID of account that media should belong to 
     * @param query_params Accepts an array of query parameters to narrow results
     * @param results_limit Limit number of returned results
     * @param results_offset Offset to use for returned results. Useful for paging.
     */
    async get_times(uuid:string, query_params:any[], results_limit=-1, results_offset = 0){
        return new Promise((resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .select()
                .from("SELECT FROM (TRAVERSE out('has_time') FROM (SELECT FROM (TRAVERSE out('has_media') FROM (SELECT FROM (TRAVERSE out('owns') FROM (SELECT FROM account WHERE uuid='" + uuid + "') MAXDEPTH 1) WHERE @class='collection')) WHERE @class='media')) WHERE @class='time'" + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET " + results_offset)
                .group('@rid')
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Get a list of time objects that belong to a given user.
     * 
     * @param uuid UUID of account that media should belong to 
     * @param query_params Accepts an array of query parameters to narrow results
     * @param results_limit Limit number of returned results
     * @param results_offset Offset to use for returned results. Useful for paging.
     */
    async get_related_media(media_id: string, query_params:any[], results_limit=-1, results_offset = 0){
        return new Promise((resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .select()
                .from("SELECT FROM (TRAVERSE out('related_to') FROM (SELECT FROM #" + media_id + ")) WHERE @rid <> " + media_id + this.build_query_from_params(query_params) + " LIMIT " + results_limit + " OFFSET  " + results_offset)
                .group('@rid')
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Returns media that share tags in common with the specified media item.
     * 
     * @param rid The Record ID of the media item.
     * @param query_params Array of query parameters to be applied.
     * @param results_limit Limit the number of returned results. -1 returns all results.
     * @param results_offset Offset for the results. Useful for paging.
     */
    async get_related_media_by_tag(rid: string, query_params: any[], results_limit = -1, results_offset = 0){
        return new Promise(async (resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .query("SELECT FROM (TRAVERSE in('tagged_with') FROM (SELECT FROM (TRAVERSE out('tagged_with') FROM #" + rid + ") WHERE @class='tag')) WHERE @class='media' AND @rid <> #" + rid +  this.build_query_from_params(query_params) + " GROUP BY @rid LIMIT " + results_limit + " OFFSET " + results_offset)
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Returns media that share people in common with the specified media item.
     * 
     * @param rid The Record ID of the media item.
     * @param query_params Array of query parameters to be applied.
     * @param results_limit Limit the number of returned results. -1 returns all results.
     * @param results_offset Offset for the results. Useful for paging.
     */
    async get_related_media_by_people(rid: string, query_params: any[], results_limit = -1, results_offset = 0){
        return new Promise(async (resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .query("SELECT FROM (TRAVERSE in('features_person') FROM (SELECT FROM (TRAVERSE out('features_person') FROM #" + rid + ") WHERE @class='person')) WHERE @class='media' AND @rid <> #" + rid + this.build_query_from_params(query_params) + " GROUP BY @rid LIMIT " + results_limit + " OFFSET " + results_offset)
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Returns media that share time in common with the specified media item.
     * 
     * @param rid The Record ID of the media item.
     * @param query_params Array of query parameters to be applied.
     * @param results_limit Limit the number of returned results. -1 returns all results.
     * @param results_offset Offset for the results. Useful for paging.
     */
    async get_related_media_by_time(rid: string, query_params: any[], results_limit = -1, results_offset = 0){
        return new Promise(async (resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .query("SELECT FROM (TRAVERSE in('has_time') FROM (SELECT FROM (TRAVERSE out('has_time') FROM #" + rid + ") WHERE @class='time')) WHERE @class='media' AND @rid <> #" + rid + this.build_query_from_params(query_params) + " GROUP BY @rid LIMIT " + results_limit + " OFFSET " + results_offset)
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Returns media that share places in common with the specified media item.
     * 
     * @param rid The Record ID of the media item.
     * @param query_params Array of query parameters to be applied.
     * @param results_limit Limit the number of returned results. -1 returns all results.
     * @param results_offset Offset for the results. Useful for paging.
     */
    async get_related_media_by_place(rid: string, query_params: any[], results_limit = -1, results_offset = 0){
        return new Promise(async (resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .query("SELECT FROM (TRAVERSE in('features_place') FROM (SELECT FROM (TRAVERSE out('features_place') FROM #" + rid + ") WHERE @class='place')) WHERE @class='media' AND @rid <> #" + rid + this.build_query_from_params(query_params) + " GROUP BY @rid LIMIT " + results_limit + " OFFSET " + results_offset)
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    async get_media_from_collection(uuid: string, collection_name: string, results_limit = -1, results_offset = 0){
        return new Promise(async (resolve, reject) => {
            var returning : any[] = [];
            try{
                db
                .query("SELECT FROM (TRAVERSE out('has_media') FROM (SELECT FROM (TRAVERSE out('owns') FROM (SELECT FROM account WHERE uuid='" + uuid + "') MAXDEPTH 1) WHERE @class='collection' AND name='" + collection_name + "')) WHERE @class='media' LIMIT " + results_limit + " OFFSET " + results_offset)
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e)
            {
                reject(e);
            }
        });
    }

    /**
     * Create a vertex in the graph. Returns the created object.
     * 
     * @param vertex_class Specify the class of vertex to create.
     * @param params An array of data properties to store. Each array element should contain a 2-element array using [property: value] format.
     */
    async create_vertex(vertex_class: string, params: any[]){
        return new Promise((resolve, reject) => {
            try{
                let property_arrays = this.build_create_arrays_from_params(params);
                let result = db.query("INSERT INTO " + vertex_class + " (" + property_arrays[0].toString() + ") VALUES (" + property_arrays[1].toString() + ")");
                resolve(result);
            }
            catch(e){
                reject(e);
            }
        });
    }

    /**
     * Create an edge between two existing vertexes in the graph.
     * 
     * @param edge_class Specify the class of edge to create.
     * @param from_id The Record ID of the vertex to begin the edge from.
     * @param to_id The Record ID of the vertex where the edge ends.
     */
    async create_edge(edge_class: string, from_id: string, to_id: string){
        return new Promise((resolve, reject) => {
            try{
                let result = db.query("CREATE EDGE " + edge_class + " FROM #" + from_id + " TO #" + to_id);
                resolve(result);
            }
            catch(e){
                reject(e);
            }
        });
    }

    /**
     * Checks if an edge already exists within the graph.
     * 
     * @param edge_class Specify the class of edge to search for.
     * @param from_id The Record ID of the vertex where the edge should begin.
     * @param to_id The Record ID of the vertex where the edge should end.
     */
    async check_edge(edge_class: string, from_id: string, to_id: string){
        return new Promise((resolve, reject) => {
            var returning : any[] = [];
            try{            
                db.query("SELECT FROM " + edge_class + " WHERE out = '#" + from_id + "' AND in = '#" + to_id + "' LIMIT 1")
                .all()
                //@ts-ignore
                .then(function (vertex) 
                {
                    //@ts-ignore
                    vertex.forEach( (element: any) => {
                        returning.push(element);
                    });
                    resolve(returning);
                });
            }
            catch(e){
                reject(e);
            }
        });
    }

    /**
     * Builds a query string from the array of parameters provided.
     * 
     * @param query_params An array of query paramters.
     */
    build_query_from_params(query_params:any[]){
        var query_string = " AND ";
        var params = 0;
        
        for(var pointer in query_params){
                query_string = query_string + query_params[pointer] + " AND ";
                params = params+1;
        }

        if(params > 0)
            return query_string.substring(0, query_string.length - 5);
        else
            return '';
    }

    /**
     * Builds array to insert into create statements, from an array of properties and values.
     * 
     * @param data_properties An array of data properties and values.
     */
    build_create_arrays_from_params(data_properties:any[]){
        let property_names : any[] = [];
        let property_values : any[] = [];

        data_properties.forEach( (element: any) => {
            property_names.push(element[0]);
            property_values.push(element[1]);
        });

       return [property_names, property_values];
    }
}

export {GraphAPI};