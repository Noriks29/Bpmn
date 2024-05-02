import { html } from 'htm/preact';

import { TextFieldEntry, isTextFieldEntryEdited, SelectEntry} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export default function(element) {

  return [
    {
      id: 'Getway',
      element,
      component: Getway,
      isEdited: isTextFieldEntryEdited
    }
  ];
}


function Getway(props) {
  const { element, id } = props;
  const moddle = useService('moddle');
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  
  const BusinessObject = getBusinessObject(element);
  if (!BusinessObject.hasOwnProperty("gatewayDirection")){
    BusinessObject.gatewayDirection = "Diverging"
  }
  
  function updateValues(value){
    
    BusinessObject.gatewayDirection = value
      modeling.updateProperties(element, {
        BusinessObject
    });
    return value
  }

  const getMode = () => {
    const { gatewayDirection } = getBusinessObject(element)
    return gatewayDirection;
  };

  const setMode = value => {
    return updateValues(value)
  };

  const getOptions = () => {
    return [{value: "Diverging", label: "Diverging"},{value: "Converging", label: "Converging"}]
  };

  return html`<${SelectEntry}
  id=${ id }
  element=${ element }
  label=${ translate('Stream') }
  getOptions=${ getOptions }
  getValue=${ getMode }
  setValue=${ setMode }
  debounce=${ debounce }
  />`;
}