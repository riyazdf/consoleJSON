#!/bin/bash
one='{ "foo": "lorem"}';
echo $one
echo $one | python -mjson.tool

two='{ "foo": "lorem", "bar": "ipsum" }';
echo $two
echo $two | python -mjson.tool

nested='{ "foo": "lorem", "bar": {"baz":"ipsum"} }';
echo $nested
echo $nested | python -mjson.tool

nnested='{ "foo": "lorem", "bar": {"baz": {"foofoo": "ipsum"} } }';
echo $nnested
echo $nnested | python -mjson.tool

