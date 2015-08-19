# [consoleJSON](http://consolejson.com)

*For the prettiest JSON in your console*

consoleJSON is a tool that displays JSON in the browser console, according to user-defined rules.  These rules comprise rulesets, which have many features:

* Rules can print keys and values in a variety of **fonts, colors, and styles**
* Rulesets are **composable** and can be saved
* consoleJSON comes with **default** rulesets to make it easy to get started
* Users can add and remove rules at **different scopes** to make it easy to reason about large JSON objects, or easily find a certain key

## Getting Started
Setup is incredibly easy. Simply download the [consoleJSON.js file](http://www.consolejson.com/assets/consoleJSON.js) (or the [minified version](http://www.consolejson.com/assets/consoleJSON.min.js)), and include it in your project structure. Then, include the following code in your html document:

```<script src="path/to/consoleJSON.js">```

Once you've included consoleJSON, you can simply call ```consoleJSON.log(...)``` to pretty print your JSON with one of the default rulesets.

For more examples, check out the [demos](http://www.consolejson.com/demo) or [documentation](http://www.consolejson.com/docs/).

## License
consoleJSON is under the MIT license. See the [LICENSE](LICENSE) file for details.

## Contributing
If you would like to contribute code to consoleJSON, please proceed by forking the repository and sending a pull request.

## Documents

**Note:** consoleJSON was created for CS164: Programming Languages and Compilers at UC Berkeley, during the Fall 2014 semester.

Below are some documents that were created throughout the development of consoleJSON, for some background:

[Overview Slides](https://docs.google.com/presentation/d/1e1No0AYsyo0m9ecbyA-M29bpXtVlAz5FXJyUk-v7LAc/edit?usp=sharing)

[Design Document](https://docs.google.com/document/d/1hkGU-5WY58IMbAAEPPg6ltP-8RJmyH9z3LaAyQLmsn4/)

[Demo Video](http://youtu.be/zt6ae4jTTw0)
