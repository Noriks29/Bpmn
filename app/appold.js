import BpmnModeler from 'bpmn-js/lib/Modeler';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel'; //для панели свойств4

import minimapModule from 'diagram-js-minimap';


import diagramXML2 from '../resources/monsg.bpmn'; // путь к заготовке схемы
import diagramXML from '../resources/monsg_test.bpmn'; // путь к заготовке схемы

import customModule from './custom'; // папка с надстройками bpmn-js

import qaExtension from '../resources/qa'; // подгрузка кастмных моделей обьекта qa
import ltsmExtension from '../resources/ltsm'; // подгрузка кастомных моделей обьекта list

import resourcePropertiesProvider from './custom';
import ltsmPropertiesProvider from './custom';

const HIGH_PRIORITY = 1500; // повышаем приоритет что бы система была важнее дефолтной(1000)

const containerEl = document.getElementById('container'), //тут всё отображение
      qualityAssuranceEl = document.getElementById('quality-assurance'), //скрытый контейнер с формой
      ResourceWindow = document.getElementById('resource-window'), //скрытый контейнер res
      suitabilityScoreEl = document.getElementById('suitability-score'), //чекбокс с добавление в маршрут
      lastCheckedEl = document.getElementById('last-checked'), //время последнего обновления
      formEl = document.getElementById('form'); // основной айди формы

// hide quality assurance if user clicks outside
//скрываем форму редактирования обьекта при клике вне фрэйма
window.addEventListener('click', (event) => {
  const { target } = event;
  if (target === qualityAssuranceEl || qualityAssuranceEl.contains(target)) {
    return;
  }
  if (target === ResourceWindow || target === buttonShowResource ) {
    return;
  }
  qualityAssuranceEl.classList.add('hidden');
  ResourceWindow.classList.add('hidden');
});

const buttonShowResource = document.getElementById('resource_panel');
buttonShowResource.addEventListener('click', async function() {
  ResourceWindow.classList.remove('hidden');
  console.log("sdfsdfsdf")
})


// create modeler
const bpmnModeler = new BpmnModeler({
  container: containerEl,
  propertiesPanel: { // из примера с панелью св
    parent: '#properties'
  },
  additionalModules: [ // подгрузка модулей
    customModule,
    minimapModule,
    
    BpmnPropertiesPanelModule, // из примера с панелью св
    BpmnPropertiesProviderModule, // из примера с панелью св
    resourcePropertiesProvider,
    ltsmPropertiesProvider
    
  ],
  moddleExtensions: {
    qa: qaExtension, 
    ltsm: ltsmExtension // добавление расширения модели
  }
});


// import file button
const buttonImportXML = document.querySelector('.button_import');
const reader = new FileReader();
buttonImportXML.addEventListener('change', function(file_input) {
  if (file_input.target.files[0]) {
    var file = file_input.target.files[0];
    reader.readAsText(file);
    reader.addEventListener('load', (e) => {
      importXMLfromFile(reader.result);
    });
    reader.addEventListener('error', () => {
      console.error(`Произошла ошибка при чтении файла`);
    });
  }
  /*bpmnModeler.clear();
  bpmnModeler.createDiagram();*/
})

// save file
const buttonSaveXML = document.querySelector('.button_save');
buttonSaveXML.addEventListener('click', async function() {
  console.log("click!!");
  try {
    const { xml } = await bpmnModeler.saveXML();
    console.log(xml);
  } catch (err) {
    console.log(err);
  }
})



// import XML
importXMLfromFile(diagramXML); //предустановка
function importXMLfromFile(file){
  
bpmnModeler.importXML(file).then(() => {

  const moddle = bpmnModeler.get('moddle'),
        modeling = bpmnModeler.get('modeling');
  
  let analysisDetails,
      businessObject,
      element,
      suitabilityScore;

/*
  bpmnModeler._definitions.rootElements.push( bpmnModeler._definitions.rootElements[1])
  const Res = moddle.create('bpmn:Resource')
  console.log(Res)
  Res.id = "nametest"
  bpmnModeler._definitions.rootElements.push(Res)*/

  // open quality assurance if user right clicks on element
  bpmnModeler.on('element.contextmenu', HIGH_PRIORITY, (event) => {
    suitabilityScoreEl.checked = false
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    qualityAssuranceEl.classList.remove('hidden');
    ({ element } = event);
    
    // ignore root element
    if (!element.parent) {
      return;
    }
    businessObject = getBusinessObject(element)

    console.log(element)

    try{
      const { suitabilityScore } = getExtensionElement(businessObject, 'qa:AnalysisDetails');
      suitabilityScoreEl.checked = suitabilityScore ? suitabilityScore : '';
    }
    catch(err){
      console.log(err)
    }

    analysisDetails = getExtensionElement(businessObject, 'qa:AnalysisDetails');
    lastCheckedEl.textContent = analysisDetails ? analysisDetails.lastChecked : '-';
  });

  // set suitability core and last checked if user submits
  formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();

    /*
    suitabilityScore = suitabilityScoreEl.checked;
    console.log(event,element)
    const extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');
    if (!analysisDetails) {
      console.log("создан элемент AnalysisDetails");
      analysisDetails = moddle.create('qa:AnalysisDetails');
      extensionElements.get('values').push(analysisDetails);
    }
    
    const values = [...extensionElements.get('values')];
    extensionElements.set('values', values.map((value) => {
      if (value.$type === 'qa:AnalysisDetails') {
        return Object.assign(value, {
          suitabilityScore: suitabilityScore
        });
      }
      return value;
    }));

    analysisDetails.lastChecked = new Date().toISOString();
    modeling.updateProperties(element, {
      extensionElements,
      suitable: suitabilityScore
    });*/

    qualityAssuranceEl.classList.add('hidden')
    /*
    analysisDetails = undefined
    ltsmProps = undefined*/
  });

  // close quality assurance if user presses escape
  formEl.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      qualityAssuranceEl.classList.add('hidden');
    }
  });

  // validate suitability score if user inputs value
  //suitabilityScoreEl.addEventListener('input', validate);
  /*
  container
      .removeClass('with-error')
      .addClass('with-diagram');*/

  bpmnModeler.get('minimap').open();

}).catch((err) => {
  console.error(err);
});
}

function getExtensionElement(element, type) {
  if (!element.extensionElements) {
    return 0;
  }
  return element.extensionElements.values.filter((extensionElement) => {
    return extensionElement.$instanceOf(type);
  })[0];
}