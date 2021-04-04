LSD
===
A Local Storage Database
---
A really simple noSQL JavaScript database implementation that uses 
the browsers localStorage to persist its data.  The idea can easily be 
moved onto a node.js server where the data is persisted on disk.

Here is a small applications that stores information about cars and car makers.

lsd = LSD();
lsd.Create('Cars');
lsd.Cars.Create("Makers");
lsd.Cars.Create("Models");
var audiOID = lsd.Cars.Makers.Insert({name:'Audi',country:'Germany'});
lsd.Cars.Models.Insert({makeroid:audiOID,name:'Audi A1'});



The API
---

All API objects are wrapped inside the LSD object.   The LSD object is created
as:

	lsd = LSD();

The Database object
---

The LSD object has a single Create method to create or initialize databases 

Create a database 
---

	lsd.Create('Library');

   
The only thing this call does is to create a Database property called <b>Library</b>.

    lsd.Library
   
If a 'Library' object exists in your LocalStorage then this function call is 
similar to Connect(..) method for SQL databases. 

NOTE: If a Database object is not 'created' then it cannot be accessed in your code.

The Database object exposes one Create() function.   This function takes a 
single string argument and creates a Catalog object.

   lsd.Library.Create('CatalogName');


The Catalog object
---

Each database can contain one or more catalogs.  A catalog is simply a storage for similar types  of objects.  Our Library database could have a  Books catalog and a  Authors catalog.

You can of course store different objects types in a single catalog but using descriptive catalog name for each type of object is much easier to understand and makes your code more 
logical.

You use the lsd.Library.Create() method create new catalogs:

	lsd.Library.Create('Books');
	lsd.Library.Create('Authors');

So now we have two catalogs in the Library database that can be used for books and authors respectively.  

The above Create() method does two things.   First it creates a Catalog property in the 
Database object <b>lsd.Library</b> and secondly it opens up a catalog storage if it exists else
it will create a new one.

You can test this be running the above steps and view your browsers LocalStorage.  You should see two keys ; <b>lsd.Library.Authors</b> and <b>lsd.Library.Books</b>.  

Those two catalogs are now properties of the Library object in the same way the Library
object is a property of lsd.   Those objects can be accessed simply as 

	lsd.Library.Books 
	
and 

	lsd.Library.Authors

The Catalog object has methods to insert,update,delete and query objects.

<ul>
    <li>Insert(obj) inserts a new object</li>
    <li>Update(obj) updates existing object </li>
    <li>Delete(obj) deletes a object<li>
    <li>GetByOid(id) returns a object with given id</li>
</ul>

The Catalog also wraps several Query methods:

