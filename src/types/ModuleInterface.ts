export default interface ModuleInterface {
  id: number
  coord: {
    x: number // column position, starting at 0
    y: number // y coordinate in the grid
    w: number // width of the module, in columns
    h: number // height of the module, in pixels
  }
}
