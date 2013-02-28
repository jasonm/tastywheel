Tasty Wheel
========================

Wheel of (beer) fortune.

![](http://farm3.staticflickr.com/2151/4515299383_52887a79a6_z.jpg)


Prerequisites
-------------

Get couchdb:

```
brew install couchdb
```

Install node and npm:

```
brew install node
```

Install some build tools:

```
gem install watchr
```

Installation
------------

Install dependencies:

```
kanso install
```

Specify the name of the local (and, optionally, production) database you want
to deploy to:

```
cp kansorc.example .kansorc
```

Now, edit `.kansorc` to change the local or production database.

Deploy:

```
kanso push
```

You should see output ending with something like:

```
Build complete: 131ms
Uploading...
OK: http://localhost:5984/radio_beer_development/_design/bartender/index.html
```

Open that URL to view the app.


Development
-------------

As you develop, automatically rebuild the site with `watchr`:

```
watchr kanso.watchr
```

Save your hard-earned keystrokes.  Automatically reload the browser when
a rebuild happens with `live-reload` (the build touches `tmp/livereload.txt`
to initiate this handoff):

```
npm install -g live-reload
live-reload tmp/livereload.txt
```

Test Data
-----------------

Create beers with futon or something for now.  Maybe like:

    {
       "_id": "172df7d7ff08b684a88c2cfe97000795",
       "_rev": "1-97a2a8a729e26fe1b934e4601b5eca72",
       "name": "Awesome Beer",
       "abv": "7",
       "brewery": {
           "name": "Jason's kitchen"
       },
       "description": "My personal awesome beer",
       "type": "beer",
       "ratings": [
           {
               "glass_id": "abc123",
               "values": {
                   "Hoppy": 3,
                   "Sweet": 5,
                   "Creamy": 3,
                   "Fruity": 7,
                   "Roasty": 9,
                   "Bitter": 8,
                   "Citrus": 5,
                   "Floral": 7
               }
           }
       ]
    }

Deployment
-----------------

When you are ready to go live, make sure `.kansorc` has the correct credentials
under the `production` key, then push:

```
kanso push production
```
