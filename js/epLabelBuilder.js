var properties = JSON.parse(localStorage.properties || '{}');
var page = JSON.parse(localStorage.page || '{}');
var label = JSON.parse(localStorage.label || '{}');
var target = undefined;

function clearLocalStorage() {
    localStorage.properties = '{}';
    localStorage.label = '{}';
    localStorage.page = '{}';

    properties = {};
    label = {};
    page = {};
}

function getDataValueToStorage(el) {
    if (el.find('img').length > 0) return el.find('img').attr('src');
    else if (el.find('canvas').length > 0) return el.find('canvas').attr('data-value');
    else return el.text();
}

function getStylesOfElement(el) {
    return {
        'width': el.style.width,
        'height': el.style.height,
        'border-width': el.style.borderWidth,
        'border-color': el.style.borderColor,
        'border-style': el.style.borderStyle,
        'cursor': el.style.cursor,
        'overflow': el.style.overflow,
        'position': el.style.position,
        'display': el.style.display,
        'color': el.style.color,
        'align-items': el.style.alignItems,
        'font-size': el.style.fontSize,
        'z-index': el.style.zIndex,
        'rotate': el.style.rotate,
        'font-family': el.style.fontFamily,
        'font-style': el.style.fontStyle,
        'font-weight': el.style.fontWeight,
        'line-height': el.style.lineHeight,
        'border-radius': el.style.borderRadius,
        'transform': el.style.transform,
        'justify-content': el.style.justifyContent,
        'text-align': el.style.textAlign,
        'background': el.style.background
    }
}

function stopFunc(event, ui) {
    properties[this.id] = {
        position: ui.position ? ui.position : properties[this.id].position,
        style: getStylesOfElement(event.target),
        dataId: $(event.target).attr('data-id'),
        data: getAllDataOfElement($(event.target))
    }

    saveToLocalStorage('properties', properties);
};

function focusElement(id) {
    const el = $(`#${id}`);
    if (el.is(':visible')) el.focus();
    setTarget(el);
}

var lastDeletedElement = undefined;
function removeElement(id) {
    delete properties[id];
    saveToLocalStorage('properties', properties);

    removeElementInListOfElements(id);
    lastDeletedElement = $(`#${id}`).clone();
    $(`#${id}`).remove();
    setTarget(undefined);
}

function duplicateElement(id) {
    const clone = $(`#${id}`).clone();
    clone.css('top', parseFloat(target ? target.css('top') : clone.css('top')) + 3);
    clone.css('left', parseFloat(target ? target.css('left') : clone.css('left')) + 3);

    appendNewElement(clone);
}

var elementToCopy = undefined;
function keyEvent(event) {
    var isPositionModified = false;
    switch (event.key) {
        case 'Delete':
            event.preventDefault();

            removeElement(event.target.id);
            break;
        case 'ArrowUp':
            event.preventDefault();
            $(event.target).css('top', parseFloat($(event.target).css('top')) - 1);
            isPositionModified = true;
            break;
        case 'ArrowDown':
            event.preventDefault();
            $(event.target).css('top', parseFloat($(event.target).css('top')) + 1);
            isPositionModified = true;
            break;
        case 'ArrowRight':
            event.preventDefault();
            $(event.target).css('left', parseFloat($(event.target).css('left')) + 1);
            isPositionModified = true;
            break;
        case 'ArrowLeft':
            event.preventDefault();
            $(event.target).css('left', parseFloat($(event.target).css('left')) - 1);
            isPositionModified = true;
            break;
        case 'c':
            if (event.ctrlKey) elementToCopy = event.target;
            break;
        case 'v':
            if (event.ctrlKey && elementToCopy) duplicateElement(elementToCopy.id);
            break;
        default:
            break;
    }

    if (isPositionModified) {
        properties[event.target.id].position = $(event.target).position();
        saveToLocalStorage('properties', properties);
    }
}

function applyEventsOnElement(el, propertie) {
    if (el.find('img').length > 0) {
        if (propertie) el.find('img').attr('src', propertie.data['data-value']);
        el.find('img').on('click', (event) => el.focus());
    }

    if (el.find('canvas').length > 0) {
        el.find('canvas').on('click', (event) => el.focus());
    }

    // fix problem to lost styles
    const currentStyle = getStylesOfElement(el[0]);

    el.on('keydown', keyEvent);
    el.on('click', clickEvent);

    el.resizable({
        stop: stopFunc
    }).draggable({
        scroll: false,
        stop: stopFunc,
        tolerance: 'touch'
    }).rotatable({
        stop: stopFunc
    });

    el.css(currentStyle);
}

