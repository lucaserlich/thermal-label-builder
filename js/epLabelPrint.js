(async function () {
    if (window.epLabelPrint) return;

    const epLabelPrint = {
        interpolateStringTemplate: function (tmpl, data, defaultValue = '?', reg) {
            return tmpl.replace(reg || /\${([^{}]*)}/g, function (a, b) {
                try { return new Function('data', ['with(data){return ', b, ' || \'', (defaultValue || ''), '\';}'].join(''))(data); }
                catch (e) { return defaultValue || ''; }
            });
        },
        generateElementToPrintOfString: function (jsonStr, templateStr) {
            return this.generateElementToPrint(JSON.parse(jsonStr), $(templateStr));
        },
        generateElementToPrint: function (object, template) {
            if (!(template instanceof jQuery)) template = $(template);

            const element = $('<html>');
            const page = template;
            const row = page.find('#row');
            const content = page.find('#content');

            row.css('width', page.css('width'));

            element.append($(`<style>
                        #page, #content { background: #fff !important; }
                        body { overflow: auto; margin: 0; }
                        div[data-id='barcode'] canvas {
                            max-width: 100%;
                            display: block;
                            margin: 0 auto;
                        }
                        @page {
                            size: ${page[0].style.width} ${content[0].style.height};
                        }
                        </style>`));

            const columns = parseFloat(page.attr('data-columns')) || 1;
            const rows = parseFloat(page.attr('data-rows')) || 1;
            const getNewRow = () => row.clone().empty();
            const getNewPage = () => page.clone().empty();

            let currentColumn = 1;
            let currentRow = 1;
            let pageCopy = getNewPage();
            let rowCopy = getNewRow();
            object.tags.forEach(tag => {
                const generatedContentWithDataTag = $(
                    this.interpolateStringTemplate(
                        content[0].outerHTML,
                        tag.data
                    )
                );

                for (let i = tag.qty; i > 0; i--) {
                    let contentCopy = generatedContentWithDataTag.clone();

                    contentCopy.find('div[data-id="barcode"]').each((i, el) => {
                        $(el).find('canvas').attr('data-value', $(el).attr('data-code-tag'));
                        $(el).find('canvas').JsBarcode().init();
                    });

                    if (currentColumn > columns && currentRow < rows) {
                        currentColumn = 1;
                        currentRow += 1;
                        pageCopy.append(rowCopy);
                        rowCopy = getNewRow();
                    } else if (currentColumn > columns && currentRow >= rows) {
                        currentColumn = 1;
                        currentRow = 1;
                        pageCopy.append(rowCopy);
                        element.append(pageCopy);
                        pageCopy = getNewPage();
                        rowCopy = getNewRow();
                    }

                    if (currentColumn === 1) contentCopy.css('margin-left', '0');

                    rowCopy.append(contentCopy);
                    currentColumn += 1;
                }
            });

            pageCopy.append(rowCopy);
            element.append(pageCopy);

            return element;
        },
        printElementInPDF: async function (element) {
            const content = element.find('#content');
            const page = element.find('#page');
            const doc = new window.jspdf.jsPDF(
                page.attr('data-orientation') || 'l',
                'mm',
                [
                    (parseFloat(content[0].style.height) * (parseFloat(page.attr('data-rows')) || 1)) 
                    * 
                    (parseFloat(page.attr('data-fator')) || 0.99013), 
                    parseFloat(page[0].style.width)
                ],
                false
            );

            await doc.html(element[0], {
                callback: (doc) => {
                    const pageCount = doc.internal.getNumberOfPages();
                    if (pageCount > 1) doc.deletePage(pageCount);
                    return doc;
                },
                x: 0,
                y: 0,
                windowWidth: parseFloat(page[0].style.width) * 3.7795280352161, //window width in CSS pixels,
                html2canvas: { scale: parseFloat(page.attr('data-scale')) || 0.262, dpi: parseFloat(page.attr('data-dpi')) || 300 }
            });

            return doc;
        }
    };

    async function apendScriptInThisPage(scriptUrl) {
        const scriptPromise = await fetch(scriptUrl);
        const script = await scriptPromise.text();

        return new Function(script);
    }

    // Use this for starting without a server
    // if (!window.jQuery) apendScriptInThisPage('https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js').then((r) => r()).catch(error => console.log(error));
    // if (!window.html2canvas) apendScriptInThisPage('https://html2canvas.hertzen.com/dist/html2canvas.min.js').then((r) => r()).catch(error => console.log(error));
    // if (!window.JsBarcode) apendScriptInThisPage('https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js').then((r) => r()).catch(error => console.log(error));
    // if (!window.jspdf) apendScriptInThisPage('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then((r) => r()).catch(error => console.log(error));
    
    // Comment this if you not have a server
    if (!window.jQuery) apendScriptInThisPage('./js/jquery.min.js').then((r) => r()).catch(error => console.log(error));
    if (!window.html2canvas) apendScriptInThisPage('./js/html2canvas.min.js').then((r) => r()).catch(error => console.log(error));
    if (!window.JsBarcode) apendScriptInThisPage('./js/JsBarcode.all.min.js').then((r) => r()).catch(error => console.log(error));
    if (!window.jspdf) apendScriptInThisPage('./js/jspdf.umd.min.js').then((r) => r()).catch(error => console.log(error));

    return window.epLabelPrint = epLabelPrint;
})();