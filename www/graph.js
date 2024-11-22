document.addEventListener("DOMContentLoaded", function () {
  const width = 1200,
    height = 600;

  // Create SVG element
  const svg = d3
    .select("#graphContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "1px solid #ccc") // Border for the canvas
    .style("box-sizing", "border-box"); // Ensure the border doesn't affect the size

  // Define arrow marker for directed edges
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#000");

  // Define arrow marker for double-sided edges (start)
  svg
    .append("defs")
    .append("marker")
    .attr("id", "double-arrowhead-start")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#000");

  // Define arrow marker for double-sided edges (end)
  svg
    .append("defs")
    .append("marker")
    .attr("id", "double-arrowhead-end")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#000");

  // Toolbox
  const toolbox = d3.select("#toolbox");

  // Add color buttons
  const colors = ["red", "#2ca4ea", "green"];
  colors.forEach((color) => {
    toolbox
      .append("div")
      .attr("class", "toolbox-item")
      .attr("data-type", "node")
      .attr("data-color", color)
      .text(`Node`)
      .style("cursor", "pointer")
      .style("margin", "10px")
      .style("padding", "5px")
      .style("border", `1px solid ${color}`)
      .style("background-color", color)
      .style("color", "white")
      .on("click", function () {
        // Create a new node at a default position with the selected color
        const newNode = {
          id: `${nodes.length + 1}`,
          x: width / 2,
          y: height / 2,
          color: color,
        };
        nodes.push(newNode);

        console.log("Node added:", newNode); // Debug log
        console.log("Current nodes:", nodes); // Log current state of nodes

        const nodeGroup = svg.append("g").attr("class", "node-group");

        nodeGroup
          .append("circle")
          .attr("cx", newNode.x)
          .attr("cy", newNode.y)
          .attr("r", 20) // Increased node size
          .attr("fill", newNode.color)
          .attr("data-id", newNode.id)
          .call(
            d3.drag().on("drag", function (event) {
              const newX = Math.max(0, Math.min(event.x, width));
              const newY = Math.max(0, Math.min(event.y, height));
              d3.select(this).attr("cx", newX).attr("cy", newY);
              newNode.x = newX;
              newNode.y = newY;
              nodeGroup.select("text").attr("x", newX).attr("y", newY);
            })
          )
          .on("click", function () {
            selectNode(newNode);
          });

        nodeGroup
          .append("text")
          .attr("x", newNode.x)
          .attr("y", newNode.y)
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .text(newNode.id);
      });
  });

  // Add Directed button
  toolbox
    .append("div")
    .attr("class", "toolbox-item")
    .attr("data-type", "directed")
    .text("Directed")
    .style("cursor", "pointer")
    .style("margin", "10px")
    .style("padding", "5px")
    .style("border", "1px solid black")
    .style("background-color", "black")
    .style("color", "white")
    .on("click", function () {
      graphType = "directed";
      console.log("Graph type set to directed"); // Debug log
    });

  // Add Double-Sided button
  toolbox
    .append("div")
    .attr("class", "toolbox-item")
    .attr("data-type", "double-sided")
    .text("Double-Sided")
    .style("cursor", "pointer")
    .style("margin", "10px")
    .style("padding", "5px")
    .style("border", "1px solid black")
    .style("background-color", "black")
    .style("color", "white")
    .on("click", function () {
      graphType = "double-sided";
      console.log("Graph type set to double-sided"); // Debug log
    });

  // Add Undirected button
  toolbox
    .append("div")
    .attr("class", "toolbox-item")
    .attr("data-type", "undirected")
    .text("Undirected")
    .style("cursor", "pointer")
    .style("margin", "10px")
    .style("padding", "5px")
    .style("border", "1px solid black")
    .style("background-color", "black")
    .style("color", "white")
    .on("click", function () {
      graphType = "undirected";
      console.log("Graph type set to undirected"); // Debug log
    });

  // Graph data
  let nodes = [];
  let links = [];
  let selectedNodes = []; // To store selected nodes for edge creation

  // Select node for edge creation
  function selectNode(node) {
    // Remove highlight from previously selected nodes
    svg.selectAll("circle").attr("stroke", null).attr("stroke-width", null);

    // Highlight the selected node
    svg
      .select(`circle[data-id='${node.id}']`)
      .attr("stroke", "black")
      .attr("stroke-width", 3);

    selectedNodes.push(node);

    if (selectedNodes.length === 2) {
      // Two nodes selected: create an edge
      const source = selectedNodes[0];
      const target = selectedNodes[1];

      // Prompt for weight
      const weight = prompt(
        `Enter weight for edge from ${source.id} to ${target.id}:`,
        "1"
      );
      if (weight !== null) {
        // Add edge to data
        const newLink = {
          source: source.id,
          target: target.id,
          weight: parseFloat(weight),
        };
        links.push(newLink);

        console.log("Link added:", newLink); // Debug log
        console.log("Graph type during edge creation:", graphType); // Debug log

        // Draw edge based on graph type
        if (graphType === "directed") {
          console.log("Drawing directed edge with arrow"); // Debug log
          svg
            .append("line")
            .attr("x1", source.x)
            .attr("y1", source.y)
            .attr("x2", target.x)
            .attr("y2", target.y)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)")
            .on("click", function () {
              alert(
                `Edge from ${source.id} to ${target.id}, Weight: ${newLink.weight}`
              );
            });
        } else if (graphType === "double-sided") {
          console.log("Drawing double-sided edge with arrows"); // Debug log
          svg
            .append("line")
            .attr("x1", source.x)
            .attr("y1", source.y)
            .attr("x2", target.x)
            .attr("y2", target.y)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("marker-start", "url(#double-arrowhead-start)")
            .attr("marker-end", "url(#double-arrowhead-end)")
            .on("click", function () {
              alert(
                `Double-sided edge from ${source.id} to ${target.id}, Weight: ${newLink.weight}`
              );
            });
        } else {
          console.log("Drawing undirected edge"); // Debug log
          // Draw undirected edge (simple line)
          svg
            .append("line")
            .attr("x1", source.x)
            .attr("y1", source.y)
            .attr("x2", target.x)
            .attr("y2", target.y)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .on("click", function () {
              alert(
                `Edge from ${source.id} to ${target.id}, Weight: ${newLink.weight}`
              );
            });
        }

        // Display weight on edge
        svg
          .append("text")
          .attr("x", (source.x + target.x) / 2)
          .attr("y", (source.y + target.y) / 2)
          .text(weight)
          .attr("font-size", "12px")
          .attr("fill", "black");

        // Reset selected nodes
        selectedNodes = [];
      }
    }
  }

  // Send data to Shiny
  document
    .getElementById("processGraph")
    .addEventListener("click", function () {
      const graphData = { nodes, links };
      console.log("Graph data sent to Shiny:", graphData); // Log graph data
      Shiny.setInputValue("graphData", JSON.stringify(graphData));
    });
});
