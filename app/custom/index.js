import CustomContextPad from './CustomContextPad';
import CustomPalette from './CustomPalette';
import CustomRenderer from './CustomRenderer';
import ResourcePropertiesProvider from './Properties/resource/ResourcePropertiesProvider';
import LtsmPropertiesProvider from './Properties/ltsm/LtsmPropertiesProvider';
import AnalysisDetailsPropertiesProvider from './Properties/analysisDetails/AnalysisDetailsPropertiesProvider';
import GetwayPropertiesProvider from './Properties/geteway/GetwayPropertiesProvider';


console.log("indexЗапущен");
export default {
  __init__: [ 'customContextPad', 'customPalette', 'customRenderer', 'resourcePropertiesProvider', 'ltsmPropertiesProvider', "analysisDetailsPropertiesProvider", "getwayPropertiesProvider" ],
  resourcePropertiesProvider: [ 'type', ResourcePropertiesProvider ],
  ltsmPropertiesProvider: [ 'type', LtsmPropertiesProvider ],
  analysisDetailsPropertiesProvider: [ 'type', AnalysisDetailsPropertiesProvider ],
  getwayPropertiesProvider: [ 'type', GetwayPropertiesProvider ],

  customContextPad: [ 'type', CustomContextPad ],
  customPalette: [ 'type', CustomPalette ],
  customRenderer: [ 'type', CustomRenderer ]
};
