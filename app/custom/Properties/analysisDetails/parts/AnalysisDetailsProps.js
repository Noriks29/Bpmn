import { html } from 'htm/preact';

import { TextFieldEntry, isTextFieldEntryEdited, CheckboxEntry } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export default function(element) {

  return [
    {
      id: 'AnalysisDetails',
      element,
      component: AnalysisDetails,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function getExtensionElement(element, type) {
    if (!element.extensionElements) {
      return 0;
    }
    return element.extensionElements.values.filter((extensionElement) => {
      return extensionElement.$instanceOf(type);
    })[0];
  }


function AnalysisDetails(props) {
  const { element, id } = props;
  const moddle = useService('moddle');
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  
  const extensionElements = getBusinessObject(element).extensionElements || moddle.create('bpmn:ExtensionElements');
  if (!extensionElements.hasOwnProperty("values")){
    Object.assign(extensionElements,
        {
            values: []
        })
    extensionElements.values.push(moddle.create('qa:AnalysisDetails'))
  }


  
  function CheckAnalysisDetails(){
    //console.log("now -- ", extensionElements)
    for (let index = 0; index < extensionElements.values.length; index++) {
        if (extensionElements.values[index].$type === 'qa:AnalysisDetails') {
            if(extensionElements.values[index].suitabilityScore !== true)
              extensionElements.values[index].suitabilityScore = false
            return 0
          }
    }
    extensionElements.values.push(moddle.create('qa:AnalysisDetails'))
    modeling.updateProperties(element, {
      extensionElements
    });
    return 0
  }
  function updateValues(value){
    for (let index = 0; index < extensionElements.values.length; index++) {
        if (extensionElements.values[index].$type === 'qa:AnalysisDetails') {
            extensionElements.values[index].suitabilityScore = value
            extensionElements.values[index].lastChecked = new Date().toISOString();
            modeling.updateProperties(element, {
                extensionElements
              });
            return Number(value)
          }
    }
    return 0
  }

  const getValue = () => {
    //console.log("element" - element)
    CheckAnalysisDetails()
    const { suitabilityScore }   = getExtensionElement(getBusinessObject(element), 'qa:AnalysisDetails')
    return suitabilityScore;
  };
  const getValuelastChecked = () => {
    const { lastChecked }   = getExtensionElement(getBusinessObject(element), 'qa:AnalysisDetails')
    return lastChecked
  }

  const setValue = value => {
    //console.log(value)
    return updateValues(value)
    
  };

  return html`<${CheckboxEntry}
    id=${ id }
    element=${ element }
    label=${ translate('AnalysisDetails') }
    getValue=${ getValue }
    setValue=${ setValue }
    debounce=${ debounce }
  />
  <${TextFieldEntry}
    id=${ id }
    element=${ element }
    label=${ translate('lastChecked') }
    getValue=${ getValuelastChecked }
    disabled=true
    debounce=${ debounce }
  />
  `;
}