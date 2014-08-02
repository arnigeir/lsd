LSD
===
A Local Storage Database
---
A really simple noSQL database implementation that uses 
the browsers localStorage to persist its data and a functional api to manage and query.

The database API consist of a single object called LSD:

	lsd = LSD();

The Database object
---

The LSD object has a single Create method to create or initialize databases 

Create a new database 
---

	lsd.Create('Library');

creates a Library database in the local storage.  This creates a 
database property object in the lsd instance with the same name that 
can be used to create catalogs to hold JavaScript objects.

If the Library database already exists this method has no effect but it is better to 
call it in the case the database does not already exist as that will throw exceptions when
trying to access the database that does not exist.

The Catalog object
---

Each database can contain one ore more catalogs.  A catalog is simply a object storage for similar types  of objects, like library books could have a dedicated Books catalog, book authors a Authors catalog et cetera.   You can of course store different objects types in a single catalog but using descriptive catalog name for each type of object is much easier in the long run to understand and maintain.

The Library.Create() is used to create new catalogs:

	lsd.Library.Create('Books');
	lsd.Library.Create('Authors');

So now we have two catalogs in the Library database that can be used for books and authors respectively.  

Note that if a catalog already exists the Create method quietly returns without doing anything.  The LSD() method has already loaded all the 
catalogs that were previously created and they can be accessed irrelevant of the Create() method call above.  It is though a good idea to 
call the create method just to make sure that the needed catalogs are created just in case to avoid exception later in you code.

Those two catalogs are now properties of the Library object in LSD in the same way the Library
object is a property of LSD.   Those objects can be accessed simply as 

	lsd.Library.Books 
	
and 

	lsd.Library.Authors

The Catalog object has several methods to manage it's objects like inserting (Insert) new ones , updating (Update) existing ones ,
delete (Delete) and retrieve (Filter) the objects.

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
will take a more detailed look at Query later but at the moment only explain the method "ToArray()" that a JavaScript array of the objects in the query.

	var books = lsd.Library.Books.Filter( function(b) { return b.author === "Michael Cricton" }).ToArray();

The 'books' object is a JavaScript array with a single book, 'Airframe'.

	alert(books[0].title)

will display 'Airframe'.

My omitting the ToArray() method we get the Query object.

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


 

	



  












