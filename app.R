library(shiny)
library(jsonlite)

# UI
ui <- fluidPage(
  titlePanel("Graph Drawing Tool"),
  sidebarLayout(
    sidebarPanel(
      h4("Toolbox"),
      tags$div(id = "toolbox"),
      actionButton("processGraph", "Process Graph"),
      tableOutput("matrixOutput")  # Display adjacency matrix
    ),
    mainPanel(
      tags$div(
        id = "graphContainer",
        style = "width: 100%; height: 600px; border: 1px solid #ccc; margin-top: 20px;"
      ),
      tags$script(src = "d3.min.js"),  # Include D3.js
      tags$script(src = "graph.js")   # Include custom JavaScript
    )
  )
)

# Server
server <- function(input, output, session) {
  graphData <- reactiveVal(NULL)  # To store graph data
  
  # Observe graph data sent from frontend
  observeEvent(input$graphData, {
    graphData <- fromJSON(input$graphData)  # Convert JSON to R object
    
    # Create adjacency matrix
    nodes <- graphData$nodes
    links <- graphData$links
    
    numNodes <- length(nodes)
    nodeIds <- sapply(nodes, `[[`, "id")
    adjacencyMatrix <- matrix(0, nrow = numNodes, ncol = numNodes,
                              dimnames = list(nodeIds, nodeIds))
    
    for (link in links) {
      source <- link$source
      target <- link$target
      weight <- link$weight
      adjacencyMatrix[source, target] <- weight
    }
    
    graphData(list(matrix = adjacencyMatrix))  # Save for output
  })
  
  # Render adjacency matrix as a table
  output$matrixOutput <- renderTable({
    req(graphData())
    graphData()$matrix
  })
}

# Run the app
shinyApp(ui, server)