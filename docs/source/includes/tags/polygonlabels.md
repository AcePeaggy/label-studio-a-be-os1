### Parameters

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Name of tag |
| toName | <code>string</code> |  | Name of image to label |
| [choice] | <code>single</code> \| <code>multiple</code> | <code>single</code> | Configure whether you can select one or multiple labels |
| [maxUsages] | <code>number</code> |  | Maximum number of times a label can be used per task |
| [showInline] | <code>boolean</code> | <code>true</code> | Show labels in the same visual line |
| [opacity] | <code>number</code> | <code>0.2</code> | Opacity of polygon |
| [fillColor] | <code>string</code> |  | Polygon fill color in hexadecimal |
| [strokeColor] | <code>string</code> |  | Stroke color in hexadecimal |
| [strokeWidth] | <code>number</code> | <code>1</code> | Width of stroke |
| [pointSize] | <code>small</code> \| <code>medium</code> \| <code>large</code> | <code>medium</code> | Size of polygon handle points |
| [pointStyle] | <code>rectangle</code> \| <code>circle</code> | <code>rectangle</code> | Style of points |
| [snap] | <code>pixel</code> \| <code>none</code> | <code>none</code> | Snap polygon to image pixels |

### Result parameters

| Name | Type | Description |
| --- | --- | --- |
| original_width | <code>number</code> | width of the original image (px) |
| original_height | <code>number</code> | height of the original image (px) |
| image_rotation | <code>number</code> | rotation degree of the image (deg) |
| value | <code>Object</code> |  |
| value.points | <code>Array.&lt;Array.&lt;number&gt;&gt;</code> | list of (x, y) coordinates of the polygon by percentage of the image size (0-100) |

### Example JSON
```json
{
  "original_width": 1920,
  "original_height": 1280,
  "image_rotation": 0,
  "value": {
    "points": [[2, 2], [3.5, 8.1], [3.5, 12.6]],
    "polygonlabels": ["Car"]
  }
}
```

