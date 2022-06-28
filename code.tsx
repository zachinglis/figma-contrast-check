// This is a counter widget with buttons to increment and decrement the number.

const { widget, notify } = figma
const { useSyncedState, usePropertyMenu, AutoLayout, Text, Input, useWidgetId } = widget

function Widget() {
  const [currentColor, setCurrentColor] = useSyncedState('currentColor', '#000000')
  const [parentColor, setParentColor] = useSyncedState('parentColor', '#ffffff')

  const id = useWidgetId()

  function RGBToHex(rgb: RGB): string {
    let r = Math.round(rgb.r * 255).toString(16);
    let g = Math.round(rgb.g * 255).toString(16);
    let b = Math.round(rgb.b * 255).toString(16);
  
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
  }
  
  function testContrast() {
    const node = figma.getNodeById(id) as WidgetNode
    const parent = node.parent as FrameNode
    
    if(!parent) {
      notify("Parent is not a frame")
      return
    }
    const fill = parent.fills[0]
    if(fill === undefined) {
      notify("Parent needs a fill")
      return
    }
    if(fill.type !== 'SOLID') {
      notify("Parent fill is not a solid color")
      return
    }

    const bgColor = RGBToHex(fill.color)
    console.log("fill", fill.color)
    console.log("bg", bgColor)
    setParentColor(bgColor)
  }

  //#region Settings
  const [size, setSize] = useSyncedState('size', 'large')
  usePropertyMenu([
    {
      itemType: 'action',
      propertyName: 'recalculate',
      tooltip: 'Recalcuate the contrast',
    },
    {
      itemType: 'separator',
    },
    {
    itemType: 'dropdown',
    tooltip: 'Change widget size',
    propertyName: 'size',
    options: [
      { label: 'Tiny', option: 'tiny' },
      { label: 'Small', option: 'small' },
      { label: 'Large', option: 'large' },
    ],
    selectedOption: 'large'
  }],
  ({propertyName, propertyValue}) => {
    if (propertyName === 'size') {
      setSize(propertyValue)
    }
    if (propertyName === 'recalculate') {
      testContrast()
    }
  })
  //#endregion

  //#region Widget - currentColor
  function updateCurrentColor({ characters }) {
    console.log("editted", characters)
  }
  //#endregion
// TODO: Width should stay the same
// TODO: Make color text of widget the chosen color
// Hover fx
  //#region Visual - Settings Opened
    const [settingsOpened, setSettingsOpened] = useSyncedState('settignsOpened', false)

    function showSettings() { setSettingsOpened(true) }
    function closeSettings() { setSettingsOpened(false) }
  //#endregion
  //#region Visual - Size styles
  let fontSize = 18
  let padding = 16
  if(size === 'tiny') {
    fontSize = 9
    padding = 6
  }
  if(size == 'small') {
    fontSize = 13
    padding = 9
  }
  //#endregion

  return (
    <AutoLayout
      verticalAlignItems={'center'}
      spacing={padding / 2}
      padding={padding}
      cornerRadius={8}
      fill={'#FFFFFF'}
      stroke={'#E6E6E6'}
    >
      {settingsOpened && (
        <>
          <Input 
          value={currentColor}
          placeholder="#000000"
          width={80}
          onTextEditEnd={updateCurrentColor} />
          <Text fontSize={fontSize} onClick={closeSettings}>
              Close
          </Text>
        </>
      )}
      {!settingsOpened && (
        <>
          <Text fontSize={fontSize} horizontalAlignText={'left'}>
            Parent: {parentColor} /
            Current: {currentColor}
          </Text>
          <Text fontSize={fontSize} onClick={showSettings}>
            Change
          </Text>
        </>
      )}
    </AutoLayout>
  )
}

widget.register(Widget)
