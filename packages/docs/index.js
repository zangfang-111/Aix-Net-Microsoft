import mermaid from 'mermaid'

mermaid.sequenceConfig = {
  diagramMarginX: 150,
  diagramMarginY: 10,
  boxTextMargin: 5,
  noteMargin: 10,
  messageMargin: 0,
  mirrorActors: true
}

mermaid.initialize({
  theme: 'forest',
  gantt: { axisFormatter: [
    ['%Y-%m-%d', (d) => {
      return d.getDay() === 1
    }]
  ] }
})
