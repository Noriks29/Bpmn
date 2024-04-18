import BpmnModeler from 'bpmn-js/lib/Modeler';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel'; //для панели свойств4

import minimapModule from 'diagram-js-minimap';


import diagramXML from '../resources/monsg.bpmn'; // путь к заготовке схемы
import diagramXML2 from '../resources/monsg_test.bpmn'; // путь к заготовке схемы

import customModule from './custom'; // папка с надстройками bpmn-js

import qaExtension from '../resources/qa'; // подгрузка кастмных моделей обьекта qa
import ltsmExtension from '../resources/ltsm'; // подгрузка кастомных моделей обьекта list

const HIGH_PRIORITY = 1500; // повышаем приоритет что бы система была важнее дефолтной(1000)

const containerEl = document.getElementById('container'), //тут всё отображение
      qualityAssuranceEl = document.getElementById('quality-assurance'), //скрытый контейнер с формой
      suitabilityScoreEl = document.getElementById('suitability-score'), //чекбокс с добавление в маршрут
      volumeScoreEl = document.getElementById('volume-score'), //инпут 2
      streamScoreEl = document.getElementById('stream-score'), //инпут 1
      lastCheckedEl = document.getElementById('last-checked'), //время последнего обновления
      okayEl = document.getElementById('okay'), // кнопка сохранения
      formEl = document.getElementById('form'), // основной айди формы
      warningEl = document.getElementById('warning'); // ошибка скрытая

// hide quality assurance if user clicks outside
//скрываем форму редактирования обьекта при клике вне фрэйма
window.addEventListener('click', (event) => {
  const { target } = event;

  if (target === qualityAssuranceEl || qualityAssuranceEl.contains(target)) {
    return;
  }

  qualityAssuranceEl.classList.add('hidden');
});

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
    BpmnPropertiesProviderModule // из примера с панелью св
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
    //document.body.append('You selected ' + file.name);
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
      ltsmProps,
      businessObject,
      element,
      suitabilityScore,
      streamScore,
      volumeScore;

  // проверки корректности формы
  function validate() {
    const volume_tmp = volumeScoreEl.value; // получение данных из 1 и 2го инпута
    const stream_tmp = streamScoreEl.value;

    if (isNaN(volume_tmp) || isNaN(stream_tmp)) { // если поля пустые то отключаем кнопки и выводим ошибки
      warningEl.classList.remove('hidden');
      okayEl.disabled = true;
    } else {
      warningEl.classList.add('hidden');
      okayEl.disabled = false;
    }

    /*
     const { value } = suitabilityScoreEl;

     if (isNaN(value)) {
       warningEl.classList.remove('hidden');
       okayEl.disabled = true;
      } else {
       warningEl.classList.add('hidden');
       okayEl.disabled = false;
     }*/
  }

  // open quality assurance if user right clicks on element
  bpmnModeler.on('element.contextmenu', HIGH_PRIORITY, (event) => {
    suitabilityScoreEl.checked = false
    volumeScoreEl.value = 0;
    streamScoreEl.value = 0;
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    qualityAssuranceEl.classList.remove('hidden');
    ({ element } = event);

    // ignore root element
    if (!element.parent) {
      return;
    }

    businessObject = getBusinessObject(element);

    console.log("businessObject - ", businessObject);

    //const props = getExtensionElement(businessObject, 'ns0:props');
    try{
      const { suitabilityScore } = getExtensionElement(businessObject, 'qa:AnalysisDetails');
      suitabilityScoreEl.checked = suitabilityScore ? suitabilityScore : '';
    }
    catch(err){
      console.log(err)
    }
    const props = getExtensionElement(businessObject, 'ltsm:props');

    const { volume, stream } = props;
    

    volumeScoreEl.value = volume ? volume : '';
    streamScoreEl.value = stream ? stream : '';

    volumeScoreEl.focus();

    analysisDetails = getExtensionElement(businessObject, 'qa:AnalysisDetails');
    ltsmProps = getExtensionElement(businessObject, 'ltsm:props');
    lastCheckedEl.textContent = analysisDetails ? analysisDetails.lastChecked : '-';
    validate();
  });

  // set suitability core and last checked if user submits
  formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();

    suitabilityScore = suitabilityScoreEl.checked;
    streamScore = streamScoreEl.value;
    volumeScore = volumeScoreEl.value;

    const extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');
    console.log(ltsmProps,analysisDetails)
    if (!ltsmProps) {
      console.log("создан элемент Props");
      ltsmProps = moddle.create('ltsm:props');
      extensionElements.get('values').push(ltsmProps);
    }

    if (!analysisDetails) {
      console.log("создан элемент AnalysisDetails");
      analysisDetails = moddle.create('qa:AnalysisDetails');
      extensionElements.get('values').push(analysisDetails);
    }
    
    const values = [...extensionElements.get('values')];
    extensionElements.set('values', values.map((value) => {
      if (value.$type === 'ltsm:props') {
        return Object.assign(value, {
          stream: streamScore,
          volume: volumeScore
        });
      }
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
    });

    qualityAssuranceEl.classList.add('hidden');
    analysisDetails = undefined
    ltsmProps = undefined
  });

  // close quality assurance if user presses escape
  formEl.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      qualityAssuranceEl.classList.add('hidden');
    }
  });

  // validate suitability score if user inputs value
  suitabilityScoreEl.addEventListener('input', validate);
  streamScoreEl.addEventListener('input', validate);
  volumeScoreEl.addEventListener('input', validate);

  container
      .removeClass('with-error')
      .addClass('with-diagram');

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
    console.log("интерес 4");
    return extensionElement.$instanceOf(type);
  })[0];
}