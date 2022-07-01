interface checkContrastArgs {
  foregroundColor?: string
  ratioLevel?: string
  fontSize?: string
}

import {RGBToHex, getCurrentRatio, doesPass } from './lib/color'

const { widget, notify } = figma
const { useSyncedState, usePropertyMenu, AutoLayout, Rectangle, SVG, Text, Input, useWidgetId } = widget

function Widget() {
  //#section Initial State
  const [foregroundColor, setForegroundColor] = useSyncedState('foregroundColor', '#000000')
  const [backgroundColor, setBackgroundColor] = useSyncedState('parentColor', '#ffffff')
  const [ratio, setRatio] = useSyncedState('ratio', '0')
  const [passes, setPasses] = useSyncedState('passes', 'false')

  const [optionRatioLevel, setOptionRatioLevel] = useSyncedState('optinRatioLevel', 'AA')
  const [optionFontSize, setOptionFontSize] = useSyncedState('optionFontSize', 'large')
  const [optionSize, setOptionSize] = useSyncedState('optionSize', 'large')
  const [settingsOpened, setSettingsOpened] = useSyncedState('settignsOpened', false)
  
  const id = useWidgetId()
  //#endregion
  //#region Helper methods - Colors & Contrast

  //#endregion
  //#region Helper methods - Nodes
  function getParentFrame(node: WidgetNode): FrameNode | undefined {
    if(!node.parent) return

    if(node.parent.type === 'FRAME') {
      return node.parent as FrameNode
    } else {
      return getParentFrame(node.parent as WidgetNode)
    }
  }

  function getParentFrameHex(node: WidgetNode): string | undefined {
    const parent = getParentFrame(node)

    if(!parent) {
      notify("Widget must be inside a frame")
      return
    }

    const fill = parent.fills[0]
    if(fill === undefined) {
      notify("Parent frame needs a fill")
      return
    }
    if(fill.type !== 'SOLID') {
      notify("Parent frame fill is not a solid color")
      return
    }
  
    return RGBToHex(fill.color)
  }
  //#endregion

  function setPassOrFail(args: checkContrastArgs = {}) {
    const node = figma.getNodeById(id) as WidgetNode

    let fgColor = args.foregroundColor || foregroundColor
    let bgColor = getParentFrameHex(node)
    let ratioLevel = args.ratioLevel || optionRatioLevel
    let fontSize = args.fontSize || optionFontSize

    if(!foregroundColor || !backgroundColor) return

    const newRatio = getCurrentRatio(fgColor, bgColor)
    const newValidity = doesPass(newRatio, ratioLevel, fontSize)

    if(args.foregroundColor) setForegroundColor(fgColor)
    setBackgroundColor(backgroundColor)
    setRatio(String(newRatio))
    setPasses(String(newValidity))

    node.name = `Contrast Checker (${newValidity === true ? 'PASS' : 'FAIL'})`
  }

  //#region Settings
  const propertyIconColor = "#BCBCBC"
  usePropertyMenu([
    {
      itemType: 'dropdown',
      tooltip: 'WCAG Level',
      propertyName: 'ratio',
      options: [
        { label: 'AA', option: 'AA' },
        { label: 'AAA', option: 'AAA' },
      ],
      selectedOption: optionRatioLevel
    },
    {
      itemType: 'dropdown',
      tooltip: 'Size of the text',
      propertyName: 'text',
      options: [
        { label: 'Normal Text', option: 'normal' },
        { label: 'Large Text', option: 'large' },
      ],
      selectedOption: optionFontSize
    },
    {
      itemType: 'separator',
    },
    {
    itemType: 'dropdown',
    tooltip: 'Change widget size',
    propertyName: 'size',
    options: [
      { label: 'Tiny Widget', option: 'tiny' },
      { label: 'Small Widget', option: 'small' },
      { label: 'Large Widget', option: 'large' },
    ],
    selectedOption: optionSize
  },
  {
    itemType: 'separator',
  },
  {
    itemType: 'action',
    propertyName: 'toggleSettings',
    tooltip: settingsOpened ? 'Close Settings' : 'Open Settings',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="${propertyIconColor}" d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z"/></svg>`,
  },  {
    itemType: 'action',
    propertyName: 'recalculate',
    tooltip: 'Recalculate',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="${propertyIconColor}" d="M5.463 4.433A9.961 9.961 0 0 1 12 2c5.523 0 10 4.477 10 10 0 2.136-.67 4.116-1.81 5.74L17 12h3A8 8 0 0 0 6.46 6.228l-.997-1.795zm13.074 15.134A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.136.67-4.116 1.81-5.74L7 12H4a8 8 0 0 0 13.54 5.772l.997 1.795z"/></svg>`,
  },
],
  ({propertyName, propertyValue}) => {
    if (propertyName === 'size') {
      setOptionSize(propertyValue)
    }
    if (propertyName === 'ratio') {
      setOptionRatioLevel(propertyValue)
      setPassOrFail({ratioLevel: propertyValue})
    }
    if (propertyName === 'text') {
      setOptionFontSize(propertyValue)
      setPassOrFail({fontSize: propertyValue})
    }
    if (propertyName === 'toggleSettings') {
      setSettingsOpened(!settingsOpened)
    }
    if(propertyName === 'recalculate') {
      setPassOrFail()
      setSettingsOpened(false)
    }
  })
  //#endregion

  //#region Widget - currentColor
  function updateForegroundColor({ characters }: TextEditEvent) {
    let fgColor = characters

    if(!fgColor.includes('#'))
      fgColor = "#" + fgColor

    setPassOrFail({
      foregroundColor: fgColor
    })
    closeSettings()
  }
  //#endregion
  //#region Visual - Settings Opened
    function showSettings() { setSettingsOpened(true) }
    function closeSettings() { setSettingsOpened(false) }
  //#endregion
  //#region Visual - Size styles
  let widgetFontSize: number = 22
  let widgetPadding: WidgetJSX.Padding = { horizontal: 16, vertical: 8 }
  let widgetSpacing: number = 12
  let widgetWidth: WidgetJSX.Size = 140
  let widgetHeight: WidgetJSX.Size = 40
  if(optionSize === 'tiny') {
    widgetFontSize = 14
    widgetSpacing = 8
    widgetPadding = 0
    widgetHeight = 34
    widgetWidth = 100
  }
  if(optionSize == 'small') {
    widgetFontSize = 16
    widgetSpacing = 4
    widgetHeight = 40
    widgetWidth = 100
    widgetPadding = { horizontal: 4, vertical: 0 }
  }
  const widgetBg = "#ffffff"
  const widgetFg = "#000000"
  //#endregion

  return (
    <AutoLayout
      fill={widgetBg}
      height={widgetHeight}
      width={widgetWidth}
      cornerRadius={8}
    >
      <Rectangle
        height={widgetHeight}
        fill={foregroundColor}
        stroke="#e4e4e4"
        strokeWidth={1}
        strokeAlign="outside"
        width={10} />
      <AutoLayout
        height={widgetHeight}
        width={widgetWidth - 10}
        spacing={widgetSpacing}
        horizontalAlignItems={settingsOpened ? 'end' : 'center'}
        verticalAlignItems='center'
      >
        {settingsOpened && (
          <Input 
            placeholder="#000000"
            value={foregroundColor}
            width={widgetWidth * 0.8}
            height={widgetHeight}
            verticalAlignText='center'
            fill={widgetFg}
            fontSize={widgetFontSize} 
            onTextEditEnd={updateForegroundColor} />
        )}
        {!settingsOpened && (
          <>
            {passes === 'true' && (
              <AutoLayout
                horizontalAlignItems='center'
                verticalAlignItems='center'
                spacing={widgetSpacing / 2}
              >
                <Text fill={widgetFg} fontWeight="bold" fontSize={widgetFontSize}>Pass</Text>
                <SVG src={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="#12C219" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"/></svg>`} />
              </AutoLayout>
            )}
            {passes !== 'true' && (
              <AutoLayout
                horizontalAlignItems='center'
                verticalAlignItems='center'
                spacing={widgetSpacing / 2}
              >
                <Text fill={widgetFg} fontWeight="bold" fontSize={widgetFontSize}>Fail</Text>
                <SVG src={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="#C21212" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-11.414L9.172 7.757 7.757 9.172 10.586 12l-2.829 2.828 1.415 1.415L12 13.414l2.828 2.829 1.415-1.415L13.414 12l2.829-2.828-1.415-1.415L12 10.586z"/></svg>`} />
              </AutoLayout>
            )}
          </>
        )}
      </AutoLayout>
    </AutoLayout>
  )
}

widget.register(Widget)