function updateTextOfSelectedElement(element) {
    if ((element || $('')).length > 0) {
        const value = element.attr('id').startsWith('barcode') ? element.find('canvas').attr('data-code-tag') : element.attr('data-value');
        $('#selected-element').html(`${value ? value : '?'} <span class="text-xs">(${element.attr('id')})</span>`);
    } else $('#selected-element').html('Nenhum elemento selecionado');
}

function updateTextInListOfElement(element) {
    if (!element) return;

    const value = element.attr('id').startsWith('barcode') ? element.find('canvas').attr('data-code-tag') : element.attr('data-value');
    $('#elements-list').find(`li[data-id="${element.attr('id')}"]`).find(`span[data-id="data-value"]`).html(value);
}

function setTarget(element) {
    target = element;
    if (element) {
        $('#input-width').val(parseFloat(target.css('width')));
        $('#input-height').val(parseFloat(target.css('height')));
        $('#input-top').val(parseFloat(target.css('top')));
        $('#input-left').val(parseFloat(target.css('left')));
        $('#input-zindex').val(parseFloat(target.css('z-index')));
        $('#input-fontsize').val(parseFloat(target.css('font-size')));
        $('#input-fontfamily').val(target.css('font-family'));
        $('#input-alignitems').val(target.css('align-items'));
        $('#input-color').val(target.css('color'));
        $('#input-justifycontent').val(target.css('justify-content'));
        $('#input-textalign').val(target.css('text-align'));
        $('#input-fontstyle').prop('checked', target.css('font-style') === 'italic');
        $('#input-fontweight').prop('checked', target.css('font-weight') === '700');
        $('#input-lineheight').val(parseFloat(target.css('line-height')));
        $('#input-borderwidth').val(parseFloat(target.css('border-width')));
        $('#input-borderradius').val(parseFloat(target.css('border-radius')));
        if (target[0]) $('#input-transform').val(target[0].style.transform);
        $('#input-background').val(target.css('background'));
        $('#input-borderstyle').val(target.css('border-style'));
        $('#input-bordercolor').val(target.css('border-color'));

        switch (target.attr('data-id')) {
            case 'span':
                $('#input-value').val(target.text());
                break;
            case 'img':
                $('#input-value').val(target.find('img').attr('src'));
                break;
            case 'barcode':
                $('#input-value').val(target.attr('data-code-tag'));

                $('#barcode-width').val(parseFloat(target.find('canvas').attr('data-width')));
                $('#barcode-height').val(parseFloat(target.find('canvas').attr('data-height')));
                $('#barcode-format').val(target.find('canvas').attr('data-format'));
                $('#barcode-textposition').val(target.find('canvas').attr('data-textposition'));
                $('#barcode-textalign').val(target.find('canvas').attr('data-textalign'));
                $('#barcode-textmargin').val(target.find('canvas').attr('data-textmargin'));
                $('#barcode-font').val(target.find('canvas').attr('data-font'));
                $('#barcode-fontoptions').val(target.find('canvas').attr('data-fontoptions'));
                $('#input-barcode-display-value').prop('checked', target.find('canvas').attr('data-displayvalue') != 'false');
                break;
            default:
                $('#input-value').val('');
                break;
        }
    } 

    updateTextOfSelectedElement(element);
}

function clickEvent(event) {
    setTimeout(() => setTarget($(document.activeElement)), 1);
}

function changeValueOfElement(target, value) {
    if (target.length > 0) {
        switch (target.attr('data-id')) {
            case 'span':
                target.attr('data-value', value);
                target.get(0).firstChild.nodeValue = value;
                break;
            case 'img':
                target.find('img').attr('src', value);
                break;
            case 'barcode':
                target.attr('data-code-tag', value);
                target.find('canvas').attr('data-code-tag', value);
                break;
            default:
                break;
        }
    }
}

