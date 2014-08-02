
/*
constructor for a storage
the storage must implement the following functions

getAll() - returns all items
insert(o) - inserts item o
update(o) - updates item o
delete(o) - deletes item o
*/

function DefaultStorage(databaseName,catalogName){
	'use strict';
	var that = {},
		key = "jstore."+databaseName+"."+catalogName,
		catalogData,
		json;
	
	//get catalog data from localstorage or initialize new catalog
	json = localStorage[key];
	if(!json){
		catalogData = {database:databaseName,catalog:catalogName,cnt:1,items:[]};
		localStorage[key] = JSON.stringify(catalogData);
	}else{
		catalogData = JSON.parse(json);
	}
	
	function sync(){
		localStorage[key] = JSON.stringify(catalogData);
	}
	
	function findItem(oid){
        var i=0;
        if(oid){
            //inefficient method to find the item
            for(i=0;i<catalogData.items.length;i++){
                if(oid === catalogData.items[i].oid) {
                    return catalogData.items[i];
                }
            }
        }
        return undefined;
    }
	
	that.findItem = findItem;
	
	
	//scans catalog data items for a object with oid
	//returns index of object in array or -1 if not found
	function findItemIndex(oid){
        var i=0;
        if(oid){        
            //inefficient method to find the item
            for(i=0;i<catalogData.items.length;i++){
                if(oid === catalogData.items[i].oid) {
                    return i;
                }
            }
        }
        return -1;        
    }
	
	
	
	
	that.findItemIndex = findItemIndex;
	
	//returns a clone of the catalog items array
	that.getItems=function(){
		return catalogData.items.slice(0);
	}
	//insert a object and returns its new oid
	that.insertItem = function(o){
		if(!o) return undefined;
		o.oid  = catalogData.cnt;
		catalogData.cnt++;
		catalogData.items.push(o);
		sync();
		return o.oid;
	}
	//updates an object with valid 'oid' and returns that oid else -1
	that.updateItem = function(o){
		var ix;
		//find the object index and then update it
		if(!o || !o.oid || o.oid < 1) return;
		
		ix =  findItemIndex(o.oid);
		if(ix>0){
			catalogData.items[ix] = o;
			sync();
			return o.oid
		}	
		return undefined;
	}
	
	that.deleteItem = function(o){
		var ix;	
		if(!o) return;		
		ix =  findItemIndex(o.oid);
		if(ix>0){
			catalogData.items.splice(ix,1);
			sync();
		}
	}
	
	that.deleteAllItems = function(){
		catalogData.items = [];
		sync();
	}
	return that;
}


function Catalog(storage){
    'use strict';
    var that = {};
	    
    //insert a new item and returns its id
    that.Insert = function(o){
		return storage.insertItem(o);         

    };
    //update item if it exists - else do nothing
    //return the oid of the updated object
    that.Update = function(o){
        return storage.updateItem(o);
	}
	
	that.Delete = function(o){
		storage.delete(o);
	}
	//deprecated
	that.DeleteAllItems = function(){
		storage.deleteAllItems();
	}	
	that.DeleteAll = function(){
		storage.deleteAllItems();
	}
	
	//returns the items in this catalog as array
	//Deprecated
	that.ToArray = function(){
		return storage.getItems();
	}
	

	
	//Query API

	//returns a specific item from storage by 'oid'
	that.GetByOid = function(oid){
		return storage.findItem(oid);
	}

	//returns a Query object containing filtered list of items
	that.Filter = function(filter){
		return Query(storage.getItems()).Filter(filter);
	}
	
	//returns a Query object with  list of mapped items
	that.Map = function(map){
		return Query(storage.getItems()).Map(map);
	}
	that.Reduce = function(reduce){
		return Query(storage.getItems()).Reduce(reduce);
	}
	
	//join all objects in this catalog with objects in 
	//the catalog parameter using the join function
	that.Join = function(catalog,name,join){
		return Query(storage.getItems()).Join(catalog,name,join);
	}
	
	return that;
    
    
}

//query objects are returned by catalog queries and chained queries
//queries can not alter the state of catalogs
function Query(items){
	'use strict';
	var that = {};

	//returns the i'th item of the query result
	that.Get = function(i){
		return clone(items[i]);
	}
	//returns the length of the query results
	that.Length = function(){
		return items.length;
	}	

	that.Filter = function(filter){
		var i,newItems = [];
		if(filter){
			for(i=0;i<items.length;i++){
				if(filter(items[i])){
					newItems.push(items[i]);
				}
			}
		}else{
			newItems = items;
		}
		return Query(newItems);
	}
	
	that.Map = function(map){
		var i,newItems = [];
		if(map){
			for(i=0;i<items.length;i++){
				newItems.push(map(items[i]));
			}
		}else{
			newItems = items;
		}
		return Query(newItems);
	}
	
	that.Reduce = function(reduce){
		var aggregate,i;
		if(reduce){
			for(i=0;i<items.length;i++){
				aggregate = reduce(aggregate,items[i]);
			}			
		}
		return aggregate;
	}
	
			//join all objects in this catalog with objects in 
	//the catalog parameter using the join function
	that.Join = function(catalog,name,join){
		
		var i,j,m,n,details,joinItems;

		if(catalog && join && name)
		{
			joinItems = catalog.ToArray();
			m = items.length;
			n = joinItems.length;
			
			//for each item in this collection add a array property with given name
			for(i=0;i<m;i++)
			{
				details = [];
				for(j=0;j<n;j++)
				{
					if(join(items[i],joinItems[j]))
					{
						details.push(joinItems[j]);
					}
				}				
				items[i][name] = details;
			}
		}
		return Query(items);
		
	}
	
	
	that.ToArray = function(){
		return items;
	}
	
	return that;
	
}

function Database(databaseName){
	'use strict';
    var that = {};
    //creates a new catalog
    that.Create = function(catalogName){
		if(!catalogName) throw "Illegal argument";
        that[catalogName] = Catalog(DefaultStorage(databaseName,catalogName));
    }
    return that;
}


function LSD(){
	'use strict';
    var that = {};
	
    //create a new database and add to this store object
    that.Create = function(databaseName){
        if(!databaseName) throw "Illegal argument";
        that[databaseName] = Database(databaseName);
    }
    return that;      
}

