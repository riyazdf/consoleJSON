#!/bin/bash
# For each of these examples, we print out what the normal JSON looks like
# Then we print out what mjson.tool shows.

# Here is one key value pair
one='{ "foo": "lorem"}';
echo $one
echo $one | python -mjson.tool

# Here is two key value pairs
two='{ "foo": "lorem", "bar": "ipsum" }';
echo $two
echo $two | python -mjson.tool

# Here is a nested bunch of key value pairs
nested='{ "foo": "lorem", "bar": {"baz":"ipsum"} }';
echo $nested
echo $nested | python -mjson.tool

# More nesting
nnested='{ "foo": "lorem", "bar": {"baz": {"foofoo": "ipsum"} } }';
echo $nnested
echo $nnested | python -mjson.tool