function textContentChange(event) {
    if (target) {
        switch (target.attr('data-id')) {
            case 'barcode':
                changeValueOfElement(target, event.target.value);
                properties[target.attr('id')].data['data-code-tag'] = event.target.value;
                break;
            default:
                changeValueOfElement(target, event.target.value);
                properties[target.attr('id')].data['data-value'] = event.target.value;
                break;
        }

        updateTextOfSelectedElement(target);
        updateTextInListOfElement(target);
        saveToLocalStorage('properties', properties);
    }
}

function styleChange(event) {
    if (target) {
        if ($(event.target).attr('type') === 'checkbox') {
            applyStyleInElement(
                $(event.target).attr('data-style'),
                $(event.target).is(':checked') ? $(event.target).attr('data-value') : '',
                target
            );
        } else {
            applyStyleInElement(
                $(event.target).attr('data-style'),
                event.target.value + ($(event.target).attr('data-sufix') ? $(event.target).attr('data-sufix') : ''),
                target
            );
        }
    }
}

function applyStyleInElement(style, value, target) {
    target.css(style, value);

    properties[target.attr('id')].style[style] = value;
    saveToLocalStorage('properties', properties);
}

function labelPropertyChange(event) {
    $('#content').css($(event.target).attr('data-style'), event.target.value + 'mm');

    label[$(event.target).attr('data-style')] = event.target.value;
    saveToLocalStorage('label', label);
}

function pagePropertyChange(event) {
    if ($(event.target).attr('data-property')) {
        $('#page').attr($(event.target).attr('data-property'), event.target.value);
        page[$(event.target).attr('data-property')] = event.target.value;
    } else {
        $('#page').css($(event.target).attr('data-style'), event.target.value + 'mm');
        page[$(event.target).attr('data-style')] = event.target.value;
    }

    saveToLocalStorage('page', page);
}

function barcodeDataChange(event) {
    if ($(event.target).attr('type') === 'checkbox' && target) {
        applyDataValueInBarcodeElement(
            $(event.target).attr('data-property'),
            $(event.target).is(':checked'),
            target
        );
    } else if (target) {
        applyDataValueInBarcodeElement(
            $(event.target).attr('data-property'),
            event.target.value,
            target
        );
    }
}

function applyDataValueInBarcodeElement(property, value, target) {
    if (target.find('canvas')) {
        target.find('canvas').attr(property, value);

        switch (value) {
            case 'CODE128B':
                target.find('canvas').attr('data-value', 'OI!');
                properties[target.attr('id')].data['data-value'] = 'OI!';
                break;
            case 'EAN13':
                target.find('canvas').attr('data-value', '1234567890128');
                properties[target.attr('id')].data['data-value'] = '1234567890128';
                break;
            case 'EAN8':
                target.find('canvas').attr('data-value', '12345670');
                properties[target.attr('id')].data['data-value'] = '12345670';
                break;
            case 'CODE39':
                target.find('canvas').attr('data-value', '123456');
                properties[target.attr('id')].data['data-value'] = '123456';
                break;
            case 'ITF14':
                target.find('canvas').attr('data-value', '1234567890123');
                properties[target.attr('id')].data['data-value'] = '1234567890123';
                break;
            case 'MSI':
                target.find('canvas').attr('data-value', '123456');
                properties[target.attr('id')].data['data-value'] = '123456';
                break;
            default:
                break;
        }

        properties[target.attr('id')].data[property] = value;
        saveToLocalStorage('properties', properties);

        target.find('canvas').JsBarcode().init();
    }
}

function initBarcodeElement(el, propertie) {
    if (el.attr('data-id') === 'barcode') {
        if (propertie) {
            Object.keys(propertie.data).forEach(key => el.find('canvas').attr(key, propertie.data[key]));
            el.find('canvas').attr('data-value', propertie.data['data-value']);
        }
        el.find('canvas').JsBarcode().init();
    }
}

function saveToLocalStorage(propertyName, dataObj) {
    localStorage[propertyName] = JSON.stringify(dataObj);
    setHtmlContentWithPageElement();
}

function setHtmlContentWithPageElement() {
    $('#html-content').val($('<div>').append($('#page').clone()).html());
}

function setElementsList() {
    $('#content').find('*[data-id]').each((i, el) => addElementInListOfElements($(el)));
}