<ul>
<li>Filter(callback) Returns selected object from catalog and returns as a Query object</li>
<li>Map(callback) Applies the callback function to all elements and returns those as a Query object</li>
<li>Reduce(callback) Aggregates 
<li>

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
 
    <li>Filter(xisting objects ,delete (Delete) and retrieve (Filter) the objects.


Insert new object into a Catalog
---

	var bookOid = lsd.Library.Books.Insert({title:'Airframe',author:'Michael Crichton'});

Stores the book Airframe by Michael Crichton in the catalog Books in Library database.

The Insert function creates a unique object id (oid) for the inserted book object and returns it.
This id can be used to retrieve the inserted object

Retrieve a object by its object id (oid)
---

	var airframe = lsd.Library.Books.GetByOid(bookOid);
	alert(airframe.title);

Note that the GetByOid uses the object identifier (oid) to locate the stored object and returns a instance of the
object.  

If the original book object had custom methods they will not be stored or returned from LSD but
only the value properties.
Update a object
---
We can now modify the airframe book object and update the LSD database

	airframe.title = "The airframe";
	lsd.Library.Books.Update(airframe);

This works because the airframe book object returned from LSD has a  'oid' property value that 
identifies it within the Books catalog.
    
Caution: Do not change the oid value in your code as that might cause havoc in your application or database.

Delete a object 
---
The object can be deleted simply by passing it to the Delete method of the catalog.

	lsd.Library.Books.Delete(airframe);

Delete all objects
---
To delete all objects from a catalog 

	lsd.Library.Books.DeleteAll();
	
	
The Query object
---
The Catalog object additionally has a Filter method to return selected objects  from a catalog based on some user constraint.  
The Filter method returns a Query object that has couple of methods to further manipulate the values from Filter. We 
will take a more detailed look at the Query object later but at the moment only explain the method "ToArray()" that returns a JavaScript array.

	var books = lsd.Library.Books.Filter( function(b) { return b.author === "Michael Cricton" }).ToArray();

The 'books' object is a JavaScript array with a single book object of the book 'Airframe'.  Try it and then display with 

	console.log(books[0].title)



By omitting the ToArray() method we get the Query object.

	var query = lsd.Library.Books.Filter( function(b) { return b.author === "Michael Crichton" });

The Query object has methods to iterate and change objects (Map),aggregate objects or properties of objects (Reduce), get a single object by its index (Get), query the objects further (Filter), return the objects as an array (ToArray) as above and finally join the objects to other objects (Join) in different catalogs.

Map(foo)
---
Lets say we want to split the 'author' property into 'firstname' and 'lastname' and add those as properties to the 
returned objects

	var mapped = query.Map( function(b) { 
		b.firstname = b.author;
		b.lastname = "";
		if(b && b.author){
			var parts = b.author.split(',');
			if(parts.length > 1){
				b.firstname = parts[0];
				b.lastname = parts[1];
			}
		}
	});

Here I assume all authors have no more than two names (first and last).  If author only has one name
that name is returned as first name and last name is left empty.

The 'mapped' query now has all the objects from 'query' with the additional properties 'firstname' and 'lastname'.

We can continue to modify all the objects in 'mapped' by calling the Map function on 'mapped'.

Reduce(foo)
---
The Reduce method has a single function parameter that must define two parameters, the aggregate object 
and the object to aggregate

	var aggregate = query.Reduce( function(a,b) { 	
		if(!a){
			a = 0;
		}
		if(b.author === "Michael Crichton"){
			a++;
		}
		return a;
	});
	alert(aggregate);

The above aggregate is the number of books by Michael Crichton in the Books catalogue and the 'alert' should display 1.

A point to note is that the aggregate function must check if the aggregate is defined and if not initialize it with some 
value.   This value can be a number (as in the above example) or any JavaScript object we wish the aggregate to be. 

Get(i)
---

We can get objects from Query by their index (which is not the same as the object id - or oid).

	var item = query.Get(0);
	
returns the first item from the query or 'undefined' if the query is empty.

Length()
---

If we want to check how many items are in a query 

	var cnt = query.Length();
	alert(cnt);

Will display the number of items in the query object.

Join(catalog,name,foo)
---
If we want to get author objects WITH all their books we can use the Join() method to return all the authors we 
are interested in and insert a 'books' property containing a array with all the book objects belonging to them.

Lets assume that we have inserted reference 'authorid' in the 'book' objects to the oid property of the 
author objects.

We can then query our database for some authors and join their books to the returned author objects 

	var returnAll = function(a) { return true;}
	var authors = lsd.Library.Authors.Filter(returnAll).Join(lsd.Library.Books,'books', function(a,b) { a.oid === b.authorid; }).ToArray();
	alert(authors[0].books[0].title);
	
The above will return all authors (the returnAll function returns true for all authors and can be reused for all catalog)
and then joins their books (detail objects) to the author objects as array property 'books'. We finally print 
the title of the first book of the first author in the returned query.

You can easily chain more joins to join authors to other objects if needed, like a star join in SQL or chain any 
of the other Query functions like Map,Reduce or Filter to make more complicated constructs.


The Local Storage and LSD
===
If you open the api.html file in Chrome or Firefox then open the developers tools and take a view at the Local Storage object (in Resources in Chrome).  Your LSD objects should should be visible there with the keys jstore.<database name>.<catalog name>

<b>jstore.Library.Authors</b></br>
{"database":"Library","catalog":"Authors","cnt":93,"items":[{"firstname":"Arthur C","lastname":"Clark","oid":91},{"firstname":"Michael","lastname":"Crichton","oid":92}]}

<b>jstore.Library.Books</b></br>
{"database":"Library","catalog":"Books","cnt":333,"items":[{"title":"Conan","authorid":2,"year":1972,"oid":331},{"title":"The Barbarian","authorid":2,"year":1973,"oid":332}]}

<b>jstore.Library.Sales</b></br>
{"database":"Library","catalog":"Sales","cnt":67,"items":[{"bookid":331,"totalsales":3244,"oid":65},{"bookid":332,"totalsales":1000,"oid":66}]}

NOTE: If you are using a later version of the LSD library then "jstore" might have changed to "lsd".

All your objects in a catalog are stored as JSON strings so you can easily read them directly into your javascript code, just as other local storage 
objects. 


 

	



  












