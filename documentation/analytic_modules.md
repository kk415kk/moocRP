[Back to README](../README.md)

Analytic Modules
================

One main functionality of moocRP is the ability for researchers to upload analytics modules that they've created and share it with other researchers. This allows other researchers to view what's already been done and apply the same analytics module to various datasets and possibly alternative data types.

A <strong>data type</strong> could be something like MOOCdb.

A <strong>dataset</strong> could be the data for a specific offering of a course during a specific term.

File Structure
---
Uploaded files should be archived in a ZIP archive. The structure of the analytics module should be of this form:

    ````
    main.html
    css/
    js/
    ````

````main.html```` is used to display the main visualization - all script and stylesheet dependencies should be listed in ````main.html````. All script and CSS files should be placed in the ````js/```` and ````css/```` folders respectively.


Reading Data
---
moocRP uses a templating system called EJS. EJS allows moocRP to pass data from the server to the client through special variables using their syntax of bracket. This allows your visualization to access the string-represented version of the dataset, which you can then process into any format you'd like.

Here is a template for accessing the data for a particular data model that you should put in your script code:
````
var dataFiles = {}
<% for (var dataFile in dataset) { %>
  <% if (dataset.hasOwnProperty(dataFile)) { %>
    dataFiles["<%= dataFile %>"] = <%- JSON.stringify(dataset[dataFile]) %>;
  <% } %>
<% } %>
````

Each data model will have its own associated files. To access a particular file in your script, you can simply call ````dataFiles[some_file_name]```` to access the raw contents of the file. To know what associated files there are for each model, see [the data models page](data_models.md). (under construction)

Important Notes
---
* Please do NOT use external JS sources in your module. Download the JS sources you need to use and place them into the ````js/```` folder. Link to the JS source using ````<script src="js/your_source.js">````.
* If you have a "main" ````div```` where you display your visualizations, please use the class or ID name "module-main" to label the ````div````, i.e. ````<div class="main-module">...</div>```` or ````<div id="main-module">...</div>````. This is to prevent class/ID clashes with existing moocRP CSS styling. Some common class names to avoid:
  * ````container````
  * ````wrapper````
* Do not label your body tags with class or ID names and use it to identify where to place new content, i.e. with JavaScript. Instead, use a main ````div```` tag to wrap around your content.

Pre-processing Data
---
TODO

Basic Template
---

```main.html```

````
<script src="js/d3.min.js">
<script src="js/myMainJS.js">

<div class="module-main">
</div>

<script>
var dataFiles = {}
<% for (var dataFile in dataset) { %>
  <% if (dataset.hasOwnProperty(dataFile)) { %>
    dataFiles["<%= dataFile %>"] = <%- JSON.stringify(dataset[dataFile]) %>;
  <% } %>
<% } %>

createMyGraph(dataFiles["course_structure.json"]);
</script>
````

````myMainJS.js````

````
var createMyGraph = function(data) {
  <!-- do something with data, generate a graph -->
}
````

Sample Analytics Modules
---
See [some sample moocRP modules here](http://www.github.com/kk415kk/moocrp_visualizations).

FAQs
---
TODO


Under construction.