function addElementInListOfElements(el) {
    if (el.attr('id')) {
        const value = el.attr('id').startsWith('barcode') ? el.find('canvas').attr('data-code-tag') : el.attr('data-value');
        $('#elements-list').append($(`
                <li data-id="${el.attr('id')}" onclick="focusElement('${el.attr('id')}')" class="cursor-pointer list-none flex align-middle hover:bg-gray-100 hover:text-blue-600 p-2 m-1 rounded-lg">
                    <button onclick="duplicateElement('${el.attr('id')}')" class="hover:text-green-500 hover:border-green-500 cursor-pointer border-solid border-gray-300 bg-gray-100 border-[1px] rounded-lg active:bg-green-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                        </svg>
                    </button>
                    <div class="p-2 flex-auto flex-col">
                        <div class="text-xs leading-3">${el.attr('id')}</div>
                        <span data-id="data-value">
                            ${value ? value : '?'}
                        </span>
                    </div>
                    <button onclick="removeElement('${el.attr('id')}')" class="hover:text-red-500 hover:border-red-600 cursor-pointer border-solid border-gray-300 bg-gray-100 border-[1px] rounded-lg float-right relative active:bg-red-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </li>
                `));
    }
}

function removeElementInListOfElements(id) {
    $('#elements-list').find(`[data-id="${id}"]`).remove();
}

function replaceHtmlToNew(newHtml) {
    const page = $(newHtml);
    $('#replaceable').empty().append(page);

    clearLocalStorage();
    addListennerDragAndDropInContent();

    page.find('*[data-id]').each((i, el) => {
        if ($(el).attr('id')) {
            properties[$(el).attr('id')] = getEmptyProperty(
                $(el).attr('data-id'),
                getAllDataOfElement($(el)),
                getStylesOfElement(el),
                getPositionOfElement($(el))
            );
            applyEventsOnElement($(el));
        }
    });

    saveToLocalStorage('properties', properties);
    saveToLocalStorage('page', $.extend(getAllDataOfElement(page), { width: parseFloat(page[0].style.width) }));

    const content = page.find('#content');
    saveToLocalStorage('label', $.extend(getAllDataOfElement(content), {
        width: parseFloat(content[0].style.width),
        height: parseFloat(content[0].style.height),
        'margin-left': parseFloat(content[0].style.marginLeft),
        'margin-top': parseFloat(content[0].style.marginBottom)
    }));
    window.location.reload();
}

function getPositionOfElement(el) {
    return { left: parseInt(el.css('left')), top: parseInt(el.css('top')) };
}

function getAllDataOfElement(el) {
    const data = {};

    var [nodeToGetAttr] = el;
    setAllAttrToObject(nodeToGetAttr, data);

    if (el.attr('data-id') === 'barcode' && el.attr('id')) {
        [nodeToGetAttr] = el.find('canvas');
        setAllAttrToObject(nodeToGetAttr, data);
    }

    return data;
}

function setAllAttrToObject(nodeToGetAttr, objectToSetData) {
    if (nodeToGetAttr) $.each(nodeToGetAttr.attributes, (i, attr) => {
        if (attr.name.startsWith('data')) objectToSetData[attr.name] = attr.value;
    });
}

