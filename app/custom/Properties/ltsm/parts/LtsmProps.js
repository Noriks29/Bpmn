import { html } from 'htm/preact';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export default function(element) {

  return [
    {
      id: 'Ltsm',
      element,
      component: Ltsm,
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


function Ltsm(props) {
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
        extensionElements.values.push(moddle.create('ltsm:props'))
  }
  
  function updateValues(props, value){
    //console.log("now -- ", extensionElements)
    for (let index = 0; index < extensionElements.values.length; index++) {
        if (extensionElements.values[index].$type === 'ltsm:props') {
            extensionElements.values[index][props] = value
            modeling.updateProperties(element, {
                extensionElements
              });
            return value
          }
    }
    return 0
  }

  const getValueStream = () => {
    const { stream }   = getExtensionElement(getBusinessObject(element), 'ltsm:props')
    return stream;
  };
  const getValueVolume = () => {
    const { volume }   = getExtensionElement(getBusinessObject(element), 'ltsm:props')
    return volume;
  };
  const getValuePenalty_start = () => {
    const { penalty_start }   = getExtensionElement(getBusinessObject(element), 'ltsm:props')
    return penalty_start;
  };
  const getValuePenalty_angle= () => {
    const { penalty_angle }   = getExtensionElement(getBusinessObject(element), 'ltsm:props')
    return penalty_angle;
  };

  const setValueVolume = value => {
    return updateValues("volume", value)
  };
  const setValueStream = value => {
    return updateValues("stream", value)
  };
  const setValuePenalty_start = value => {
    return updateValues("penalty_start", value)
  };
  const setValuePenalty_angle = value => {
    return updateValues("penalty_angle", value)
  };

  return html`<${TextFieldEntry}
    id=${ id }
    element=${ element }
    label=${ translate('Stream') }
    getValue=${ getValueStream }
    setValue=${ setValueStream }
    debounce=${ debounce }
  />
  <${TextFieldEntry}
    id=${ id }
    element=${ element }
    label=${ translate('Volume') }
    getValue=${ getValueVolume }
    setValue=${ setValueVolume }
    debounce=${ debounce }
  />
  <${TextFieldEntry}
    id=${ id }
    element=${ element }
    label=${ translate('penalty_start') }
    getValue=${ getValuePenalty_start }
    setValue=${ setValuePenalty_start }
    debounce=${ debounce }
  />
  <${TextFieldEntry}
    id=${ id }
    element=${ element }
    label=${ translate('penalty_angle') }
    getValue=${ getValuePenalty_angle }
    setValue=${ setValuePenalty_angle }
    debounce=${ debounce }
  />
  `;
}