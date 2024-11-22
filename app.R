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
      tableOutput("matrixOutput"),  # Display adjacency matrix
      h4("Copyable R Code:"),
      verbatimTextOutput("rCodeOutput")  # Display adjacency matrix as R code
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
    graphDataJSON <- fromJSON(input$graphData)  # Convert JSON to R object
    print(graphDataJSON)  # Debug: Print the graph data JSON
    
    # Create adjacency matrix
    nodes <- graphDataJSON$nodes
    links <- graphDataJSON$links
    
    numNodes <- length(nodes)
    nodeIds <- sapply(nodes, `[[`, "id")
    print(nodeIds)  # Debug: Print node IDs
    
    adjacencyMatrix <- matrix(0, nrow = numNodes, ncol = numNodes,
                              dimnames = list(nodeIds, nodeIds))
    
    for (link in links) {
      source <- as.character(link$source)
      target <- as.character(link$target)
      weight <- link$weight
      if (source %in% nodeIds && target %in% nodeIds) {
        print(paste("Adding link:", source, "->", target, "with weight", weight))  # Debug: Print link info
        adjacencyMatrix[source, target] <- weight
      } else {
        print(paste("Warning: Node ID not found for link:", source, "->", target))  # Debug: Print warning
      }
    }
    
    graphData(list(matrix = adjacencyMatrix, nodeIds = nodeIds))  # Save for output
  })
  
  # Render adjacency matrix as a table
  output$matrixOutput <- renderTable({
    req(graphData())
    graphData()$matrix
  })
  
  # Render adjacency matrix as R code
  output$rCodeOutput <- renderText({
    req(graphData())
    adjMatrix <- graphData()$matrix
    nodeIds <- graphData()$nodeIds
    
    # Debugging: Print adjacency matrix and node IDs
    print("Adjacency Matrix:")
    print(adjMatrix)
    print("Node IDs:")
    print(nodeIds)
    
    # Ensure the matrix and node IDs are correctly formatted
    if (is.null(adjMatrix) || is.null(nodeIds)) {
      return("Error: Adjacency matrix or node IDs are null.")
    }
    
    formattedMatrix <- paste(
      "matrix(c(", 
      paste(as.vector(t(adjMatrix)), collapse = ", "), 
      "), nrow = ", nrow(adjMatrix), 
      ", byrow = TRUE, dimnames = list(", 
      paste0("c(", paste(shQuote(nodeIds), collapse = ", "), ")"), 
      ", ", 
      paste0("c(", paste(shQuote(nodeIds), collapse = ", "), ")"), 
      "))", sep = ""
    )
    paste("adj_matrix <-", formattedMatrix)
  })
}

# Run the app
shinyApp(ui, server)