$(function () {
    const contentEl = $('#content');
    const pageEl = $('#page');

    $.each(properties, function (id, propertie) {
        var el = $(`#${id}`);

        if (!el.length) {
            el = $(`#${propertie.dataId}`).clone();
            contentEl.append(el);
            el.attr('id', id);
            el.addClass('draggable');
        }

        el.css(propertie.position);
        setTimeout(() => el.css(propertie.style), 1);

        if (propertie.data) {
            if (propertie.data['data-value'] !== undefined) changeValueOfElement(el, propertie.data['data-value']);
            if (propertie.data['data-code-tag']) changeValueOfElement(el, propertie.data['data-code-tag']);
        }

        initBarcodeElement(el, propertie);
        applyEventsOnElement(el, propertie);

        setTimeout(() => setHtmlContentWithPageElement(), 100);
    });

    if (label.width) {
        contentEl.css('width', label.width + 'mm');
        $('#label-width').val(label.width);
    }
    if (label.height) {
        contentEl.css('height', label.height + 'mm');
        $('#label-height').val(label.height);
    }
    if (label['margin-left']) {
        contentEl.css('margin-left', label['margin-left'] + 'mm');
        $('#label-marginleft').val(label['margin-left']);
    }
    if (label['margin-top']) {
        contentEl.css('margin-top', label['margin-top'] + 'mm');
        $('#label-margintop').val(label['margin-top']);
    }
    if (page.width) {
        pageEl.css('width', page.width + 'mm');
        $('#page-width').val(page.width);
    }
    if (page['margin-left']) {
        pageEl.css('margin-left', page['margin-left'] + 'mm');
        $('#page-marginleft').val(page['margin-left']);
    }
    if (page['margin-right']) {
        pageEl.css('margin-right', page['margin-right'] + 'mm');
        $('#page-marginright').val(page['margin-right']);
    }

    Object.keys(page).filter(key => key.startsWith('data-')).forEach(key => {
        pageEl.attr(key, page[key]);
        $(`input[data-property="${key}"]`).val(page[key]);
    });

    setElementsList();

    document.addEventListener('keydown', (event) => {
        if (event.key === 'z' && event.ctrlKey && lastDeletedElement) {
            event.preventDefault();
            appendNewElement(lastDeletedElement);
            lastDeletedElement = undefined;
        }
    })
});

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData('elementId', ev.target.getAttribute('data-id'));
}

function drop(ev) {
    ev.preventDefault();

    el = $(`#${ev.dataTransfer ? ev.dataTransfer.getData('elementId') : ev.target.getAttribute('data-id')}`).clone();

    const topPosition = ev.clientY - $('#content').offset().top - 10;
    const leftPosition = ev.clientX - $('#content').offset().left - 10;

    el.css('top', topPosition > 0 ? topPosition : 0);
    el.css('left', leftPosition > 0 ? leftPosition : 0);

    appendNewElement(el);
}

function appendNewElement(el) {
    el.addClass('draggable');
    el.attr('id', `${el.attr('data-id')}-${Date.now()}`);

    $('#content').append(el);
    addElementInListOfElements(el);

    properties[el.attr('id')] = getEmptyProperty(
        el.attr('data-id'),
        getAllDataOfElement(el),
        getStylesOfElement(el[0]),
        { top: parseFloat(el.css('top')), left: parseFloat(el.css('left')) }
    );

    saveToLocalStorage('properties', properties);

    initBarcodeElement(el);
    applyEventsOnElement(el);
    setTimeout(() => focusElement(el.attr('id')), 1);
}

function getEmptyProperty(dataId, data = {}, style = {}, position = {}) {
    return { data: data, position: position, style: style, dataId: dataId };
}

function addListennerDragAndDropInContent() {
    document.getElementById('content').addEventListener('drop', drop);
    document.getElementById('content').addEventListener('dragover', allowDrop);
}
addListennerDragAndDropInContent();

function printElement($event) {
    const files = $('#input-json').prop('files');
    if (!files[0]) return;

    $('#loading').css('display', 'block');
    files[0].text()
        .then(jsonString => {
            const epLabelPrint = window.epLabelPrint;
            epLabelPrint.printElementInPDF(
                epLabelPrint.generateElementToPrintOfString(jsonString, document.getElementById('page').outerHTML)
            ).then(doc => {
                window.open(doc.output('bloburl'));
                $('#loading').css('display', 'none');
            }).catch(error => {
                console.log(error);
                $('#loading').css('display', 'none');
            });
        })
        .catch(error => {
            console.log(error);
            $('#loading').css('display', 'none');
        });
}

function activateTab(event) {
    $('#tabs').find('li').each((i, el) => {
        $(el).find('a').removeClass('active');
        $(el).find('a').removeClass('text-blue-600');
        $(el).find('a').removeClass('bg-gray-100');
        $(el).find('a').addClass('hover:text-gray-600');
    });

    const tab = $(event.target);
    tab.addClass('active');
    tab.addClass('text-blue-600');
    tab.addClass('bg-gray-100');
    tab.removeClass('hover:text-gray-600');

    $(`#${tab.attr('data-tab-id')}`).find('*[tab-content]').each((i, el) => {
        $(el).removeClass('active');
        $(el).addClass('hidden')
    });

    const target = $(`#${tab.attr('data-tab')}`);
    target.addClass('active');
    target.removeClass('hidden');
}