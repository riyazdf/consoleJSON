#!/bin/bash
# For each of these examples, we print out what the normal JSON looks like
# Then we print out what jq shows.

# Here is one key value pair, simple pretty print
# Note: '.' is the identity filter, and jq auto colorizes
one='{ "foo": "lorem"}';
echo $one
echo $one | jq '.'

# Here is two key value pairs
two='{ "foo": "lorem", "bar": "ipsum" }';
echo $two
echo $two | jq '.'

# Here is a nested bunch of key value pairs
nested='{ "foo": "lorem", "bar": {"baz":"ipsum"} }';
echo $nested
echo $nested | jq '.'

# More nesting
nnested='{ "foo": "lorem", "extra1": "buzz", "bar": {"extra2":"key", "boo": "wol", "baz": {"extra3":"key", "foofoo": "ipsum"} } }';
echo $nnested
echo $nnested | jq '.'

# Now for some more interesting filtering
# We will filter out all the "extra" keys
# Note how clunky it is to specify the output keys vs. objects
echo $nnested
echo $nnested | jq '{foo, bar: {boo: (.bar.boo), baz: {foofoo: (.bar.baz.foofoo)}}}'

# This time we'll just search for the foofoo key using jq filter composition
echo $nnested
echo $nnested | jq '.bar? | .baz? | .foofoo?'
