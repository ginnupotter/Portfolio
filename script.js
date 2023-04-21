  // get the file input element
  var fileInput = document.getElementById("file");

  // add a change event listener
  fileInput.addEventListener("change", function() {
    // get the selected file
    var file = fileInput.files[0];

    // check if the file is valid
    if (file) {
      // create a file reader
      var reader = new FileReader();

      // add a load event listener
      reader.addEventListener("load", function() {
        // get the file content as text
        var text = reader.result;

        // parse the csv data
        var data = d3.csvParse(text);

        // calculate the total value of the portfolio
        var total = d3.sum(data, d => +d.value);

        // calculate the percentage of each stock in the portfolio
        data.forEach(d => {
          d.percentage = (+d.value / total) * 100;
        });

        // get the square element
        var square = document.getElementById("square");

        // get the width and height of the square
        var width = square.clientWidth;
        var height = square.clientHeight;

        // create a scale for the circle radius
        var radiusScale = d3.scaleSqrt()
          .domain([0, d3.max(data, d => +d.value)])
          .range([10, 100]);

        // create a simulation for the circles
        var simulation = d3.forceSimulation(data)
          .force("x", d3.forceX(width / 2).strength(0.05))
          .force("y", d3.forceY(height / 2).strength(0.05))
          .force("collide", d3.forceCollide(d => radiusScale(+d.value) + 5))
          .on("tick", ticked);

        // create a svg element inside the square
        var svg = d3.select(square).append("svg")
          .attr("width", width)
          .attr("height", height);

        // create a group for the circles and labels
        var nodes = svg.append("g")
          .attr("class", "nodes");

        // create a node for each data point
        nodes.selectAll(".node")
          .data(data)
          .join("g")
          .attr("class", "node")
          .append("circle")
          .attr("class", "circle")
          .attr("r", d => radiusScale(+d.value))
          .append("title")
          .text(d => d.name + ": " + d.value + ": " + d.percentage.toFixed(2) + "%");

        // create a label for each node
        nodes.selectAll(".node")
          .append("text")
          .attr("class", "label")
          .text(d => d.name.substring(0,4));

        // update the node positions on each tick
        function ticked() {
          nodes.selectAll(".node")
            .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
        }
      });

      // read the file as text
      reader.readAsText(file);
    } else {
      // alert the user that no file is selected
      alert("Please select a csv file.");
    }
  });