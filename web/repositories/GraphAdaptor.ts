import { GraphAPI } from './GraphAPI';

export class GraphAdaptor {

  /**
   * Creates media object and associated objects in the graph, then returns data in the same format as mongo db api.
   * 
   * @param account_uuid UUID of account that 'owns' this media
   * @param file_path String, file path of media item
   * @param media_type String, type of media
   * @param linked_media Array of media item ids to link to
   * @param tags Array of strings - tag names
   * @param places Array of strings - place names
   * @param people Array of strings - people names
   * @param times Array of strings - time values
   * @param collection String - name of collection, can be existing or new.
   */
  async create_media_object(account_uuid: string, file_path: string, media_type: string, linked_media: any , tags: string[], places: string[], people: string[], times: string[], collection: string){
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();

        /*
        * Get RId of account with specified uuid
        */
        let account_item = await api.get_accounts(account_uuid,[],-1,0);
          //@ts-ignore
        let account_id = account_item[0]['@rid']['cluster'] + ":" + account_item[0]['@rid']['position'];
        
        /*
        * Create media object first
        */
        let media_item = await api.create_vertex('media', [['path', file_path],['mimetype',media_type]]);
          //@ts-ignore
        let media_item_id = media_item[0]['@rid']['cluster'] + ":" + media_item[0]['@rid']['position'];
        /*
        * Loop through each tag that has been passed to the function
        */
       tags.forEach(async (to_tag :any ) => {
        /*
        * Check if tag exists, create if not
        */
        let tag_item = await api.get_tags(account_uuid,[["name = '" + to_tag + "'"]],1,0);
        var tag_item_id;

        //@ts-ignore
        if(tag_item.length > 0){
          //@ts-ignore
          tag_item_id = tag_item[0]['@rid']['cluster'] + ":" + tag_item[0]['@rid']['position'];
        } else {
          //@ts-ignore
          let new_tag = await api.create_vertex('tag', [["name","'" + to_tag + "'"]]);
          //@ts-ignore
          tag_item_id = new_tag[0]['@rid']['cluster'] + ":" + new_tag[0]['@rid']['position'];
        }

        let tagged_edge_result = await api.check_edge("TAGGED_WITH", media_item_id, tag_item_id);
        //@ts-ignore
        if(tagged_edge_result.length == 0){
          await api.create_edge("TAGGED_WITH", media_item_id, tag_item_id);
        }
      });
        /*
        * Get or create collection
        */
        let collection_item = await api.get_collections(account_uuid, [["name = '" + collection + "'"]],-1,0);
        //@ts-ignore
        var collection_item_id : any;
        
        //@ts-ignore
        if(collection_item.length > 0){
          //@ts-ignore
          collection_item_id = collection_item[0]['@rid']['cluster'] + ":" + collection_item[0]['@rid']['position'];
        } else {
          let new_collection = await api.create_vertex('collection', [['name', "'" + collection + "'"]]);
          //@ts-ignore
          collection_item_id = new_collection[0]['@rid']['cluster'] + ":" + new_collection[0]['@rid']['position'];
        }

        /*
        * Create user -> collection links
        */
        let owns_edge_result = await api.check_edge("OWNS", account_id, collection_item_id);

        //@ts-ignore
        if(owns_edge_result.length == 0){
          await api.create_edge("OWNS", account_id, collection_item_id);
        }

        await api.create_edge("HAS_MEDIA", collection_item_id, media_item_id);

        /*
        * Loop through linked_media and create edges
        */
        if(linked_media !== '')
        {
          var linked_media_array : Array<any> = linked_media.split(",");
          if(linked_media_array.length > 0){
            linked_media_array.forEach(async (to_link : any) => {
              //@ts-ignore
              await api.create_edge("RELATED_TO", media_item_id, to_link);
              await api.create_edge("RELATED_TO", to_link, media_item_id);
            });
          }
        }

         /*
         * Loop through each place that has been passed to the function
         */
         places.forEach(async (to_place :any ) => {
          /*
          * Check if tag exists, create if not
          */
          let place_item = await api.get_places(account_uuid,[["name = '" + to_place + "'"]],1,0);
          var place_item_id;

          //@ts-ignore
          if(place_item.length > 0){
            //@ts-ignore
            place_item_id = place_item[0]['@rid']['cluster'] + ":" + place_item[0]['@rid']['position'];
          } else {
            //@ts-ignore
            let new_place = await api.create_vertex('place', [["name","'" + to_place + "'"]]);
            //@ts-ignore
            place_item_id = new_place[0]['@rid']['cluster'] + ":" + new_place[0]['@rid']['position'];
          }

          let place_edge_result = await api.check_edge("FEATURES_PLACE", media_item_id, place_item_id);
          //@ts-ignore
          if(place_edge_result.length == 0){
            await api.create_edge("FEATURES_PLACE", media_item_id, place_item_id);
          }
        });

        /*
        * Loop through each place that has been passed to the function
        */
        people.forEach(async (to_people :any ) => {
          /*
          * Check if tag exists, create if not
          */
          let people_item = await api.get_people(account_uuid,[["name = '" + to_people + "'"]],1,0);
          var people_item_id;

          //@ts-ignore
          if(people_item.length > 0){
            //@ts-ignore
            people_item_id = people_item[0]['@rid']['cluster'] + ":" + people_item[0]['@rid']['position'];
          } else {
            //@ts-ignore
            let new_people = await api.create_vertex('person', [["name","'" + to_people + "'"]]);
            //@ts-ignore
            people_item_id = new_people[0]['@rid']['cluster'] + ":" + new_people[0]['@rid']['position'];
          }

          let people_edge_result = await api.check_edge("FEATURES_PERSON", media_item_id, people_item_id);
          //@ts-ignore
          if(people_edge_result.length == 0){
            await api.create_edge("FEATURES_PERSON", media_item_id, people_item_id);
          }
        });

        /*
        * Loop through each time that has been passed to the function
        */
        times.forEach(async (to_time :any ) => {
          /*
          * Check if time exists, create if not
          */
          let time_item = await api.get_times(account_uuid,[["value = '" + to_time + "'"]],1,0);
          var time_item_id;

          //@ts-ignore
          if(time_item.length > 0){
            //@ts-ignore
            time_item_id = time_item[0]['@rid']['cluster'] + ":" + time_item[0]['@rid']['position'];
          } else {
            //@ts-ignore
            let new_time = await api.create_vertex('time', [["value","'" + to_time + "'"]]);
            //@ts-ignore
            time_item_id = new_time[0]['@rid']['cluster'] + ":" + new_time[0]['@rid']['position'];
          }

          let time_edge_result = await api.check_edge("HAS_TIME", media_item_id, time_item_id);
          //@ts-ignore
          if(time_edge_result.length == 0){
            await api.create_edge("HAS_TIME", media_item_id, time_item_id);
          }
        });

        resolve(await this.get_media_item(account_uuid,media_item_id, 0));
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Retrieves a single media item, with info on linked objects.
   * 
   * Takes retrieves basic media item data, as well as name and RId data for each linked entity.
   * Currently returns in a format similar to that expected when using the Mongo DB API.
   * 
   * @param uuid UUID of the user account.
   * @param media_id RId of the media item to return.
   */
  async get_media_item(uuid: string, media_id: string, internal = 0){
    return new Promise( async (resolve, reject) => {
      try{
        let returning: any = {};
        let api = new GraphAPI();
        var results = await api.get_media(uuid,["@rid = '#" + media_id + "'"],1,0);

        returning.code = 200;
        returning.message = "success";
        returning.errors = "false";
        returning.payload = {};
        returning.payload.links = {};
        returning.payload.links.tags = await this.get_media_tags(media_id, [], -1, 0, 1);
        returning.payload.links.collections = await this.get_media_collections(media_id, null, -1, 0, 1);
        returning.payload.links.people = await this.get_media_people(media_id, null, -1, 0, 1);
        returning.payload.links.places = await this.get_media_places(media_id, null, -1, 0, 1);
        returning.payload.links.times = await this.get_media_times(media_id, null, -1, 0, 1);
        returning.payload.links.related_media = await this.get_related_media(media_id, [], -1, 0, 1);
        returning.payload.era = 'era';
        returning.payload.tags = await this.get_media_tags(media_id, null, -1, 0, 1);
        returning.payload.collections = await this.get_media_collections(media_id, null, -1, 0, 1);
        returning.payload.people = await this.get_media_people(media_id, null, -1, 0, 1);
        returning.payload.places = await this.get_media_places(media_id, null, -1, 0, 1);
        returning.payload.times = await this.get_media_times(media_id, null, -1, 0, 1);
        returning.payload.related_media = await this.get_related_media(media_id, [], -1, 0, 1);

        returning.payload._id = media_id;
        //@ts-ignore
        returning.payload.path = results[0]['path'];
        //@ts-ignore
        returning.payload.mimetype = results[0]['mimetype'];
        returning.payload.sizes = [];
        returning.payload.user = uuid;
        //@ts-ignore
        returning.payload.createdAt = results[0]['created_at'];

        /**
         * THESE ARE TEMP FIXES TO MATCH WHAT THE WEBAPP IS EXPECTING
         */
        returning.payload.locket = returning.payload.collections[0].name;
        returning.payload.emotions = await this.get_media_combined_tag_names(media_id,[],-1,0,1);

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns a single media item from a collection that belongs to the specified user.
   * 
   * @param uuid Account UUID 
   * @param collection_name Name of the collection to retrieve a media item from.
   */
  async get_single_media_from_collection(uuid: string, collection_name: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        let results = await api.get_media_from_collection(uuid, collection_name, -1, 0);
        let returning: Array<any> = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.push({ 'name': element.name, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        /*
        * If array has no length, then no matching result
        */
        if(returning.length > 0)
        {
          let element_to_return = Math.floor(Math.random()*(returning.length+1)+0);
          resolve(this.get_media_item(uuid, returning[element_to_return].id, 0));
        }
        else
        {
          resolve({'code': 404, 'errors': true, 'message' : 'No results found.', 'payload': {}});
        }
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns a list of accounts
   * 
   * @param uuid User account UUID
   * @param params Array of query parameters to apply.
   * @param results_limit Limit the number of results to return.
   */
  async get_accounts(uuid: string, params: any[], results_limit: number) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        let params: Array<any> = [];
        var results = await api.get_accounts(uuid, params, results_limit);
        resolve(results);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns media associated with an account.
   * 
   * Requires the UUID of the account, and will accept an array of further parameters to query with.
   * 
   * @param uuid UUID of the user account
   * @param params Array of query parameters 
   * @param results_limit Number of results to return, -1 returns all results.
   * @param results_offset Results offset, useful for paging. 
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_account_media(uuid: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_media(uuid, params, results_limit, results_offset);
        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        for(let element of results)
        {
         let temp : any = await this.get_media_item(uuid, element['@rid']['cluster'] + ":" + element['@rid']['position'],1);
         returning.payload.push(temp);
        };

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns media associated with an account.
   * 
   * Requires the UUID of the account, and will accept an array of further parameters to query with.
   * 
   * @param uuid UUID of the user account
   * @param params Array of query parameters 
   * @param results_limit Number of results to return, -1 returns all results.
   * @param results_offset Results offset, useful for paging. 
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_collection_media(uuid: string, collection_name: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_collection_media(uuid, collection_name, params, results_limit, results_offset);
        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];
        //@ts-ignore
        for(let element of results)
        {
          returning.payload.push(await this.get_media_item(uuid, element['@rid']['cluster'] + ":" + element['@rid']['position'],1));
        }
        
        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns all tags related directly with a single media item.
   * 
   * @param rid Record ID of the media item
   * @param params Array of query parameters to apply
   * @param results_limit Limit the number of returned results. -1 returns all results.
   * @param results_offset Offset the results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_media_tags(rid: string, params: any[], results_limit : number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_media_tags(rid, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'name': element.name, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns all people related directly with a single media item.
   * 
   * @param rid Record ID of the media item
   * @param params Array of query parameters to apply
   * @param results_limit Limit the number of returned results. -1 returns all results.
   * @param results_offset Offset the results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_media_people(rid: string, params: any[], results_limit : number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_media_people(rid, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'name': element.name, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns all places related directly with a single media item.
   * 
   * @param rid Record ID of the media item
   * @param params Array of query parameters to apply
   * @param results_limit Limit the number of returned results. -1 returns all results.
   * @param results_offset Offset the results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_media_places(rid: string, params: any[], results_limit : number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_media_places(rid, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'name': element.name, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });
        
        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns all times related directly with a single media item.
   * 
   * @param rid Record ID of the media item
   * @param params Array of query parameters to apply
   * @param results_limit Limit the number of returned results. -1 returns all results.
   * @param results_offset Offset the results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_media_times(rid: string, params: any[], results_limit : number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_media_times(rid, params, results_limit, results_offset);
        
        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'value': element.value, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns all times related directly with a single media item.
   * 
   * @param rid Record ID of the media item
   * @param params Array of query parameters to apply
   * @param results_limit Limit the number of returned results. -1 returns all results.
   * @param results_offset Offset the results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_media_combined_tag_names(rid: string, params: any[], results_limit : number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results_times = await api.get_media_times(rid, params, results_limit, results_offset);
        var results_tags = await api.get_media_tags(rid, params, results_limit, results_offset);
        var results_places = await api.get_media_places(rid, params, results_limit, results_offset);
        var results_people = await api.get_media_people(rid, params, results_limit, results_offset);


        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results_times.forEach((element: any) => {
          returning.payload.push('t/' + element.value);
        });

        //@ts-ignore
        results_tags.forEach((element: any) => {
          returning.payload.push(element.name);
        });

        //@ts-ignore
        results_places.forEach((element: any) => {
          returning.payload.push('@' + element.name);
        });

        //@ts-ignore
        results_people.forEach((element: any) => {
          returning.payload.push('p/' + element.name);
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns a single tag item.
   * 
   * @param uuid UUID of the user account.
   * @param rid Record ID of the tag to return.
   */
  async get_tag_item(uuid: string, rid: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_tags(uuid, ["@rid = " + rid], 1, 0);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];
        
         //@ts-ignore
         results.forEach((element: any) => {
          returning.payload.push({ 'name': element.name, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        resolve(returning);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns a list of collections associated with the user UUID.
   * 
   * @param uuid UUID of the user account.
   * @param params Array of search parameters to apply. 
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset for the returned results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_account_collections(uuid: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_collections(uuid, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'name': element.name, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns a list of people associated with the media of the specified UUID.
   * 
   * @param uuid UUID of the user account.
   * @param params Array of search parameters to apply.
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset for the returned results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_account_people(uuid: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
      return new Promise(async (resolve, reject) => {
        try {
          let api = new GraphAPI();
          var results = await api.get_people(uuid, params, results_limit, results_offset);

          let returning: any = {};
          returning.code = 200;
          returning.message = "success";
          returning.errors = 'false';
          returning.payload = [];

          //@ts-ignore
          results.forEach((element: any) => {
            returning.payload.push({ 'name': element.name, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
          });

          if(internal == 0)
            resolve(returning);
          else
            resolve(returning.payload);
        }
        catch (e) {
          reject({code: 500, message: e, errors : true, payload: []});
        }
      })
  }

  /**
   * Returns a list of times associated with the media of the specified UUID.
   * 
   * @param uuid UUID of the user account.
   * @param params Array of search parameters to apply.
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset for the returned results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_account_times(uuid: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();;
        var results = await api.get_times(uuid, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'value': element.value, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns a list of places that are associated with the provided UUID.
   * 
   * @param uuid UUID of the suer account
   * @param params Array of search terms to apply.
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset for the returned results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_account_places(uuid: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_places(uuid, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'name': element.name, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns all tags associated with media that are in turn associated with the specified account UUID.
   * 
   * @param uuid UUID of the user accounts.
   * @param params Array of search params
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset for results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_account_tags(uuid: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_tags(uuid, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'name': element.name, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Returns a list of collections that feature the specified media item.
   * 
   * @param uuid UUID of the suer account
   * @param params Array of search terms to apply.
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset for the returned results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_media_collections(rid: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        let params: Array<any> = [];
        var results = await api.get_media_collections(rid, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'name': element.name, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Get a list of 'related' media - specifically using the 'related media' links specified by the user on data entry.
   * 
   * @param media_id Record ID of the media item to begin searching from
   * @param params Array of search parameters to apply to the media items returned.
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset for the results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_related_media(media_id: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_related_media(media_id, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'mimetype': element.mimetype, 'path': element.path, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Get a list of 'related' media - uses any available linking edge.
   * 
   * @param media_id Record ID of the media item to begin searching from.
   * @param params Array of search parameters to apply to the media items returned.
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset fro the results. Useful for paging.
   * @param internal Flag. When 0, returns full API formatted results. Wehn 1, returns just results for use in other functions.
   */
  async get_related_media_all(media_id: string, params: any[], results_limit: number, results_offset = 0, internal = 0){
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_related_media_all(media_id, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];
        
        //@ts-ignore
        for(let element of results)
        {
          returning.payload.push( {'mimetype': element.mimetype, 'path': element.path, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        }

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch(e) {
        reject({code: 500, message: e, errors: true, payload: []});
      }
    })
  }

  /**
   * Get a list of 'related' media - uses any available linking edge.
   * 
   * @param media_id Record ID of the media item to begin searching from.
   * @param params Array of search parameters to apply to the media items returned.
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset fro the results. Useful for paging.
   * @param internal Flag. When 0, returns full API formatted results. Wehn 1, returns just results for use in other functions.
   */
  async get_related_media_all_weighted(media_id: string, params: any[], results_limit: number, results_offset = 0, internal = 0, tag_weight: number, people_weight: number, places_weight: number, times_weight: number){
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_related_media_all(media_id, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];
        
        //@ts-ignore
        for(let element of results)
        {
          let num_tags_in_common = await this.get_num_tags_between_vertexes(media_id, element['@rid']['cluster'] + ":" + element['@rid']['position']);
          //@ts-ignore
          let tag_weighted : number = num_tags_in_common * tag_weight;
          let num_people_in_common = await this.get_num_people_between_vertexes(media_id, element['@rid']['cluster'] + ":" + element['@rid']['position']);
          //@ts-ignore
          let people_weighted : number = num_people_in_common * people_weight;
          let num_places_in_common = await this.get_num_places_between_vertexes(media_id, element['@rid']['cluster'] + ":" + element['@rid']['position']);
          //@ts-ignore
          let places_weighted : number = num_places_in_common * places_weight;
          let num_times_in_common = await this.get_num_times_between_vertexes(media_id, element['@rid']['cluster'] + ":" + element['@rid']['position']);
          //@ts-ignore
          let times_weighted : number = num_times_in_common * times_weight;

          //@ts-ignore
          let total_links_count = num_people_in_common + num_places_in_common + num_tags_in_common + num_times_in_common;
          //@ts-ignore
          let total_links_weighted = tag_weighted + people_weighted + places_weighted + times_weighted;

          if(total_links_count > 0)
            returning.payload.push( {'mimetype': element.mimetype, 'path': element.path, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'], 'num_tags' : num_tags_in_common, 'num_people' : num_people_in_common, 'num_places' : num_places_in_common, 'num_num_times' : num_times_in_common, 'total_common_links' : total_links_count, 'total_weighted_common_links' : total_links_weighted});
        }

        //@ts-ignore
        returning.payload = returning.payload.sort(function(a, b) {
          if (a.total_weighted_common_links > b.total_weighted_common_links)
            return -1;
          if (a.total_weighted_common_links < b.total_weighted_common_links)
            return 1;
          return 0;
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch(e) {
        reject({code: 500, message: e, errors: true, payload: []});
      }
    })
  }

  /**
   * Get a list of 'related' media - with links inferred by having tags in common.
   * 
   * @param media_id Record ID of the media item to begin searching from
   * @param params Array of search parameters to apply to the media items returned.
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset for the results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_related_media_by_tags(media_id: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_related_media_by_tag(media_id, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'mimetype': element.mimetype, 'path': element.path, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Get a list of 'related' media - with links inferred by media feauturing the same people.
   * 
   * @param media_id Record ID of the media item to begin searching from
   * @param params Array of search parameters to apply to the media items returned.
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset for the results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_related_media_by_people(media_id: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();

        var results = await api.get_related_media_by_people(media_id, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'mimetype': element.mimetype, 'path': element.path, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  /**
   * Get a list of 'related' media - links are inferred by having 'time' in common.
   * 
   * @param media_id Record ID of the media item to begin searching from
   * @param params Array of search parameters to apply to the media items returned.
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset for the results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_related_media_by_time(media_id: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_related_media_by_time(media_id, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'mimetype': element.mimetype, 'path': element.path, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  async delete_media(media_id: string) {
    return new Promise(async (resolve, reject) => {
      try{
        let api = new GraphAPI();
        await api.delete_media(media_id);
        resolve('success');
      }
      catch(e){
        reject(e);
      }
    })
  }

  /**
   * Get a list of 'related' media - inferred from media having 'place' in common.
   * 
   * @param media_id Record ID of the media item to begin searching from
   * @param params Array of search parameters to apply to the media items returned.
   * @param results_limit Limit the number of results to return. -1 returns all results.
   * @param results_offset Offset for the results. Useful for paging.
   * @param internal Flag. When 0, returns data formatted similar to mongo API. When 1, returns just results for use in other functions.
   */
  async get_related_media_by_place(media_id: string, params: any[], results_limit: number, results_offset = 0, internal = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = new GraphAPI();
        var results = await api.get_related_media_by_place(media_id, params, results_limit, results_offset);

        let returning: any = {};
        returning.code = 200;
        returning.message = "success";
        returning.errors = 'false';
        returning.payload = [];

        //@ts-ignore
        results.forEach((element: any) => {
          returning.payload.push({ 'mimetype': element.mimetype, 'path': element.path, 'id': element['@rid']['cluster'] + ":" + element['@rid']['position'] });
        });

        if(internal == 0)
          resolve(returning);
        else
          resolve(returning.payload);
      }
      catch (e) {
        reject({code: 500, message: e, errors : true, payload: []});
      }
    })
  }

  async get_num_tags_between_vertexes(id1: string, id2: string){
    return new Promise(async (resolve, reject) => {
      try{
        let api = new GraphAPI();
        let num = api.num_tags_in_common(id1,id2);
        resolve(num);
      }
      catch (e) {
        reject ({code: 500, message: e, errors: true, payload: []});
      }
    })
  }

  async get_num_places_between_vertexes(id1: string, id2: string){
    return new Promise(async (resolve, reject) => {
      try{
        let api = new GraphAPI();
        let num = api.num_places_in_common(id1,id2);
        resolve(num);
      }
      catch (e) {
        reject ({code: 500, message: e, errors: true, payload: []});
      }
    })
  }

  async get_num_people_between_vertexes(id1: string, id2: string){
    return new Promise(async (resolve, reject) => {
      try{
        let api = new GraphAPI();
        let num = api.num_people_in_common(id1,id2);
        resolve(num);
      }
      catch (e) {
        reject ({code: 500, message: e, errors: true, payload: []});
      }
    })
  }

  async get_num_times_between_vertexes(id1: string, id2: string){
    return new Promise(async (resolve, reject) => {
      try{
        let api = new GraphAPI();
        let num = api.num_times_in_common(id1,id2);
        resolve(num);
      }
      catch (e) {
        reject ({code: 500, message: e, errors: true, payload: []});
      }
    })
  }

  /**
   * Creates a 'placeholder' user account based on the ID passed from creation in mongo.
   * 
   * @param uuid The ID of the user account to create.
   */
  async create_account(uuid: string) {
    return new Promise(async (resolve, reject) => {
      try{
        let api = new GraphAPI();
        await api.create_vertex('account',[["uuid","'" + uuid + "'"]]);
        resolve(true);
      }
      catch (e) {
        reject ({code: 500, message: e, errors: true, payload: []});
      }
    })
  }
}